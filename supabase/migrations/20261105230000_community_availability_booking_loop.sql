-- 社区供需双边改造：供应时段预约闭环 + 我的发布管理
-- 1) 扩展状态枚举：pending_booking(待确认) / booked(已约)
ALTER TABLE public.community_posts DROP CONSTRAINT community_posts_status_check;
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_status_check
  CHECK (status = ANY (ARRAY['open','has_applicants','awaiting_confirmation','confirmed','in_service','completed','cancelled','closed','pending_booking','booked']));

-- 2) 预约成单不经过报名表，放开 signup_id 非空
ALTER TABLE public.companion_orders ALTER COLUMN signup_id DROP NOT NULL;

-- 3) 预约申请表：家庭对供应帖发起预约申请
CREATE TABLE IF NOT EXISTS public.availability_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  booker_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'applied' CHECK (status = ANY (ARRAY['applied','accepted','rejected','cancelled'])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, family_id)
);
ALTER TABLE public.availability_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS availability_bookings_family_read ON public.availability_bookings;
CREATE POLICY availability_bookings_family_read ON public.availability_bookings
  FOR SELECT TO authenticated USING (public.is_family_member(family_id));

-- 4) 辅助：当前用户的家庭 id
CREATE OR REPLACE FUNCTION public.current_family_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO '' SET row_security TO 'off' AS $func$
  SELECT m.family_id FROM public.family_memberships m
  WHERE m.user_id = (SELECT auth.uid()) AND m.status = 'active'
  LIMIT 1
$func$;

-- 5) 家庭预约供应时段
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
  INSERT INTO public.availability_bookings(post_id, family_id, booker_user_id, note, status)
  VALUES (p_post_id, v_family, (SELECT auth.uid()), left(btrim(coalesce(p_note,'')), 200), 'applied')
  ON CONFLICT (post_id, family_id) DO UPDATE SET note = excluded.note, status = 'applied', updated_at = now()
  RETURNING id INTO v_booking;
  UPDATE public.community_posts SET status = 'pending_booking', updated_at = now()
  WHERE id = p_post_id AND status = 'open';
  RETURN v_booking;
END $func$;

