const STORAGE_KEY = 'kangban-demo-v4';
function dateOffset(days) {
  const date = new Date(); date.setHours(12,0,0,0); date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
const seed = {
  records: [
    { id: 'r1', type: '检查报告', title: '血常规检查报告', hospital: '市第一人民医院 · 心内科', date: dateOffset(-3), state: '已核对', icon: '▤' },
    { id: 'r2', type: '用药记录', title: '日常用药清单', hospital: '家属补充 · 最近核对', date: dateOffset(-5), state: '已核对', icon: '＋' },
    { id: 'r3', type: '检查报告', title: '心电图检查结果', hospital: '市第一人民医院 · 检查科', date: dateOffset(-8), state: '待确认', icon: '⌁' },
    { id: 'r4', type: '门诊记录', title: '心内科复诊记录', hospital: '市第一人民医院 · 心内科', date: dateOffset(-25), state: '已核对', icon: '⌂' },
  ],
  companionOrders: [],
  currentRole: 'family',
  companionProfile: {
    name: '王阿姨',
    experience: '5年陪诊经验',
    serviceArea: '深圳市南山区及周边医院',
    availability: '工作日 08:00–18:00',
    available: true,
    bio: '熟悉门诊挂号、院内路线和检查流程，耐心陪伴长辈完成就诊。只协助流程与信息交接，不提供诊疗建议。'
  },
  shares: [{ who: '家庭档案创建', when: '10月22日 19:30' }],
  medications: [],
  medicationTaken: {},
  medicationNotified: {},
  appointmentChecks: { idCard: true, reports: false, medicines: false, questions: false, selfDescription: false },
  preVisitDescriptions: [],
  voiceNote: '',
  nextRecordId: 5,
  healthReadings: [
    { id: 'bp-seed-2', memberId: 'm1', date: dateOffset(-2), time: '08:10', systolic: 152, diastolic: 94, pulse: 78, source: '手动录入' },
    { id: 'bp-seed-1', memberId: 'm1', date: dateOffset(-1), time: '08:05', systolic: 149, diastolic: 93, pulse: 76, source: '模拟手表' },
    { id: 'bp-seed-0', memberId: 'm1', date: dateOffset(0), time: '07:50', systolic: 166, diastolic: 102, pulse: 88, source: '模拟手表' },
    { id: 'bp-seed-m2-1', memberId: 'm2', date: dateOffset(-3), time: '09:15', systolic: 148, diastolic: 91, pulse: 74, source: '欧姆龙血压计' },
    { id: 'bp-seed-m2-0', memberId: 'm2', date: dateOffset(0), time: '08:20', systolic: 158, diastolic: 96, pulse: 80, source: '模拟手表' }
  ],
  alerts: [],
  missedAlerts: {},
  nextAlertId: 1,
  nextReadingId: 1,
  alertsSeeded: false,
  familyMembers: [
    { id: 'm1', name: '陈兰英', role: '母亲', age: 68, conditions: '高血压', allergies: '青霉素', medications: '氨氯地平 5mg · 每日一次；阿司匹林 100mg · 每日一次', surgeries: '无记录', avatarClass: 'member-avatar-1' },
    { id: 'm2', name: '周建国', role: '父亲', age: 71, conditions: '2型糖尿病 · 高血压', allergies: '无已知过敏', medications: '二甲双胍 0.5g · 每日两次', surgeries: '2019年 白内障手术', avatarClass: 'member-avatar-2' },
    { id: 'm3', name: '周晓林', role: '女儿', age: 38, conditions: '无慢性病', allergies: '花粉过敏', medications: '无需长期用药', surgeries: '无记录', avatarClass: 'member-avatar-3' },
    { id: 'm4', name: '周晓东', role: '儿子', age: 42, conditions: '高血脂 · 超重', allergies: '无已知过敏', medications: '阿托伐他汀 20mg · 每晚一次', surgeries: '无记录', avatarClass: 'member-avatar-4' }
  ],
  currentMemberId: 'm1',
  nextMetricId: 32,
  metricDefs: {},
  bodyMetrics: [
    { id: 'bm-1', memberId: 'm1', metric: '体重', value: 58.4, unit: 'kg', date: dateOffset(-20) },
    { id: 'bm-2', memberId: 'm1', metric: 'BMI', value: 23.1, unit: '', date: dateOffset(-20) },
    { id: 'bm-3', memberId: 'm1', metric: '体重', value: 59.1, unit: 'kg', date: dateOffset(-10) },
    { id: 'bm-4', memberId: 'm1', metric: 'BMI', value: 23.4, unit: '', date: dateOffset(-10) },
    { id: 'bm-5', memberId: 'm1', metric: '空腹血糖', value: 5.4, unit: 'mmol/L', date: dateOffset(-18) },
    { id: 'bm-6', memberId: 'm1', metric: '空腹血糖', value: 5.8, unit: 'mmol/L', date: dateOffset(-8) },
    { id: 'bm-7', memberId: 'm1', metric: '空腹血糖', value: 6.4, unit: 'mmol/L', date: dateOffset(-2) },
    { id: 'bm-8', memberId: 'm1', metric: '总胆固醇', value: 5.1, unit: 'mmol/L', date: dateOffset(-30) },
    { id: 'bm-9', memberId: 'm1', metric: '总胆固醇', value: 5.5, unit: 'mmol/L', date: dateOffset(-6) },
    { id: 'bm-10', memberId: 'm2', metric: '空腹血糖', value: 7.6, unit: 'mmol/L', date: dateOffset(-15) },
    { id: 'bm-11', memberId: 'm2', metric: '空腹血糖', value: 8.2, unit: 'mmol/L', date: dateOffset(-4) },
    { id: 'bm-12', memberId: 'm2', metric: '收缩压', value: 146, unit: 'mmHg', date: dateOffset(-7) },
    { id: 'bm-13', memberId: 'm2', metric: '收缩压', value: 138, unit: 'mmHg', date: dateOffset(-1) },
    { id: 'bm-14', memberId: 'm2', metric: '尿酸', value: 468, unit: 'μmol/L', date: dateOffset(-9) },
    { id: 'bm-15', memberId: 'm3', metric: '体重', value: 52.0, unit: 'kg', date: dateOffset(-14) },
    { id: 'bm-16', memberId: 'm3', metric: 'BMI', value: 20.1, unit: '', date: dateOffset(-14) },
    { id: 'bm-17', memberId: 'm3', metric: '体重', value: 52.3, unit: 'kg', date: dateOffset(-2) },
    { id: 'bm-18', memberId: 'm4', metric: '总胆固醇', value: 5.9, unit: 'mmol/L', date: dateOffset(-20) },
    { id: 'bm-19', memberId: 'm4', metric: '总胆固醇', value: 6.1, unit: 'mmol/L', date: dateOffset(-4) },
    { id: 'bm-20', memberId: 'm4', metric: '体重', value: 74.5, unit: 'kg', date: dateOffset(-12) },
    { id: 'bm-21', memberId: 'm4', metric: 'BMI', value: 25.4, unit: '', date: dateOffset(-12) },
    /* 日常记录（血压计/手表）同步进看板的血压指标 */
    { id: 'bm-22', memberId: 'm1', metric: '收缩压', value: 152, unit: 'mmHg', date: dateOffset(-2), source: '手动录入' },
    { id: 'bm-23', memberId: 'm1', metric: '舒张压', value: 94, unit: 'mmHg', date: dateOffset(-2), source: '手动录入' },
    { id: 'bm-24', memberId: 'm1', metric: '收缩压', value: 149, unit: 'mmHg', date: dateOffset(-1), source: '模拟手表' },
    { id: 'bm-25', memberId: 'm1', metric: '舒张压', value: 93, unit: 'mmHg', date: dateOffset(-1), source: '模拟手表' },
    { id: 'bm-26', memberId: 'm1', metric: '收缩压', value: 166, unit: 'mmHg', date: dateOffset(0), source: '模拟手表' },
    { id: 'bm-27', memberId: 'm1', metric: '舒张压', value: 102, unit: 'mmHg', date: dateOffset(0), source: '模拟手表' },
    { id: 'bm-28', memberId: 'm2', metric: '收缩压', value: 148, unit: 'mmHg', date: dateOffset(-3), source: '欧姆龙血压计' },
    { id: 'bm-29', memberId: 'm2', metric: '舒张压', value: 91, unit: 'mmHg', date: dateOffset(-3), source: '欧姆龙血压计' },
    { id: 'bm-30', memberId: 'm2', metric: '收缩压', value: 158, unit: 'mmHg', date: dateOffset(0), source: '模拟手表' },
    { id: 'bm-31', memberId: 'm2', metric: '舒张压', value: 96, unit: 'mmHg', date: dateOffset(0), source: '模拟手表' }
  ]
};
let state = loadState();
let currentTab = 'home';
let selectedFile = null;
let toastTimer;
let ocrWorkerPromise = null;
let medicationSource = null;
let preVisitFiles = [];
let preVisitRecorder = null;
let preVisitRecordingStream = null;
let preVisitAudioChunks = [];
let preVisitAttachmentUrl = null;
let evidenceTarget = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const loaded = { ...seed, ...saved };
    loaded.currentRole = saved.currentRole === 'escort' ? 'escort' : 'family';
    loaded.companionProfile = { ...seed.companionProfile, ...(saved.companionProfile || {}) };
    loaded.companionOrders = (saved.companionOrders || []).map((order, index) => ({
      ...order,
      id: order.id || `legacy-order-${index}`,
      status: order.status || 'pending',
      patient: order.patient || '陈兰英',
      requester: order.requester || '小林',
      reviews: order.reviews || { family: null, escort: null }
    }));
    loaded.healthReadings = saved.healthReadings || structuredClone(seed.healthReadings);
    loaded.metricDefs = saved.metricDefs || {};
    loaded.familyMembers = saved.familyMembers || structuredClone(seed.familyMembers);
    loaded.bodyMetrics = saved.bodyMetrics || structuredClone(seed.bodyMetrics);
    loaded.currentMemberId = saved.currentMemberId || 'm1';
    loaded.nextMetricId = saved.nextMetricId || 32;
    loaded.alerts = saved.alerts || [];
    loaded.missedAlerts = saved.missedAlerts || {};
    loaded.nextAlertId = saved.nextAlertId || 1;
    loaded.nextReadingId = saved.nextReadingId || 1;
    return loaded;
  } catch { return structuredClone(seed); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function attachmentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kangban-demo-attachments', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function putAttachment(id, file) {
  if (!file || !('indexedDB' in window)) return;
  const db = await attachmentDb();
  await new Promise((resolve, reject) => {
    const request = db.transaction('files', 'readwrite').objectStore('files').put({ id, name: file.name, type: file.type, blob: file, savedAt: new Date().toISOString() });
    request.onsuccess = resolve; request.onerror = () => reject(request.error);
  });
  db.close();
}
async function getAttachment(id) {
  if (!('indexedDB' in window)) return null;
  const db = await attachmentDb();
  const file = await new Promise((resolve, reject) => {
    const request = db.transaction('files', 'readonly').objectStore('files').get(id);
    request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error);
  });
  db.close(); return file;
}
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function formatDate(value) {
  const [y,m,d] = value.split('-').map(Number);
  return `${m}月${d}日`;
}
function appointmentLabel() {
  const visit = new Date(); visit.setHours(12,0,0,0); visit.setDate(visit.getDate()+4);
  return `${visit.getMonth()+1}月${visit.getDate()}日 · 心内科复诊`;
}
function displayToday() {
  const now = new Date();
  document.getElementById('todayLabel').textContent = `${now.getMonth()+1}月${now.getDate()}日 · 家庭健康档案`;
  const visit = new Date(); visit.setHours(12,0,0,0); visit.setDate(visit.getDate()+4);
  document.getElementById('nextVisitDate').textContent = `${visit.getMonth()+1}月${visit.getDate()}日 周${'日一二三四五六'[visit.getDay()]}`;
}
function renderRecords() {
  const sorted = [...state.records].sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('recordCount').textContent = sorted.length;
  document.getElementById('recordList').innerHTML = sorted.length ? sorted.map(record => `
    <article class="record-item" data-open-record="${esc(record.id)}" data-record-type="${esc(record.type)}" tabindex="0" role="button" aria-label="查看${esc(record.title)}">
      <span class="record-icon ${record.type === '用药记录' ? 'medicine' : ''}">${esc(record.icon || '▤')}</span>
      <div class="record-body"><strong>${esc(record.title)}</strong><small>${esc(record.hospital)} · ${formatDate(record.date)}</small></div>
      <span class="record-status">${esc(record.state)}</span>
    </article>`).join('') : '<p class="empty-hint">还没有资料，添加一份检查报告试试。</p>';
  const preview = sorted.slice(0, 3);
  const timelineHost = document.getElementById('homeTimeline');
  if (timelineHost) timelineHost.innerHTML = preview.map(record => `
    <div class="timeline-row"><span class="timeline-date">${formatDate(record.date)}</span><i class="timeline-marker"></i><div class="timeline-copy"><strong>${esc(record.title)}</strong><small>${esc(record.hospital.split(' · ')[0])}</small></div></div>`).join('');
  const orderHost = document.getElementById('companionOrders');
  const statusLabel = { pending: '待陪诊员确认', accepted: '已接单', declined: '未接单', completed: '已完成' };
  orderHost.innerHTML = `<div class="collapsible ${collapsedPanels.has('companion-orders') ? 'collapsed' : ''}" data-panel="companion-orders"><div class="section-heading service-heading"><div><p class="eyebrow">预约、评价与再次预约</p><h2>我的陪诊安排</h2></div><button class="section-collapse" data-panel-toggle="companion-orders" aria-label="折叠或展开">▾</button></div><div class="section-body">${state.companionOrders.length ? `<div class="family-order-list">${state.companionOrders.map(o => {
    const exec = (o.status === 'accepted' || o.status === 'completed') && o.execution?.items?.length ? (() => {
      const progress = executionProgress(o);
      return `<div class="exec-block exec-block-family"><div class="exec-progress"><strong>履约进度 ${progress.done} / ${progress.total}</strong>${progress.all ? '<span class="exec-progress-done">服务项目已全部完成</span>' : '<span>陪诊员正在逐项执行</span>'}</div>
        <div class="exec-list">${o.execution.items.map(item => `<div class="exec-row ${item.done ? 'is-done' : ''}"><span class="exec-mark">${item.done ? '✓' : '·'}</span><div class="exec-copy"><strong>${esc(item.label)}</strong></div>${item.evidenceId ? `<button class="exec-evidence has-evidence" data-evidence-view="${esc(item.key)}" data-order-id="${esc(o.id)}">查看佐证</button>` : ''}</div>`).join('')}</div></div>`;
    })() : '';
    return `<article class="family-order-card"><div class="family-order-top"><strong>${esc(o.service)}</strong><span class="record-status">${statusLabel[o.status] || '待确认'}</span></div>
      <p>${esc(o.hospital)} · ${esc(o.date)}<br>${esc(o.providerName || state.companionProfile.name)}</p>
      ${exec}
      ${o.status === 'completed' && !o.reviews?.family ? `<button class="text-button" data-order-review="${esc(o.id)}" data-review-role="family">评价本次陪诊 →</button>` : ''}
      ${o.status === 'completed' && o.reviews?.family ? `<small class="review-complete">你已完成评价${o.reviews?.escort ? ' · 双方已互评' : ' · 等待陪诊员评价'}</small>` : ''}${reviewSummary(o)}
      ${(o.status === 'completed' || o.status === 'declined') ? `<button class="text-button" data-rebook="${esc(o.id)}">再次预约 →</button>` : ''}
    </article>`;
  }).join('')}</div>` : `<div class="family-empty-card"><p>还没有陪诊预约。可以先查看陪诊员介绍并提交一笔演示预约。</p><button class="primary-button" data-action="book-profile">预约陪诊员</button></div>`}</div></div>`;
  renderMedicationReminders();
  renderHomeCompanionModule();
  renderHealth();
  renderCompanionViews();
}

