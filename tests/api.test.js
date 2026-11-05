const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'api.js'), 'utf8');

function boot({ config = null, client = null, initialState = {} } = {}) {
  const storage = new Map([['kangban-demo-v7', JSON.stringify(initialState)]]);
  const events = [];
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  const window = {
    KANGBAN_SUPABASE_CONFIG: config,
    supabase: client ? { createClient: () => client } : undefined,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    dispatchEvent: event => events.push(event),
    crypto: { randomUUID: () => 'uuid-test' }
  };
  vm.runInNewContext(source, { window, CustomEvent, Math });
  return { api: window.KangbanAPI, events, storage };
}

test('missing or incomplete config selects local mode and reports it', () => {
  const { api, events } = boot({ config: { url: 'https://example.supabase.co', publishableKey: '' } });
  assert.equal(api.mode, 'local');
  assert.equal(api.isCloudEnabled(), false);
  assert.equal(events[0].detail.mode, 'local');
});

test('local mode reads and persists rows within the legacy state object', async () => {
  const { api, storage } = boot({ initialState: { familyMembers: [{ id: 'member-1', name: '模拟家人' }] } });
  assert.equal((await api.select('family_members'))[0].name, '模拟家人');
  await api.insert('family_members', { name: '新增成员' });
  const saved = JSON.parse(storage.get('kangban-demo-v7'));
  assert.equal(saved.familyMembers.length, 2);
  assert.equal(saved.familyMembers[1].id, 'uuid-test');
  await api.update('family_members', 'uuid-test', { name: '更新成员' });
  assert.equal(JSON.parse(storage.get('kangban-demo-v7')).familyMembers[1].name, '更新成员');
  await api.remove('family_members', 'uuid-test');
  assert.equal(JSON.parse(storage.get('kangban-demo-v7')).familyMembers.length, 1);
});

test('local mode blocks server RPC and unsupported tables', async () => {
  const { api } = boot();
  await assert.rejects(api.rpc('apply_to_demand', { p_post_id: 'x' }), /本机演示模式/);
  await assert.rejects(api.select('users'), /不支持的数据表/);
});

test('cloud mode routes CRUD and surfaces Supabase errors without local fallback', async () => {
  let nextResult = { data: [{ id: 'cloud-1' }], error: null };
  const calls = [];
  const chain = {
    select: (...args) => { calls.push(['select', ...args]); return chain; },
    eq: (...args) => { calls.push(['eq', ...args]); return chain; },
    order: (...args) => { calls.push(['order', ...args]); return chain; },
    limit: (...args) => { calls.push(['limit', ...args]); return chain; },
    insert: (...args) => { calls.push(['insert', ...args]); return chain; },
    update: (...args) => { calls.push(['update', ...args]); return chain; },
    delete: () => { calls.push(['delete']); return chain; },
    single: () => Promise.resolve(nextResult),
    then: resolve => resolve(nextResult)
  };
  const client = { from: name => { calls.push(['from', name]); return chain; }, rpc: (name,args) => { calls.push(['rpc',name,args]); return Promise.resolve(nextResult); }, storage: { from: () => ({ upload: async () => ({ data: {}, error: null }) }) } };
  const config = { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_demo' };
  const { api, storage, events } = boot({ config, client });
  assert.equal(api.mode, 'supabase');
  assert.match(events[0].detail.message, /已连接|云端/);
  assert.deepEqual(Array.from(await api.select('medical_records', { filters: { family_id: 'family-1' } }), row => row.id), ['cloud-1']);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'family_id'));
  nextResult = { data: null, error: { message: 'RLS denied', code: '42501' } };
  await assert.rejects(api.insert('medical_records', {}), /RLS denied/);
  assert.equal(storage.get('kangban-demo-v7'), '{}', 'failed cloud writes must not modify local data');
});

test('private file downloads use the authenticated private bucket and surface access errors', async () => {
  const calls = [];
  const blob = new Blob(['synthetic image'], { type: 'image/png' });
  let result = { data: blob, error: null };
  const client = {
    storage: { from: bucket => ({ download: async path => { calls.push([bucket, path]); return result; } }) }
  };
  const config = { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_demo' };
  const { api } = boot({ config, client });
  assert.equal(await api.downloadPrivateFile('family-1/attachments/report.png'), blob);
  assert.deepEqual(calls, [['kangban-private', 'family-1/attachments/report.png']]);
  result = { data: null, error: { message: 'Object not found', code: '404' } };
  await assert.rejects(api.downloadPrivateFile('other-family/secret.png'), /Object not found/);
});
