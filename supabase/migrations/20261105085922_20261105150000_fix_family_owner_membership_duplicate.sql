create or replace function public.ensure_family_for_current_user()
returns uuid
language plpgsql
security definer
set search_path = ''
set row_security = 'off'
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_family_id uuid;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select p.display_name into v_display_name
  from public.profiles p
  where p.id = v_user_id and p.role = 'family';

  if not found then
    raise exception 'A family profile is required to create a family';
  end if;

  select m.family_id into v_family_id
  from public.family_memberships m
  where m.user_id = v_user_id and m.status = 'active'
  limit 1;

  if v_family_id is not null then
    return v_family_id;
  end if;

  insert into public.families (created_by, name)
  values (v_user_id, coalesce(nullif(v_display_name, ''), '我的') || '的家庭')
  returning id into v_family_id;

  -- family_owner_after_insert creates the owner's active membership automatically.
  return v_family_id;
end;
$function$;

revoke all on function public.ensure_family_for_current_user() from public, anon;
grant execute on function public.ensure_family_for_current_user() to authenticated;
