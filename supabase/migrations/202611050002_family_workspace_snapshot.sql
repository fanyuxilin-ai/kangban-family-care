-- Versioned whole-workspace snapshot keeps the existing local app data model
-- intact while auth/RLS provides per-family cloud sync. Structured tables in
-- 001 remain the source of truth for community, order and file permissions.
alter table public.families add column if not exists demo_state jsonb not null default '{}'::jsonb;
grant update(demo_state,updated_at) on public.families to authenticated;
