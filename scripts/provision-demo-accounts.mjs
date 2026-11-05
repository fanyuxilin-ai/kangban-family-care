#!/usr/bin/env node
// Idempotently create/update the fictional cloud demo accounts.
// The service-role key is read only from the process environment and is never written to disk or printed.
const baseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = process.env.KANGBAN_SUPABASE_SERVICE_ROLE_KEY || '';
const password = process.env.KANGBAN_DEMO_PASSWORD || '';
if (!/^https:\/\//.test(baseUrl) || !serviceKey || password.length < 12) {
  console.error('Required: SUPABASE_URL, KANGBAN_SUPABASE_SERVICE_ROLE_KEY, KANGBAN_DEMO_PASSWORD (12+ chars).');
  process.exit(2);
}

async function request(path, { method = 'GET', body, prefer } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(prefer ? { prefer } : {})
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${data?.msg || data?.message || 'Supabase request failed'}`);
  return data;
}

async function listUsers() {
  const users = [];
  for (let page = 1; page < 100; page++) {
    const result = await request(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    const batch = result?.users || [];
    users.push(...batch);
    if (batch.length < 1000) break;
  }
  return users;
}

async function ensureUser(email, role, displayName, existingUsers) {
  let user = existingUsers.find(row => row.email?.toLowerCase() === email.toLowerCase());
  const payload = { email, password, email_confirm: true, user_metadata: { role, display_name: displayName } };
  if (user) user = await request(`/auth/v1/admin/users/${encodeURIComponent(user.id)}`, { method: 'PUT', body: payload });
  else user = await request('/auth/v1/admin/users', { method: 'POST', body: payload });
  if (!user?.id) throw new Error(`Supabase did not return a user id for ${email}`);
  await request('/rest/v1/profiles?on_conflict=id', {
    method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: { id: user.id, role, account_status: 'active', display_name: displayName }
  });
  if (role === 'escort') {
    await request('/rest/v1/escort_profiles?on_conflict=user_id', {
      method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
      body: { user_id: user.id, display_name: displayName, review_status: 'approved' }
    });
  }
  console.log(`${role === 'family' ? '家庭' : '陪诊师'}演示账号已准备：${email}（已确认；${role === 'escort' ? '已审核' : '可登录'}）`);
  return user;
}

try {
  const users = await listUsers();
  await ensureUser('kangban-family-demo@example.com', 'family', '康伴演示家庭', users);
  await ensureUser('kangban-escort-demo@example.com', 'escort', '康伴演示陪诊师', users);
} catch (error) {
  console.error(error.message || '演示账号初始化失败');
  process.exitCode = 1;
}