/* ============ 健康档案 Tab（FR-01：模拟账号 · 四人档案 · 体检看板） ============ */
const METRIC_DEFS = {
  '体重': { unit: 'kg' },
  'BMI': { unit: '', low: 18.5, high: 24 },
  '空腹血糖': { unit: 'mmol/L', low: 3.9, high: 6.1 },
  '收缩压': { unit: 'mmHg', low: 90, high: 139 },
  '舒张压': { unit: 'mmHg', low: 60, high: 89 },
  '总胆固醇': { unit: 'mmol/L', high: 5.2 },
  '尿酸': { unit: 'μmol/L', low: 208, high: 428 }
};
function currentMember() {
  return (state.familyMembers || []).find(member => member.id === state.currentMemberId) || (state.familyMembers || [])[0];
}
/* 指标定义：静态基础表 + 体检报告导入时学到的扩展表（state.metricDefs，持久化）。
   报单上出现的新指标会带参考范围入库，系统随之扩展，无需改代码。 */
function metricDef(metric) {
  return METRIC_DEFS[metric] || state.metricDefs?.[metric] || null;
}
function metricStatus(metric, value) {
  const def = metricDef(metric);
  if (!def || (def.low == null && def.high == null)) return 'normal';
  if (def.high != null && value > def.high) return 'high';
  if (def.low != null && value < def.low) return 'low';
  return 'normal';
}
function refText(metric) {
  const def = metricDef(metric) || {};
  if (def.low != null && def.high != null) return `参考 ${def.low} – ${def.high} ${def.unit || ''}`.trim();
  if (def.high != null) return `参考 < ${def.high} ${def.unit || ''}`.trim();
  return '无固定参考范围';
}
function statusLabelOf(value, metric) {
  const status = metricStatus(metric, value);
  return { normal: '正常', high: '偏高', low: '偏低' }[status];
}
function statusTagOf(value, metric) {
  const status = metricStatus(metric, value);
  return status === 'normal' ? 'reading-tag-ok' : status === 'high' ? 'reading-tag-red' : 'reading-tag-yellow';
}
function memberMetricEntries(memberId) {
  return (state.bodyMetrics || []).filter(entry => entry.memberId === memberId);
}
function latestAbnormal(memberId) {
  const byMetric = {};
  memberMetricEntries(memberId).slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(entry => { byMetric[entry.metric] = entry; });
  return Object.values(byMetric).filter(entry => metricStatus(entry.metric, entry.value) !== 'normal');
}
const expandedMembers = new Set(['m1']);
let dashboardMetric = {};
const dashboardFilter = {};   // 看板筛选：day / category / all / abnormal
const historyFilter = {};     // 历史记录筛选：{ [memberId]: { metric, abnormalOnly } }
let readingMethod = 'manual';   // 录入读数方式：manual / voice / photo / device
let readingSource = '手动录入'; // 当前录入来源（随方式变化）
const collapsedPanels = new Set(); // 全局面板折叠记忆（key 见各 panelBlock / data-panel）
/* 可折叠面板通用结构：点击头部或折叠箭头收起/展开，body 用 .section-body 包裹 */
function panelBlock(key, headHtml, bodyHtml, extraClass = '') {
  const collapsed = collapsedPanels.has(key);
  return `<div class="board-block collapsible ${extraClass} ${collapsed ? 'collapsed' : ''}" data-panel="${key}">
    <button type="button" class="board-block-head panel-head" data-panel-toggle="${key}">${headHtml}<i class="panel-chevron" aria-hidden="true">▾</i></button>
    <div class="section-body">${bodyHtml}</div>
  </div>`;
}
const boardOpenDays = new Set(); // 化验报告展开的日期分组
const boardDaySeeded = new Set(); // 已做过「首日自动展开」的成员，之后尊重用户手动折叠
let dashboardMemberId = 'm1';   // 当前打开体检看板的成员（弹窗内交互都用它）

function renderHealth() {
  const host = document.getElementById('memberArchiveList');
  if (host) {
    host.innerHTML = state.familyMembers.map(member => {
      const open = expandedMembers.has(member.id);
      const entries = memberMetricEntries(member.id);
      const tracking = latestAbnormal(member.id);
      const trackingHtml = tracking.length
        ? `<div class="member-tracking"><span class="member-tracking-title">异常指标跟踪</span>${tracking.map(entry => `<div class="track-row"><div><strong>${esc(entry.metric)} ${entry.value} ${esc(entry.unit || '')}</strong><small>${formatDate(entry.date)} 录入 · ${refText(entry.metric)}</small></div><span class="reading-tag ${statusTagOf(entry.value, entry.metric)}">跟踪中</span></div>`).join('')}</div>`
        : `<p class="member-tracking-empty">无异常指标，继续保持 ✓</p>`;
      /* 日常记录：读数按成员归属（各设备接口各归各人），卡片内只看自己的数据 */
      const readings = (state.healthReadings || []).filter(reading => reading.memberId === member.id).slice(0, 3);
      const dailyHtml = `<div class="member-daily">
          <div class="member-daily-head"><span class="member-tracking-title">日常记录 · 血压（${readings.length ? `最近 ${Math.min(readings.length, 3)} 条` : '暂无'}）</span><button class="text-button" data-member-reading="${member.id}">录入读数 →</button></div>
          ${readings.length ? `<div class="reading-list">${readings.map(r => {
            const result = evaluateReading(r);
            return `<div class="reading-row"><div class="reading-copy"><strong>${r.systolic}/${r.diastolic} <small>mmHg</small></strong><small>${formatDate(r.date)} ${esc(r.time || '')} · 脉搏 ${r.pulse || '—'} 次/分 · ${esc(r.source || '手动录入')}</small></div><span class="reading-tag ${result ? `reading-tag-${result.level}` : 'reading-tag-ok'}">${result ? ALERT_META[result.level].label : '正常'}</span></div>`;
          }).join('')}</div>` : `<p class="member-tracking-empty">还没有日常读数，点右上「录入读数」试试。</p>`}
          <button class="text-button member-board-link" data-member-dashboard="${member.id}">数据看板（日常记录 + 体检单） →</button>
        </div>`;
      return `<article class="member-archive ${open ? 'is-open' : ''}">
        <button class="member-archive-head" data-member-toggle="${member.id}" aria-expanded="${open}">
          <span class="member-avatar ${member.avatarClass}">${esc(member.name.slice(0, 1))}</span>
          <div class="member-archive-title"><strong>${esc(member.name)}</strong><small>${esc(member.role)} · ${member.age}岁 · ${entries.length} 条指标${tracking.length ? ` · <b class="member-alert-count">${tracking.length} 项异常跟踪</b>` : ' · 无异常'}</small></div>
          <span class="member-chevron">${open ? '⌃' : '⌄'}</span>
        </button>
        ${open ? `<div class="member-archive-body">
          <div class="info-grid">
            <div><span class="field-label">慢病</span><strong>${esc(member.conditions)}</strong></div>
            <div><span class="field-label">过敏史</span><strong class="${/无/.test(member.allergies) ? '' : 'alert-text'}">${esc(member.allergies)}</strong></div>
            <div><span class="field-label">长期用药</span><strong>${esc(member.medications)}</strong></div>
            <div><span class="field-label">手术史</span><strong>${esc(member.surgeries)}</strong></div>
          </div>
          ${trackingHtml}
          ${dailyHtml}
          <div class="member-archive-actions member-archive-actions-3">
            <button class="secondary-button" data-member-edit="${member.id}">编辑档案</button>
            <button class="secondary-button" data-member-daily="${member.id}">日常记录</button>
            <button class="primary-button" data-checkup-import="${member.id}">导入体检单</button>
          </div>
        </div>` : ''}
      </article>`;
    }).join('');
  }
}

function showMemberEdit(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  openModal(`${modalHead('健康档案 · 家庭可编辑', `编辑 ${esc(member.name)} 的档案`, '家庭成员间信息互通（家庭无隐私原则），修改保存后所有家人可见。')}
    <form class="member-edit-form" id="memberEditForm" data-member-id="${member.id}">
      <label><span class="field-label-block">慢病情况</span><input class="input-field" name="conditions" value="${esc(member.conditions)}" /></label>
      <label><span class="field-label-block">过敏史</span><input class="input-field" name="allergies" value="${esc(member.allergies)}" /></label>
      <label><span class="field-label-block">长期用药</span><input class="input-field" name="medications" value="${esc(member.medications)}" /></label>
      <label><span class="field-label-block">手术史</span><input class="input-field" name="surgeries" value="${esc(member.surgeries)}" /></label>
      <button class="primary-button" type="submit">保存档案</button>
    </form><p class="privacy-small">演示版保存在本机浏览器；正式版每次修改都会记录「谁 · 何时 · 改了什么」。</p>`);
  document.getElementById('memberEditForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target);
    Object.assign(member, {
      conditions: String(data.get('conditions') || '').trim(),
      allergies: String(data.get('allergies') || '').trim(),
      medications: String(data.get('medications') || '').trim(),
      surgeries: String(data.get('surgeries') || '').trim()
    });
    state.shares.push({ who: `${member.name} 档案由家人更新`, when: nowLabel() });
    saveState(); renderHealth(); closeModal();
    toast(`${member.name} 的档案已更新，家人端同步可见`);
  });
}

function trendSvg(entries, metric) {
  if (entries.length < 2) return `<div class="trend-empty">「${esc(metric)}」记录两次后显示趋势图</div>`;
  const vals = entries.map(entry => entry.value);
  const min = Math.min(...vals), max = Math.max(...vals), span = (max - min) || 1;
  const w = 264, h = 100, padX = 16, top = 18, bottom = 28;
  const pts = entries.map((entry, i) => [padX + i * (w - padX * 2) / (entries.length - 1), h - bottom - ((entry.value - min) / span) * (h - top - bottom)]);
  const line = pts.map(point => point.map(n => n.toFixed(1)).join(',')).join(' ');
  const dots = pts.map((point, i) => `<circle cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" r="3" fill="#6d8f78" /><text x="${point[0].toFixed(1)}" y="${(point[1] - 8).toFixed(1)}" text-anchor="middle" class="trend-val">${entries[i].value}</text>`).join('');
  const unit = METRIC_DEFS[metric]?.unit ? ` ${METRIC_DEFS[metric].unit}` : '';
  return `<svg class="trend-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(metric)}趋势图">
    <polyline points="${line}" fill="none" stroke="#6d8f78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    ${dots}
    <text x="${padX}" y="${h - 8}" class="trend-date">${formatDate(entries[0].date)}</text>
    <text x="${w - padX}" y="${h - 8}" text-anchor="end" class="trend-date">${formatDate(entries[entries.length - 1].date)}</text>
  </svg><p class="privacy-small">${esc(metric)}：最低 ${min} · 最高 ${max}${unit}</p>`;
}

function showMemberDashboard(memberId, metric = '') {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  dashboardMemberId = memberId;
  const entries = memberMetricEntries(memberId).slice().sort((a, b) => a.date.localeCompare(b.date));
  const metrics = [...new Set(entries.map(entry => entry.metric))];
  const active = metric && metrics.includes(metric) ? metric : (dashboardMetric[memberId] && metrics.includes(dashboardMetric[memberId]) ? dashboardMetric[memberId] : metrics[0]);
  if (active) dashboardMetric[memberId] = active;
  const weightEntries = entries.filter(entry => entry.metric === '体重');
  const lastWeight = weightEntries[weightEntries.length - 1];
  const prevWeight = weightEntries[weightEntries.length - 2];
  const change = lastWeight && prevWeight ? Number((lastWeight.value - prevWeight.value).toFixed(1)) : null;
  const lastEntry = entries[entries.length - 1];
  const tracking = latestAbnormal(memberId);
  const abnormalCount = tracking.length; // 口径与跟踪区一致：每个指标只看最新一次读数
  const filter = dashboardFilter[memberId] || 'day';
  openModal(`${modalHead('数据看板 · 日常记录 + 体检单', `${esc(member.name)} · ${esc(member.role)} ${member.age}岁`, '汇总「日常记录」和「导入体检单」两个来源的数据：身体指标统计、趋势、化验报告整理与跟踪。点右上角可切换指标，底部可导入模拟体检单。')}
    <div class="board-stats">
      <div><span>最近体重</span><strong>${lastWeight ? `${lastWeight.value} kg` : '—'}</strong><small>最近一次</small></div>
      <div><span>体重变化</span><strong>${change === null ? '—' : `${change > 0 ? '↑' : change < 0 ? '↓' : '—'}${Math.abs(change)} kg`}</strong><small>记录两次后显示</small></div>
      <div><span>记录次数</span><strong>${entries.length} 次</strong><small>身体指标跟踪</small></div>
      <div><span>异常待随访</span><strong class="${abnormalCount ? 'trend-warn' : 'trend-ok'}">${abnormalCount} 项</strong><small>异常指标跟踪</small></div>
    </div>
    ${panelBlock('dash-trend', '<strong>📈 趋势图</strong>', `
      <div class="metric-chips">${metrics.map(item => `<button class="metric-chip ${item === active ? 'selected' : ''}" data-metric-chip="${esc(item)}" data-member-id="${member.id}">${esc(item)}</button>`).join('')}</div>
      ${active ? trendSvg(entries.filter(entry => entry.metric === active), active) : '<p class="empty-hint">还没有指标记录，先导入体检单。</p>'}`)}
    ${renderBoardLab(member, entries, filter, abnormalCount)}
    ${renderBoardHistory(member, entries)}
    <button class="primary-button" data-checkup-import="${member.id}">＋ 导入体检单（模拟 OCR）</button>
    <p class="privacy-small">演示版：体检单为模拟识别，数值可修改后入库；不做真实医疗判断。</p>`);
}

/* 历史记录区（按指标分组 + 组内时间线 + 筛选与搜索定位） */
function renderBoardHistory(member, entries) {
  const conf = historyFilter[member.id] || {};
  const metricNames = [...new Set(entries.map(entry => entry.metric))];
  const activeMetric = metricNames.includes(conf.metric) ? conf.metric : 'all';
  const abnormalOnly = !!conf.abnormalOnly;
  const chips = [
    `<button class="metric-chip ${activeMetric === 'all' && !abnormalOnly ? 'selected' : ''}" data-hist-filter="all" data-member-id="${member.id}">全部</button>`,
    ...metricNames.map(name => {
      const abnormal = entries.filter(entry => entry.metric === name && metricStatus(name, entry.value) !== 'normal').length;
      return `<button class="metric-chip ${activeMetric === name && !abnormalOnly ? 'selected' : ''}" data-hist-filter="${esc(name)}" data-member-id="${member.id}">${esc(name)}${abnormal ? ` ·${abnormal}` : ''}</button>`;
    }),
    `<button class="metric-chip ${abnormalOnly ? 'selected' : ''}" data-hist-abn="${member.id}">只看异常</button>`
  ].join('');
  return panelBlock('dash-history', '<strong>🗂 历史记录</strong><small>按指标 · 时间线 · 可搜索 / 编辑 / 删除</small>', `
    <div class="hist-search"><input class="input-field" id="histSearch" data-member-id="${member.id}" type="text" placeholder="🔍 搜索指标 / 数值 / 日期 / 来源" value="${esc(conf.search || '')}" /></div>
    <div class="metric-chips board-filter-chips">${chips}</div>
    <div id="histBody">${renderHistBody(member, entries)}</div>`);
}
function renderHistBody(member, entries) {
  const conf = historyFilter[member.id] || {};
  const metricNames = [...new Set(entries.map(entry => entry.metric))];
  const activeMetric = metricNames.includes(conf.metric) ? conf.metric : 'all';
  const abnormalOnly = !!conf.abnormalOnly;
  const keyword = (conf.search || '').trim().toLowerCase();
  let pool = entries;
  if (activeMetric !== 'all') pool = pool.filter(entry => entry.metric === activeMetric);
  if (abnormalOnly) pool = pool.filter(entry => metricStatus(entry.metric, entry.value) !== 'normal');
  if (keyword) {
    pool = pool.filter(entry => [entry.metric, String(entry.value), entry.unit || '', formatDate(entry.date), entry.date, entry.source || ''].join(' ').toLowerCase().includes(keyword));
  }
  const groups = new Map();
  pool.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(entry => {
    if (!groups.has(entry.metric)) groups.set(entry.metric, []);
    groups.get(entry.metric).push(entry);
  });
  return entries.length && groups.size
    ? [...groups.entries()].map(([name, list]) => {
        const abnormal = list.filter(entry => metricStatus(name, entry.value) !== 'normal').length;
        return `<div class="hist-group">
          <div class="hist-group-head"><strong>${esc(name)}</strong><small>${list.length} 条记录${abnormal ? ` · <b>${abnormal} 条异常</b>` : ' · 全部正常'}</small></div>
          <div class="hist-timeline">${list.map(entry => `<div class="hist-node">
              <span class="hist-dot ${metricStatus(name, entry.value) !== 'normal' ? 'hist-dot-abn' : ''}"></span>
              <div class="hist-node-body">
                <div class="hist-node-top"><strong>${entry.value} ${esc(entry.unit || '')}</strong><span class="reading-tag ${statusTagOf(entry.value, entry.metric)}">${statusLabelOf(entry.value, entry.metric)}</span></div>
                <small>${formatDate(entry.date)}${entry.source ? ` · ${esc(entry.source)}` : ''}</small>
                <div class="track-ops"><button class="text-button track-btn" data-hist-edit="${esc(entry.id)}">编辑</button><button class="text-button track-btn track-btn-del" data-hist-del="${esc(entry.id)}">删除</button></div>
              </div>
            </div>`).join('')}</div>
        </div>`;
      }).join('')
    : `<p class="empty-hint">${!entries.length ? '还没有指标记录，先导入体检单。' : keyword ? `没有匹配「${esc(conf.search.trim())}」的记录，换个关键词试试。` : '当前筛选下没有记录，试试其他指标或关闭「只看异常」。'}</p>`;
}

