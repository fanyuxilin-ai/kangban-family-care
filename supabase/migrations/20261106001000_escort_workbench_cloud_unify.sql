-- 陪诊师工作台归一：接单开关（云端生效）+ 到场回传节点 + Realtime 推送
-- 1) 陪诊师接单开关：escort_profiles.available
ALTER TABLE public.escort_profiles ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;

-- 2) book_availability 校验陪诊师是否可约（重建，加一行校验）
CREATE OR REPLACE FUNCTION public.book_availability(p_post_id uuid, p_note text DEFAULT '')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
DECLARE v_post public.community_posts%rowtype; v_family uuid; v_booking uuid;
BEGIN
  v_family := public.current_family_id();
  IF v_family IS NULL THEN RAISE EXCEPTION '请先登录家庭账号'; END IF;
  SELECT * INTO v_post FROM public.community_posts WHERE id = p_post_id FOR UPDATE;
  IF NOT FOUND OR v_post.type <> 'availability' THEN RAISE EXCEPTION '时段不存在'; END IF;
  IF v_post.author_id = (SELECT auth.uid()) THEN RAISE EXCEPTION '不能预约自己发布的时段'; END IF;
  IF v_post.status <> 'open' THEN RAISE EXCEPTION '该时段当前不可预约'; END IF;
  IF v_post.service_date < current_date THEN RAISE EXCEPTION '该时段日期已过期'; END IF;
  IF NOT coalesce((SELECT p.available FROM public.escort_profiles p WHERE p.user_id = v_post.author_id), true)
    THEN RAISE EXCEPTION '这位陪诊师当前暂停接单'; END IF;
  INSERT INTO public.availability_bookings(post_id, family_id, booker_user_id, note, status)
  VALUES (p_post_id, v_family, (SELECT auth.uid()), left(btrim(coalesce(p_note,'')), 200), 'applied')
  ON CONFLICT (post_id, family_id) DO UPDATE SET note = excluded.note, status = 'applied', updated_at = now()
  RETURNING id INTO v_booking;
  UPDATE public.community_posts SET status = 'pending_booking', updated_at = now()
  WHERE id = p_post_id AND status = 'open';
  RETURN v_booking;
END $func$;

-- 3) 到场回传：arrived_at 列 + transition_companion_order 增加 arrive 动作
ALTER TABLE public.companion_orders ADD COLUMN IF NOT EXISTS arrived_at timestamptz;

CREATE OR REPLACE FUNCTION public.transition_companion_order(p_order_id uuid,p_action text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_order public.companion_orders%rowtype;
BEGIN
  SELECT * INTO v_order FROM public.companion_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION '订单不存在'; END IF;
  IF p_action='arrive' THEN
    IF v_order.escort_id<>(SELECT auth.uid()) OR v_order.status<>'confirmed' THEN RAISE EXCEPTION '当前账号或订单状态不能回传到场'; END IF;
    UPDATE public.companion_orders SET arrived_at=now(),updated_at=now() WHERE id=p_order_id;
    RETURN 'arrived';
  ELSIF p_action='start' THEN
    IF v_order.escort_id<>(SELECT auth.uid()) OR NOT public.is_active_escort() OR v_order.status<>'confirmed' THEN RAISE EXCEPTION '当前账号或订单状态不能开始服务'; END IF;
    UPDATE public.companion_orders SET status='in_service',arrived_at=coalesce(arrived_at,now()),updated_at=now() WHERE id=p_order_id;
    UPDATE public.community_posts SET status='in_service',updated_at=now() WHERE id=v_order.post_id;
  ELSIF p_action='complete' THEN
    IF v_order.escort_id<>(SELECT auth.uid()) OR v_order.status<>'in_service' THEN RAISE EXCEPTION '只有接单陪诊师可以完成服务'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(v_order.execution->'items','[]'::jsonb)) AS x(item) WHERE coalesce((x.item->>'done')::boolean,false)=false) THEN RAISE EXCEPTION '请先完成标准履约清单'; END IF;
    UPDATE public.companion_orders SET status='completed',updated_at=now() WHERE id=p_order_id;
    UPDATE public.community_posts SET status='completed',updated_at=now() WHERE id=v_order.post_id;
  ELSIF p_action='cancel' THEN
    IF NOT (public.is_family_member(v_order.family_id) OR v_order.escort_id=(SELECT auth.uid())) THEN RAISE EXCEPTION '无权取消此订单'; END IF;
    IF v_order.status IN ('completed','cancelled') THEN RAISE EXCEPTION '订单已结束'; END IF;
    UPDATE public.companion_orders SET status='cancelled',updated_at=now() WHERE id=p_order_id;
    UPDATE public.community_posts SET status='cancelled',updated_at=now() WHERE id=v_order.post_id;
  ELSE RAISE EXCEPTION '不支持的订单操作'; END IF;
  RETURN CASE WHEN p_action='start' THEN 'in_service' WHEN p_action='complete' THEN 'completed' ELSE 'cancelled' END;
