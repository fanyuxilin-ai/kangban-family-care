const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migrationDirectory = path.join(__dirname, '..', 'supabase', 'migrations');
const expectedTables = [
  'profiles', 'families', 'family_memberships', 'family_members', 'escort_profiles',
  'body_metrics', 'daily_entries', 'medical_encounters', 'medical_records',
  'insurance_policies', 'reimbursements', 'attachments', 'community_posts',
  'community_post_details', 'post_signups', 'companion_orders', 'migration_runs'
];

function migrationText() {
  const migrationName = fs.readdirSync(migrationDirectory).find(name =>
    name === '202611050001_kangban_cloud_core.sql' || name.endsWith('_202611050001_kangban_cloud_core.sql')
  );
  assert.ok(migrationName, 'core migration must retain its canonical migration name');
  return fs.readFileSync(path.join(migrationDirectory, migrationName), 'utf8');
}

test('Supabase migration defines exactly the 17 approved business tables', () => {
  const sql = migrationText();
  const created = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_]+)/gi)].map(m => m[1].toLowerCase());
  assert.equal(created.length, 17, `expected 17 tables, found ${created.length}`);
  for (const name of expectedTables) assert.ok(created.includes(name), `missing table ${name}`);
});

test('every business table enables RLS and has table-specific policies', () => {
  const sql = migrationText();
  for (const name of expectedTables) {
    assert.match(sql, new RegExp(`alter\\s+table\\s+public\\.${name}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `${name} must enable RLS`);
    assert.match(sql, new RegExp(`create\\s+policy\\s+[a-z_]+\\s+on\\s+public\\.${name}\\b`, 'i'), `${name} must have an explicit policy`);
  }
});

test('private file storage is not public and access is policy controlled', () => {
  const sql = migrationText();
  assert.match(sql, /insert\s+into\s+storage\.buckets[\s\S]*?public\s*=\s*false/i);
  assert.match(sql, /on\s+storage\.objects\s+for\s+select/i);
  assert.match(sql, /on\s+storage\.objects\s+for\s+insert/i);
  assert.match(sql, /on\s+storage\.objects\s+for\s+delete/i);
});

test('transaction RPCs cover applying, family selection, and escort confirmation', () => {
  const sql = migrationText();
  for (const fn of ['apply_to_demand', 'confirm_post_signup', 'respond_companion_order']) {
    assert.match(sql, new RegExp(`function\\s+public\\.${fn}\\s*\\(`, 'i'), `missing RPC ${fn}`);
  }
  assert.match(sql, /for\s+update/i, 'RPCs must lock records while confirming to prevent duplicate assignment');
});

test('profile role and review status are not user-editable columns', () => {
  const sql = migrationText();
  assert.match(sql, /grant\s+update\s*\(\s*display_name\s*,\s*avatar_url\s*\)\s+on\s+public\.profiles/i);
  assert.doesNotMatch(sql, /grant\s+update\s+on\s+public\.profiles\s+to\s+authenticated/i);
  assert.match(sql, /handle_new_auth_user/i);
});

test('resume storage paths bypass legacy UUID casts and upsert stays owner scoped', () => {
  const migrationName = '20261106020000_fix_resume_storage_policy_path_cast.sql';
  const sql = fs.readFileSync(path.join(migrationDirectory, migrationName), 'utf8');
  for (const operation of ['select', 'insert', 'update']) {
    const policy = sql.match(new RegExp(`create\\s+policy\\s+kangban_storage_${operation === 'select' ? 'read_family_or_assigned_escort' : operation === 'insert' ? 'insert_family_or_assigned_escort' : 'update_owned_family_or_escort'}[\\s\\S]*?;`, 'i'))?.[0];
    assert.ok(policy, `missing guarded ${operation} policy`);
    assert.match(policy, /case[\s\S]*?split_part\(name,\s*'\/',\s*1\)\s*=\s*'resumes'/i);
    assert.match(policy, /split_part\(name,\s*'\/',\s*1\)\s*~\*/i, 'legacy UUID conversion must follow UUID validation');
  }
  assert.match(sql, /split_part\(name,\s*'\/',\s*2\)\s*=\s*\(select auth\.uid\(\)\)::text[\s\S]*?public\.is_active_escort\(\)/i);
  assert.match(sql, /owner_id\s*=\s*\(select auth\.uid\(\)\)::text/i);
});

function safetyMigrationText() {
  const migrationName = fs.readdirSync(migrationDirectory).find(name => name.includes('member_safety_checkin'));
  assert.ok(migrationName, 'member safety migration must exist');
  return fs.readFileSync(path.join(migrationDirectory, migrationName), 'utf8');
}

test('member safety tables are family scoped and protected by RLS', () => {
  const sql = safetyMigrationText();
  for (const name of ['member_safety_settings', 'member_safety_signals', 'member_safety_alerts', 'member_safety_alert_events', 'member_safety_recipients', 'member_safety_notifications']) {
    assert.match(sql, new RegExp(`create\\s+table\\s+public\\.${name}\\b`, 'i'), `${name} must exist`);
    assert.match(sql, new RegExp(`alter\\s+table\\s+public\\.${name}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `${name} must enable RLS`);
    if (name === 'member_safety_notifications') {
      assert.doesNotMatch(sql, /create\s+policy\s+[a-z_]+\s+on\s+public\.member_safety_notifications\b/i, 'outbox is server-only and intentionally has no client policy');
      assert.match(sql, /revoke all on public\.[\s\S]*?member_safety_notifications from anon, authenticated/i);
    } else {
      assert.match(sql, new RegExp(`create\\s+policy\\s+[a-z_]+\\s+on\\s+public\\.${name}\\b`, 'i'), `${name} must have an explicit policy`);
    }
    assert.match(sql, new RegExp(`${name}[\\s\\S]*?family_id\\s+uuid`, 'i'), `${name} must be scoped to a family`);
  }
});

test('member safety RPCs validate family access, signal source, and alert resolution', () => {
  const sql = safetyMigrationText();
  for (const fn of ['configure_member_safety', 'list_member_safety_recipients', 'record_member_safety_signal', 'resolve_member_safety_alert', 'claim_due_member_safety_alerts', 'complete_member_safety_notification']) {
    assert.match(sql, new RegExp(`function\\s+public\\.${fn}\\s*\\(`, 'i'), `missing ${fn}`);
  }
  assert.match(sql, /record_member_safety_signal[\s\S]*?is_family_member/i);
  assert.match(sql, /record_member_safety_signal[\s\S]*?health_measurement[\s\S]*?self_check/i);
  assert.match(sql, /configure_member_safety[\s\S]*?self_check_user_id/i);
  assert.match(sql, /p_source='self_check'[\s\S]*?s\.self_check_user_id=auth\.uid\(\)/i);
  assert.match(sql, /resolve_member_safety_alert[\s\S]*?confirmed_safe[\s\S]*?contacting[\s\S]*?unable_to_reach/i);
  assert.match(sql, /revoke all on function public\.claim_due_member_safety_alerts[\s\S]*?authenticated/i);
  assert.match(sql, /grant execute on function public\.claim_due_member_safety_alerts[\s\S]*?service_role/i);
  assert.match(sql, /revoke all on function public\.complete_member_safety_notification[\s\S]*?authenticated/i);
  assert.match(sql, /grant execute on function public\.complete_member_safety_notification[\s\S]*?service_role/i);
});

test('safety alert scheduler uses Vault and invokes the Edge Function every five minutes', () => {
  const sql = fs.readFileSync(path.join(migrationDirectory, '20261114100000_schedule_member_safety_alerts.sql'), 'utf8');
  assert.match(sql, /cron\.schedule[\s\S]*?\*\/5 \* \* \* \*/i);
  assert.match(sql, /vault\.decrypted_secrets[\s\S]*?kangban_safety_cron_token/i);
  assert.match(sql, /functions\/v1\/process-member-safety-alerts/i);
});