/* 化验报告区（参考产品稿：按天/按类别分组、筛选芯片、异常标色） */
function boardRow(entry) {
  return `<div class="track-row board-lab-row"><div><strong>${esc(entry.metric)}</strong><small>${entry.value} ${esc(entry.unit || '')} · ${refText(entry.metric)}</small></div><span class="reading-tag ${statusTagOf(entry.value, entry.metric)}">${statusLabelOf(entry.value, entry.metric)}</span></div>`;
}
function renderBoardLab(member, entries, filter, abnormalCount, tracking) {
  const chips = [
    ['day', '按天'],
    ['category', '按检查类别'],
    ['all', '全部'],
    ['abnormal', abnormalCount ? `只看异常 · ${abnormalCount}` : '只看异常']
  ].map(([key, label]) => `<button class="metric-chip ${filter === key ? 'selected' : ''}" data-board-filter="${key}" data-member-id="${member.id}">${esc(label)}</button>`).join('');
  const legend = '<p class="board-legend">异常标红（偏高）/ 标黄（偏低），仅作整理，具体诊断请遵医嘱。</p>';
  let body = '';
  if (!entries.length) body = '<p class="empty-hint">还没有化验数据，先导入体检单。</p>';
  else if (filter === 'all') body = entries.slice().reverse().map(boardRow).join('');
  else if (filter === 'abnormal') {
    const rows = entries.slice().reverse().filter(entry => metricStatus(entry.metric, entry.value) !== 'normal');
    body = rows.length ? rows.map(boardRow).join('') : '<p class="empty-hint">当前没有异常指标，继续保持。</p>';
  } else {
    const groups = new Map();
    if (filter === 'day') {
      entries.slice().reverse().forEach(entry => {
        if (!groups.has(entry.date)) groups.set(entry.date, []);
        groups.get(entry.date).push(entry);
      });
    } else {
      entries.slice().reverse().forEach(entry => {
        const key = entry.category || entry.metric;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
      });
    }
    if (filter === 'day' && !boardDaySeeded.has(member.id)) {
      const first = [...groups.keys()][0];
      if (first && !boardOpenDays.has(first)) boardOpenDays.add(first);
      boardDaySeeded.add(member.id);
    }
    body = [...groups.entries()].map(([key, rows]) => {
      const abnormal = rows.filter(entry => metricStatus(entry.metric, entry.value) !== 'normal').length;
      const open = boardOpenDays.has(key);
      return `<div class="board-day ${open ? 'open' : ''}">
        <button class="board-day-head" data-board-day="${esc(key)}"><strong>${esc(key)}</strong><span>${rows.length} 项${abnormal ? ` · <b class="${abnormal ? 'board-abn' : 'board-ok'}">${abnormal} 项异常</b>` : ' · <b class="board-ok">全部正常</b>'}</span><i class="member-chevron">${open ? '▴' : '▾'}</i></button>
        ${open ? `<div class="board-day-body">${rows.map(boardRow).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }
  return panelBlock('dash-lab', `<strong>🧪 化验报告</strong><small>${abnormalCount ? `${abnormalCount} 项异常待随访` : '暂无异常'}</small>`, `
    <div class="metric-chips board-filter-chips">${chips}</div>
    ${legend}${body}`);
}

/* 历史记录 · 编辑单条指标 */
function showHistEdit(entryId) {
  const entry = (state.bodyMetrics || []).find(item => item.id === entryId);
  if (!entry) return;
  const def = metricDef(entry.metric) || {};
  openModal(`${modalHead('编辑指标记录', `${esc(entry.metric)} · ${formatDate(entry.date)}`, '修正录入错误的数值。修改后保存，异常状态会按参考范围自动重新判定。')}
    <form class="member-edit-form" id="histEditForm">
      <label><span class="field-label-block">${esc(entry.metric)} 数值${def.unit ? `（${def.unit}）` : ''}</span><input class="input-field" name="value" type="number" step="0.1" value="${entry.value}" /></label>
      <label><span class="field-label-block">记录日期</span><input class="input-field" name="date" type="date" value="${entry.date}" /></label>
      <p class="privacy-small">${refText(entry.metric)}</p>
      <button class="primary-button" type="submit">保存修改</button>
    </form>`);
  document.getElementById('histEditForm')?.addEventListener('submit', ev => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    const value = Number(data.get('value'));
    const date = String(data.get('date') || entry.date);
    if (!Number.isFinite(value) || value <= 0) { toast('请输入有效数值'); return; }
    entry.value = value; entry.date = date;
    saveState(); renderHealth(); showMemberDashboard(entry.memberId);
    toast(`${entry.metric} 已更新为 ${value}${def.unit ? ` ${def.unit}` : ''}（${statusLabelOf(value, entry.metric)}）`);
  });
}

/* 模拟体检单：一份完整大单（按检查类别分组）。
   指标允许超出基础表 METRIC_DEFS——报告自带参考范围（low/high），
   核对入库时系统把新指标「学会」进 state.metricDefs，之后判定/跟踪都用它。 */
const CHECKUP_MOCKS = [
  { category: '血糖', metric: '空腹血糖', value: 6.8, unit: 'mmol/L', low: 3.9, high: 6.1 },
  { category: '血脂四项', metric: '总胆固醇', value: 5.6, unit: 'mmol/L', low: null, high: 5.2 },
  { category: '血脂四项', metric: '甘油三酯', value: 2.35, unit: 'mmol/L', low: null, high: 1.7 },
  { category: '血脂四项', metric: '高密度脂蛋白', value: 1.02, unit: 'mmol/L', low: 1.04, high: 1.55 },
  { category: '血脂四项', metric: '低密度脂蛋白', value: 3.9, unit: 'mmol/L', low: null, high: 3.4 },
  { category: '肝功能', metric: '谷丙转氨酶', value: 58, unit: 'U/L', low: 9, high: 50 },
  { category: '肝功能', metric: '总胆红素', value: 14.2, unit: 'μmol/L', low: 3.4, high: 20.5 },
  { category: '肾功能', metric: '肌酐', value: 78, unit: 'μmol/L', low: 57, high: 97 },
  { category: '肾功能', metric: '尿素氮', value: 6.1, unit: 'mmol/L', low: 2.9, high: 8.2 },
  { category: '肾功能', metric: '尿酸', value: 452, unit: 'μmol/L', low: 208, high: 428 },
  { category: '血常规', metric: '白细胞计数', value: 6.4, unit: '×10⁹/L', low: 3.5, high: 9.5 },
  { category: '血常规', metric: '红细胞计数', value: 4.7, unit: '×10¹²/L', low: 4.3, high: 5.8 },
  { category: '血常规', metric: '血红蛋白', value: 141, unit: 'g/L', low: 130, high: 175 },
  { category: '血常规', metric: '血小板计数', value: 226, unit: '×10⁹/L', low: 125, high: 350 },
  { category: '一般检查', metric: '体重', value: 60.2, unit: 'kg' },
  { category: '一般检查', metric: 'BMI', value: 23.9, unit: '', low: 18.5, high: 24 },
  { category: '一般检查', metric: '收缩压', value: 132, unit: 'mmHg', low: 90, high: 139 }
];
/* 核对阶段的状态判定：报告印的参考范围优先于系统基础表 */
function checkupRowStatus(row, value) {
  const def = metricDef(row.metric) || {};
  const low = row.low != null ? row.low : def.low;
  const high = row.high != null ? row.high : def.high;
  if (low == null && high == null) return 'normal';
  if (high != null && value > high) return 'high';
  if (low != null && value < low) return 'low';
  return 'normal';
}
function showCheckupImport(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  openModal(`${modalHead('导入体检单 · 模拟 OCR', `${esc(member.name)} 的体检报告`, '演示识别流程：识别体检单为结构化指标（17 项 · 6 个检查类别），人工核对后入库。报告上基础表之外的新指标，会连同参考范围自动登记进系统。')}
    <div class="checkup-photo">📋 体检报告影像件（模拟）<small>市第一人民医院健康体检中心 · 年度体检 · 含血常规 / 血脂四项 / 肝肾功能等</small></div>
    <button class="primary-button" id="checkupScan" data-member-id="${member.id}">开始识别（模拟 OCR）</button>
    <p class="privacy-small">医生手写内容不保证识别率，识别结果必须人工核对后才会入库。</p>`);
}
function showCheckupConfirm(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  const rows = CHECKUP_MOCKS;
  const tagClass = status => status === 'normal' ? 'reading-tag-ok' : status === 'high' ? 'reading-tag-red' : 'reading-tag-yellow';
  const tagLabel = status => ({ normal: '正常', high: '偏高', low: '偏低' })[status];
  const categories = [...new Set(rows.map(row => row.category))];
  const rowHtml = row => {
    const index = rows.indexOf(row);
    const ref = row.low != null && row.high != null ? `${row.low} – ${row.high}` : row.high != null ? `< ${row.high}` : '—';
    return `<label class="checkup-row"><span class="checkup-name">${esc(row.metric)}</span><input type="number" step="0.1" value="${row.value}" data-checkup-value="${index}" /><small>${esc(row.unit || '')} · 参考 ${ref}</small><span class="reading-tag ${tagClass(checkupRowStatus(row, row.value))}" data-checkup-tag="${index}">${tagLabel(checkupRowStatus(row, row.value))}</span></label>`;
  };
  const grouped = categories.map(category => `<p class="checkup-category">${esc(category)}</p>${rows.filter(row => row.category === category).map(rowHtml).join('')}`).join('');
  openModal(`${modalHead('导入体检单 · 核对入库', `识别到 ${rows.length} 项指标 · ${categories.length} 个检查类别`, '已按报告参考范围自动标记状态，数值可直接修改（状态实时重判）。新指标会随报告自动登记参考范围。')}
    <div class="checkup-list">${grouped}</div>
    <button class="primary-button" id="checkupConfirm" data-member-id="${member.id}">确认入库</button>
    <p class="privacy-small">入库后异常指标自动进入「异常指标跟踪」，可在体检看板查看变化。</p>`);
  document.querySelectorAll('[data-checkup-value]').forEach(input => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.checkupValue);
      const tag = document.querySelector(`[data-checkup-tag="${index}"]`);
      const value = Number(input.value);
      if (!tag || !Number.isFinite(value)) return;
      const status = checkupRowStatus(rows[index], value);
      tag.className = `reading-tag ${tagClass(status)}`;
      tag.textContent = tagLabel(status);
    });
  });
  document.getElementById('checkupConfirm')?.addEventListener('click', () => {
    const edited = rows.map((row, index) => ({ ...row, value: Number(document.querySelector(`[data-checkup-value="${index}"]`)?.value) || row.value }));
    // 新指标登记：报告带来的、基础表没有的指标，把参考范围学进 state.metricDefs（持久化）
    let learned = 0;
    edited.forEach(row => {
      if (!metricDef(row.metric) && (row.low != null || row.high != null)) {
        state.metricDefs = state.metricDefs || {};
        state.metricDefs[row.metric] = { unit: row.unit, low: row.low, high: row.high, category: row.category };
        learned += 1;
      }
    });
    edited.forEach(row => {
      state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId, metric: row.metric, value: row.value, unit: row.unit, date: dateOffset(0), source: '体检导入', category: row.category });
    });
    saveState(); renderHealth(); closeModal();
    const abnormal = edited.filter(row => checkupRowStatus(row, row.value) !== 'normal');
    toast(`已导入 ${edited.length} 项指标${learned ? `（新登记 ${learned} 项指标范围）` : ''}${abnormal.length ? `，${abnormal.length} 项异常进入跟踪` : '，全部正常'}`);
    if (abnormal.length) {
      createAlert('blue', '体检指标异常已入库', `${member.name}本次体检 ${abnormal.map(row => `${row.metric} ${row.value}${row.unit || ''}（${tagLabel(checkupRowStatus(row, row.value))}）`).join('、')}，超出参考范围，已进入异常指标跟踪，建议下次复查关注。`, '体检导入');
    }
    showMemberDashboard(memberId);
  });
}

function showInsuranceHub(channel) {
  const isSocial = channel === 'social';
  openModal(`${modalHead('保险报销 · 保单优先', isSocial ? '社保医疗保险' : '商业医疗保险', '从参保档案或保单进入，创建或关联一次就诊的材料包；材料包只保存一份，各渠道分别维护材料清单和办理进度。')}
    <div class="insurance-channel-card"><strong>${isSocial ? '医保参保档案' : '演示保单'}：陈兰英</strong><small>${isSocial ? '深圳市职工医保（演示） · 异地就医备案未办理' : '百万医疗险（演示保单） · 保额 200 万 · 生效中'}</small></div>
    <div class="share-log"><h3>材料包与办理进度（演示）</h3>
      <div class="log-row"><span>10月22日 市一院门诊 · 材料包</span><small>已提交</small></div>
      <div class="log-row"><span>${isSocial ? '医保零星报销' : '商业险理赔申请'}</span><small>待补件</small></div>
    </div>
    <div class="health-highlight">进度状态：待整理 → 已提交 → 待补件 → 处理中 → 已办结。演示版不做保险销售、不自动判断承保或赔付金额。</div>
    <button class="primary-button" id="insuranceTodo">创建 / 关联就诊材料包</button>
    <p class="privacy-small">完整模块由成员B按需求文档 FR-07 开发，当前为医疗资料分区下的入口演示。</p>`);
  document.getElementById('insuranceTodo')?.addEventListener('click', () => { closeModal(); toast('演示版：材料包功能开发中，入口与信息架构已就位'); });
}

function renderHomeCompanionModule() {
  const host = document.getElementById('homeCompanionModule');
  if (!host) return;
  const latest = state.companionOrders[0];
  const needsReview = state.companionOrders.find(order => order.status === 'completed' && !order.reviews?.family);
  const rebookable = state.companionOrders.find(order => order.status === 'completed' || order.status === 'declined');
  const status = { pending: '等待陪诊员确认', accepted: '陪诊员已接单', declined: '暂未接单', completed: '服务已完成' };
  const recentOrder = latest ? `<div class="home-companion-status"><span class="service-icon service-green">♡</span><div><strong>${esc(latest.service)} · ${status[latest.status] || '待确认'}</strong><small>${esc(latest.hospital)} · ${esc(latest.date)} · ${esc(latest.providerName || state.companionProfile.name)}</small></div></div>` : `<div class="home-companion-status"><span class="service-icon service-green">♡</span><div><strong>还没有预约</strong><small>${esc(state.companionProfile.name)} · ${state.companionProfile.available ? '当前可预约' : '暂时停止接单'}</small></div></div>`;
  host.innerHTML = `<div class="home-companion-card">${recentOrder}<div class="home-companion-actions"><button class="secondary-button" data-action="companion">${latest ? '查看我的预约' : '了解陪诊服务'}</button><button class="primary-button" data-action="book-profile">预约陪诊员</button>${needsReview ? `<button class="secondary-button" data-order-review="${esc(needsReview.id)}" data-review-role="family">评价本次陪诊</button>` : ''}${rebookable ? `<button class="secondary-button" data-rebook="${esc(rebookable.id)}">再次预约</button>` : ''}</div></div>`;
}

