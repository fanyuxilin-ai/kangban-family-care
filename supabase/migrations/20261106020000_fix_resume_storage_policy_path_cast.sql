-- Keep the legacy family/order storage policies from casting the `resumes`
-- prefix to UUID. Resume objects are authorized by the dedicated policies in
-- 20261106010000_signup_resume.sql.
drop policy if exists kangban_storage_read_family_or_assigned_escort on storage.objects;
create policy kangban_storage_read_family_or_assigned_escort on storage.objects
for select to authenticated
using (
  case
    when bucket_id <> 'kangban-private' then false
    when split_part(name, '/', 1) = 'resumes' then false
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_family_member(split_part(name, '/', 1)::uuid)
        or public.can_access_companion_order_file(split_part(name, '/', 2))
    else false
  end
);

drop policy if exists kangban_storage_insert_family_or_assigned_escort on storage.objects;
create policy kangban_storage_insert_family_or_assigned_escort on storage.objects
for insert to authenticated
with check (
  case
    when bucket_id <> 'kangban-private' then false
    when split_part(name, '/', 1) = 'resumes' then false
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_manage_family(split_part(name, '/', 1)::uuid)
        or public.can_access_companion_order_file(split_part(name, '/', 2))
    else false
  end
);

drop policy if exists kangban_storage_update_owned_family_or_escort on storage.objects;
create policy kangban_storage_update_owned_family_or_escort on storage.objects
for update to authenticated
using (bucket_id = 'kangban-private' and owner_id = (select auth.uid())::text)
with check (
  case
    when bucket_id <> 'kangban-private' or owner_id is distinct from (select auth.uid())::text then false
    when split_part(name, '/', 1) = 'resumes'
      then split_part(name, '/', 2) = (select auth.uid())::text
        and public.is_active_escort()
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_manage_family(split_part(name, '/', 1)::uuid)
        or public.can_access_companion_order_file(split_part(name, '/', 2))
    else false
  end
);
