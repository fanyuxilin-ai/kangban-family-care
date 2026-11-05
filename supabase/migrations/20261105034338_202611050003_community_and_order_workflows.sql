-- Keep the approved post-creation RPC available when M1 has already been applied.
create or replace function public.create_demand_post(
  p_family_id uuid, p_patient_member_id uuid, p_author_label text, p_region text,
  p_hospital_name text, p_service_date date, p_service_type text, p_summary text,
  p_need_text text, p_budget_min numeric default null, p_budget_max numeric default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_post uuid;
begin
  if not public.can_manage_family(p_family_id) or public.current_profile_role() <> 'family' then raise exception '无权发布该家庭需求'; end if;
  if length(btrim(coalesce(p_summary,''))) < 2 or length(btrim(coalesce(p_need_text,''))) < 2 then raise exception '请填写需求摘要和服务说明'; end if;
  if p_patient_member_id is not null and not exists(select 1 from public.family_members m where m.id=p_patient_member_id and m.family_id=p_family_id) then raise exception '就诊成员不属于当前家庭'; end if;
  insert into public.community_posts(type,author_id,family_id,author_label,region,hospital_name,service_date,service_type,summary,budget_min,budget_max)
  values('demand',(select auth.uid()),p_family_id,left(btrim(p_author_label),48),left(btrim(p_region),100),left(btrim(p_hospital_name),160),p_service_date,left(btrim(p_service_type),60),left(btrim(p_summary),200),p_budget_min,p_budget_max)
  returning id into v_post;
  insert into public.community_post_details(post_id,patient_member_id,patient_label,need_text,created_by)
  select v_post,p_patient_member_id,coalesce(m.name,''),left(btrim(p_need_text),2000),(select auth.uid())
  from (select 1) seed left join public.family_members m on m.id=p_patient_member_id;
  return v_post;
end;
$$;
revoke all on function public.create_demand_post(uuid,uuid,text,text,text,date,text,text,text,numeric,numeric) from public,anon;
grant execute on function public.create_demand_post(uuid,uuid,text,text,text,date,text,text,text,numeric,numeric) to authenticated;

alter table public.companion_orders alter column execution set default '{"items":[{"key":"phone_confirmation","label":"电话确认就诊安排","done":false,"evidence_required":false},{"key":"registration","label":"协助取号挂号","done":false,"evidence_required":true},{"key":"waiting","label":"候诊陪同","done":false,"evidence_required":false},{"key":"symptom_handoff","label":"协助代述病情","done":false,"evidence_required":false},{"key":"exam_payment_medicine","label":"检查、缴费或取药协助","done":false,"evidence_required":true},{"key":"report","label":"协助领取报告","done":false,"evidence_required":true},{"key":"follow_up","label":"协助预约复诊","done":false,"evidence_required":false},{"key":"service_summary","label":"完成服务小结","done":false,"evidence_required":false}]}'::jsonb;

drop policy if exists kangban_storage_read_family_or_order on storage.objects;
create policy kangban_storage_read_family_or_order on storage.objects for select to authenticated
  using (bucket_id='kangban-private' and (
    public.is_family_member(split_part(name,'/',1)::uuid)
    or exists(select 1 from public.companion_orders o where o.id::text=split_part(name,'/',2) and o.escort_id=(select auth.uid()))
  ));
drop policy if exists kangban_storage_insert_family on storage.objects;
create policy kangban_storage_insert_family_or_assigned_escort on storage.objects for insert to authenticated
  with check (bucket_id='kangban-private' and (
    public.can_manage_family(split_part(name,'/',1)::uuid)
    or exists(select 1 from public.companion_orders o where o.id::text=split_part(name,'/',2) and o.escort_id=(select auth.uid()) and public.is_active_escort())
  ));
drop policy if exists kangban_storage_update_owned_family_or_escort on storage.objects;
create policy kangban_storage_update_owned_family_or_escort on storage.objects for update to authenticated
  using (bucket_id='kangban-private' and owner_id=(select auth.uid())::text)
  with check (bucket_id='kangban-private' and owner_id=(select auth.uid())::text and (
    public.can_manage_family(split_part(name,'/',1)::uuid)
    or exists(select 1 from public.companion_orders o where o.id::text=split_part(name,'/',2) and o.escort_id=(select auth.uid()) and public.is_active_escort())
  ));

-- Only the assigned escort may begin/complete service. Either participant can cancel.
create or replace function public.transition_companion_order(p_order_id uuid,p_action text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_order public.companion_orders%rowtype;
begin
  select * into v_order from public.companion_orders where id=p_order_id for update;
  if not found then raise exception '订单不存在'; end if;
  if p_action='start' then
    if v_order.escort_id<>(select auth.uid()) or not public.is_active_escort() or v_order.status<>'confirmed' then raise exception '当前账号或订单状态不能开始服务'; end if;
    update public.companion_orders set status='in_service',updated_at=now() where id=p_order_id;
    update public.community_posts set status='in_service',updated_at=now() where id=v_order.post_id;
  elsif p_action='complete' then
    if v_order.escort_id<>(select auth.uid()) or v_order.status<>'in_service' then raise exception '只有接单陪诊师可以完成服务'; end if;
    if exists(select 1 from jsonb_array_elements(coalesce(v_order.execution->'items','[]'::jsonb)) as x(item) where coalesce((x.item->>'done')::boolean,false)=false) then raise exception '请先完成标准履约清单'; end if;
    update public.companion_orders set status='completed',updated_at=now() where id=p_order_id;
    update public.community_posts set status='completed',updated_at=now() where id=v_order.post_id;
  elsif p_action='cancel' then
    if not (public.is_family_member(v_order.family_id) or v_order.escort_id=(select auth.uid())) then raise exception '无权取消此订单'; end if;
    if v_order.status in ('completed','cancelled') then raise exception '订单已结束'; end if;
    update public.companion_orders set status='cancelled',updated_at=now() where id=p_order_id;
    update public.community_posts set status='cancelled',updated_at=now() where id=v_order.post_id;
  else raise exception '不支持的订单操作'; end if;
  return case when p_action='start' then 'in_service' when p_action='complete' then 'completed' else 'cancelled' end;
end;
$$;
revoke all on function public.transition_companion_order(uuid,text) from public,anon;
grant execute on function public.transition_companion_order(uuid,text) to authenticated;

create or replace function public.update_order_checklist(p_order_id uuid,p_item_key text,p_evidence_path text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order public.companion_orders%rowtype; v_item jsonb; v_items jsonb; v_next jsonb;
begin
  select * into v_order from public.companion_orders where id=p_order_id for update;
  if not found or v_order.escort_id<>(select auth.uid()) or v_order.status<>'in_service' or not public.is_active_escort() then raise exception '当前账号或订单状态不能更新履约清单'; end if;
  select x.item into v_item from jsonb_array_elements(coalesce(v_order.execution->'items','[]'::jsonb)) as x(item) where x.item->>'key'=p_item_key;
  if v_item is null then raise exception '履约项目不存在'; end if;
  if coalesce((v_item->>'evidence_required')::boolean,false) then
    if p_evidence_path is null or not exists(select 1 from storage.objects o where o.bucket_id='kangban-private' and o.name=p_evidence_path and o.owner_id=(select auth.uid())::text) then raise exception '该项目需要先由当前陪诊师上传佐证照片'; end if;
    if split_part(p_evidence_path,'/',1)<>v_order.family_id::text or split_part(p_evidence_path,'/',2)<>v_order.id::text then raise exception '佐证文件路径与当前订单不匹配'; end if;
  end if;
  select jsonb_agg(case when item->>'key'=p_item_key then item||jsonb_build_object('done',true,'done_at',now(),'evidence_path',p_evidence_path) else item end order by ordinality)
  into v_items from jsonb_array_elements(v_order.execution->'items') with ordinality as x(item,ordinality);
  v_next:=jsonb_set(v_order.execution,'{items}',coalesce(v_items,'[]'::jsonb),true);
  update public.companion_orders set execution=v_next,updated_at=now() where id=p_order_id;
  return v_next;
end;
$$;
revoke all on function public.update_order_checklist(uuid,text,text) from public,anon;
grant execute on function public.update_order_checklist(uuid,text,text) to authenticated;