function reviewSummary(order) {
  const entries = [
    ['家庭评价陪诊员', order.reviews?.family],
    ['陪诊员评价家庭', order.reviews?.escort]
  ].filter(([, review]) => review);
  return entries.length ? `<div class="review-summary">${entries.map(([label, review]) => `<p><strong>${label} · ${Number(review.score)}★</strong>${review.comment ? `　${esc(review.comment)}` : ''}</p>`).join('')}</div>` : '';
}

/* ============ 陪诊履约清单与佐证（FR-09 演示版） ============ */
const EXECUTION_ITEMS = {
  '全程陪诊': ['到院接送', '协助取号', '陪同就诊', '取药与报告', '就诊后信息交接'],
  '检查陪同': ['到院接送', '检查陪同', '报告领取', '就诊后信息交接'],
  '取药与报告': ['到院取号', '取药 / 领取报告', '用药信息交接']
};
function executionChecklist(service) {
  return EXECUTION_ITEMS[service] || EXECUTION_ITEMS['全程陪诊'];
}
function ensureExecution(order) {
  if (order.status !== 'accepted' && order.status !== 'completed') return order;
  if (order.execution?.items?.length) return order;
  const items = executionChecklist(order.service).map(label => ({ key: `exec-${label}`, label, done: false, doneAt: null, evidenceId: null, evidenceName: null }));
  order.execution = { items, startedAt: new Date().toISOString() };
  return order;
}
function executionProgress(order) {
  const items = order.execution?.items || [];
  const done = items.filter(item => item.done).length;
  return { done, total: items.length, all: items.length > 0 && done === items.length };
}
function showEvidenceModal(orderId, key) {
  const order = state.companionOrders.find(item => item.id === orderId);
  const item = order?.execution?.items?.find(entry => entry.key === key);
  if (!item) { toast('没有找到该履约项'); return; }
  if (!item.evidenceId) { toast('该项还没有上传佐证'); return; }
  getAttachment(item.evidenceId).then(record => {
    const preview = record?.type?.startsWith('image/') ? `<img class="report-preview" src="${URL.createObjectURL(record.blob)}" alt="履约佐证照片" />` : '<p class="privacy-small">当前设备无法预览此附件。</p>';
    openModal(`${modalHead('陪诊履约 · 佐证查看', esc(item.label), '陪诊员在服务过程中上传的现场佐证，仅对本次预约的家庭成员可见。')}${preview}<p class="privacy-small">佐证照片保存在本机浏览器，不上传云端。</p><button class="primary-button" id="evidenceDone">返回</button>`);
    document.getElementById('evidenceDone')?.addEventListener('click', closeModal);
  }).catch(() => toast('读取佐证失败'));
}

function renderCompanionViews() {
  const profile = state.companionProfile;
  const familyProfile = document.getElementById('familyEscortProfile');
  if (familyProfile) {
    const ratings = state.companionOrders.flatMap(order => order.reviews?.family ? [order.reviews.family.score] : []);
    const average = ratings.length ? (ratings.reduce((sum, score) => sum + Number(score || 0), 0) / ratings.length).toFixed(1) : '新加入';
    familyProfile.innerHTML = `<div class="escort-avatar">${esc(profile.name.slice(0, 1))}</div><div class="escort-profile-copy"><div class="escort-name-row"><strong>${esc(profile.name)}</strong><span class="record-status">${profile.available ? '可预约' : '暂不接单'}</span></div><small>${esc(profile.experience)} · ${esc(profile.serviceArea)}</small><p>${esc(profile.bio)}</p><small>可预约：${esc(profile.availability)} · 评价 ${average}${ratings.length ? `（${ratings.length}）` : ''}</small><button class="text-button" data-action="book-profile">预约这位陪诊员 →</button></div>`;
  }
  const nameInput = document.getElementById('escortNameInput');
  if (nameInput) {
    nameInput.value = profile.name;
    document.getElementById('escortExperienceInput').value = profile.experience;
    document.getElementById('escortAreaInput').value = profile.serviceArea;
    document.getElementById('escortAvailabilityInput').value = profile.availability;
    document.getElementById('escortBioInput').value = profile.bio;
  }
  const availabilityLabel = document.getElementById('escortAvailabilityLabel');
  if (availabilityLabel) {
    availabilityLabel.textContent = profile.available ? '可预约' : '暂停接单';
    document.getElementById('escortAvailabilityText').textContent = profile.available ? '家庭可以向你提交预约申请' : '家庭暂时不能提交新的预约';
    document.getElementById('availabilityButton').textContent = profile.available ? '暂停接单' : '恢复接单';
  }
  const orders = state.companionOrders;
  orders.forEach(ensureExecution);
  const count = (status) => orders.filter(order => order.status === status).length;
  const pendingCount = document.getElementById('escortPendingCount');
  if (pendingCount) {
    pendingCount.textContent = count('pending');
    document.getElementById('escortAcceptedCount').textContent = count('accepted');
    document.getElementById('escortCompletedCount').textContent = count('completed');
    const host = document.getElementById('escortOrders');
    host.innerHTML = orders.length ? orders.map(order => {
      const label = { pending: '待确认', accepted: '待服务', declined: '未接单', completed: '已完成' }[order.status] || '待确认';
      let executionBlock = '';
      if (order.status === 'accepted' || order.status === 'completed') {
        const progress = executionProgress(order);
        executionBlock = `<div class="exec-block"><div class="exec-progress"><strong>履约进度 ${progress.done} / ${progress.total}</strong>${progress.all ? '<span class="exec-progress-done">已完成全部项目</span>' : '<span>逐项完成并上传佐证</span>'}</div>
          <div class="exec-list">${order.execution.items.map(item => `<div class="exec-row ${item.done ? 'is-done' : ''}">
            <button class="exec-toggle" data-exec-toggle="${esc(item.key)}" data-order-id="${esc(order.id)}" ${item.done ? 'disabled' : ''}>${item.done ? '✓' : ''}</button>
            <div class="exec-copy"><strong>${esc(item.label)}</strong>${item.done ? `<small>完成于 ${esc(item.doneAt || '')}</small>` : '<small>待执行</small>'}</div>
            ${item.evidenceId ? `<button class="exec-evidence has-evidence" data-evidence-view="${esc(item.key)}" data-order-id="${esc(order.id)}">查看佐证</button>` : `<button class="exec-evidence" data-exec-evidence="${esc(item.key)}" data-order-id="${esc(order.id)}">上传佐证</button>`}
          </div>`).join('')}</div></div>`;
      }
      const actions = order.status === 'pending' ? `<div class="order-actions"><button class="secondary-button" data-order-action="decline" data-order-id="${esc(order.id)}">暂不接单</button><button class="primary-button" data-order-action="accept" data-order-id="${esc(order.id)}">接受预约</button></div>`
        : order.status === 'accepted' ? (() => { const progress = executionProgress(order); return `${executionBlock}${progress.all ? `<button class="primary-button" data-order-action="complete" data-order-id="${esc(order.id)}">标记陪诊已完成</button>` : '<small class="review-complete">完成全部履约项目后才能标记完成</small>'}`; })()
        : order.status === 'completed' ? `${executionBlock}${!order.reviews?.escort ? `<button class="primary-button" data-order-review="${esc(order.id)}" data-review-role="escort">评价本次家庭</button>` : `<small class="review-complete">你已评价${order.reviews?.family ? ' · 双方已互评' : ' · 等待家庭评价'}</small>`}`
        : '';
      return `<article class="escort-order-card"><div class="family-order-top"><strong>${esc(order.patient || '家庭预约')}</strong><span class="record-status">${label}</span></div><p>${esc(order.service)} · ${esc(order.date)}<br>${esc(order.hospital)}<br>需求：${esc(order.need || '未补充')}</p><small class="privacy-small order-share-note">本次申请仅分享以上预约信息，不包含完整病历。</small>${reviewSummary(order)}${actions}</article>`;
    }).join('') : '<div class="empty-hint">还没有预约申请。切换到家庭端创建一笔演示预约，就能在这里体验接单流程。</div>';
  }
}

function renderRole() {
  const isEscort = state.currentRole === 'escort';
  const member = currentMember();
  document.getElementById('roleAvatar').textContent = isEscort ? state.companionProfile.name.slice(0, 1) : (member?.name.slice(0, 1) || '家');
  document.getElementById('roleLabel').textContent = isEscort ? `陪诊员端 · ${state.companionProfile.name}` : `家庭端 · ${member?.name || '家人'}`;
  document.getElementById('familyTabs').hidden = isEscort;
  document.getElementById('escortTabs').hidden = !isEscort;
  const greetName = document.querySelector('#view-home .greeting-row h1 span');
  if (greetName && member) greetName.textContent = member.name;
  renderCompanionViews();
}

function setRole(role) {
  state.currentRole = role === 'escort' ? 'escort' : 'family';
  saveState();
  renderRole();
  navigate(state.currentRole === 'escort' ? 'escort' : 'home');
  closeModal();
}
function renderMedicationReminders() {
  const host = document.getElementById('homeMedicationReminders');
  if (!host) return;
  const today = dateOffset(0);
  const slots = (state.medications || []).flatMap(med => (med.times || []).map(time => ({ med, time }))).sort((a,b) => a.time.localeCompare(b.time));
  if (!slots.length) {
    host.innerHTML = `<div class="med-empty"><span>还没有服药提醒</span><button class="text-button" data-action="add-medication">拍照添加医嘱 →</button></div>`;
    return;
  }
  host.innerHTML = `<div class="med-reminder-list">${slots.map(({med,time}) => {
    const key = `${today}|${med.id}|${time}`; const done = Boolean(state.medicationTaken?.[key]);
    return `<div class="med-reminder-row ${done ? 'is-taken' : ''}"><time>${esc(time)}</time><div class="med-reminder-copy"><strong>${esc(med.name)}</strong><small>${esc(med.dose || '按已核对医嘱')} · ${esc(med.frequencyLabel || `每日${med.times.length}次`)}</small></div><button class="med-taken-button" data-med-taken="${esc(med.id)}" data-med-time="${esc(time)}" ${done ? 'disabled' : ''}>${done ? '已记录' : '记录已服'}</button></div>`;
  }).join('')}</div>`;
}
function checkMedicationReminders() {
  const now = new Date();
  const day = dateOffset(0);
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  let changed = false;
  for (const med of state.medications || []) {
    for (const time of med.times || []) {
      const [hour, minute] = time.split(':').map(Number);
      const delta = currentMinute - (hour * 60 + minute);
      const key = `${day}|${med.id}|${time}`;
      if (delta >= 0 && delta <= 3 && !state.medicationTaken?.[key] && !state.medicationNotified?.[key]) {
        state.medicationNotified = { ...(state.medicationNotified || {}), [key]: true };
        changed = true;
        const message = `${med.name}${med.dose ? ` · ${med.dose}` : ''}，请按已确认医嘱核对。`;
        if ('Notification' in window && Notification.permission === 'granted') new Notification('康伴服药提醒', { body: message, tag: key });
        else if (document.visibilityState === 'visible') toast(`服药提醒：${med.name} · ${time}`);
      }
      if (delta > 90 && !state.medicationTaken?.[key] && !state.missedAlerts?.[key]) {
        state.missedAlerts = { ...(state.missedAlerts || {}), [key]: true };
        changed = true;
        createAlert('yellow', '提醒后仍未记录服药', `${med.name}（${med.dose || '按医嘱'}）计划 ${time} 服用，超过 90 分钟未记录已服。请联系妈妈确认是否漏服，不要自行补服处方药。`, '服药提醒闭环');
      }
    }
  }
  if (changed) saveState();
}

