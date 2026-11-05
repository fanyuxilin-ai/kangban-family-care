-- 康伴 M1 云端核心数据层。所有健康/保单资料均按家庭归属控制，不向 anon 开放。
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('family','escort')),
  account_status text not null check (account_status in ('active','pending_review','suspended')),
  display_name text not null default '康伴用户',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  v_role := case when new.raw_user_meta_data ->> 'role' = 'escort' then 'escort' else 'family' end;
  insert into public.profiles(id, role, account_status, display_name)
  values (
    new.id,
    v_role,
    case when v_role = 'escort' then 'pending_review' else 'active' end,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), '康伴用户')
  ) on conflict (id) do nothing;
  if v_role = 'escort' then
    insert into public.escort_profiles(user_id,display_name,review_status)
    values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), '康伴陪诊师'), 'pending_review')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default '我的家庭',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  invite_email text,
  invite_token uuid unique default gen_random_uuid(),
  membership_role text not null check (membership_role in ('owner','caregiver','viewer')),
  status text not null default 'active' check (status in ('pending','active','revoked')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint family_membership_identity check (user_id is not null or invite_email is not null)
);
create unique index family_memberships_user_unique on public.family_memberships(family_id,user_id) where user_id is not null;
create unique index family_memberships_email_unique on public.family_memberships(family_id,lower(invite_email)) where invite_email is not null;
create index family_memberships_user_idx on public.family_memberships(user_id,family_id) where status = 'active';

create or replace function public.create_family_owner_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.family_memberships(family_id,user_id,membership_role,status,created_by,accepted_at)
  values (new.id,new.created_by,'owner','active',new.created_by,now());
  return new;
end;
$$;
revoke all on function public.create_family_owner_membership() from public, anon, authenticated;
create trigger family_owner_after_insert after insert on public.families
for each row execute function public.create_family_owner_membership();

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  legacy_id text,
  name text not null,
  relationship text not null default '家庭成员',
  age smallint check (age is null or age between 0 and 125),
  health_profile jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index family_members_family_idx on public.family_members(family_id,display_order);

