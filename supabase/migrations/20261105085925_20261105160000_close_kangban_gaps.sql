-- 云端任务分享、受信管理员审核与最小化订单数据。
-- 继续复用 companion_orders 的既有分享字段，业务表数量仍为 17。

-- 订单详情不能由陪诊师直接通过 PostgREST 读取；全部订单由受限 RPC 提供。
revoke select on public.companion_orders from authenticated;
drop policy if exists post_details_private_read on public.community_post_details;
create policy post_details_private_read on public.community_post_details for select to authenticated
  using (exists(select 1 from public.community_posts p where p.id=post_id and public.is_family_member(p.family_id)));

create or replace function public.list_my_companion_orders()
returns jsonb language plpgsql stable security definer set search_path = '' set row_security = off as $$
declare v_result jsonb;
begin
  if (select auth.uid()) is null then raise exception '请先登录'; end if;
  select coalesce(jsonb_agg(
    case when public.is_family_member(o.family_id) then jsonb_build_object(
      'id',o.id,'post_id',o.post_id,'signup_id',o.signup_id,'family_id',o.family_id,
      'patient_member_id',o.patient_member_id,'escort_id',o.escort_id,'service_type',o.service_type,
      'hospital_name',o.hospital_name,'service_date',o.service_date,'starts_at',o.starts_at,'ends_at',o.ends_at,
      'need_summary',o.need_summary,'patient_label',coalesce((select d.patient_label from public.community_post_details d where d.post_id=o.post_id),''),
      'price',o.price,'status',o.status,'execution',o.execution,
      'service_report',o.service_report,'reviews',o.reviews,'family_confirmed_at',o.family_confirmed_at,
      'escort_confirmed_at',o.escort_confirmed_at,'share_expires_at',o.share_expires_at,
      'share_revoked_at',o.share_revoked_at,'share_with_self_description',o.share_with_self_description,
      'share_access_logs',o.share_access_logs,'created_at',o.created_at,'updated_at',o.updated_at
    ) else jsonb_build_object(
      'id',o.id,'family_id',o.family_id,'escort_id',o.escort_id,'service_type',o.service_type,
      'hospital_name',o.hospital_name,'service_date',o.service_date,'starts_at',o.starts_at,'ends_at',o.ends_at,
      'price',o.price,'status',o.status,'execution',o.execution,'created_at',o.created_at,'updated_at',o.updated_at,
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
$$;

create or replace function public.is_kangban_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt()->'app_metadata'->>'kangban_admin','false')='true'
$$;

create or replace function public.list_pending_escorts()
returns jsonb language plpgsql stable security definer set search_path = '' set row_security = off as $$
begin
  if not public.is_kangban_admin() then raise exception '需要康伴管理员权限'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'user_id',e.user_id,'display_name',e.display_name,'experience',e.experience,'service_area',e.service_area,'bio',e.bio,
    'created_at',e.created_at,'account_status',p.account_status
  ) order by e.created_at)
    from public.escort_profiles e join public.profiles p on p.id=e.user_id where e.review_status='pending_review'), '[]'::jsonb);
end;
$$;

create or replace function public.create_order_task_share(p_order_id uuid,p_code_hash text,p_with_self_description boolean default false)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v_expires timestamptz;
begin
  if (select auth.uid()) is null or length(coalesce(p_code_hash,''))<>64 or p_code_hash !~ '^[0-9a-f]{64}$' then raise exception '分享参数无效'; end if;
  if coalesce(p_with_self_description,false) and not exists(select 1 from public.companion_orders o where o.id=p_order_id and o.patient_member_id is not null) then
    raise exception '该订单尚未关联家庭成员，不能分享诊前自我描述';
  end if;
  update public.companion_orders o set share_code_hash=p_code_hash,share_expires_at=now()+interval '10 minutes',
    share_revoked_at=null,share_with_self_description=coalesce(p_with_self_description,false),updated_at=now()
  where o.id=p_order_id and public.can_manage_family(o.family_id) and o.status in ('confirmed','in_service')
  returning share_expires_at into v_expires;
  if v_expires is null then raise exception '只有已确认或服务中的订单可以分享'; end if;
  return v_expires;
end;
$$;

