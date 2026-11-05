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