/* ============ 健康预警（FR-02 规则版）与分级告知（FR-04） ============ */
const ALERT_META = {
  red: { label: '紧急', badge: 'alert-badge-red', hint: '立即处理' },
  yellow: { label: '需要关注', badge: 'alert-badge-yellow', hint: '建议跟进' },
  blue: { label: '一般', badge: 'alert-badge-blue', hint: '日常留意' }
};
const NOTIFY_PLAN = {
  red: ['已向全体家庭成员推送 App 强提醒', '已发起电话外呼（演示）：小林 · 女儿', '已在平台后台生成人工介入记录'],
  yellow: ['已推送 App 通知给家庭成员', '已加入今日健康汇总'],
  blue: ['已加入今日健康汇总，家人打开首页可见']
};
function evaluateReading(reading) {
  const { systolic, diastolic } = reading;
  if (systolic >= 180 || diastolic >= 110) return { level: 'red', title: '血压明显升高', detail: `收缩压 ${systolic} mmHg / 舒张压 ${diastolic} mmHg，达到紧急阈值（≥180/≥110）。请立即联系妈妈确认情况，必要时就医。` };
  if (systolic >= 160 || diastolic >= 100) return { level: 'yellow', title: '血压偏高', detail: `收缩压 ${systolic} mmHg / 舒张压 ${diastolic} mmHg，超过关注阈值（≥160/≥100）。建议今天复测一次并留意妈妈的状态。` };
  if (systolic >= 140 || diastolic >= 90) return { level: 'blue', title: '血压轻度升高', detail: `收缩压 ${systolic} mmHg / 舒张压 ${diastolic} mmHg，轻度超过日常范围（≥140/≥90），已记入健康汇总。` };
  return null;
}
function nowLabel() {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
function createAlert(level, title, detail, source) {
  const alert = { id: `alert-${state.nextAlertId++}`, level, title, detail, source: source || '规则引擎', createdAt: nowLabel(), notify: NOTIFY_PLAN[level] || NOTIFY_PLAN.blue };
  state.alerts.unshift(alert);
  saveState(); renderHomeAlerts();
  if ('Notification' in window && Notification.permission === 'granted') new Notification(`康伴${ALERT_META[level].label}预警：${title}`, { body: detail, tag: alert.id });
  return alert;
}
function renderHomeAlerts() {
  const host = document.getElementById('homeAlerts');
  if (!host) return;
  const latest = state.alerts[0];
  if (!latest) {
    host.innerHTML = `<div class="alert-card alert-card-calm"><span class="alert-icon">✓</span><div><strong>近期没有需要处理的预警</strong><small>录入血压读数或同步手表数据后，规则引擎会自动评估。</small></div><button class="text-button" data-action="add-reading">录入 →</button></div>`;
    return;
  }
  const meta = ALERT_META[latest.level];
  const counts = { red: 0, yellow: 0, blue: 0 };
  state.alerts.forEach(alert => { counts[alert.level] = (counts[alert.level] || 0) + 1; });
  const countText = counts.red ? `${counts.red} 条紧急` : counts.yellow ? `${counts.yellow} 条需要关注` : `${counts.blue || 0} 条一般记录`;
  host.innerHTML = `<div class="alert-card alert-card-${latest.level}"><span class="alert-icon alert-icon-${latest.level}">${latest.level === 'red' ? '!' : latest.level === 'yellow' ? '△' : '·'}</span><div><strong>${esc(latest.title)}</strong><small>${esc(latest.detail.split('。')[0])}。</small><small class="alert-time">${esc(latest.createdAt)} · ${countText}</small></div><button class="text-button" data-action="alerts">查看 →</button></div>`;
}
function showAlertCenter() {
  const alerts = state.alerts;
  const list = alerts.length ? alerts.map(alert => {
    const meta = ALERT_META[alert.level];
    return `<article class="alert-detail-card"><div class="alert-detail-head"><span class="alert-badge ${meta.badge}">${meta.label}</span><strong>${esc(alert.title)}</strong><small>${esc(alert.createdAt)}</small></div><p>${esc(alert.detail)}</p><small class="alert-source">来源：${esc(alert.source)}</small><div class="alert-notify"><strong>分级告知记录</strong>${(alert.notify || []).map(entry => `<small>› ${esc(entry)}</small>`).join('')}</div></article>`;
  }).join('') : '<p class="privacy-small" style="margin-top:18px">还没有预警记录。下面录入一次血压读数试试。</p>';
  openModal(`${modalHead('规则版 · 本机演示', '健康预警中心', '预警由血压读数和服药记录按固定规则生成，不构成医疗判断。红色立即电话告知，黄色推送提醒，蓝色进入每日汇总。')}
    ${list}
    <div class="reading-form">
      <strong>有新读数？</strong>
      <button class="primary-button" data-action="add-reading">＋ 录入读数（手动 / 语音 / 拍照 / 硬件）</button>
      <p class="privacy-small">录入后由规则引擎自动评估并分级告知；也可在硬件同步里模拟手表读数与跌倒事件。</p>
    </div>`);
}
/* ============ 录入读数（多通道：手动 / 语音 / 拍照 / 硬件，读数按成员归属） ============ */
let readingMemberId = 'm1';   // 当前录入读数的目标成员（设备数据各归各人）
const READING_METHODS = [
  { id: 'manual', icon: '✍️', label: '手动录入', hint: '一句话描述读数，AI 识别后回填核对' },
  { id: 'voice', icon: '🎙', label: '语音录入', hint: '老人说一句话，自动转成读数' },
  { id: 'photo', icon: '📷', label: '拍照识别', hint: '拍血压计 / 血糖仪，OCR 读数' },
  { id: 'device', icon: '⌚', label: '硬件同步', hint: '智能手表自动同步与异常上报' }
];
/* 一句话 → 结构化读数（演示版本地解析；正式版由大模型做意图抽取） */
function parseReadingText(text) {
  const flat = String(text || '').replace(/[，,。;；！？]/g, ' ');
  const result = {};
  const slash = flat.match(/(?:血压)?\s*(\d{2,3})\s*[\/／|到\-~]\s*(\d{2,3})/);
  const spoken = slash ? null : flat.match(/血压[^\d]{0,4}(\d{2,3})\s+(\d{2,3})/);
  const bp = slash || spoken;
  if (bp) { result.systolic = Number(bp[1]); result.diastolic = Number(bp[2]); }
  const pulse = flat.match(/(?:脉搏|心率|pulse)\D{0,4}(\d{2,3})/i);
  if (pulse) result.pulse = Number(pulse[1]);
  return result.systolic && result.diastolic ? result : null;
}
function showReadingEntry(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId) || currentMember();
  if (!member) return;
  readingMemberId = member.id;
  const method = READING_METHODS.some(item => item.id === readingMethod) ? readingMethod : 'manual';
  const chips = READING_METHODS.map(item => `<button class="metric-chip ${item.id === method ? 'selected' : ''}" data-reading-method="${item.id}">${item.icon} ${item.label}</button>`).join('');
  const captureForm = `<div class="reading-form">
      <strong>确认 ${esc(member.name)} 的读数（来源：${esc(readingSource)}）</strong>
      <div class="reading-inputs">
        <label><span>收缩压</span><input class="input-field" id="readingSystolic" type="number" min="60" max="260" placeholder="mmHg" /></label>
        <label><span>舒张压</span><input class="input-field" id="readingDiastolic" type="number" min="40" max="160" placeholder="mmHg" /></label>
        <label><span>脉搏</span><input class="input-field" id="readingPulse" type="number" min="30" max="220" placeholder="次/分" /></label>
      </div>
      <button class="primary-button" id="saveReading">核对无误，保存并评估</button>
      <p class="privacy-small">读数会记到 ${esc(member.name)} 名下并同步进数据看板；保存后由规则引擎自动评估：≥160/100 黄色预警、≥180/110 红色预警，并按级别分级告知家人。</p>
    </div>`;
  let capture = '';
  if (method === 'manual') {
    capture = `<div class="ai-parse-block">
      <strong>手动录入 · 一句话 + AI 识别</strong>
      <div class="ai-parse-row">
        <input class="input-field" id="manualText" placeholder="例：今天早上血压 152/94，脉搏 78" />
        <button class="secondary-button" id="aiParseReading">✳ AI 识别</button>
      </div>
      <div class="entry-result" id="aiParseResult" hidden></div>
      ${captureForm}
    </div>`;
  } else if (method === 'voice') {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">🎙</div>
        <strong>语音录入（演示）</strong>
        <p>老人对着手机或音箱说一句，语音转文字 + 意图抽取后自动填入读数，无需打字。</p>
        <div class="entry-result" id="voiceResult" hidden></div>
        <button class="primary-button" id="voiceMock">▶ 模拟一句语音："妈妈今天血压 152 94，脉搏 78"</button>
        <p class="privacy-small">演示为固定语句；正式版接入语音识别（微信语音 / 讯飞）后支持自然表达与多方言。</p>
      </div>${captureForm}`;
  } else if (method === 'photo') {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">📷</div>
        <strong>拍照识别（模拟 OCR）</strong>
        <p>拍下血压计 / 血糖仪的读数屏，识别数值后回填，家人在下方核对确认。</p>
        <div class="entry-photo">🩺 电子血压计读数屏（模拟）<small>欧姆龙 HEM-7124 · 今日 07:50</small></div>
        <div class="entry-result" id="photoResult" hidden></div>
        <button class="primary-button" id="photoMock">🔍 开始识别</button>
        <p class="privacy-small">识别结果需人工确认后入库，不做自动提交。正式版使用端侧 OCR 模型。</p>
      </div>${captureForm}`;
  } else {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">⌚</div>
        <strong>硬件设备同步（演示）</strong>
        <p>预留华为 / 小米等智能手表接入入口：血压、心率、睡眠自动同步；跌倒检测、长时间无响应自动触发紧急预警。</p>
        <div class="entry-result">已绑定设备（演示）：智能手表 · 电量 82% · 上次同步 ${nowLabel().split(' ')[1]}</div>
        <button class="primary-button" id="mockWatchSync">同步一次手表血压读数</button>
        <button class="secondary-button" id="mockFallEvent">模拟手表跌倒事件（红色预警）</button>
        <p class="privacy-small">真实接入走华为 Health Kit / 小米运动健康开放接口，属于正式版范围；同步读数同样进入规则引擎评估。</p>
      </div>`;
  }
  const activeHint = READING_METHODS.find(item => item.id === method)?.hint || '';
  openModal(`${modalHead(`日常记录 · ${esc(member.name)}`, '录入读数', `支持手动、语音、拍照与硬件同步四种方式，读数记到 ${esc(member.name)} 名下（各设备接口各归各人），录入后自动进入数据看板与预警评估。`)}
    <div class="metric-chips entry-method-chips">${chips}</div>
    <p class="privacy-small entry-hint">${esc(activeHint)}</p>
    ${capture}`);
  const fillForm = values => {
    document.getElementById('readingSystolic').value = values[0];
    document.getElementById('readingDiastolic').value = values[1];
    document.getElementById('readingPulse').value = values[2];
  };
  document.getElementById('aiParseReading')?.addEventListener('click', () => {
    const text = document.getElementById('manualText')?.value || '';
    if (!text.trim()) { toast('先输入一句读数描述，再点 AI 识别'); return; }
    const parsed = parseReadingText(text);
    const result = document.getElementById('aiParseResult');
    if (!parsed) {
      if (result) { result.hidden = false; result.textContent = `没能从「${text.trim()}」里识别出血压读数，请按「血压 152/94，脉搏 78」的格式描述，或直接在下方填写。`; }
      return;
    }
    fillForm([parsed.systolic, parsed.diastolic, parsed.pulse || '']);
    if (result) {
      result.hidden = false;
      result.textContent = `AI 识别结果：收缩压 ${parsed.systolic} / 舒张压 ${parsed.diastolic}${parsed.pulse ? ` · 脉搏 ${parsed.pulse} 次/分` : '（未提及脉搏）'}，已填入下方表单，请核对后保存。`;
    }
    toast('AI 识别完成，请在下方核对');
  });
  document.getElementById('voiceMock')?.addEventListener('click', () => {
    const result = document.getElementById('voiceResult');
    if (result) { result.hidden = false; result.textContent = '“女儿，我刚量了血压，152 94，脉搏 78。” → 识别为血压读数，已填入下方表单'; }
    readingSource = '语音录入';
    document.querySelector('.reading-form strong').textContent = `确认 ${esc(member.name)} 的读数（来源：语音录入）`;
    fillForm([152, 94, 78]);
    toast('语音识别完成，请在下方核对');
  });
  document.getElementById('photoMock')?.addEventListener('click', () => {
    const result = document.getElementById('photoResult');
    if (result) { result.hidden = false; result.textContent = '识别结果：收缩压 146 / 舒张压 92 · 脉搏 78（置信度 96%），已填入下方表单'; }
    readingSource = '拍照识别';
    document.querySelector('.reading-form strong').textContent = `确认 ${esc(member.name)} 的读数（来源：拍照识别）`;
    fillForm([146, 92, 78]);
    toast('识别完成，请在下方核对');
  });
  document.getElementById('mockWatchSync')?.addEventListener('click', () => {
    const pool = [ [128, 82, 72], [146, 92, 78], [168, 104, 86], [122, 80, 70] ];
    const [sys, dia, pulse] = pool[Math.floor(Math.random() * pool.length)];
    saveReading({ memberId: readingMemberId, systolic: sys, diastolic: dia, pulse, source: '模拟手表' });
  });
  document.getElementById('mockFallEvent')?.addEventListener('click', () => {
    createAlert('red', '疑似跌倒事件', `模拟手表上报一次疑似跌倒（${nowLabel()}），设备定位：家中客厅（演示数据）。请立即联系妈妈确认情况，必要时就医。`, '模拟手表 · 跌倒监测');
    closeModal(); toast('已生成红色预警，家人已收到电话外呼演示');
    showAlertCenter();
  });
  document.getElementById('saveReading')?.addEventListener('click', () => {
    const systolic = Number(document.getElementById('readingSystolic')?.value);
    const diastolic = Number(document.getElementById('readingDiastolic')?.value);
    const pulse = Number(document.getElementById('readingPulse')?.value) || 0;
    if (!systolic || !diastolic) { toast('请先填写收缩压和舒张压'); return; }
    saveReading({ memberId: readingMemberId, systolic, diastolic, pulse, source: readingSource });
  });
}
function saveReading(reading) {
  const memberId = reading.memberId || currentMember()?.id || 'm1';
  const member = state.familyMembers.find(item => item.id === memberId);
  const entry = { id: `bp-${state.nextReadingId++}`, memberId, date: dateOffset(0), time: nowLabel().split(' ')[1], ...reading, memberId };
  state.healthReadings.unshift(entry);
  /* 日常记录同步进数据看板：血压作为 收缩压/舒张压 指标入池，与体检单数据同源展示 */
  [['收缩压', entry.systolic], ['舒张压', entry.diastolic]].forEach(([metric, value]) => {
    state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId, metric, value, unit: 'mmHg', date: entry.date, source: entry.source });
  });
  const result = evaluateReading(entry);
  let message = `${member?.name || '家人'} 的读数已保存，未触发预警`;
  if (result) {
    createAlert(result.level, result.title, result.detail, `${entry.source} · 血压 ${entry.systolic}/${entry.diastolic}`);
    message = `${member?.name || '家人'} 的读数已触发${ALERT_META[result.level].label}预警并完成分级告知`;
  }
  saveState(); renderHomeAlerts(); renderHealth(); closeModal(); toast(message);
}
/* 日常记录弹窗：某个成员的完整日常读数列表 */
function showDailyLog(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  const readings = (state.healthReadings || []).filter(reading => reading.memberId === memberId);
  const body = readings.length ? `<div class="reading-list">${readings.map(r => {
    const result = evaluateReading(r);
    return `<div class="reading-row"><div class="reading-copy"><strong>${r.systolic}/${r.diastolic} <small>mmHg</small></strong><small>${formatDate(r.date)} ${esc(r.time || '')} · 脉搏 ${r.pulse || '—'} 次/分 · ${esc(r.source || '手动录入')}</small></div><span class="reading-tag ${result ? `reading-tag-${result.level}` : 'reading-tag-ok'}">${result ? ALERT_META[result.level].label : '正常'}</span></div>`;
  }).join('')}</div>` : '<p class="empty-hint">还没有日常读数，点下方按钮录入第一条。</p>';
  openModal(`${modalHead(`日常记录 · ${esc(member.name)}`, '血压与设备数据', '手动、语音、拍照、硬件四种通道的读数都按成员归属；这些数据和体检单一起构成数据看板。')}
    ${body}
    <button class="primary-button" data-member-reading="${member.id}">＋ 录入读数（手动 / 语音 / 拍照 / 硬件）</button>
    <p class="privacy-small">正式版中血压计、血糖仪、手表各自通过厂商接口接入，数据自动归到对应家庭成员名下。</p>`);
}

function navigate(tab) {
  if (state.currentRole === 'escort' && !tab.startsWith('escort')) tab = 'escort';
  if (state.currentRole !== 'escort' && tab.startsWith('escort')) tab = 'home';
  currentTab = tab;
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `view-${tab}`));
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toast(message) {
  const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}
function openModal(content) {
  document.getElementById('modalContent').innerHTML = content;
  document.getElementById('modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalBackdrop').hidden = true;
  document.body.style.overflow = '';
  stopListening();
  if (preVisitRecorder?.state === 'recording') preVisitRecorder.stop();
  if (preVisitAttachmentUrl) { URL.revokeObjectURL(preVisitAttachmentUrl); preVisitAttachmentUrl = null; }
}
function modalHead(eyebrow, title, text) {
  return `<p class="eyebrow modal-eyebrow">${eyebrow}</p><h2 id="modalTitle">${title}</h2><p class="modal-lead">${text}</p>`;
}
function showUpload() {
  selectedFile = null;
  openModal(`${modalHead('把重要信息收进家庭档案', '添加一份就医资料', '拍下报告、选择已有图片，或用语音补充说明。文字提取结果会先由家人核对。')}
    <div class="upload-choice">
      <button class="upload-option" data-upload-source="camera"><span>◎</span><strong>拍照上传</strong></button>
      <button class="upload-option" data-upload-source="library"><span>▧</span><strong>从相册选择</strong></button>
    </div>
    <button class="secondary-button sample-report-button" id="loadSampleReport">先用虚构报告体验识别</button>
    <button class="secondary-button sample-report-button" id="loadSamplePrescription">用虚构处方生成服药提醒</button>
    <div class="voice-box"><label for="voiceText">语音或文字补充</label><textarea id="voiceText" placeholder="例如：妈妈对青霉素过敏，这次复诊要带上最近的血压记录。">${esc(state.voiceNote)}</textarea><div class="voice-controls"><small id="voiceStatus">可使用设备语音输入，或直接打字。</small><button class="voice-button" id="startVoice">● 开始说话</button></div></div>
    <button class="primary-button" id="continueUpload">下一步：查看提取内容</button><p class="privacy-small">演示数据和所选文件仅保存在当前浏览器本机，不会上传到云端。请勿使用真实患者资料。</p>`);
}
function openFilePicker(source) {
  const input = document.getElementById(source === 'camera' ? 'fileInput' : 'libraryInput');
  input.value = ''; input.click();
}
async function loadSampleReport() {
  try {
    const response = await fetch('./samples/虚构血常规报告.png');
    if (!response.ok) throw new Error('演示样本暂时无法读取');
    const blob = await response.blob();
    showExtraction(new File([blob], '虚构血常规报告.png', { type: 'image/png' }));
  } catch (error) { toast(error.message || '演示样本暂时无法读取'); }
}
async function loadSamplePrescription() {
  try {
    const response = await fetch('./samples/虚构服药医嘱.png');
    if (!response.ok) throw new Error('处方演示样本暂时无法读取');
    const blob = await response.blob();
    showExtraction(new File([blob], '虚构服药医嘱.png', { type: 'image/png' }));
  } catch (error) { toast(error.message || '处方演示样本暂时无法读取'); }
}
function showMedicationManager() {
  const medications = state.medications || [];
  const list = medications.length ? `<div class="med-manager-list">${medications.map(med => `<article class="med-manager-card"><div><strong>${esc(med.name)}</strong><small>${esc(med.dose || '剂量请按医嘱核对')} · ${esc(med.frequencyLabel || `每日${med.times.length}次`)}</small></div><span>${(med.times || []).map(esc).join(' / ')}</span></article>`).join('')}</div>` : '<div class="med-empty med-empty-large">尚未建立用药计划。拍下处方后，康伴会识别药名、用法和医嘱中明确写出的时间。</div>';
  const permissionText = '提醒只在康伴保持打开时运行；关闭应用后的定时推送尚未接入。';
  openModal(`${modalHead('按确认过的处方医嘱', '服药提醒', '康伴只整理医嘱中明确写出的内容。没有写明的提醒时间由家人确认填写，不代替医生或药师指导。')}${list}
    <button class="primary-button" id="addPrescription">拍照添加处方</button>
    <button class="secondary-button" id="enableMedicationNotifications">开启浏览器通知</button>
    <p class="privacy-small">${permissionText} 提醒和处方保存在当前设备。</p>`);
}
function showMedicationReview(items, source) {
  medicationSource = source;
  const cards = items.map((item, index) => {
    const options = [1,2,3,4].map(count => `<option value="${count}" ${item.count === count ? 'selected' : ''}>每日 ${count} 次</option>`).join('');
    const times = Array.from({length:4}, (_,slot) => {
      const visible = item.count && slot < item.count;
      const value = item.times?.[slot] || '';
      return `<label class="med-time-slot" data-slot="${slot}" style="display:${visible ? 'flex' : 'none'}"><span>第 ${slot+1} 次提醒</span><input type="time" data-med-time required ${value ? `value="${esc(value)}"` : ''}></label>`;
    }).join('');
    return `<article class="med-review-card" data-med-card="${index}">
      <label class="med-edit-row"><span>药品名称</span><input class="med-name" value="${esc(item.name)}" required></label>
      <label class="med-edit-row"><span>医嘱剂量</span><input class="med-dose" value="${esc(item.dose)}" placeholder="照处方填写"></label>
      <label class="med-edit-row"><span>频次</span><select class="med-frequency" data-med-count required><option value="" ${item.count ? '' : 'selected'}>请选择每日次数</option>${options}</select></label>
      <p class="med-source-text">识别到的医嘱：${esc(item.instruction || '请核对原始处方')}</p>
      <div class="med-time-slots">${times}</div>
    </article>`;
  }).join('');
  openModal(`${modalHead('处方识别 · 请逐项核对', '确认服药安排', '识别结果可能有误。只有核对药名、医嘱剂量、每日次数和每次时间后，才会保存提醒。')}
    <div class="med-review-list">${cards}</div>
    <div class="health-highlight">医嘱未写明具体时间时，请依据医嘱/药师说明选择，不要仅凭康伴自动推断。处方有疑问请咨询医生或药师。</div>
    <button class="primary-button" id="saveMedicationPlan">确认并创建每日提醒</button>
    <button class="secondary-button" id="backToPrescriptionOcr">返回核对识别文字</button>`);
}
function parseOcrFields(text, fallbackDate) {
  const clean = String(text || '').replace(/\r/g, '').trim();
  const title = /心电图|心电/.test(clean) ? '心电图检查结果'
    : /血常规|血细胞/.test(clean) ? '血常规检查报告'
      : /尿常规/.test(clean) ? '尿常规检查报告'
        : /CT|核磁|磁共振|影像/.test(clean) ? '影像检查报告'
          : /处方|药品|用法用量/.test(clean) ? '用药记录' : '就医资料';
  const hospital = clean.match(/[\u4e00-\u9fa5A-Za-z0-9·]{2,30}(?:医院|卫生院|医疗中心|医学中心)/)?.[0] || '';
  const dateMatch = clean.match(/(20\d{2})\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})\s*日?/);
  const date = dateMatch ? `${dateMatch[1]}-${String(Number(dateMatch[2])).padStart(2,'0')}-${String(Number(dateMatch[3])).padStart(2,'0')}` : fallbackDate;
  return { title, hospital, date, text: clean, hasDate: Boolean(dateMatch) };
}
function parseMedicationOrders(text) {
  const source = String(text || '').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
  const pattern = /([\u4e00-\u9fa5A-Za-z0-9·（）()]{2,30}?(?:片|胶囊|颗粒|口服液|滴眼液|滴剂|喷雾|贴剂|软膏))/g;
  const matches = [...source.matchAll(pattern)];
  const found = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    let name = match[1].replace(/^(?:康伴|虚构演示资料|门诊处方用药医嘱|药品名称|药品|名称|用药医嘱|用药|药名)+/, '').trim();
    if (name.length < 2 || found.some(item => item.name === name)) continue;
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : Math.min(source.length, start + 100);
    const instruction = source.slice(start, end).trim().replace(/^[，,；;：:\s]+/, '');
    const frequencyText = source.slice(Math.max(0, match.index - 12), Math.min(source.length, end));
    const timeMatches = [...instruction.matchAll(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g)].map(item => item[0]);
    const dose = (instruction.match(/(?:剂量\s*[:：]?\s*)?(\d+(?:\.\d+)?\s*(?:mg|毫克|克|g))/i) || [])[1] || '';
    let count = null;
    if (/早晚各一次/.test(frequencyText)) count = 2;
    else {
      const frequency = frequencyText.match(/(?:每日|每天|一日|一天|每晚|每早)\s*(一次|两次|三次|四次|[1-4]\s*次)/);
      if (frequency) count = ({ '一次':1, '两次':2, '三次':3, '四次':4 })[frequency[1].replace(/\s/g,'')] || Number(frequency[1].match(/[1-4]/)?.[0]);
    }
    if (timeMatches.length) count = count || timeMatches.length;
    found.push({ name, dose, instruction: instruction.slice(0, 100), count, times: timeMatches.slice(0, 4) });
  }
  return found;
}
function getOcrWorker() {
  if (!ocrWorkerPromise) {
    if (!window.Tesseract?.createWorker) throw new Error('中文识别组件尚未加载，请重新打开页面。');
    ocrWorkerPromise = window.Tesseract.createWorker('chi_sim+eng', 1, {
      workerPath: './vendor/worker.min.js',
      corePath: './vendor/tesseract-core-simd-lstm.wasm.js',
      langPath: './vendor/lang',
      gzip: true,
      logger: message => {
        const status = document.getElementById('ocrStatus');
        if (status && message.status === 'recognizing text') status.textContent = `正在识别图片文字 ${Math.round((message.progress || 0) * 100)}%`;
      }
    }).catch(error => { ocrWorkerPromise = null; throw error; });
  }
  return ocrWorkerPromise;
}
async function runLocalOcr(file, fallbackDate) {
  const status = document.getElementById('ocrStatus');
  const textArea = document.getElementById('extractText');
  if (!file) { if (status) status.textContent = '未选择图片，可直接手动填写资料。'; return; }
  if (!file.type.startsWith('image/')) { if (status) status.textContent = '已保留文件附件；目前 OCR 支持图片，请手动填写资料。'; return; }
  if (status) status.textContent = '正在准备本机中文识别…首次载入会稍慢。';
  try {
    const worker = await getOcrWorker();
    const pageMode = document.getElementById('ocrLayoutMode')?.value || '3';
    await worker.setParameters({ tessedit_pageseg_mode: pageMode, preserve_interword_spaces: '1' });
    const result = await worker.recognize(file);
    const confidence = Number(result.data.confidence);
    const lowConfidence = Number.isFinite(confidence) && confidence < 55;
    const parsed = parseOcrFields(result.data.text, fallbackDate);
    const typeInput = document.getElementById('extractType');
    const hospitalInput = document.getElementById('extractHospital');
    const dateInput = document.getElementById('extractDate');
    if (!lowConfidence && typeInput && parsed.text) typeInput.value = parsed.title;
    if (!lowConfidence && hospitalInput && parsed.hospital) hospitalInput.value = parsed.hospital;
    if (!lowConfidence && dateInput && parsed.hasDate) dateInput.value = parsed.date;
    if (textArea) textArea.value = parsed.text;
    const medicationItems = parseMedicationOrders(parsed.text);
    const planButton = document.getElementById('buildMedicationPlan');
    if (planButton && (lowConfidence || !medicationItems.length)) planButton.hidden = true;
    if (planButton && medicationItems.length && !lowConfidence) {
      planButton.hidden = false;
      planButton.textContent = `从医嘱生成服药提醒（识别到 ${medicationItems.length} 种药）`;
    }
    if (status) status.textContent = lowConfidence
      ? `识别可信度较低（${Math.round(confidence)}%），请勿直接使用识别字段或生成用药提醒；手写病历建议人工录入。`
      : parsed.text ? `本机识别完成，共 ${parsed.text.length} 个字符。请对照原图核对。${Number.isFinite(confidence) ? ` 识别参考值 ${Math.round(confidence)}%。` : ''}` : '没有识别到文字，可手动填写资料。';
  } catch (error) {
    console.error('本机 OCR 失败', error);
    if (status) status.textContent = '本机识别未完成，可手动填写资料；图片不会上传。';
  }
}
function showExtraction(file) {
  selectedFile = file || null;
  const name = file?.name || '未选择文件 · 手动录入';
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const note = document.getElementById('voiceText')?.value || state.voiceNote || '';
  openModal(`${modalHead('照片文字识别 · 本机运行', '检查并确认资料', '识别内容仅作为录入辅助，请对照原始资料核对。图片和识别文字保存在当前设备。')}
    <div class="health-highlight">当前 OCR 主要适用于清晰的印刷体。医生手写内容无法保证准确，尤其是药名、剂量和诊断；遇到潦草手写，请人工录入并向医生或药师核对。</div>
    <div class="file-chip"><b>▤</b><span>${esc(name)}</span><span id="ocrStatus" style="margin-left:auto;color:#789078">${file ? '等待本机识别…' : '手动录入'}</span></div>
    <div class="extraction-list"><label class="extraction-row"><span>版面类型</span><select id="ocrLayoutMode"><option value="3">普通文档</option><option value="11">表格 / 课程表</option></select></label></div>
    ${file ? '<button class="secondary-button" id="rerunOcr">按所选版面重新识别</button>' : ''}
    <div class="extraction-list">
      <label class="extraction-row"><span>资料类型</span><input id="extractType" value="就医资料" /></label>
      <label class="extraction-row"><span>医院 / 科室</span><input id="extractHospital" value="" placeholder="请填写医院或科室" /></label>
      <label class="extraction-row"><span>检查日期</span><input id="extractDate" type="date" value="${iso}" /></label>
      <label class="extraction-row"><span>用户补充</span><input id="extractNote" value="${esc(note)}" placeholder="可补充就诊背景" /></label>
    </div>
    <label class="ocr-text-label" for="extractText">图片识别出的文字（可修改）</label><textarea class="ocr-text-area" id="extractText" placeholder="识别文字会显示在这里；也可以手动录入关键信息"></textarea>
    <button class="secondary-button medication-plan-button" id="buildMedicationPlan" hidden>从医嘱生成服药提醒</button>
    <p class="privacy-small">提取内容仅作为资料录入辅助，不构成诊断结论。请以原始报告为准。</p>
    <button class="primary-button" id="saveRecord">确认并加入妈妈的档案</button>
    <button class="secondary-button" id="backToUpload">返回修改</button>`);
  const runButton = document.getElementById('rerunOcr');
  runButton?.addEventListener('click', () => runLocalOcr(file, iso));
  runLocalOcr(file, iso);
}
function showHealthCard() {
  openModal(`${modalHead('妈妈 · 68岁 · 最近核对 10月22日', '就医信息卡', '由家人协助整理，供就诊时主动展示。医生可按需查看原始报告。')}
    <div class="health-list">
      <div class="health-row"><span>过敏史</span><strong style="color:#a15d4c">青霉素</strong></div>
      <div class="health-row"><span>重要病史</span><strong>高血压 · 2018年发现</strong></div>
      <div class="health-row"><span>长期用药</span><strong>氨氯地平片 · 每日一次</strong></div>
      <div class="health-row"><span>近期用药</span><strong>阿托伐他汀钙片 · 每晚一次</strong></div>
      <div class="health-row"><span>紧急联系人</span><strong>小林 · 女儿</strong></div>
      <div class="health-row"><span>近期就诊</span><strong>10月22日 · 心内科</strong></div>
    </div>
    <div class="health-highlight">过敏史已由家属核对。就诊时请以医生问诊和原始病历为准；本信息卡不替代医疗判断。</div>
    <button class="primary-button" id="openShareFromCard">生成就诊分享码</button>`);
}
function showAppointment() {
  const checks = state.appointmentChecks || {};
  const hasDescription = (state.preVisitDescriptions || []).length > 0;
  const items = [
    ['idCard', '医保卡与身份证', '就诊时出示'],
    ['reports', '近期检查报告', '血常规、心电图等资料'],
    ['medicines', '当前用药清单', '可带药盒或核对档案'],
    ['questions', '想问医生的问题', '提前记下最关心的几件事'],
    ['selfDescription', '诊前自我描述', '记录近期症状、变化、饮食和生活情况']
  ];
  const count = items.filter(([key]) => key === 'selfDescription' ? (checks[key] || hasDescription) : checks[key]).length;
  openModal(`${modalHead(appointmentLabel(), '就诊准备清单', '和妈妈一起确认要带的资料。勾选状态会保存在这台设备上。')}
    <div class="checklist-progress"><strong id="checklistCount">已准备 ${count} / ${items.length} 项</strong><span>${count === items.length ? '准备好了' : '逐项确认'}</span></div>
    <div class="appointment-checklist">${items.map(([key, title, hint]) => `<label class="checklist-row"><input type="checkbox" data-checklist="${key}" ${(key === 'selfDescription' ? (checks[key] || hasDescription) : checks[key]) ? 'checked' : ''} ${key === 'selfDescription' && hasDescription ? 'disabled' : ''}><span class="checkmark"></span><span class="checklist-copy"><strong>${title}</strong><small>${hint}</small></span></label>`).join('')}</div>
    <button class="secondary-button" id="openPreVisitDescription">${hasDescription ? '查看 / 补充诊前描述' : '添加诊前自我描述'}</button>
    <div class="health-highlight">就诊信息卡可由妈妈主动向医生展示。清单仅帮助准备资料，不替代医生问诊。</div>
    <button class="primary-button" id="appointmentCard">打开就医信息卡</button>`);
}
function showPreVisitDescription() {
  preVisitFiles = [];
  const entries = state.preVisitDescriptions || [];
  const history = entries.length ? `<div class="previsit-history">${entries.map(entry => `<article><small>${esc(entry.createdAt)}</small><p>${esc(entry.text || '未添加文字说明')}</p><div class="previsit-files">${(entry.attachments || []).map(file => `<button class="text-button" data-previsit-attachment="${esc(file.id)}" data-previsit-type="${esc(file.type)}">查看附件：${esc(file.name)}</button>`).join('') || '<small>无附件</small>'}</div></article>`).join('')}</div>` : '<p class="privacy-small">还没有诊前描述。可记录这次不舒服从什么时候开始、出现频率、饮食睡眠和已采取的处理。</p>';
  openModal(`${modalHead('就诊前记录', '诊前自我描述', '把病人的主观感受和近期情况先记下来，方便就诊时向医生说明。可拍照、录音或语音转文字。')}
    ${history}
    <label class="ocr-text-label" for="preVisitText">病情、饮食及其他情况</label><textarea class="ocr-text-area" id="preVisitText" placeholder="例如：从周一开始饭后腹胀，近两天食欲下降；饮食、睡眠、排便或活动有哪些变化？"></textarea>
    <div class="voice-controls"><button class="secondary-button" id="preVisitDictate">语音转文字</button><button class="secondary-button" id="preVisitRecord">录制语音</button><button class="secondary-button" id="preVisitPhoto">添加照片</button><button class="secondary-button" id="preVisitAudioFile">上传录音</button></div>
    <small id="preVisitStatus" class="privacy-small">可添加多张照片或录音；内容仅保存在本机。</small>
    <button class="primary-button" id="savePreVisitDescription">保存诊前描述</button>
    <button class="text-button" id="backToAppointment">返回就诊准备清单</button>`);
}
function startPreVisitRecording() {
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) { toast('当前浏览器不支持录音，请选择“上传录音”或使用语音转文字'); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    preVisitRecordingStream = stream; preVisitAudioChunks = [];
    preVisitRecorder = new MediaRecorder(stream);
    preVisitRecorder.ondataavailable = event => { if (event.data.size) preVisitAudioChunks.push(event.data); };
    preVisitRecorder.onstop = () => {
      const blob = new Blob(preVisitAudioChunks, { type: preVisitRecorder.mimeType || 'audio/webm' });
      const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
      preVisitFiles.push(new File([blob], `诊前录音-${Date.now()}.${extension}`, { type: blob.type }));
      preVisitRecordingStream?.getTracks().forEach(track => track.stop()); preVisitRecordingStream = null;
      const status = document.getElementById('preVisitStatus'); if (status) status.textContent = `已添加 ${preVisitFiles.length} 个附件，录音已保存到待提交列表。`;
      const button = document.getElementById('preVisitRecord'); if (button) button.textContent = '录制语音';
    };
    preVisitRecorder.start();
    const button = document.getElementById('preVisitRecord'); if (button) button.textContent = '停止录音';
    const status = document.getElementById('preVisitStatus'); if (status) status.textContent = '正在录音；说完后点击“停止录音”。';
  }).catch(() => toast('无法使用麦克风，请检查浏览器权限或改为上传录音'));
}
async function savePreVisitDescription() {
  const text = document.getElementById('preVisitText')?.value.trim() || '';
  if (!text && !preVisitFiles.length) { toast('请先写下情况，或添加照片 / 录音'); return; }
  const saveButton = document.getElementById('savePreVisitDescription'); if (saveButton) saveButton.disabled = true;
  try {
    const entryId = `previsit-${Date.now()}`;
    const attachments = [];
    for (let index = 0; index < preVisitFiles.length; index++) {
      const file = preVisitFiles[index]; const attachmentId = `${entryId}-${index}`;
      await putAttachment(attachmentId, file);
      attachments.push({ id: attachmentId, name: file.name, type: file.type });
    }
    state.preVisitDescriptions = [{ id: entryId, text, createdAt: new Date().toLocaleString('zh-CN'), attachments }, ...(state.preVisitDescriptions || [])];
    state.appointmentChecks = { ...(state.appointmentChecks || {}), selfDescription: true };
    saveState(); preVisitFiles = []; closeModal(); showAppointment(); toast('诊前描述和附件已保存在本机');
  } catch (error) { if (saveButton) saveButton.disabled = false; toast('保存失败，请检查本机存储空间后重试'); }
}
async function showPreVisitAttachment(id, type) {
  const item = await getAttachment(id);
  if (!item?.blob) { toast('没有找到本机附件'); return; }
  const url = URL.createObjectURL(item.blob); preVisitAttachmentUrl = url;
  const media = type.startsWith('image/') ? `<img class="previsit-preview" src="${url}" alt="诊前描述附件">` : type.startsWith('audio/') ? `<audio class="previsit-audio" controls src="${url}"></audio>` : '<p class="privacy-small">当前设备无法预览此附件格式。</p>';
  openModal(`${modalHead('诊前附件', esc(item.name), '附件保存在当前设备。')}${media}<button class="primary-button" id="closePreVisitAttachment">返回诊前描述</button>`);
  document.getElementById('closePreVisitAttachment')?.addEventListener('click', () => { closeModal(); showPreVisitDescription(); });
}
async function showRecord(recordId) {
  const record = state.records.find(item => item.id === recordId); if (!record) return;
  let attachment = null;
  try { attachment = await getAttachment(recordId); } catch { /* local attachment storage may be unavailable */ }
  const preview = attachment?.type?.startsWith('image/') ? `<img class="report-preview" src="${URL.createObjectURL(attachment.blob)}" alt="${esc(attachment.name)}" />` : '';
  const fileLine = attachment ? `<div class="file-chip"><b>▤</b><span>${esc(attachment.name)}</span><span style="margin-left:auto;color:#789078">本机附件</span></div>` : '<p class="privacy-small">此演示条目没有原始文件附件。</p>';
  const recognized = record.ocrText ? `<section class="saved-ocr"><strong>本机识别文字</strong><p>${esc(record.ocrText)}</p></section>` : '';
  openModal(`${modalHead(esc(record.type), esc(record.title), `${esc(record.hospital)} · ${formatDate(record.date)}`)}${fileLine}${preview}${recognized}<div class="health-highlight">资料为家庭自行整理的信息。文字识别仅作录入辅助，不构成诊断意见。</div><button class="primary-button" id="recordDone">返回家庭档案</button>`);
}
function showShare() {
  const recent = state.shares.slice(-3).reverse();
  openModal(`${modalHead('由患者或家属现场发起', '分享就医资料', '选择分享内容并生成演示二维码。访问记录会显示在家庭档案中，可随时撤销。')}
    <div class="share-card"><span class="pill pill-light"><span class="status-dot"></span> 妈妈的就医信息卡</span><h3>市第一人民医院 · 复诊</h3><p>摘要信息 · 过敏史 · 当前用药</p><div class="share-code" aria-label="演示二维码"></div><div class="code-caption">仅供现场演示 · 10分钟后失效</div></div>
    <div class="share-toggle"><span>允许查看摘要信息和关键病史</span><span class="switch"></span></div>
    <div class="share-log"><h3>最近访问记录</h3>${recent.map(entry => `<div class="log-row"><span>${esc(entry.who)}</span><small>${esc(entry.when)}</small></div>`).join('')}</div>
    <button class="primary-button" id="revokeShare">撤销此演示分享</button>
    <p class="privacy-small">演示二维码为界面模拟，未连接外部扫码服务。</p>`);
}
function showCompanionForm(service, sourceOrder = null) {
  if (!state.companionProfile.available) { showInfo('暂不可预约', `${state.companionProfile.name}目前暂停接单。你可以稍后再查看。`); return; }
  openModal(`${modalHead('陪诊需求 · 演示流程', `预约${esc(service)}`, `向${esc(state.companionProfile.name)}提交申请；陪诊员接受后，家庭端会显示接单状态。`)}
    <form class="order-form" id="companionForm" data-rebook-id="${esc(sourceOrder?.id || '')}">
      <input type="hidden" name="service" value="${esc(service)}" />
      <label><span class="field-label-block">就诊医院</span><input class="input-field" name="hospital" value="${esc(sourceOrder?.hospital || '市第一人民医院')}" required /></label>
      <label><span class="field-label-block">期望日期</span><input class="input-field" name="date" type="date" value="${dateOffset(4)}" required /></label>
      <label><span class="field-label-block">需要的帮助</span><input class="input-field" name="need" value="${esc(sourceOrder?.need || '心内科复诊，协助院内路线')}" /></label>
      <label class="consent-row"><input type="checkbox" name="shareConsent" required /><span>我同意向陪诊员分享本次医院、时间和服务需求，不分享完整病历。</span></label>
      <button class="primary-button" type="submit">提交预约申请</button>
    </form><p class="privacy-small">这是本机演示预约，不会真实联系服务人员或收费。陪诊员不提供诊断或治疗建议。</p>`);
}
function showOrderSuccess(order) {
  openModal(`<div class="order-success"><div class="success-mark">✓</div><p class="eyebrow">预约申请已提交</p><h2 id="modalTitle">等待陪诊员确认</h2><p>${esc(order.service)} · ${esc(order.hospital)}<br>${esc(order.date)}<br>${esc(order.providerName)}<br><br>切换到陪诊员端即可体验接受或暂不接单。</p><button class="primary-button" id="orderDone">完成</button></div>`);
}
function showRoleSwitcher() {
  openModal(`${modalHead('模拟账号 · 演示登录', '选择进入哪个视角', '这是同一台设备上的模拟账号演示，不是真实账号登录。四位家庭成员共用一个家庭面板，健康档案数据互通。')}
    <div class="role-choice-list">
      ${state.familyMembers.map(member => {
        const isCurrent = state.currentRole === 'family' && state.currentMemberId === member.id;
        return `<button class="role-choice" data-member="${member.id}"><span class="role-choice-avatar ${member.avatarClass}">${esc(member.name.slice(0, 1))}</span><span><strong>家庭端 · ${esc(member.name)}</strong><small>${esc(member.role)} · ${member.age}岁 · ${esc(member.conditions)}</small></span><b>${isCurrent ? '当前' : '进入 →'}</b></button>`;
      }).join('')}
      <button class="role-choice" data-role="escort"><span class="role-choice-avatar escort-choice-avatar">${esc(state.companionProfile.name.slice(0,1))}</span><span><strong>陪诊员端 · ${esc(state.companionProfile.name)}</strong><small>编辑介绍、回应预约、完成陪诊、评价家庭</small></span><b>${state.currentRole === 'escort' ? '当前' : '进入 →'}</b></button>
    </div><p class="privacy-small">家庭端内切换成员只改变操作视角（操作留痕显示当前成员）；数据仍全体家人共享。预约数据保存在这台设备的浏览器中。</p>`);
}
function showReviewForm(orderId, role) {
  const order = state.companionOrders.find(item => item.id === orderId);
  if (!order || order.status !== 'completed') { toast('完成陪诊后才能互评'); return; }
  const target = role === 'family' ? '陪诊员' : '家庭';
  openModal(`${modalHead('陪诊后互评 · 演示', `评价${target}`, '评价只关联这次已完成的演示订单，帮助双方了解服务体验。')}
    <form class="review-form" id="reviewForm" data-order-id="${esc(orderId)}" data-review-role="${role}">
      <label><span class="field-label-block">整体体验</span><select class="input-field" name="score"><option value="5">5 分 · 很满意</option><option value="4">4 分 · 满意</option><option value="3">3 分 · 一般</option><option value="2">2 分 · 不太满意</option><option value="1">1 分 · 不满意</option></select></label>
      <label><span class="field-label-block">想补充的话</span><textarea name="comment" maxlength="160" placeholder="可以写服务中让你印象深刻的地方"></textarea></label>
      <button class="primary-button" type="submit">提交评价</button>
    </form><p class="privacy-small">演示版评价保存在本机，不会公开发布。</p>`);
}
function showInfo(title, message) {
  openModal(`${modalHead('家庭就医助手', title, message)}<button class="primary-button" id="infoDone">知道了</button>`);
}
function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { toast('当前浏览器不支持语音识别，可直接输入补充信息'); return; }
  const status = document.getElementById('voiceStatus');
  const textarea = document.getElementById('voiceText');
  const recognition = new SpeechRecognition(); recognition.lang = 'zh-CN'; recognition.interimResults = true; recognition.continuous = false;
  window.activeRecognition = recognition;
  recognition.onstart = () => { if (status) status.textContent = '正在聆听，请慢慢说…'; };
  recognition.onresult = event => {
    const text = Array.from(event.results).map(r => r[0].transcript).join('');
    if (textarea) textarea.value = `${textarea.value ? `${textarea.value} ` : ''}${text}`;
  };
  recognition.onerror = () => { if (status) status.textContent = '未能识别，请再试一次或直接打字。'; };
  recognition.onend = () => { if (status) status.textContent = '语音内容已填入，可继续修改。'; window.activeRecognition = null; };
  try { recognition.start(); } catch { toast('语音输入正在使用中'); }
}
function stopListening() { try { window.activeRecognition?.stop(); } catch {} window.activeRecognition = null; }

document.addEventListener('click', async event => {
  const panelToggle = event.target.closest('[data-panel-toggle]');
  if (panelToggle) {
    const key = panelToggle.dataset.panelToggle;
    const host = panelToggle.closest('.collapsible');
    if (host) {
      const nowCollapsed = host.classList.toggle('collapsed');
      if (nowCollapsed) collapsedPanels.add(key); else collapsedPanels.delete(key);
    }
    return;
  }
  const readingMethodChip = event.target.closest('[data-reading-method]');
  if (readingMethodChip) {
    readingMethod = readingMethodChip.dataset.readingMethod;
    if (readingMethod !== 'device') readingSource = { manual: '手动录入', voice: '语音录入', photo: '拍照识别' }[readingMethod] || '手动录入';
    showReadingEntry();
    return;
  }
  const tab = event.target.closest('[data-tab]');
  if (tab) { navigate(tab.dataset.tab); return; }
  const nav = event.target.closest('[data-nav]');
  if (nav) { navigate(nav.dataset.nav); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'upload') showUpload();
  if (action === 'medications') showMedicationManager();
  if (action === 'add-medication') showUpload();
  if (action === 'health-card') showHealthCard();
  if (action === 'share') showShare();
  if (action === 'alerts') showAlertCenter();
  if (action === 'add-reading') showReadingEntry();
  if (action === 'insurance-social') showInsuranceHub('social');
  if (action === 'insurance-commercial') showInsuranceHub('commercial');
  if (action === 'ai-assistant') showInfo('AI 管理助手（规划中）', '规划能力：自动总结父母健康周报、回答健康咨询、生成就医准备清单，并支持「小康，今天该吃什么药」式语音交互。当前演示版可在「我的 · 健康趋势」查看固定统计。');
  if (action === 'devices') showInfo('设备管理（规划中）', '计划预留华为运动健康、小米运动健康等智能手表接入入口，同步睡眠、运动与跌倒监测数据。当前演示版可在预警中心「模拟手表同步」体验。');
  if (action === 'companion') navigate('companion');
  if (action === 'book-profile') showCompanionForm('全程陪诊');
  if (action === 'toggle-availability') {
    state.companionProfile.available = !state.companionProfile.available;
    saveState(); renderRole(); renderRecords();
    toast(state.companionProfile.available ? '已恢复接受预约' : '已暂停接受新预约');
  }
  if (action === 'appointment') showAppointment();
  if (action === 'privacy') showInfo('隐私与资料管理', '本原型将演示资料保存在当前设备浏览器中。分享流程仅作交互展示，不会发送到网络。\n\n真实产品需提供资料导出、更正、删除和授权撤回功能。');
  if (action === 'help') showInfo('服务说明', '康伴帮助家庭整理就医资料和协同就诊准备。资料提取仅辅助整理，不替代医生判断。陪诊服务仅提供就诊流程协助。');
  if (event.target.closest('[data-upload-source="camera"]')) openFilePicker('camera');
  if (event.target.closest('[data-upload-source="library"]')) openFilePicker('library');
  if (event.target.closest('#loadSampleReport')) loadSampleReport();
  if (event.target.closest('#startVoice')) startListening();
  if (event.target.closest('#appointmentCard')) showHealthCard();
  if (event.target.closest('#openPreVisitDescription')) showPreVisitDescription();
  if (event.target.closest('#backToAppointment')) showAppointment();
  if (event.target.closest('#preVisitPhoto')) document.getElementById('preVisitPhotoInput').click();
  if (event.target.closest('#preVisitAudioFile')) document.getElementById('preVisitAudioInput').click();
  if (event.target.closest('#preVisitRecord')) {
    if (preVisitRecorder?.state === 'recording') preVisitRecorder.stop(); else startPreVisitRecording();
  }
  if (event.target.closest('#preVisitDictate')) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) toast('当前浏览器不支持语音转文字，可录音或直接输入');
    else {
      const recognition = new SpeechRecognition(); recognition.lang = 'zh-CN'; recognition.interimResults = false;
      recognition.onresult = result => { const area = document.getElementById('preVisitText'); if (area) area.value = `${area.value}${area.value ? ' ' : ''}${result.results[0][0].transcript}`; };
      recognition.onerror = () => toast('语音转文字失败，可改用录音或直接输入');
      try { recognition.start(); const status = document.getElementById('preVisitStatus'); if (status) status.textContent = '请开始描述，语音会转成可编辑文字。'; } catch { toast('语音输入正在使用中'); }
    }
  }
  if (event.target.closest('#savePreVisitDescription')) await savePreVisitDescription();
  const preVisitAttachment = event.target.closest('[data-previsit-attachment]');
  if (preVisitAttachment) await showPreVisitAttachment(preVisitAttachment.dataset.previsitAttachment, preVisitAttachment.dataset.previsitType || '');
  if (event.target.closest('#addPrescription')) showUpload();
  if (event.target.closest('#loadSamplePrescription')) loadSamplePrescription();
  if (event.target.closest('#buildMedicationPlan')) {
    const text = document.getElementById('extractText')?.value || '';
    const items = parseMedicationOrders(text);
    if (!items.length) { toast('没有识别到明确药名，请核对处方文字'); return; }
    medicationSource = {
      file: selectedFile,
      hospital: document.getElementById('extractHospital')?.value.trim() || '家属整理',
      date: document.getElementById('extractDate')?.value || dateOffset(0),
      text
    };
    showMedicationReview(items, medicationSource);
  }
  if (event.target.closest('#backToPrescriptionOcr')) showExtraction(medicationSource?.file || selectedFile);
  if (event.target.closest('#saveMedicationPlan')) {
    const cards = [...document.querySelectorAll('[data-med-card]')];
    const planned = [];
    for (const card of cards) {
      const name = card.querySelector('.med-name')?.value.trim();
      const dose = card.querySelector('.med-dose')?.value.trim() || '';
      const count = Number(card.querySelector('[data-med-count]')?.value);
      const times = [...card.querySelectorAll('[data-med-time]')].slice(0, count).map(input => input.value);
      if (!name || !count || times.length !== count || times.some(time => !time)) { toast('请核对药名、每日次数，并为每次提醒选择时间'); return; }
      const instruction = card.querySelector('.med-source-text')?.textContent.replace('识别到的医嘱：','') || '';
      planned.push({ id: `med-${Date.now()}-${planned.length}`, name, dose, times, frequencyLabel: `每日${count}次`, instruction });
    }
    if (!planned.length) { toast('没有可保存的服药计划'); return; }
    const source = medicationSource || { hospital: '家属整理', date: dateOffset(0), text: '' };
    const recordId = `r${state.nextRecordId++}`;
    state.medications = [...(state.medications || []), ...planned];
    state.records.unshift({ id: recordId, type: '用药记录', title: '处方用药医嘱', hospital: source.hospital, date: source.date, state: '已核对', icon: '＋', ocrText: source.text });
    saveState(); renderRecords(); closeModal();
    if (source.file) putAttachment(recordId, source.file).then(() => toast('服药提醒与处方原图已保存在本机')).catch(() => toast('服药提醒已保存，处方原图未能存入本机'));
    else toast('每日服药提醒已创建');
    selectedFile = null; medicationSource = null;
  }
  if (event.target.closest('#enableMedicationNotifications')) {
    if (!('Notification' in window)) { toast('当前浏览器不支持通知，可在康伴首页查看服药时间'); return; }
    Notification.requestPermission().then(permission => toast(permission === 'granted' ? '浏览器提醒已开启' : '未开启通知，仍可在应用内查看')).catch(() => toast('浏览器未能开启通知，请检查权限设置'));
  }
  const markTaken = event.target.closest('[data-med-taken]');
  if (markTaken) {
    const key = `${dateOffset(0)}|${markTaken.dataset.medTaken}|${markTaken.dataset.medTime}`;
    state.medicationTaken = { ...(state.medicationTaken || {}), [key]: true };
    saveState(); renderMedicationReminders(); toast('已记录本次服药');
  }
  if (event.target.closest('#continueUpload')) {
    state.voiceNote = document.getElementById('voiceText')?.value || ''; saveState();
    const file = selectedFile; showExtraction(file);
  }
  if (event.target.closest('#saveRecord')) {
    const date = document.getElementById('extractDate')?.value || new Date().toISOString().slice(0,10);
    const title = document.getElementById('extractType')?.value.trim() || '就医资料';
    const hospital = document.getElementById('extractHospital')?.value.trim() || '家属补充';
    const recordId = `r${state.nextRecordId++}`;
    const record = { id: recordId, type: title.includes('药') ? '用药记录' : title.includes('报告') || title.includes('检查') ? '检查报告' : '就诊资料', title, hospital, date, state: '已核对', icon: title.includes('药') ? '＋' : '▤', ocrText: document.getElementById('extractText')?.value || '' };
    state.records.unshift(record);
    state.voiceNote = document.getElementById('extractNote')?.value || ''; saveState(); renderRecords(); closeModal();
    if (selectedFile) putAttachment(recordId, selectedFile).then(() => toast('资料和原始文件已保存在本机')).catch(() => toast('资料已保存，原始文件未能存入本机'));
    else toast('资料已加入妈妈的家庭档案');
  }
  if (event.target.closest('#backToUpload')) showUpload();
  if (event.target.closest('#openShareFromCard')) showShare();
  const checklistInput = event.target.closest('[data-checklist]');
  if (checklistInput) {
    state.appointmentChecks = { ...(state.appointmentChecks || {}), [checklistInput.dataset.checklist]: checklistInput.checked };
    saveState();
    const total = document.querySelectorAll('[data-checklist]').length;
    const done = document.querySelectorAll('[data-checklist]:checked').length;
    const counter = document.getElementById('checklistCount');
    if (counter) counter.textContent = `已准备 ${done} / ${total} 项`;
    const status = document.querySelector('.checklist-progress span');
    if (status) status.textContent = done === total ? '准备好了' : '逐项确认';
  }
  if (event.target.closest('#revokeShare')) { state.shares.push({ who: '演示分享已撤销', when: `${new Date().getMonth()+1}月${new Date().getDate()}日 ${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}` }); saveState(); closeModal(); toast('已撤销演示分享'); }
  const service = event.target.closest('[data-service]')?.dataset.service;
  if (service) showCompanionForm(service);
  const memberChoice = event.target.closest('[data-member]');
  if (memberChoice) {
    state.currentMemberId = memberChoice.dataset.member;
    state.currentRole = 'family';
    saveState(); renderRole(); navigate('home'); closeModal();
    toast(`已切换到 ${currentMember().name} 的视角（操作留痕将显示当前成员）`);
    return;
  }
  const memberToggle = event.target.closest('[data-member-toggle]');
  if (memberToggle) {
    const id = memberToggle.dataset.memberToggle;
    if (expandedMembers.has(id)) expandedMembers.delete(id); else expandedMembers.add(id);
    renderHealth();
    return;
  }
  const memberEditButton = event.target.closest('[data-member-edit]');
  if (memberEditButton) { showMemberEdit(memberEditButton.dataset.memberEdit); return; }
  const memberReadingButton = event.target.closest('[data-member-reading]');
  if (memberReadingButton) { showReadingEntry(memberReadingButton.dataset.memberReading); return; }
  const memberDailyButton = event.target.closest('[data-member-daily]');
  if (memberDailyButton) { showDailyLog(memberDailyButton.dataset.memberDaily); return; }
  const dashboardButton = event.target.closest('[data-member-dashboard]');
  if (dashboardButton) { showMemberDashboard(dashboardButton.dataset.memberDashboard); return; }
  const metricChip = event.target.closest('[data-metric-chip]');
  if (metricChip) { showMemberDashboard(metricChip.dataset.memberId, metricChip.dataset.metricChip); return; }
  const boardFilterChip = event.target.closest('[data-board-filter]');
  if (boardFilterChip) { dashboardFilter[boardFilterChip.dataset.memberId] = boardFilterChip.dataset.boardFilter; showMemberDashboard(boardFilterChip.dataset.memberId); return; }
  const histFilterChip = event.target.closest('[data-hist-filter]');
  if (histFilterChip) {
    const id = histFilterChip.dataset.memberId;
    historyFilter[id] = { ...(historyFilter[id] || {}), metric: histFilterChip.dataset.histFilter, abnormalOnly: false };
    showMemberDashboard(id); return;
  }
  const histAbnChip = event.target.closest('[data-hist-abn]');
  if (histAbnChip) {
    const id = histAbnChip.dataset.histAbn;
    const conf = historyFilter[id] || {};
    historyFilter[id] = { ...conf, metric: conf.metric || 'all', abnormalOnly: !conf.abnormalOnly };
    showMemberDashboard(id); return;
  }
  const boardDay = event.target.closest('[data-board-day]');
  if (boardDay) {
    const key = boardDay.dataset.boardDay;
    if (boardOpenDays.has(key)) boardOpenDays.delete(key); else boardOpenDays.add(key);
    showMemberDashboard(dashboardMemberId);
    return;
  }
  const histEdit = event.target.closest('[data-hist-edit]');
  if (histEdit) { showHistEdit(histEdit.dataset.histEdit); return; }
  const histDel = event.target.closest('[data-hist-del]');
  if (histDel) {
    const entry = (state.bodyMetrics || []).find(item => item.id === histDel.dataset.histDel);
    if (entry) {
      state.bodyMetrics = state.bodyMetrics.filter(item => item.id !== entry.id);
      saveState(); renderHealth(); showMemberDashboard(entry.memberId);
      toast(`已删除 ${entry.metric} 记录（${formatDate(entry.date)}）；如误删可重新导入体检单`);
    }
    return;
  }
  const checkupImportButton = event.target.closest('[data-checkup-import]');
  if (checkupImportButton) { showCheckupImport(checkupImportButton.dataset.checkupImport); return; }
  const checkupScan = event.target.closest('#checkupScan');
  if (checkupScan) { showCheckupConfirm(checkupScan.dataset.memberId); return; }
  const roleChoice = event.target.closest('[data-role]');
  if (roleChoice) setRole(roleChoice.dataset.role);
  const orderAction = event.target.closest('[data-order-action]');
  if (orderAction) {
    const order = state.companionOrders.find(item => item.id === orderAction.dataset.orderId);
    if (order) {
      const actionName = orderAction.dataset.orderAction;
      if (actionName === 'complete') {
        ensureExecution(order);
        const progress = executionProgress(order);
        if (!progress.all) { toast('还有履约项目未完成，请逐项执行并上传佐证'); return; }
      }
      order.status = actionName === 'accept' ? 'accepted' : actionName === 'complete' ? 'completed' : 'declined';
      if (order.status === 'accepted') ensureExecution(order);
      if (order.status === 'completed') order.completedAt = new Date().toISOString();
      saveState(); renderRecords();
      toast(order.status === 'accepted' ? '已接受预约，请按履约清单逐项执行' : order.status === 'completed' ? '已完成陪诊，家庭端可查看履约记录' : '已标记暂不接单');
    }
  }
  const reviewButton = event.target.closest('[data-order-review]');
  if (reviewButton) showReviewForm(reviewButton.dataset.orderReview, reviewButton.dataset.reviewRole);
  const rebookButton = event.target.closest('[data-rebook]');
  if (rebookButton) {
    const previous = state.companionOrders.find(item => item.id === rebookButton.dataset.rebook);
    if (previous) showCompanionForm(previous.service, previous);
  }
  const recordId = event.target.closest('[data-open-record]')?.dataset.openRecord;
  if (recordId) showRecord(recordId);
  if (event.target.closest('#recordDone')) closeModal();
  if (event.target.closest('#orderDone') || event.target.closest('#infoDone')) closeModal();
  if (event.target.closest('#modalClose') || event.target.id === 'modalBackdrop') closeModal();
  if (event.target.closest('#bellButton')) showAlertCenter();
  if (event.target.closest('#profileSwitch')) showRoleSwitcher();
  const execToggle = event.target.closest('[data-exec-toggle]');
  if (execToggle) {
    const order = state.companionOrders.find(item => item.id === execToggle.dataset.orderId);
    const item = order?.execution?.items?.find(entry => entry.key === execToggle.dataset.execToggle);
    if (item && !item.done) {
      item.done = true; item.doneAt = nowLabel();
      saveState(); renderRecords();
      toast(`已记录：${item.label}`);
    }
  }
  const execEvidence = event.target.closest('[data-exec-evidence]');
  if (execEvidence) {
    evidenceTarget = { orderId: execEvidence.dataset.orderId, key: execEvidence.dataset.execEvidence };
    const input = document.getElementById('evidenceInput'); input.value = ''; input.click();
  }
  const evidenceView = event.target.closest('[data-evidence-view]');
  if (evidenceView) showEvidenceModal(evidenceView.dataset.orderId, evidenceView.dataset.evidenceView);
});

/* 历史记录搜索：只刷新 #histBody，保持输入框焦点 */
document.addEventListener('input', event => {
  if (event.target.id !== 'histSearch') return;
  const memberId = event.target.dataset.memberId;
  const member = (state.familyMembers || []).find(item => item.id === memberId);
  const host = document.getElementById('histBody');
  if (!member || !host) return;
  historyFilter[memberId] = { ...(historyFilter[memberId] || {}), search: event.target.value };
  host.innerHTML = renderHistBody(member, memberMetricEntries(memberId));
});

document.addEventListener('submit', event => {
  if (event.target.id === 'companionForm') {
    event.preventDefault(); const data = new FormData(event.target);
    const order = {
      id: `order-${Date.now()}`,
      service: data.get('service'),
      hospital: data.get('hospital'),
      date: data.get('date'),
      need: data.get('need'),
      patient: '陈兰英',
      requester: '小林',
      providerName: state.companionProfile.name,
      status: 'pending',
      rebookOf: event.target.dataset.rebookId || null,
      reviews: { family: null, escort: null },
      createdAt: new Date().toISOString()
    };
    state.companionOrders.unshift(order); saveState(); renderRecords(); showOrderSuccess(order);
    return;
  }
  if (event.target.id === 'escortProfileForm') {
    event.preventDefault(); const data = new FormData(event.target);
    state.companionProfile = { ...state.companionProfile, name: data.get('name').trim(), experience: data.get('experience').trim(), serviceArea: data.get('area').trim(), availability: data.get('availability').trim(), bio: data.get('bio').trim() };
    saveState(); renderRole(); renderRecords(); toast('陪诊员介绍已保存到本机');
    return;
  }
  if (event.target.id === 'reviewForm') {
    event.preventDefault(); const form = event.target; const data = new FormData(form);
    const order = state.companionOrders.find(item => item.id === form.dataset.orderId);
    if (!order || order.status !== 'completed') { toast('当前订单还不能评价'); return; }
    const role = form.dataset.reviewRole;
    order.reviews = { ...(order.reviews || {}), [role]: { score: Number(data.get('score')), comment: data.get('comment').trim(), createdAt: new Date().toISOString() } };
    saveState(); closeModal(); renderRecords(); toast('评价已保存到本机');
  }
});

document.addEventListener('change', event => {
  const select = event.target.closest('[data-med-count]');
  if (!select) return;
  const count = Number(select.value || 0);
  select.closest('[data-med-card]').querySelectorAll('[data-slot]').forEach((slot, index) => {
    const input = slot.querySelector('[data-med-time]');
    const visible = index < count;
    slot.style.display = visible ? 'flex' : 'none';
    input.required = visible;
  });
});

for (const id of ['fileInput','libraryInput']) document.getElementById(id).addEventListener('change', event => {
  const file = event.target.files?.[0]; if (!file) return;
  selectedFile = file; showExtraction(file);
});
document.getElementById('preVisitPhotoInput').addEventListener('change', event => {
  preVisitFiles.push(...Array.from(event.target.files || [])); event.target.value = '';
  const status = document.getElementById('preVisitStatus'); if (status) status.textContent = `已添加 ${preVisitFiles.length} 个附件；照片会随描述保存在本机。`;
});
document.getElementById('preVisitAudioInput').addEventListener('change', event => {
  preVisitFiles.push(...Array.from(event.target.files || [])); event.target.value = '';
  const status = document.getElementById('preVisitStatus'); if (status) status.textContent = `已添加 ${preVisitFiles.length} 个附件；录音会随描述保存在本机。`;
});
document.getElementById('evidenceInput').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file || !evidenceTarget) return;
  const order = state.companionOrders.find(item => item.id === evidenceTarget.orderId);
  const item = order?.execution?.items?.find(entry => entry.key === evidenceTarget.key);
  if (!item) { toast('没有找到履约项目'); evidenceTarget = null; return; }
  const evidenceId = `evidence-${order.id}-${item.key}`;
  try {
    await putAttachment(evidenceId, file);
    item.evidenceId = evidenceId; item.evidenceName = file.name;
    if (!item.done) { item.done = true; item.doneAt = nowLabel(); }
    saveState(); renderRecords();
    toast('佐证照片已保存，履约项已标记完成');
  } catch { toast('佐证保存失败，请重试'); }
  evidenceTarget = null;
});
document.getElementById('modalClose').addEventListener('click', closeModal);
document.querySelectorAll('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelectorAll('.filter-chip').forEach(item => item.classList.remove('selected')); chip.classList.add('selected');
  const category = chip.textContent.trim();
  document.querySelectorAll('.record-item').forEach(item => {
    const type = item.dataset.recordType;
    item.hidden = category === '全部' ? false : category === '检查报告' ? type !== '检查报告' : type !== '用药记录';
  });
}));
if (!state.alertsSeeded) {
  state.alertsSeeded = true;
  for (const reading of [...state.healthReadings].reverse()) {
    const result = evaluateReading(reading);
    if (result) {
      state.alerts.unshift({ id: `alert-${state.nextAlertId++}`, level: result.level, title: result.title, detail: result.detail, source: `${reading.source} · 血压 ${reading.systolic}/${reading.diastolic}`, createdAt: `${formatDate(reading.date)} ${reading.time}`, notify: NOTIFY_PLAN[result.level] || NOTIFY_PLAN.blue });
    }
  }
  saveState();
}
displayToday(); renderHomeAlerts(); renderRole(); renderRecords(); navigate(state.currentRole === 'escort' ? 'escort' : 'home');
setInterval(checkMedicationReminders, 60000);
setTimeout(checkMedicationReminders, 1500);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