create or replace function public.revoke_order_task_share(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.companion_orders o set share_revoked_at=now(),updated_at=now()
  where o.id=p_order_id and public.can_manage_family(o.family_id) and o.share_code_hash is not null;
  if not found then raise exception '找不到可撤销的任务分享'; end if;
  return true;
end;
$$;

create or replace function public.lookup_order_task_share(p_code_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order public.companion_orders%rowtype; v_detail public.community_post_details%rowtype; v_self jsonb;
begin
  if (select auth.uid()) is null or not public.is_active_escort() then raise exception '仅已审核陪诊师可验证分享码'; end if;
  select * into v_order from public.companion_orders o where o.share_code_hash=p_code_hash
    and o.escort_id=(select auth.uid()) and o.share_expires_at>now() and o.share_revoked_at is null
    and o.status in ('confirmed','in_service') for update;
  if not found then raise exception '分享码无效、已过期、已撤销或不属于当前订单'; end if;
  select * into v_detail from public.community_post_details d where d.post_id=v_order.post_id;
  if v_order.share_with_self_description then
    select item into v_self from public.families f
      cross join lateral jsonb_array_elements(coalesce(f.demo_state->'preVisitDescriptions','[]'::jsonb)) item
      where f.id=v_order.family_id
        and v_order.patient_member_id is not null
        and item->>'memberId'=(select m.legacy_id from public.family_members m where m.id=v_order.patient_member_id)
      order by coalesce(item->>'createdAt','') desc limit 1;
  end if;
  update public.companion_orders set share_access_logs=coalesce(share_access_logs,'[]'::jsonb)||jsonb_build_array(
    jsonb_build_object('escort_id',(select auth.uid()),'accessed_at',now(),'what',case when share_with_self_description then '任务信息与诊前自我描述' else '任务信息' end)
  ),updated_at=now() where id=v_order.id;
  return jsonb_build_object(
    'order_id',v_order.id,'patient_label',v_detail.patient_label,'hospital_name',v_order.hospital_name,
    'service_date',v_order.service_date,'service_type',v_order.service_type,'need_summary',v_order.need_summary,
    'self_description',case when v_order.share_with_self_description and v_self is not null
      then jsonb_build_object('text',coalesce(v_self->>'text',''),'created_at',coalesce(v_self->>'createdAt','')) else null end,
    'accessed_at',now()
  );
end;
$$;

create or replace function public.submit_companion_order_review(p_order_id uuid,p_score integer,p_comment text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order public.companion_orders%rowtype; v_role text; v_review jsonb;
begin
  if p_score<1 or p_score>5 or length(coalesce(p_comment,''))>160 then raise exception '评价内容无效'; end if;
  select * into v_order from public.companion_orders where id=p_order_id for update;
  if not found or v_order.status<>'completed' then raise exception '只有已完成订单可以评价'; end if;
  if public.is_family_member(v_order.family_id) then v_role='family';
  elsif v_order.escort_id=(select auth.uid()) and public.is_active_escort() then v_role='escort';
  else raise exception '只有本订单双方可以评价'; end if;
  if coalesce(v_order.reviews->v_role,'null'::jsonb)<>'null'::jsonb then raise exception '该订单已提交过评价'; end if;
  v_review=jsonb_build_object('score',p_score,'comment',left(btrim(coalesce(p_comment,'')),160),'created_at',now());
  update public.companion_orders set reviews=jsonb_set(coalesce(reviews,'{}'::jsonb),array[v_role],v_review,true),updated_at=now() where id=p_order_id;
  return v_review;
end;
$$;

create or replace function public.review_escort_account(p_user_id uuid,p_decision text)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_kangban_admin() then raise exception '需要康伴管理员权限'; end if;
  if p_decision not in ('approved','rejected') then raise exception '审核决定无效'; end if;
  update public.escort_profiles set review_status=p_decision,updated_at=now()
    where user_id=p_user_id and review_status='pending_review';
  if not found then raise exception '陪诊师不存在或已审核'; end if;
  update public.profiles set account_status=case when p_decision='approved' then 'active' else 'suspended' end,updated_at=now()
    where id=p_user_id and role='escort';
  return p_decision;
end;
$$;

revoke all on function public.list_my_companion_orders() from public,anon;
revoke all on function public.create_order_task_share(uuid,text,boolean) from public,anon;
revoke all on function public.revoke_order_task_share(uuid) from public,anon;
revoke all on function public.lookup_order_task_share(text) from public,anon;
revoke all on function public.submit_companion_order_review(uuid,integer,text) from public,anon;
revoke all on function public.is_kangban_admin() from public,anon;
revoke all on function public.list_pending_escorts() from public,anon;
revoke all on function public.review_escort_account(uuid,text) from public,anon;
grant execute on function public.list_my_companion_orders() to authenticated;
grant execute on function public.create_order_task_share(uuid,text,boolean) to authenticated;
grant execute on function public.revoke_order_task_share(uuid) to authenticated;
grant execute on function public.lookup_order_task_share(text) to authenticated;
grant execute on function public.submit_companion_order_review(uuid,integer,text) to authenticated;
grant execute on function public.is_kangban_admin() to authenticated;
grant execute on function public.list_pending_escorts() to authenticated;
grant execute on function public.review_escort_account(uuid,text) to authenticated;
