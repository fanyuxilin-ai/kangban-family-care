-- Storage policies must not query companion_orders directly after the table's
-- SELECT grant is revoked. Keep the order-file exception behind a narrow,
-- read-only SECURITY DEFINER predicate instead.
create or replace function public.can_access_companion_order_file(p_order_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1
    from public.companion_orders o
    where o.id::text = p_order_id
      and o.escort_id = (select auth.uid())
      and public.is_active_escort()
  )
$$;

revoke all on function public.can_access_companion_order_file(text) from public, anon;
grant execute on function public.can_access_companion_order_file(text) to authenticated;

drop policy if exists kangban_storage_read_family_or_order on storage.objects;
drop policy if exists kangban_storage_read_family_or_assigned_escort on storage.objects;
create policy kangban_storage_read_family_or_assigned_escort on storage.objects for select to authenticated
  using (bucket_id='kangban-private' and (
    public.is_family_member(split_part(name,'/',1)::uuid)
    or public.can_access_companion_order_file(split_part(name,'/',2))
  ));

drop policy if exists kangban_storage_insert_family on storage.objects;
drop policy if exists kangban_storage_insert_family_or_assigned_escort on storage.objects;
create policy kangban_storage_insert_family_or_assigned_escort on storage.objects for insert to authenticated
  with check (bucket_id='kangban-private' and (
    public.can_manage_family(split_part(name,'/',1)::uuid)
    or public.can_access_companion_order_file(split_part(name,'/',2))
  ));

drop policy if exists kangban_storage_update_owned_family_or_escort on storage.objects;
create policy kangban_storage_update_owned_family_or_escort on storage.objects for update to authenticated
  using (bucket_id='kangban-private' and owner_id=(select auth.uid())::text)
  with check (bucket_id='kangban-private' and owner_id=(select auth.uid())::text and (
    public.can_manage_family(split_part(name,'/',1)::uuid)
    or public.can_access_companion_order_file(split_part(name,'/',2))
  ));
