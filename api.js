/* 康伴数据访问门面：云端操作失败会显式报错，不与本地演示数据静默双写。 */
(function (root) {
  'use strict';
  const STORAGE_KEY = 'kangban-demo-v7';
  const TABLES = new Set([
    'profiles','families','family_memberships','family_members','escort_profiles','body_metrics','daily_entries',
    'medical_encounters','medical_records','insurance_policies','reimbursements','attachments','community_posts',
    'community_post_details','post_signups','companion_orders','migration_runs'
  ]);
  const LOCAL_COLLECTIONS = {
    family_members: 'familyMembers', body_metrics: 'bodyMetrics', daily_entries: 'dailyEntries',
    medical_records: 'records', insurance_policies: 'insurancePolicies', reimbursements: 'reimbursements',
    community_posts: 'demandPosts', companion_orders: 'companionOrders', post_signups: 'postSignups'
  };

  function readState() {
    try { return JSON.parse(root.localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (error) { throw new Error(`无法读取本机演示数据：${error.message}`); }
  }
  function writeState(state) { root.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function normalizeError(error) {
    return { message: error && error.message ? error.message : String(error || '未知错误'), code: error && error.code || null };
  }
  function announce(mode, message) {
    root.dispatchEvent(new CustomEvent('kangban:api-mode', { detail: { mode, message } }));
  }
  function validConfig(config) {
    return !!(config && /^https:\/\//.test(config.url || '') && /^sb_publishable_/.test(config.publishableKey || ''));
  }
  const config = root.KANGBAN_SUPABASE_CONFIG || null;
  const cloudConfigured = validConfig(config) && !!(root.supabase && root.supabase.createClient);
  const client = cloudConfigured ? root.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  let mode = cloudConfigured ? 'supabase' : 'local';
  if (mode === 'local') announce('local', '当前为本机演示模式，数据仅保存在此浏览器。配置 Supabase 后可启用云端数据。');
  else announce('supabase', 'Supabase 已配置。登录后可使用云端社区与订单；健康预警和提醒仍来自本机演示数据。');

  function assertTable(table) {
    if (!TABLES.has(table)) throw new Error(`不支持的数据表：${table}`);
  }
  function localRows(table) {
    const state = readState();
    const key = LOCAL_COLLECTIONS[table] || table;
    return { state, key, rows: Array.isArray(state[key]) ? state[key] : [] };
  }
  function localId(row) { return row && (row.id || row.legacy_id || row.legacyId); }
  async function runCloud(query) {
    const { data, error } = await query;
    if (error) throw Object.assign(new Error(error.message || 'Supabase 请求失败'), { code: error.code });
    return data;
  }
  const api = {
    get mode() { return mode; },
    get client() { return client; },
    isCloudEnabled() { return mode === 'supabase'; },
    async select(table, options = {}) {
      assertTable(table);
      if (client) {
        if (table === 'companion_orders') throw new Error('云端订单须通过权限受限的 list_my_companion_orders 接口读取。');
        let query = client.from(table).select(options.columns || '*');
        if (options.filters) for (const [column, value] of Object.entries(options.filters)) query = query.eq(column, value);
        if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending !== false });
        if (Number.isInteger(options.limit)) query = query.limit(options.limit);
        return runCloud(query);
      }
      const { rows } = localRows(table);
      let result = rows.slice();
      if (options.filters) result = result.filter(row => Object.entries(options.filters).every(([k, v]) => row[k] === v));
      if (options.limit) result = result.slice(0, options.limit);
      return result;
    },
    async insert(table, row) {
      assertTable(table);
      if (client) return runCloud(client.from(table).insert(row).select().single());
      const { state, key, rows } = localRows(table);
      const inserted = { id: row.id || (root.crypto && root.crypto.randomUUID ? root.crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`), ...row };
      state[key] = [...rows, inserted]; writeState(state); return inserted;
    },
    async upsert(table, rows, options = {}) {
      assertTable(table);
      const batch = Array.isArray(rows) ? rows : [rows];
      if (client) return runCloud(client.from(table).upsert(rows, options).select());
      const { state, key, rows: current } = localRows(table);
      const conflictColumns = String(options.onConflict || '').split(',').map(value => value.trim()).filter(Boolean);
      const next = current.slice();
      const saved = batch.map(row => {
        const index = conflictColumns.length ? next.findIndex(existing => conflictColumns.every(column => row[column] != null && existing[column] === row[column])) : -1;
        if (index < 0) {
          const inserted = { id: row.id || (root.crypto && root.crypto.randomUUID ? root.crypto.randomUUID() : `local-${Date.now()}`), ...row };
          next.push(inserted); return inserted;
        }
        next[index] = { ...next[index], ...row }; return next[index];
      });
      state[key] = next; writeState(state); return saved;
    },
    async updateWhere(table, filters, patch) {
      assertTable(table);
      if (!filters || !Object.keys(filters).length) throw new Error('批量更新必须指定筛选条件。');
      if (client) {
        let query = client.from(table).update(patch);
        for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
        return runCloud(query.select());
      }
      const { state, key, rows } = localRows(table);
      const matched = rows.filter(row => Object.entries(filters).every(([column, value]) => row[column] === value));
      for (const row of matched) Object.assign(row, patch);
      state[key] = rows; writeState(state); return matched;
    },
    async update(table, id, patch) {
      assertTable(table);
      if (client) return runCloud(client.from(table).update(patch).eq('id', id).select().single());
      const { state, key, rows } = localRows(table);
      const index = rows.findIndex(row => localId(row) === id);
      if (index < 0) throw new Error(`找不到 ${table} 记录：${id}`);
      rows[index] = { ...rows[index], ...patch }; state[key] = rows; writeState(state); return rows[index];
    },
    async remove(table, id) {
      assertTable(table);
      if (client) return runCloud(client.from(table).delete().eq('id', id));
      const { state, key, rows } = localRows(table);
      const next = rows.filter(row => localId(row) !== id);
      state[key] = next; writeState(state); return { removed: rows.length - next.length };
    },
    async rpc(name, args = {}) {
      if (!['create_demand_post','apply_to_demand','confirm_post_signup','respond_companion_order','transition_companion_order','update_order_checklist','ensure_family_for_current_user','list_my_companion_orders','create_order_task_share','revoke_order_task_share','lookup_order_task_share','submit_companion_order_review','list_pending_escorts','review_escort_account','book_availability','respond_availability_booking','cancel_my_booking','cancel_my_post','update_availability','list_my_availability_bookings'].includes(name)) throw new Error(`不支持的 RPC：${name}`);
      if (!client) throw new Error('本机演示模式不执行云端事务 RPC。');
      return runCloud(client.rpc(name, args));
    },
    async uploadPrivateFile(file, path) {
      if (!client) throw new Error('本机演示模式不支持上传到私有云端存储。');
      if (!file || !path) throw new Error('上传文件和路径不能为空。');
      const { data, error } = await client.storage.from('kangban-private').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw Object.assign(new Error(error.message || '文件上传失败'), { code: error.code });
      return data;
    },
    async downloadPrivateFile(path) {
      if (!client) throw new Error('本机演示模式不支持读取云端私有附件。');
      if (!path) throw new Error('附件路径不能为空。');
      const { data, error } = await client.storage.from('kangban-private').download(path);
      if (error) throw Object.assign(new Error(error.message || '附件读取失败'), { code: error.code });
      return data;
    },
    async loadFamilyWorkspace(familyId) {
      if (!client) return null;
      const row = await runCloud(client.from('families').select('demo_state').eq('id', familyId).single());
      return row?.demo_state && Object.keys(row.demo_state).length ? row.demo_state : null;
    },
    async saveFamilyWorkspace(familyId, state) {
      if (!client) return false;
      await runCloud(client.from('families').update({ demo_state: state, updated_at: new Date().toISOString() }).eq('id', familyId).select('id').single());
      return true;
    },
    async withLoading(label, fn) {
      announce(mode, `${label}…`);
      try { return await fn(); }
      catch (error) { throw normalizeError(error); }
      finally { announce(mode, mode === 'local' ? '本机演示模式：数据仅保存在此浏览器。' : '云端已连接。'); }
    },
    normalizeError
  };
  root.KangbanAPI = api;
})(window);