-- 6) 陪诊师处理预约申请：接受 → 直接生成已确认订单；拒绝 → 时段回到可约
CREATE OR REPLACE FUNCTION public.respond_availability_booking(p_booking_id uuid, p_accept boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
DECLARE v_booking public.availability_bookings%rowtype; v_post public.community_posts%rowtype; v_order uuid;
BEGIN
  SELECT * INTO v_booking FROM public.availability_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND OR v_booking.status <> 'applied' THEN RAISE EXCEPTION '该预约申请已处理'; END IF;
  SELECT * INTO v_post FROM public.community_posts WHERE id = v_booking.post_id FOR UPDATE;
  IF NOT FOUND OR v_post.type <> 'availability' OR v_post.author_id <> (SELECT auth.uid()) THEN RAISE EXCEPTION '无权处理该预约'; END IF;
  IF NOT public.is_active_escort() THEN RAISE EXCEPTION '陪诊师账号尚未审核通过'; END IF;
  IF p_accept THEN
    IF EXISTS (SELECT 1 FROM public.companion_orders WHERE post_id = v_post.id) THEN RAISE EXCEPTION '该时段已生成订单'; END IF;
    UPDATE public.availability_bookings SET status = 'accepted', updated_at = now() WHERE id = v_booking.id;
    INSERT INTO public.companion_orders(post_id, signup_id, family_id, patient_member_id, escort_id, service_type, hospital_name, service_date, starts_at, ends_at, need_summary, status, family_confirmed_at, escort_confirmed_at)
    VALUES (v_post.id, NULL, v_booking.family_id, NULL, (SELECT auth.uid()), v_post.service_type, v_post.hospital_name, v_post.service_date,
      CASE WHEN v_post.start_time IS NULL THEN NULL ELSE (v_post.service_date + v_post.start_time) AT TIME ZONE 'Asia/Shanghai' END,
      CASE WHEN v_post.end_time IS NULL THEN NULL ELSE (v_post.service_date + v_post.end_time) AT TIME ZONE 'Asia/Shanghai' END,
      coalesce(nullif(btrim(v_booking.note), ''), v_post.summary), 'confirmed', now(), now())
    RETURNING id INTO v_order;
    UPDATE public.community_posts SET status = 'booked', updated_at = now() WHERE id = v_post.id;
    RETURN v_order;
  ELSE
    UPDATE public.availability_bookings SET status = 'rejected', updated_at = now() WHERE id = v_booking.id;
    UPDATE public.community_posts SET status = 'open', updated_at = now() WHERE id = v_post.id AND status = 'pending_booking';
    RETURN NULL;
  END IF;
END $func$;

-- 7) 家庭撤销自己的预约申请
CREATE OR REPLACE FUNCTION public.cancel_my_booking(p_booking_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
DECLARE v_post uuid;
BEGIN
  UPDATE public.availability_bookings SET status = 'cancelled', updated_at = now()
  WHERE id = p_booking_id AND booker_user_id = (SELECT auth.uid()) AND status = 'applied'
  RETURNING post_id INTO v_post;
  IF v_post IS NULL THEN RAISE EXCEPTION '预约申请不存在或已处理'; END IF;
  UPDATE public.community_posts SET status = 'open', updated_at = now()
  WHERE id = v_post AND status = 'pending_booking';
END $func$;

-- 8) 作者取消自己的帖子（需求帖：招募中/有人报名；时段帖：可约）
CREATE OR REPLACE FUNCTION public.cancel_my_post(p_post_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
DECLARE v_post public.community_posts%rowtype;
BEGIN
  SELECT * INTO v_post FROM public.community_posts WHERE id = p_post_id FOR UPDATE;
  IF NOT FOUND OR v_post.author_id <> (SELECT auth.uid()) THEN RAISE EXCEPTION '无权操作该帖子'; END IF;
  IF v_post.type = 'demand' AND v_post.status IN ('open','has_applicants') THEN
    UPDATE public.community_posts SET status = 'cancelled', updated_at = now() WHERE id = v_post.id;
    UPDATE public.post_signups SET status = 'declined', updated_at = now() WHERE post_id = v_post.id AND status = 'applied';
  ELSIF v_post.type = 'availability' AND v_post.status = 'open' THEN
    UPDATE public.community_posts SET status = 'cancelled', updated_at = now() WHERE id = v_post.id;
  ELSE
    RAISE EXCEPTION '当前状态不可取消，请先处理进行中的预约或订单';
  END IF;
END $func$;

-- 9) 陪诊师编辑自己的可约时段（仅「可约」状态）
CREATE OR REPLACE FUNCTION public.update_availability(p_post_id uuid, p_region text, p_service_type text, p_service_date date, p_start_time text, p_end_time text, p_summary text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $func$
BEGIN
  UPDATE public.community_posts
  SET region = left(btrim(coalesce(p_region,'')), 100),
      service_type = left(btrim(coalesce(p_service_type,'陪诊服务')), 60),
      service_date = p_service_date,
      start_time = p_start_time::time,
      end_time = p_end_time::time,
      summary = left(btrim(coalesce(p_summary,'')), 200),
      updated_at = now()
  WHERE id = p_post_id AND author_id = (SELECT auth.uid()) AND type = 'availability' AND status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION '仅可编辑「可约」状态的时段'; END IF;
END $func$;

-- 10) 社区页预约申请上下文：家庭=我发出的申请；陪诊师=我时段收到的申请
CREATE OR REPLACE FUNCTION public.list_my_availability_bookings()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '' SET row_security TO 'off' AS $func$
DECLARE v_role text; v_family uuid; v_result jsonb;
BEGIN
  v_role := public.current_profile_role();
  v_family := public.current_family_id();
  IF v_role = 'family' AND v_family IS NOT NULL THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', b.id, 'post_id', b.post_id, 'status', b.status, 'note', b.note, 'created_at', b.created_at
    ) ORDER BY b.created_at DESC), '[]'::jsonb)
    INTO v_result FROM public.availability_bookings b
    WHERE b.family_id = v_family AND b.status IN ('applied','accepted');
  ELSIF v_role = 'escort' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', b.id, 'post_id', b.post_id, 'status', b.status, 'note', b.note, 'created_at', b.created_at,
      'booker_label', coalesce((SELECT NULLIF(p.display_name,'') FROM public.profiles p WHERE p.id = b.booker_user_id), '家庭用户')
    ) ORDER BY b.created_at DESC), '[]'::jsonb)
    INTO v_result FROM public.availability_bookings b
    WHERE b.status = 'applied' AND EXISTS (
      SELECT 1 FROM public.community_posts p WHERE p.id = b.post_id AND p.author_id = (SELECT auth.uid()));
  ELSE
    v_result := '[]'::jsonb;
  END IF;
  RETURN v_result;
END $func$;

GRANT EXECUTE ON FUNCTION public.book_availability(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_availability_booking(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_my_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_my_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_availability(uuid, text, text, date, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_availability_bookings() TO authenticated;
GRANT SELECT ON public.availability_bookings TO authenticated;
