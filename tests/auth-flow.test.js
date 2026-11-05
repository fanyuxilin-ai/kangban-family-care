const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createAuth({ signInError = null, profile = { role: 'family', account_status: 'active' }, signUpResult = null } = {}) {
  let signOutCalls = 0;
  let authChange;
  const user = { id: 'user-1', app_metadata: {}, user_metadata: {} };
  const window = {
    location: { hash: '', search: '', origin: 'http://localhost:4173', pathname: '/' },
    history: { replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    dispatchEvent() {},
    addEventListener() {},
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    URLSearchParams,
    KangbanAPI: {
      isCloudEnabled: () => true,
      select: async table => table === 'profiles' ? [{ ...profile, id: user.id }] : [],
      rpc: async () => 'family-1',
      client: {
        auth: {
          signInWithPassword: async () => signInError
            ? { data: { user: null }, error: signInError }
            : { data: { user }, error: null },
          signUp: async () => signUpResult || { data: { user, session: { user } }, error: null },
          signOut: async () => { signOutCalls += 1; return { error: null }; },
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: callback => { authChange = callback; }
        }
      }
    }
  };
  vm.runInNewContext(fs.readFileSync('auth.js', 'utf8'), {
    window,
    URLSearchParams,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }
  });
  return { auth: window.KangbanAuth, signOutCalls: () => signOutCalls, authChange: () => authChange };
}

test('sign-in uses the saved profile role and does not compare a login tab role', async () => {
  const harness = createAuth({ profile: { role: 'escort', account_status: 'active' } });
  assert.equal(harness.auth.signIn.length, 2);
  const session = await harness.auth.signIn('escort@example.test', 'secret');
  assert.equal(session.role, 'escort');
  assert.equal(harness.auth.mode, 'cloud');
  assert.equal(harness.signOutCalls(), 0);
});

test('pending escort accounts get an approval message and cannot continue into the app', async () => {
  const harness = createAuth({ profile: { role: 'escort', account_status: 'pending_review' } });
  await assert.rejects(harness.auth.signIn('escort@example.test', 'secret'), /待审核/);
  assert.equal(harness.signOutCalls(), 1);
  assert.equal(harness.auth.session, null);
});

test('explicit missing-account errors and generic invalid credentials have safe distinct messages', async () => {
  const missing = createAuth({ signInError: { code: 'user_not_found', message: 'User not found' } });
  await assert.rejects(missing.auth.signIn('missing@example.test', 'secret'), /账号不存在/);

  const invalid = createAuth({ signInError: { code: 'invalid_credentials', message: 'Invalid login credentials' } });
  await assert.rejects(invalid.auth.signIn('existing@example.test', 'wrong'), /邮箱或密码错误/);
});

test('autoconfirmed registration enters the role returned by its new profile', async () => {
  const harness = createAuth({ profile: { role: 'escort', account_status: 'pending_review' } });
  const session = await harness.auth.signUp({ email: 'escort@example.test', password: 'secret', displayName: '测试陪诊师', role: 'escort' });
  assert.equal(session.role, 'escort');
  assert.equal(harness.auth.mode, 'cloud');
});

test('login and registration markup follows the role-free two-step information architecture', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const app = fs.readFileSync('app.js', 'utf8');
  const authMarkup = html.slice(html.indexOf('<section class="auth-gate"'), html.indexOf('<div class="app-shell">'));
  assert.doesNotMatch(authMarkup, /id="authRoleSwitch"|家属登录|陪诊师登录/);
  assert.match(authMarkup, /name="email" type="email"/);
  assert.match(authMarkup, /name="password" type="password"/);
  assert.match(authMarkup, /id="authRegisterRoleStep"[\s\S]*data-auth-role="family"[\s\S]*data-auth-role="escort"/);
  assert.doesNotMatch(authMarkup, /id="authRegisterNext"/);
  assert.match(app, /选中账号类型后直接进入第二步/);
  assert.match(app, /setAuthRegistrationView\(true, 'credentials'\)/);
  assert.match(authMarkup, /name="registerEmail"[\s\S]*name="registerPassword"[\s\S]*name="passwordConfirm"/);
  assert.match(authMarkup, /<details class="auth-experience"/);
  assert.match(authMarkup, /data-auth-guest/);
  assert.match(authMarkup, /data-auth-cloud-demo="family"[\s\S]*data-auth-cloud-demo="escort"/);
  assert.doesNotMatch(authMarkup, /data-auth-demo=/);
  assert.match(authMarkup, /演示版密码重置请联系管理员/);
  assert.doesNotMatch(authMarkup, /忘记密码？发送重置邮件/);
  assert.match(fs.readFileSync('auth.js', 'utf8'), /enterLocalDemo\(role\)/);
  assert.match(app, /两次输入的密码不一致/);
  assert.match(app, /KangbanAuth\.signIn\(email, password\)/);
  const noSessionBranch = app.slice(app.indexOf('if (!session) {'), app.indexOf("document.body.classList.add('authenticated')"));
  assert.match(noSessionBranch, /setAuthRegistrationView\(false\)/);
  const authRouteBranch = app.slice(app.indexOf('  renderRole();', app.indexOf('async function applyAuthSession')), app.indexOf('\n}', app.indexOf('async function applyAuthSession')));
  assert.match(authRouteBranch, /navigate\(session\.role === 'escort' \? 'escort' : 'home'\)/);
  assert.doesNotMatch(authRouteBranch, /mode === 'cloud'\) navigate\('community'\)/);
});
