-- Cloud-only safety check-ins and family alerts. No clinical values are stored here.
create unique index if not exists family_members_id_family_safety_unique on public.family_members(id,family_id);

create table public.member_safety_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  self_check_user_id uuid references public.profiles(id) on delete set null,
  enabled boolean not null default false,
  consent_confirmed boolean not null default false,
  enabled_at timestamptz,
  paused_at timestamptz,
  last_signal_at timestamptz,
  created_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (family_id, member_id),
  constraint member_safety_member_family_fk foreign key (member_id, family_id)
    references public.family_members(id, family_id) on delete cascade
);

create table public.member_safety_signals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  source text not null check (source in ('self_check', 'health_measurement', 'family_confirmation')),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  constraint member_safety_signal_member_family_fk foreign key (member_id, family_id)
    references public.family_members(id, family_id) on delete cascade
);
create index member_safety_signals_member_time_idx on public.member_safety_signals(member_id, recorded_at desc);

create table public.member_safety_alerts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  setting_id uuid not null references public.member_safety_settings(id) on delete cascade,
  cycle_started_at timestamptz not null,
  last_signal_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'contacting', 'unable_to_reach', 'confirmed_safe', 'resolved_by_member')),
  resolution_note text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (setting_id, cycle_started_at),
  constraint member_safety_alert_member_family_fk foreign key (member_id, family_id)
    references public.family_members(id, family_id) on delete cascade
);
create index member_safety_alerts_family_status_idx on public.member_safety_alerts(family_id, status, created_at desc);

create table public.member_safety_alert_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  alert_id uuid not null references public.member_safety_alerts(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('created','contacting','unable_to_reach','confirmed_safe','resolved_by_member')),
  note text,
  created_at timestamptz not null default now()
);

