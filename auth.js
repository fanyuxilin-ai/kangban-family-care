/* Session and role handling for hosted auth; local demos never impersonate a cloud user. */
(function (root) {
  'use strict';
  const SESSION_KEY = 'kangban-auth-session-v1';
  const DEMO_USERS = {
    family: { email: 'family-demo@kangban.local', label: '家庭演示账号' },
    escort: { email: 'escort-demo@kangban.local', label: '陪诊师演示账号' }
  };
  let session = null;
  let mode = 'guest';
  let passwordRecovery = false;
  function readLocal() {
    try { return JSON.parse(root.localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  }
  function emit() { root.dispatchEvent(new CustomEvent('kangban:auth-change', { detail: { session, mode } })); }
  async function loadProfile(user, fallbackRole) {
    const profiles = await root.KangbanAPI.select('profiles', { filters: { id: user.id }, limit: 1 });
    const profile = profiles[0];
    if (!profile) throw new Error('账号资料尚未初始化，请联系管理员。');
    let familyId = null;
    if (profile.role === 'family') {
      const memberships = await root.KangbanAPI.select('family_memberships', { filters: { user_id: user.id, status: 'active' }, limit: 1 });
      familyId = memberships[0]?.family_id || null;
      if (!familyId) familyId = await root.KangbanAPI.rpc('ensure_family_for_current_user');
    }
    return { user, role: profile.role || fallbackRole || 'family', status: profile.account_status || 'active', familyId, displayName: profile.display_name, isAdmin: user.app_metadata?.kangban_admin === true };
  }
  const api = {
    get session() { return session; },
    get mode() { return mode; },
    get role() { return session?.role || 'guest'; },
    get isPasswordRecovery() { return passwordRecovery; },
    get demoUsers() { return DEMO_USERS; },
    async initialize() {
      if (root.KangbanAPI?.isCloudEnabled()) {
        const hashParams = new URLSearchParams(root.location.hash.replace(/^#/, ''));
        const recoveryFromUrl = hashParams.get('type') === 'recovery' || new URLSearchParams(root.location.search).get('type') === 'recovery';
        const { data, error } = await root.KangbanAPI.client.auth.getSession();
        if (error) throw error;
        const user = data?.session?.user;
        if (recoveryFromUrl && user) {
          passwordRecovery = true; mode = 'cloud'; session = null;
          root.KangbanAPI.client.auth.onAuthStateChange((event, next) => {
            if (event === 'PASSWORD_RECOVERY') { passwordRecovery = true; mode = 'cloud'; session = null; emit(); }
            else if (event === 'SIGNED_OUT' && !passwordRecovery) { session = null; mode = 'guest'; root.localStorage.removeItem(SESSION_KEY); emit(); }
          });
          emit(); return null;
        }
        if (user) {
          session = await loadProfile(user, user.user_metadata?.role);
          mode = 'cloud';
          root.KangbanAPI.client.auth.onAuthStateChange((event, next) => {
            if (event === 'PASSWORD_RECOVERY') { passwordRecovery = true; session = null; mode = 'cloud'; emit(); }
            else if (!next) { session = null; mode = 'guest'; root.localStorage.removeItem(SESSION_KEY); emit(); }
          });
          emit(); return session;
        }
      }
      const saved = readLocal();
      if (saved?.mode === 'local-demo' && ['family', 'escort'].includes(saved.role)) { session = saved; mode = 'local-demo'; }
      else if (saved?.mode === 'guest') { session = saved; mode = 'guest'; }
      emit(); return session;
    },
    async signIn(email, password, requestedRole) {
      if (!root.KangbanAPI?.isCloudEnabled()) throw new Error('尚未配置 Supabase，当前不能使用真实账号登录；请选“游客体验”或本机演示账号。');
      const { data, error } = await root.KangbanAPI.client.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') throw new Error('邮箱或密码不正确。若邮箱已确认，请核对注册密码，或使用“忘记密码”重置。');
        throw error;
      }
      const profile = await loadProfile(data.user, requestedRole);
      if (requestedRole && profile.role !== requestedRole) { await root.KangbanAPI.client.auth.signOut(); throw new Error('该账号角色与当前入口不符。'); }
      session = profile;
      mode = 'cloud'; emit(); return session;
    },
    async signUp({ email, password, displayName, role }) {
      if (!root.KangbanAPI?.isCloudEnabled()) throw new Error('尚未配置 Supabase，无法创建云端账号。');
      if (!['family', 'escort'].includes(role)) throw new Error('请选择家庭或陪诊师角色。');
      const { data, error } = await root.KangbanAPI.client.auth.signUp({ email, password, options: { data: { role, display_name: displayName } } });
      if (error) throw error;
      if (!data.session) return { pendingEmailConfirmation: true };
      session = await loadProfile(data.user, role);
      mode = 'cloud'; emit(); return session;
    },
    async requestPasswordReset(email) {
      if (!root.KangbanAPI?.isCloudEnabled()) throw new Error('尚未配置 Supabase，无法发送密码重置邮件。');
      const address = String(email || '').trim();
      if (!address) throw new Error('请先填写注册邮箱。');
      const redirectTo = `${root.location.origin}${root.location.pathname}`;
      const { error } = await root.KangbanAPI.client.auth.resetPasswordForEmail(address, { redirectTo });
      if (error) throw error;
      return true;
    },
    async updatePassword(newPassword) {
      if (!passwordRecovery || !root.KangbanAPI?.isCloudEnabled()) throw new Error('请先通过密码重置邮件打开此页面。');
      const { error } = await root.KangbanAPI.client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      passwordRecovery = false;
      await root.KangbanAPI.client.auth.signOut();
      session = null; mode = 'guest';
      root.history.replaceState({}, '', `${root.location.origin}${root.location.pathname}`);
      emit();
      return true;
    },
    enterGuest() {
      session = { mode: 'guest', role: 'guest', status: 'active', label: '游客体验' }; mode = 'guest';
      root.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); emit(); return session;
    },
    enterLocalDemo(role) {
      if (!['family', 'escort'].includes(role)) throw new Error('未知演示角色。');
      session = { ...DEMO_USERS[role], mode: 'local-demo', role, status: role === 'escort' ? 'approved_demo' : 'active' };
      mode = 'local-demo'; root.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); emit(); return session;
    },
    async signOut() {
      if (mode === 'cloud') { const { error } = await root.KangbanAPI.client.auth.signOut(); if (error) throw error; }
      session = null; mode = 'guest'; root.localStorage.removeItem(SESSION_KEY); emit();
    }
  };
  root.KangbanAuth = api;
})(window);
