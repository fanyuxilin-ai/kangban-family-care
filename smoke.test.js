/* 运行时冒烟测试：用 DOM 桩加载 app.js 并直接调用陪诊师端关键函数 */
function fakeEl() {
  const base = {
    innerHTML: '', textContent: '', hidden: false, value: '', style: {},
    dataset: {}, disabled: false, files: [], checked: false,
    classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, closest() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    appendChild() {}, dispatchEvent() {}, click() {}, focus() {}
  };
  return new Proxy(base, { get(t, p) { if (p in t) return t[p]; return undefined; }, set(t, p, v) { t[p] = v; return true; } });
}
const store = {};
global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.window = { addEventListener() {}, Notification: undefined, scrollTo() {}, SpeechRecognition: undefined, webkitSpeechRecognition: undefined };
global.document = {
  getElementById: () => fakeEl(),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  body: { style: {} },
  visibilityState: 'visible'
};
global.navigator = {};
global.setInterval = () => 0;
global.setTimeout = () => 0;
global.fetch = async () => ({ ok: true, blob: async () => new global.Blob() });
global.Blob = class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type || ''; } };
global.File = class extends global.Blob { constructor(parts, name, opts) { super(parts, opts); this.name = name; this.type = opts?.type || ''; } };
global.URL.createObjectURL = () => 'blob:mock';
global.URL.revokeObjectURL = () => {};
global.structuredClone = global.structuredClone || (obj => JSON.parse(JSON.stringify(obj)));
URL.createObjectURL = () => 'blob:mock';

const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');
const test = `
;(async function smoke() {
  const out = [];
  const ok = (name, cond) => { out.push((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) process.exitCode = 1; };

  /* 1. 应用加载：无异常即到达此处 */
  ok('app.js 加载且初始化完成', true);

  /* 1a. 云端工作区可按附件路径从私有存储取回资料，不依赖原设备 IndexedDB */
  const remoteBlob = new Blob(['synthetic test attachment'], { type: 'image/png' });
  let requestedPath = '';
  let uploadedPath = '';
  window.KangbanAuth = { mode: 'cloud', session: { familyId: 'family-demo' } };
  window.KangbanAPI = {
    downloadPrivateFile: async path => { requestedPath = path; return remoteBlob; },
    uploadPrivateFile: async (_file, path) => { uploadedPath = path; }
  };
  window.KangbanAuth.role = 'family';
  await putAttachment('new-record', new File(['new report'], 'report.png', { type: 'image/png' }));
  ok('云端家庭上传时保存私有附件路径', uploadedPath === 'family-demo/attachments/new-record-report.png' && state.cloudAttachmentPaths['new-record'] === uploadedPath);
  state.cloudAttachmentPaths = { 'cloud-record-1': 'family-demo/legacy/cloud-record-1-report.png' };
  const cloudFile = await getAttachment('cloud-record-1');
  ok('云端附件从私有 Storage 跨设备读取', cloudFile?.blob === remoteBlob && requestedPath === state.cloudAttachmentPaths['cloud-record-1']);
  delete window.KangbanAuth;
  delete window.KangbanAPI;

  /* 2. 标准化履约清单（FR-09-2 / 4.1 模板） */
  const order = { id: 'order-t1', service: '全程陪诊', status: 'accepted', patient: '陈兰英', patientMemberId: 'm1', hospital: '市第一人民医院', date: '2026-11-10', need: '复诊陪同', reviews: { family: null, escort: null } };
  state.companionOrders.unshift(order);
  ensureExecution(order);
  ok('全程陪诊生成 8 项标准清单', order.execution.items.length === 8);
  ok('必传佐证项已标记', order.execution.items.filter(i => i.evidenceRequired).length === 5);
  ok('代述病情无需佐证', order.execution.items.some(i => i.label.includes('代述病情') && !i.evidenceRequired && !i.evidenceHint));
  const progress0 = executionProgress(order);
  ok('初始进度 0/8', progress0.done === 0 && !progress0.all);
  order.execution.items.forEach(i => { i.done = true; });
  ok('全部勾选后可完成', executionProgress(order).all === true);

  /* 3. 需求帖流转（FR-12-3） */
  const post = state.demandPosts.find(p => p.id === 'dp-1');
  ok('种子需求帖存在且招募中', post && post.status === '招募中');
  acceptDemandPost('dp-1');
  const acceptedOrder = state.companionOrders.find(o => o.demandPostId === 'dp-1');
  ok('接单后生成订单且已接单', acceptedOrder && acceptedOrder.status === 'accepted' && acceptedOrder.execution?.items?.length);
  ok('需求帖状态 → 已接单', post.status === '已接单');
  acceptedOrder.execution.items[1].done = true;
  syncDemandPostByOrder(acceptedOrder);
  ok('开始履约 → 服务中', post.status === '服务中');
  acceptedOrder.status = 'completed';
  syncDemandPostByOrder(acceptedOrder);
  ok('服务完成 → 已完成', post.status === '已完成');

  /* 4. 任务分享码（FR-10） */
  const share = generateTaskShare('order-t1', true);
  ok('生成 6 位分享码', /^\\d{6}$/.test(share.code));
  ok('10 分钟有效期', Date.parse(share.expiresAt) - Date.now() > 9 * 60 * 1000);
  share.revokedAt = new Date().toISOString();
  ok('撤销后失效', taskShareActive(share) === false);

  /* 5. 复诊提醒自动转家庭端提醒（FR-09-3） */
  const before = (state.customReminders || []).length;
  const created = createVisitReminderFromReport(acceptedOrder, '2026-11-20', '心内科复诊');
  ok('复诊提醒已创建', created && state.customReminders.length === before + 1);
  const reminder = state.customReminders[state.customReminders.length - 1];
  const day = new Date('2026-11-20T12:00:00').getDay();
  ok('提醒日期与星期匹配', reminder.startDate === '2026-11-20' && reminder.days.length === 1 && reminder.days[0] === day && reminder.memberId === 'm2');

  /* 6. 收入统计（FR-11） */
  acceptedOrder.price = SERVICE_PRICES['检查陪同'];
  state.companionOrders.push({ id: 'order-t2', service: '全程陪诊', status: 'completed', price: SERVICE_PRICES['全程陪诊'], reviews: { family: null, escort: null } });
  const income = state.companionOrders.filter(o => o.status === 'completed').reduce((s, o) => s + orderPrice(o), 0);
  ok('收入汇总（模拟金额）= ' + income, income === (SERVICE_PRICES['检查陪同'] + SERVICE_PRICES['全程陪诊']));

  /* 7. 隐私隔离红线（FR-10）：陪诊师侧渲染不引用健康档案字段 */
  const escortRender = renderCompanionViews.toString();
  ok('陪诊师端渲染不含 health_profile / allergies 引用', !/allergies|conditions|medications\\s*\\(/.test(escortRender));

  console.log(out.join('\\n'));
})();
`;
eval(code + '\n' + test);