END;
$$;

-- 4) list_my_companion_orders 双分支补 arrived_at
CREATE OR REPLACE FUNCTION public.list_my_companion_orders()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '' SET row_security TO 'off' AS $function$
declare v_result jsonb;
begin
  if (select auth.uid()) is null then raise exception '请先登录'; end if;
  select coalesce(jsonb_agg(
    case when public.is_family_member(o.family_id) then jsonb_build_object(
      'id',o.id,'post_id',o.post_id,'signup_id',o.signup_id,'family_id',o.family_id,
      'patient_member_id',o.patient_member_id,'escort_id',o.escort_id,'service_type',o.service_type,
      'hospital_name',o.hospital_name,'service_date',o.service_date,'starts_at',o.starts_at,'ends_at',o.ends_at,
      'need_summary',o.need_summary,'patient_label',coalesce((select d.patient_label from public.community_post_details d where d.post_id=o.post_id),''),
      'price',o.price,'status',o.status,'execution',o.execution,'arrived_at',o.arrived_at,
      'service_report',o.service_report,'reviews',o.reviews,'family_confirmed_at',o.family_confirmed_at,
      'escort_confirmed_at',o.escort_confirmed_at,'share_expires_at',o.share_expires_at,
      'share_revoked_at',o.share_revoked_at,'share_with_self_description',o.share_with_self_description,
      'share_access_logs',o.share_access_logs,'created_at',o.created_at,'updated_at',o.updated_at
    ) else jsonb_build_object(
      'id',o.id,'family_id',o.family_id,'escort_id',o.escort_id,'service_type',o.service_type,
      'hospital_name',o.hospital_name,'service_date',o.service_date,'starts_at',o.starts_at,'ends_at',o.ends_at,
      'price',o.price,'status',o.status,'execution',o.execution,'arrived_at',o.arrived_at,'created_at',o.created_at,'updated_at',o.updated_at,
      'reviews',o.reviews,
      'share_authorized',(
        o.share_code_hash is not null and o.share_expires_at>now() and o.share_revoked_at is null
        and exists(select 1 from jsonb_array_elements(coalesce(o.share_access_logs,'[]'::jsonb)) a
          where a->>'escort_id'=(select auth.uid())::text)
      ),
      'need_summary',case when o.share_code_hash is not null and o.share_expires_at>now() and o.share_revoked_at is null
        and exists(select 1 from jsonb_array_elements(coalesce(o.share_access_logs,'[]'::jsonb)) a where a->>'escort_id'=(select auth.uid())::text)
        then o.need_summary else null end,
      'patient_label',case when o.share_code_hash is not null and o.share_expires_at>now() and o.share_revoked_at is null
        and exists(select 1 from jsonb_array_elements(coalesce(o.share_access_logs,'[]'::jsonb)) a where a->>'escort_id'=(select auth.uid())::text)
        then (select d.patient_label from public.community_post_details d where d.post_id=o.post_id) else null end
    ) end order by o.created_at desc), '[]'::jsonb)
  into v_result
  from public.companion_orders o
  where public.is_family_member(o.family_id) or o.escort_id=(select auth.uid());
  return v_result;
end;
$function$;

-- 5) Realtime：两端订阅订单与预约申请变更
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.companion_orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.availability_bookings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