create table public.escort_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  experience text not null default '',
  service_area text not null default '',
  bio text not null default '',
  review_status text not null default 'pending_review' check (review_status in ('pending_review','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  legacy_id text,
  metric text not null,
  value numeric not null,
  unit text not null default '',
  measured_at timestamptz not null,
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index body_metrics_member_time_idx on public.body_metrics(member_id,measured_at desc);

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  legacy_id text,
  entry_type text not null check (entry_type in ('medication','activity','measurement','note','appointment','other')),
  title text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index daily_entries_member_time_idx on public.daily_entries(member_id,occurred_at desc);

create table public.medical_encounters (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  legacy_id text,
  encounter_date date not null,
  hospital text not null default '',
  department text not null default '',
  summary text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index medical_encounters_member_date_idx on public.medical_encounters(member_id,encounter_date desc);

create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  encounter_id uuid references public.medical_encounters(id) on delete set null,
  legacy_id text,
  record_type text not null,
  title text not null,
  hospital text not null default '',
  record_date date,
  summary text not null default '',
  ocr_text text not null default '',
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','confirmed','needs_review')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index medical_records_member_date_idx on public.medical_records(member_id,record_date desc);
create index medical_records_encounter_idx on public.medical_records(encounter_id);

create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  legacy_id text,
  policy_type text not null check (policy_type in ('social','commercial')),
  category text not null default 'medical',
  name text not null,
  company text not null default '',
  policy_number text not null default '',
  coverage text not null default '',
  starts_on date,
  ends_on date,
  policy_terms jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index insurance_policies_member_idx on public.insurance_policies(member_id,policy_type);

create table public.reimbursements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  encounter_id uuid references public.medical_encounters(id) on delete set null,
  policy_id uuid not null references public.insurance_policies(id) on delete restrict,
  legacy_id text,
  status text not null default 'organizing' check (status in ('organizing','submitted','supplement_requested','processing','completed','rejected')),
  submitted_at timestamptz,
  result_note text not null default '',
  status_history jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id,legacy_id)
);
create index reimbursements_member_status_idx on public.reimbursements(member_id,status);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('demand','availability')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  author_label text not null,
  region text not null default '',
  hospital_name text not null default '',
  service_date date,
  start_time time,
  end_time time,
  service_type text not null default '',
  summary text not null default '',
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  status text not null default 'open' check (status in ('open','has_applicants','awaiting_confirmation','confirmed','in_service','completed','cancelled','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_owner_by_type check ((type='demand' and family_id is not null) or (type='availability' and family_id is null)),
  constraint valid_post_time check (end_time is null or start_time is null or end_time > start_time),
  constraint valid_budget check (budget_min is null or budget_max is null or budget_max >= budget_min)
);
create index community_posts_feed_idx on public.community_posts(status,type,service_date,created_at desc);
create index community_posts_author_idx on public.community_posts(author_id,created_at desc);

create table public.community_post_details (
  post_id uuid primary key references public.community_posts(id) on delete cascade,
  patient_member_id uuid references public.family_members(id) on delete set null,
  patient_label text not null default '',
  exact_hospital_address text not null default '',
  need_text text not null default '',
  private_notes text not null default '',
  self_description text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_signups (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  escort_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  status text not null default 'applied' check (status in ('applied','selected','declined','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id,escort_id)
);
create index post_signups_escort_idx on public.post_signups(escort_id,status,created_at desc);

create table public.companion_orders (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.community_posts(id) on delete restrict,
  signup_id uuid not null unique references public.post_signups(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete cascade,
  patient_member_id uuid references public.family_members(id) on delete set null,
  escort_id uuid not null references public.profiles(id) on delete restrict,
  service_type text not null,
  hospital_name text not null default '',
  service_date date not null,
  starts_at timestamptz,
  ends_at timestamptz,
  need_summary text not null default '',
  price numeric(10,2),
  status text not null default 'pending_escort_confirmation' check (status in ('pending_escort_confirmation','confirmed','in_service','completed','cancelled')),
  execution jsonb not null default '{"items":[]}'::jsonb,
  service_report jsonb not null default '{}'::jsonb,
  reviews jsonb not null default '{}'::jsonb,
  family_confirmed_at timestamptz,
  escort_confirmed_at timestamptz,
  share_code_hash text,
  share_expires_at timestamptz,
  share_revoked_at timestamptz,
  share_with_self_description boolean not null default false,
  share_access_logs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index companion_orders_family_idx on public.companion_orders(family_id,status,service_date desc);
create index companion_orders_escort_idx on public.companion_orders(escort_id,status,service_date);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  member_id uuid references public.family_members(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  storage_bucket text not null default 'kangban-private' check (storage_bucket='kangban-private'),
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  entity_type text not null check (entity_type in ('medical_record','insurance_policy','reimbursement','companion_order','community_post')),
  entity_id uuid not null,
  created_at timestamptz not null default now()
);
create index attachments_family_idx on public.attachments(family_id,created_at desc);
create index attachments_entity_idx on public.attachments(entity_type,entity_id);

create table public.migration_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_version text not null,
  source_hash text not null,
  status text not null default 'pending' check (status in ('pending','running','failed','completed')),
  category_counts jsonb not null default '{}'::jsonb,
  cursor jsonb not null default '{}'::jsonb,
  error_message text not null default '',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,source_version,source_hash)
);
create index migration_runs_user_idx on public.migration_runs(user_id,created_at desc);

-- Helper functions are SECURITY DEFINER to avoid policy recursion on memberships/orders.
create or replace function public.current_profile_role()
returns text language sql stable security definer set search_path = '' set row_security = off as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;
create or replace function public.is_active_escort()
returns boolean language sql stable security definer set search_path = '' set row_security = off as $$
  select exists(select 1 from public.profiles p join public.escort_profiles e on e.user_id=p.id
    where p.id=(select auth.uid()) and p.role='escort' and p.account_status='active' and e.review_status='approved')
$$;
create or replace function public.is_family_member(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' set row_security = off as $$
  select exists(select 1 from public.family_memberships m where m.family_id=p_family_id and m.user_id=(select auth.uid()) and m.status='active')
$$;
create or replace function public.can_manage_family(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' set row_security = off as $$
  select exists(select 1 from public.family_memberships m where m.family_id=p_family_id and m.user_id=(select auth.uid()) and m.status='active' and m.membership_role in ('owner','caregiver'))
$$;
create or replace function public.can_view_post_details(p_post_id uuid)
returns boolean language sql stable security definer set search_path = '' set row_security = off as $$
  select exists(select 1 from public.community_posts p where p.id=p_post_id and public.is_family_member(p.family_id))
    or exists(select 1 from public.companion_orders o where o.post_id=p_post_id and o.escort_id=(select auth.uid()) and o.status <> 'cancelled')
$$;
create or replace function public.can_access_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = '' set row_security = off as $$
  select exists(select 1 from public.companion_orders o where o.id=p_order_id and
    (public.is_family_member(o.family_id) or o.escort_id=(select auth.uid())))
$$;
revoke all on function public.current_profile_role() from public, anon;
revoke all on function public.is_active_escort() from public, anon;
revoke all on function public.is_family_member(uuid) from public, anon;
revoke all on function public.can_manage_family(uuid) from public, anon;
revoke all on function public.can_view_post_details(uuid) from public, anon;
revoke all on function public.can_access_order(uuid) from public, anon;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_active_escort() to authenticated;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.can_manage_family(uuid) to authenticated;
grant execute on function public.can_view_post_details(uuid) to authenticated;
grant execute on function public.can_access_order(uuid) to authenticated;

-- RLS and grants: no anon access; row ownership is always checked against auth.uid().
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.family_members enable row level security;
alter table public.escort_profiles enable row level security;
alter table public.body_metrics enable row level security;
alter table public.daily_entries enable row level security;
alter table public.medical_encounters enable row level security;
alter table public.medical_records enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.reimbursements enable row level security;
alter table public.attachments enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_details enable row level security;
alter table public.post_signups enable row level security;
alter table public.companion_orders enable row level security;
alter table public.migration_runs enable row level security;
revoke all on public.profiles,public.families,public.family_memberships,public.family_members,public.escort_profiles,
  public.body_metrics,public.daily_entries,public.medical_encounters,public.medical_records,public.insurance_policies,
  public.reimbursements,public.attachments,public.community_posts,public.community_post_details,public.post_signups,
  public.companion_orders,public.migration_runs from anon;
grant select on public.profiles to authenticated;
grant update(display_name,avatar_url) on public.profiles to authenticated;
grant select,insert on public.families to authenticated;
grant update(name) on public.families to authenticated;
grant select on public.family_memberships to authenticated;
grant select,insert,update,delete on public.family_members to authenticated;
grant select,insert,update,delete on public.body_metrics to authenticated;
grant select,insert,update,delete on public.daily_entries to authenticated;
grant select,insert,update,delete on public.medical_encounters to authenticated;
grant select,insert,update,delete on public.medical_records to authenticated;
grant select,insert,update,delete on public.insurance_policies to authenticated;
grant select,insert,update,delete on public.reimbursements to authenticated;
grant select,insert,delete on public.attachments to authenticated;
grant select,insert,update on public.escort_profiles to authenticated;
grant select,insert,delete on public.community_posts to authenticated;
grant update(region,hospital_name,service_date,start_time,end_time,service_type,summary,budget_min,budget_max,updated_at) on public.community_posts to authenticated;
grant select,insert,update on public.community_post_details to authenticated;
grant select,insert,update on public.post_signups to authenticated;
grant select on public.companion_orders to authenticated;
grant select,insert,update on public.migration_runs to authenticated;

-- Table-specific RLS. Public community feed is intentionally summary-only;
-- patient details live in community_post_details and require family/order access.
create policy profiles_read_self_or_family on public.profiles for select to authenticated
  using (id=(select auth.uid()) or exists(select 1 from public.family_memberships m where m.user_id=profiles.id and public.is_family_member(m.family_id)));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id=(select auth.uid())) with check (id=(select auth.uid()));

create policy families_read_member on public.families for select to authenticated
  using (public.is_family_member(id));
create policy families_create_self on public.families for insert to authenticated
  with check (created_by=(select auth.uid()) and public.current_profile_role()='family');
create policy families_update_caregiver on public.families for update to authenticated
  using (public.can_manage_family(id)) with check (public.can_manage_family(id));

create policy memberships_read_family on public.family_memberships for select to authenticated
  using (public.is_family_member(family_id) or user_id=(select auth.uid()));
create policy members_family_access on public.family_members for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id));
create policy metrics_family_access on public.body_metrics for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy daily_entries_family_access on public.daily_entries for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy encounters_family_access on public.medical_encounters for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy records_family_access on public.medical_records for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy policies_family_access on public.insurance_policies for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy reimbursements_family_access on public.reimbursements for all to authenticated
  using (public.is_family_member(family_id)) with check (public.can_manage_family(family_id) and created_by=(select auth.uid()));
create policy attachments_read_family on public.attachments for select to authenticated
  using (public.is_family_member(family_id));
create policy attachments_insert_family on public.attachments for insert to authenticated
  with check (public.can_manage_family(family_id) and uploaded_by=(select auth.uid()));
create policy attachments_delete_family on public.attachments for delete to authenticated
  using (public.can_manage_family(family_id) and uploaded_by=(select auth.uid()));

create policy escort_profile_read on public.escort_profiles for select to authenticated
  using (user_id=(select auth.uid()) or review_status='approved');
create policy escort_profile_insert_self on public.escort_profiles for insert to authenticated
  with check (user_id=(select auth.uid()) and public.current_profile_role()='escort' and review_status='pending_review');
create policy escort_profile_update_self on public.escort_profiles for update to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy posts_feed_read on public.community_posts for select to authenticated
  using (status <> 'cancelled' or author_id=(select auth.uid()));
create policy posts_create_family_demand on public.community_posts for insert to authenticated
  with check (author_id=(select auth.uid()) and type='demand' and status='open' and public.can_manage_family(family_id) and public.current_profile_role()='family');
create policy posts_create_escort_availability on public.community_posts for insert to authenticated
  with check (author_id=(select auth.uid()) and type='availability' and status='open' and family_id is null and public.is_active_escort());
create policy posts_update_author on public.community_posts for update to authenticated
  using (author_id=(select auth.uid())) with check (author_id=(select auth.uid()));
create policy posts_delete_author on public.community_posts for delete to authenticated
  using (author_id=(select auth.uid()) and status in ('open','closed','cancelled'));
create policy post_details_private_read on public.community_post_details for select to authenticated
  using (public.can_view_post_details(post_id));
create policy post_details_family_insert on public.community_post_details for insert to authenticated
  with check (created_by=(select auth.uid()) and exists(select 1 from public.community_posts p where p.id=post_id and p.type='demand' and public.can_manage_family(p.family_id)));
create policy post_details_family_update on public.community_post_details for update to authenticated
  using (exists(select 1 from public.community_posts p where p.id=post_id and public.can_manage_family(p.family_id)))
  with check (created_by=(select auth.uid()) or exists(select 1 from public.community_posts p where p.id=post_id and public.can_manage_family(p.family_id)));
create policy signups_read_participants on public.post_signups for select to authenticated
  using (escort_id=(select auth.uid()) or exists(select 1 from public.community_posts p where p.id=post_id and public.is_family_member(p.family_id)));
create policy signups_insert_approved_escort on public.post_signups for insert to authenticated
  with check (escort_id=(select auth.uid()) and public.is_active_escort() and exists(select 1 from public.community_posts p where p.id=post_id and p.type='demand' and p.status in ('open','has_applicants')));
create policy signups_update_self_withdraw on public.post_signups for update to authenticated
  using (escort_id=(select auth.uid())) with check (escort_id=(select auth.uid()) and status='withdrawn');
create policy orders_read_participants on public.companion_orders for select to authenticated
  using (public.is_family_member(family_id) or escort_id=(select auth.uid()));
create policy migration_runs_owner on public.migration_runs for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

-- Create public summary and private patient details in one transaction. The
-- public summary must not contain a patient name or medical information.
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

-- Order creation is serialized by locking the post and signup; only a family
-- caregiver can select one applicant and create the single order for a post.
create or replace function public.apply_to_demand(p_post_id uuid,p_note text default '')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_signup uuid;
begin
  if not public.is_active_escort() then raise exception '陪诊师账号尚未审核通过'; end if;
  perform 1 from public.community_posts p where p.id=p_post_id and p.type='demand' and p.status in ('open','has_applicants') for update;
  if not found then raise exception '需求已关闭或不存在'; end if;
  insert into public.post_signups(post_id,escort_id,note,status)
  values(p_post_id,(select auth.uid()),coalesce(p_note,''),'applied')
  on conflict(post_id,escort_id) do update set note=excluded.note,status='applied',updated_at=now()
  returning id into v_signup;
  update public.community_posts set status='has_applicants',updated_at=now() where id=p_post_id and status='open';
  return v_signup;
end;
$$;

create or replace function public.confirm_post_signup(p_signup_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_signup public.post_signups%rowtype; v_post public.community_posts%rowtype; v_detail public.community_post_details%rowtype; v_order uuid;
begin
  select * into v_signup from public.post_signups where id=p_signup_id for update;
  if not found or v_signup.status <> 'applied' then raise exception '报名已处理'; end if;
  select * into v_post from public.community_posts where id=v_signup.post_id for update;
  if not found or v_post.type <> 'demand' or v_post.status not in ('open','has_applicants') or not public.can_manage_family(v_post.family_id) then raise exception '无权确认或需求已关闭'; end if;
  if exists(select 1 from public.companion_orders where post_id=v_post.id) then raise exception '该需求已生成订单'; end if;
  select * into v_detail from public.community_post_details where post_id=v_post.id;
  update public.post_signups set status='selected',updated_at=now() where id=v_signup.id;
  update public.post_signups set status='declined',updated_at=now() where post_id=v_post.id and id<>v_signup.id and status='applied';
  insert into public.companion_orders(post_id,signup_id,family_id,patient_member_id,escort_id,service_type,hospital_name,service_date,starts_at,ends_at,need_summary,status)
  values(v_post.id,v_signup.id,v_post.family_id,v_detail.patient_member_id,v_signup.escort_id,v_post.service_type,v_post.hospital_name,v_post.service_date,
    case when v_post.start_time is null then null else (v_post.service_date+v_post.start_time) at time zone 'Asia/Shanghai' end,
    case when v_post.end_time is null then null else (v_post.service_date+v_post.end_time) at time zone 'Asia/Shanghai' end,
    coalesce(v_detail.need_text,v_post.summary),'pending_escort_confirmation') returning id into v_order;
  update public.community_posts set status='awaiting_confirmation',updated_at=now() where id=v_post.id;
  return v_order;
end;
$$;

create or replace function public.respond_companion_order(p_order_id uuid,p_accept boolean)
returns text language plpgsql security definer set search_path = '' as $$
declare v_order public.companion_orders%rowtype;
begin
  select * into v_order from public.companion_orders where id=p_order_id for update;
  if not found then raise exception '订单不存在'; end if;
  if p_accept is false then
    if not (public.is_family_member(v_order.family_id) or v_order.escort_id=(select auth.uid())) then raise exception '无权操作此订单'; end if;
    update public.companion_orders set status='cancelled',updated_at=now() where id=p_order_id;
    update public.community_posts set status='cancelled',updated_at=now() where id=v_order.post_id;
    return 'cancelled';
  end if;
  if v_order.status not in ('pending_escort_confirmation','confirmed') then raise exception '订单当前不可确认'; end if;
  if v_order.escort_id=(select auth.uid()) and public.is_active_escort() then
    update public.companion_orders set escort_confirmed_at=now() where id=p_order_id;
  elsif public.is_family_member(v_order.family_id) then
    update public.companion_orders set family_confirmed_at=now() where id=p_order_id;
  else raise exception '无权操作此订单'; end if;
  update public.companion_orders set status='confirmed',updated_at=now()
    where id=p_order_id and family_confirmed_at is not null and escort_confirmed_at is not null;
  select status into v_order.status from public.companion_orders where id=p_order_id;
  if v_order.status='confirmed' then update public.community_posts set status='confirmed',updated_at=now() where id=v_order.post_id; end if;
  return v_order.status;
end;
$$;

revoke all on function public.apply_to_demand(uuid,text) from public,anon;
revoke all on function public.create_demand_post(uuid,uuid,text,text,text,date,text,text,text,numeric,numeric) from public,anon;
revoke all on function public.confirm_post_signup(uuid) from public,anon;
revoke all on function public.respond_companion_order(uuid,boolean) from public,anon;
grant execute on function public.apply_to_demand(uuid,text) to authenticated;
grant execute on function public.create_demand_post(uuid,uuid,text,text,text,date,text,text,text,numeric,numeric) to authenticated;
grant execute on function public.confirm_post_signup(uuid) to authenticated;
grant execute on function public.respond_companion_order(uuid,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('kangban-private','kangban-private',false,20971520,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy kangban_storage_read_family_or_order on storage.objects for select to authenticated
  using (bucket_id='kangban-private' and (
    public.is_family_member(split_part(name,'/',1)::uuid)
    or exists(select 1 from public.companion_orders o where o.id::text=split_part(name,'/',2) and o.escort_id=(select auth.uid()))
  ));
create policy kangban_storage_insert_family on storage.objects for insert to authenticated
  with check (bucket_id='kangban-private' and public.can_manage_family(split_part(name,'/',1)::uuid));
create policy kangban_storage_delete_family on storage.objects for delete to authenticated
  using (bucket_id='kangban-private' and public.can_manage_family(split_part(name,'/',1)::uuid));

-- Keep sensitive status columns out of direct writes; lifecycle transitions use RPCs.
revoke insert,update,delete on public.post_signups from authenticated;
revoke insert,update,delete on public.companion_orders from authenticated;
revoke update on public.escort_profiles from authenticated;
grant insert(user_id,display_name,experience,service_area,bio) on public.escort_profiles to authenticated;
grant update(display_name,experience,service_area,bio) on public.escort_profiles to authenticated;