create table public.member_safety_recipients (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  setting_id uuid not null references public.member_safety_settings(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (setting_id, recipient_user_id)
);

-- Durable outbox, including one bounded follow-up. No message body is persisted.
create table public.member_safety_notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  alert_id uuid not null references public.member_safety_alerts(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  notification_kind text not null check (notification_kind in ('initial', 'follow_up')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'disabled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  provider_message_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (alert_id, recipient_user_id, notification_kind)
);
create index member_safety_notifications_due_idx on public.member_safety_notifications(status, next_attempt_at, lease_until);

alter table public.member_safety_settings enable row level security;
alter table public.member_safety_signals enable row level security;
alter table public.member_safety_alerts enable row level security;
alter table public.member_safety_alert_events enable row level security;
alter table public.member_safety_recipients enable row level security;
alter table public.member_safety_notifications enable row level security;

create policy member_safety_settings_read on public.member_safety_settings for select to authenticated
  using (public.is_family_member(family_id));
create policy member_safety_settings_manage on public.member_safety_settings for all to authenticated
  using (public.can_manage_family(family_id)) with check (public.can_manage_family(family_id));
create policy member_safety_signals_read on public.member_safety_signals for select to authenticated
  using (public.is_family_member(family_id));
create policy member_safety_alerts_read on public.member_safety_alerts for select to authenticated
  using (public.is_family_member(family_id));
create policy member_safety_alert_events_read on public.member_safety_alert_events for select to authenticated
  using (public.is_family_member(family_id));
create policy member_safety_recipients_read on public.member_safety_recipients for select to authenticated
  using (public.is_family_member(family_id));
-- Notifications/outbox are never readable or writable by clients.

do $$
declare v_table text;
begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime') then
    foreach v_table in array array['member_safety_alerts','member_safety_settings'] loop
      if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=v_table) then
        execute format('alter publication supabase_realtime add table public.%I',v_table);
      end if;
    end loop;
  end if;
end;
$$;

revoke all on public.member_safety_settings, public.member_safety_signals, public.member_safety_alerts, public.member_safety_alert_events,
  public.member_safety_recipients, public.member_safety_notifications from anon, authenticated;
grant select on public.member_safety_settings, public.member_safety_signals, public.member_safety_alerts, public.member_safety_alert_events,
  public.member_safety_recipients to authenticated;

create or replace function public.configure_member_safety(
  p_family_id uuid,
  p_member_id uuid,
  p_enabled boolean,
  p_consent_confirmed boolean,
  p_recipient_user_ids uuid[] default '{}',
  p_self_check_user_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_setting public.member_safety_settings%rowtype;
  v_user_id uuid := auth.uid();
  v_recipient_count integer;
begin
  if v_user_id is null or not public.can_manage_family(p_family_id) then raise exception '无权管理此家庭的安心守护'; end if;
  if not exists (select 1 from public.family_members fm where fm.id=p_member_id and fm.family_id=p_family_id) then raise exception '家庭成员不存在'; end if;
  if p_enabled and not p_consent_confirmed then raise exception '启用前须确认已告知成员并获得同意或有权代为管理'; end if;
  if p_enabled and p_self_check_user_id is null then raise exception '请选择该成员本人用于报平安的云端账号'; end if;
  if p_enabled and not exists (
    select 1 from public.family_memberships m join public.profiles p on p.id=m.user_id join auth.users u on u.id=m.user_id
    where m.family_id=p_family_id and m.user_id=p_self_check_user_id and m.status='active' and p.role='family' and u.email_confirmed_at is not null
  ) then raise exception '本人报平安账号必须是该家庭中邮箱已验证的家庭账号'; end if;
  if p_enabled and coalesce(cardinality(p_recipient_user_ids),0)=0 then raise exception '至少选择一位已验证邮箱的家庭联系人'; end if;
  if exists (
    select 1 from unnest(coalesce(p_recipient_user_ids,'{}'::uuid[])) x
    left join public.family_memberships fm on fm.family_id=p_family_id and fm.user_id=x and fm.status='active'
    left join auth.users u on u.id=x and u.email_confirmed_at is not null
    left join public.profiles profile on profile.id=x
    where fm.user_id is null or u.id is null or profile.role is distinct from 'family' or x=v_user_id
  ) then raise exception '通知对象必须是其他已加入家庭且邮箱已验证的账号'; end if;
  select count(distinct x) into v_recipient_count from unnest(coalesce(p_recipient_user_ids,'{}'::uuid[])) x;

  insert into public.member_safety_settings as existing_setting(family_id,member_id,self_check_user_id,enabled,consent_confirmed,enabled_at,paused_at,last_signal_at,created_by,updated_at)
  values (p_family_id,p_member_id,p_self_check_user_id,p_enabled,p_consent_confirmed,case when p_enabled then now() end,case when p_enabled then null else now() end,case when p_enabled then now() end,v_user_id,now())
  on conflict (family_id,member_id) do update set enabled=excluded.enabled, consent_confirmed=excluded.consent_confirmed,
    self_check_user_id=case when excluded.enabled then excluded.self_check_user_id else existing_setting.self_check_user_id end,
    enabled_at=case when excluded.enabled then now() else existing_setting.enabled_at end,
    paused_at=case when excluded.enabled then null else now() end,
    last_signal_at=case when excluded.enabled and not existing_setting.enabled then now() else existing_setting.last_signal_at end,
    updated_at=now()
  returning * into v_setting;

  delete from public.member_safety_recipients where setting_id=v_setting.id;
  if p_enabled then
    insert into public.member_safety_recipients(family_id,setting_id,recipient_user_id)
    select p_family_id,v_setting.id,x from (select distinct unnest(p_recipient_user_ids) x) selected;
  end if;
  return jsonb_build_object('setting_id',v_setting.id,'enabled',v_setting.enabled,'recipient_count',case when p_enabled then v_recipient_count else 0 end,'last_signal_at',v_setting.last_signal_at);
end;
$$;
revoke all on function public.configure_member_safety(uuid,uuid,boolean,boolean,uuid[],uuid) from public, anon;
grant execute on function public.configure_member_safety(uuid,uuid,boolean,boolean,uuid[],uuid) to authenticated;

create or replace function public.list_member_safety_recipients(p_family_id uuid)
returns table(user_id uuid,display_name text,email text)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.can_manage_family(p_family_id) then raise exception '无权查看家庭通知联系人'; end if;
  return query
    select m.user_id,p.display_name,u.email
    from public.family_memberships m join public.profiles p on p.id=m.user_id
    join auth.users u on u.id=m.user_id
    where m.family_id=p_family_id and m.status='active' and m.user_id is not null
      and u.email_confirmed_at is not null and p.role='family'
    order by p.display_name;
end;
$$;
revoke all on function public.list_member_safety_recipients(uuid) from public, anon;
grant execute on function public.list_member_safety_recipients(uuid) to authenticated;

create or replace function public.record_member_safety_signal(p_family_id uuid, p_member_id uuid, p_source text)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v_now timestamptz := now(); v_setting_id uuid;
begin
  if auth.uid() is null or not public.is_family_member(p_family_id) then raise exception '无权记录此家庭的平安信号'; end if;
  if p_source not in ('self_check','health_measurement') then raise exception '不支持的平安信号来源'; end if;
  if not exists (select 1 from public.family_members fm where fm.id=p_member_id and fm.family_id=p_family_id) then raise exception '家庭成员不存在'; end if;
  if p_source='self_check' and not exists (
    select 1 from public.member_safety_settings s where s.family_id=p_family_id and s.member_id=p_member_id and s.enabled and s.self_check_user_id=auth.uid()
  ) then raise exception '当前账号未被指定为该成员的本人报平安账号'; end if;
  insert into public.member_safety_signals(family_id,member_id,source,recorded_by,recorded_at) values (p_family_id,p_member_id,p_source,auth.uid(),v_now);
  update public.member_safety_settings set last_signal_at=v_now,updated_at=v_now
    where family_id=p_family_id and member_id=p_member_id and enabled returning id into v_setting_id;
  if p_source='self_check' and v_setting_id is not null then
    with resolved as (
      update public.member_safety_alerts set status='resolved_by_member',resolved_by=auth.uid(),resolved_at=v_now
      where setting_id=v_setting_id and status in ('open','contacting','unable_to_reach') returning id,family_id
    )
    insert into public.member_safety_alert_events(family_id,alert_id,actor_user_id,event_type)
      select family_id,id,auth.uid(),'resolved_by_member' from resolved;
  end if;
  return v_now;
end;
$$;
revoke all on function public.record_member_safety_signal(uuid,uuid,text) from public, anon;
grant execute on function public.record_member_safety_signal(uuid,uuid,text) to authenticated;

create or replace function public.resolve_member_safety_alert(p_alert_id uuid,p_resolution text,p_note text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_alert public.member_safety_alerts%rowtype; v_now timestamptz := now();
begin
  select * into v_alert from public.member_safety_alerts where id=p_alert_id for update;
  if not found or auth.uid() is null or not public.is_family_member(v_alert.family_id) then raise exception '无权处理此告警'; end if;
  if p_resolution not in ('confirmed_safe','contacting','unable_to_reach') then raise exception '不支持的告警处理状态'; end if;
  update public.member_safety_alerts set status=p_resolution,
    resolved_by=case when p_resolution='confirmed_safe' then auth.uid() else null end,
    resolved_at=case when p_resolution='confirmed_safe' then v_now else null end,
    resolution_note=nullif(left(btrim(coalesce(p_note,'')),500),'')
    where id=p_alert_id;
  if p_resolution='confirmed_safe' then
    update public.member_safety_settings set last_signal_at=v_now,updated_at=v_now where id=v_alert.setting_id;
    insert into public.member_safety_signals(family_id,member_id,source,recorded_by,recorded_at)
      values(v_alert.family_id,v_alert.member_id,'family_confirmation',auth.uid(),v_now);
  end if;
  insert into public.member_safety_alert_events(family_id,alert_id,actor_user_id,event_type,note)
    values(v_alert.family_id,p_alert_id,auth.uid(),p_resolution,nullif(left(btrim(coalesce(p_note,'')),500),''));
  return jsonb_build_object('alert_id',p_alert_id,'status',p_resolution,'resolved_at',case when p_resolution='confirmed_safe' then v_now else null end);
end;
$$;
revoke all on function public.resolve_member_safety_alert(uuid,text,text) from public, anon;
grant execute on function public.resolve_member_safety_alert(uuid,text,text) to authenticated;

-- Called by a trusted server job. Atomically creates alerts/outbox rows and leases due notifications.
create or replace function public.claim_due_member_safety_alerts(p_now timestamptz default now())
returns setof jsonb language plpgsql security definer set search_path = '' as $$
declare v_setting record; v_alert_id uuid; v_notification record;
begin
  for v_setting in
    select s.*, fm.name member_name from public.member_safety_settings s
    join public.family_members fm on fm.id=s.member_id and fm.family_id=s.family_id
    where s.enabled and s.last_signal_at <= p_now - interval '48 hours'
      and not exists (select 1 from public.member_safety_alerts a where a.setting_id=s.id and a.status in ('open','contacting','unable_to_reach'))
  loop
    insert into public.member_safety_alerts(family_id,member_id,setting_id,cycle_started_at,last_signal_at)
      values(v_setting.family_id,v_setting.member_id,v_setting.id,v_setting.last_signal_at,v_setting.last_signal_at)
      on conflict(setting_id,cycle_started_at) do nothing returning id into v_alert_id;
    if v_alert_id is not null then
      insert into public.member_safety_alert_events(family_id,alert_id,event_type)
        values(v_setting.family_id,v_alert_id,'created');
      insert into public.member_safety_notifications(family_id,alert_id,recipient_user_id,notification_kind)
      select v_setting.family_id,v_alert_id,r.recipient_user_id,'initial' from public.member_safety_recipients r
      join public.family_memberships fm on fm.family_id=r.family_id and fm.user_id=r.recipient_user_id and fm.status='active'
      join auth.users u on u.id=r.recipient_user_id and u.email_confirmed_at is not null
      where r.setting_id=v_setting.id on conflict do nothing;
    end if;
    v_alert_id := null;
  end loop;

  insert into public.member_safety_notifications(family_id,alert_id,recipient_user_id,notification_kind)
  select a.family_id,a.id,r.recipient_user_id,'follow_up'
  from public.member_safety_alerts a
  join public.member_safety_settings s on s.id=a.setting_id and s.enabled
  join public.member_safety_recipients r on r.setting_id=s.id
  join public.family_memberships fm on fm.family_id=r.family_id and fm.user_id=r.recipient_user_id and fm.status='active'
  join auth.users u on u.id=r.recipient_user_id and u.email_confirmed_at is not null
  where a.status in ('open','contacting','unable_to_reach') and a.created_at <= p_now - interval '2 hours'
  on conflict do nothing;

  for v_notification in
    with due as (
      select n.id from public.member_safety_notifications n
      join public.member_safety_alerts a on a.id=n.alert_id and a.status in ('open','contacting','unable_to_reach')
      join public.member_safety_settings s on s.id=a.setting_id and s.enabled
      where n.next_attempt_at<=p_now and n.attempt_count<6
        and (n.status in ('pending','failed') or (n.status='processing' and n.lease_until<p_now))
      order by n.next_attempt_at,n.created_at
      for update of n skip locked limit 100
    ), claimed as (
      update public.member_safety_notifications n set status='processing',attempt_count=n.attempt_count+1,lease_until=p_now+interval '5 minutes'
      from due where n.id=due.id returning n.*
    )
    select c.id notification_id,c.notification_kind,c.attempt_count,c.alert_id,c.recipient_user_id,
      a.family_id,a.member_id,a.last_signal_at,fm.name member_name,u.email recipient_email
    from claimed c join public.member_safety_alerts a on a.id=c.alert_id
    join public.family_members fm on fm.id=a.member_id
    join auth.users u on u.id=c.recipient_user_id and u.email_confirmed_at is not null
  loop
    return next jsonb_build_object('notification_id',v_notification.notification_id,'notification_kind',v_notification.notification_kind,
      'attempt_count',v_notification.attempt_count,'alert_id',v_notification.alert_id,'family_id',v_notification.family_id,
      'member_id',v_notification.member_id,'member_label',v_notification.member_name,'last_signal_at',v_notification.last_signal_at,
      'recipient_user_id',v_notification.recipient_user_id,'recipient_email',v_notification.recipient_email);
  end loop;
end;
$$;
revoke all on function public.claim_due_member_safety_alerts(timestamptz) from public, anon, authenticated;
grant execute on function public.claim_due_member_safety_alerts(timestamptz) to service_role;

create or replace function public.complete_member_safety_notification(
  p_notification_id uuid,p_success boolean,p_provider_message_id text default null,p_error_code text default null,p_now timestamptz default now()
) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.member_safety_notifications set
    status=case when p_success then 'sent' else case when attempt_count>=6 then 'disabled' else 'failed' end end,
    provider_message_id=case when p_success then nullif(p_provider_message_id,'') else null end,
    last_error_code=case when p_success then null else left(coalesce(p_error_code,'provider_error'),80) end,
    sent_at=case when p_success then p_now else null end,
    next_attempt_at=case when p_success then next_attempt_at else p_now + make_interval(mins => least(60, power(2, least(attempt_count,5))::integer)) end,
    lease_until=null
  where id=p_notification_id and status='processing';
end;
$$;
revoke all on function public.complete_member_safety_notification(uuid,boolean,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.complete_member_safety_notification(uuid,boolean,text,text,timestamptz) to service_role;

grant usage on schema public to authenticated, service_role;
