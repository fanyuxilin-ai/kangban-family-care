const STORAGE_KEY = 'kangban-demo-v3';
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
  familyMembers: [{ id: 'member-mom', name: '陈兰英', relationship: '妈妈' }],
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
  customReminders: [],
  reminderLogs: {},
  reminderNotified: {},
  measurementRecords: [],
  appointmentChecks: { idCard: true, reports: false, medicines: false, questions: false, selfDescription: false },
  preVisitDescriptions: [],
  voiceNote: '',
  nextRecordId: 5,
  healthReadings: [
    { id: 'bp-seed-2', date: dateOffset(-2), time: '08:10', systolic: 152, diastolic: 94, pulse: 78, source: '手动录入' },
    { id: 'bp-seed-1', date: dateOffset(-1), time: '08:05', systolic: 149, diastolic: 93, pulse: 76, source: '模拟手表' },
    { id: 'bp-seed-0', date: dateOffset(0), time: '07:50', systolic: 166, diastolic: 102, pulse: 88, source: '模拟手表' }
  ],
  alerts: [],
  missedAlerts: {},
  nextAlertId: 1,
  nextReadingId: 1,
  alertsSeeded: false
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
    loaded.familyMembers = Array.isArray(saved.familyMembers) && saved.familyMembers.length ? saved.familyMembers : structuredClone(seed.familyMembers);
    loaded.customReminders = Array.isArray(saved.customReminders) ? saved.customReminders : [];
    loaded.reminderLogs = saved.reminderLogs && typeof saved.reminderLogs === 'object' ? saved.reminderLogs : {};
    loaded.reminderNotified = saved.reminderNotified && typeof saved.reminderNotified === 'object' ? saved.reminderNotified : {};
    loaded.measurementRecords = Array.isArray(saved.measurementRecords) ? saved.measurementRecords : [];
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
  orderHost.innerHTML = `<div class="section-heading service-heading"><div><p class="eyebrow">预约、评价与再次预约</p><h2>我的陪诊安排</h2></div></div>${state.companionOrders.length ? `<div class="family-order-list">${state.companionOrders.map(o => {
    const exec = (o.status === 'accepted' || o.status === 'completed') && o.execution?.items?.length ? (() => {
      const progress = executionProgress(o);
      return `<div class="exec-block exec-block-family"><div class="exec-progress"><strong>履约进度 ${progress.done} / ${progress.total}</strong>${progress.all ? '<span class="exec-progress-done">服务项目已全部完成</span>' : '<span>陪诊员正在逐项执行</span>'}</div>
        <div class="exec-list">${o.execution.items.map(item => `<div class="exec-row ${item.done ? 'is-done' : ''}"><span class="exec-mark">${item.done ? '✓' : '·'}</span><div class="exec-copy"><strong>${esc(item.label)}</strong></div>${item.evidenceId ? `<button class="exec-evidence has-evidence" data-evidence-view="${esc(item.key)}" data-order-id="${esc(o.id)}">查看佐证</button>` : ''}</div>`).join('')}</div></div>`;
    })() : '';
    return `<article class="family-order-card"><div class="family-order-top"><strong>${esc(o.service)}</strong><span class="record-status">${statusLabel[o.status] || '待确认'}</span></div>
      <p>${esc(o.hospital)} · ${esc(o.date)}<br>${esc(o.providerName || state.companionProfile.name)}</p>
      ${exec}
      ${o.status === 'completed' && o.serviceReport ? `<section class="service-report-card"><div class="service-report-heading"><strong>陪诊反馈</strong><small>${esc(o.serviceReport.submittedAt || '')} · ${esc(o.providerName || state.companionProfile.name)}</small></div><p><b>服务情况</b>${esc(o.serviceReport.summary)}</p>${o.serviceReport.followUp ? `<p><b>后续待办</b>${esc(o.serviceReport.followUp)}</p>` : ''}<p><b>离院交接</b>${esc(o.serviceReport.handoff)}</p>${o.serviceReport.needsFamily ? '<div class="service-report-alert">陪诊员标记需要家属跟进，请尽快联系患者或陪诊员确认。</div>' : ''}<small class="privacy-small">陪诊过程记录仅供家庭沟通参考；诊疗和用药安排请以医院原始资料为准。</small></section>` : ''}
      ${o.status === 'completed' && !o.reviews?.family ? `<button class="text-button" data-order-review="${esc(o.id)}" data-review-role="family">评价本次陪诊 →</button>` : ''}
      ${o.status === 'completed' && o.reviews?.family ? `<small class="review-complete">你已完成评价${o.reviews?.escort ? ' · 双方已互评' : ' · 等待陪诊员评价'}</small>` : ''}${reviewSummary(o)}
      ${(o.status === 'completed' || o.status === 'declined') ? `<button class="text-button" data-rebook="${esc(o.id)}">再次预约 →</button>` : ''}
    </article>`;
  }).join('')}</div>` : `<div class="family-empty-card"><p>还没有陪诊预约。可以先查看陪诊员介绍并提交一笔演示预约。</p><button class="primary-button" data-action="book-profile">预约陪诊员</button></div>`}`;
  renderMedicationReminders();
  renderHomeCompanionModule();
  renderHealth();
  renderCompanionViews();
}

/* ============ 健康档案 Tab（FR-01：档案 · 日常记录 · 趋势） ============ */
function renderHealth() {
  const readings = state.healthReadings || [];
  const listHost = document.getElementById('healthReadingsList');
  if (listHost) {
    listHost.innerHTML = readings.length ? `<div class="reading-list">${readings.slice(0, 6).map(r => {
      const result = evaluateReading(r);
      return `<div class="reading-row"><div class="reading-copy"><strong>${r.systolic}/${r.diastolic} <small>mmHg</small></strong><small>${formatDate(r.date)} ${esc(r.time || '')} · 脉搏 ${r.pulse || '—'} 次/分 · ${esc(r.source || '手动录入')}</small></div><span class="reading-tag ${result ? `reading-tag-${result.level}` : 'reading-tag-ok'}">${result ? ALERT_META[result.level].label : '正常'}</span></div>`;
    }).join('')}${readings.length > 6 ? `<p class="privacy-small" style="text-align:center">仅显示最近 6 条，完整记录见预警中心。</p>` : ''}</div>` : '<p class="empty-hint">还没有血压记录，点右上角「录入读数」添加一条。</p>';
  }
  const trendHost = document.getElementById('healthTrend');
  if (trendHost) {
    const week = readings.filter(r => r.date >= dateOffset(-7));
    const avg = nums => nums.length ? Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length) : null;
    const sys = avg(week.map(r => r.systolic)); const dia = avg(week.map(r => r.diastolic));
    const highs = week.filter(r => r.systolic >= 140 || r.diastolic >= 90).length;
    trendHost.innerHTML = `<div class="trend-card">
      <div class="trend-row"><span class="field-label">近 7 天平均血压</span><strong>${sys ? `${sys}/${dia} mmHg` : '暂无数据'}</strong></div>
      <div class="trend-row"><span class="field-label">超标次数（≥140/90）</span><strong class="${highs ? 'trend-warn' : 'trend-ok'}">${highs} 次</strong></div>
      <div class="trend-row"><span class="field-label">本周记录</span><strong>${week.length} 条</strong></div>
      <p class="privacy-small">演示版为固定统计；正式版的周报 / 月报由 AI 管理助手生成子女可读摘要。</p>
    </div>`;
  }
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
  document.getElementById('roleAvatar').textContent = isEscort ? state.companionProfile.name.slice(0, 1) : '林';
  document.getElementById('roleLabel').textContent = isEscort ? `陪诊员端 · ${state.companionProfile.name}` : '家庭端 · 小林';
  document.getElementById('familyTabs').hidden = isEscort;
  document.getElementById('escortTabs').hidden = !isEscort;
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
  const day = new Date(`${today}T12:00:00`).getDay();
  const memberName = id => state.familyMembers.find(member => member.id === id)?.name || '陈兰英';
  const items = [
    ...(state.medications || []).flatMap(med => (med.times || []).map(time => ({ id: med.id, kind: 'medication', title: med.name, detail: med.dose || med.frequencyLabel || '按已确认医嘱', time, memberId: med.memberId || 'member-mom', med }))),
    ...(state.customReminders || []).filter(reminder => reminder.active !== false && (!reminder.startDate || reminder.startDate <= today) && (!reminder.endDate || reminder.endDate >= today) && (reminder.days || [0,1,2,3,4,5,6]).includes(day)).map(reminder => ({ ...reminder, kind: reminder.kind || 'custom' }))
  ].sort((a,b) => a.time.localeCompare(b.time));
  if (!items.length) {
    host.innerHTML = `<div class="med-empty"><span>今天暂无安排，可添加量血压、散步或自定义事项。</span><button class="text-button" data-action="add-reminder">新增提醒 →</button></div>`;
    return;
  }
  host.innerHTML = `<div class="med-reminder-list">${items.map(item => {
    const key = `${today}|${item.id}|${item.time}`;
    const log = item.kind === 'medication' ? null : state.reminderLogs?.[key];
    const skipped = log?.status === 'skipped';
    const done = item.kind === 'medication' ? Boolean(state.medicationTaken?.[key]) : log?.status === 'done' || skipped;
    const typeLabel = item.kind === 'medication' ? '服药' : item.kind === 'measurement' ? '测量' : item.kind === 'activity' ? '活动' : '自定义';
    const subline = item.kind === 'medication' ? `${esc(item.detail)} · ${esc(memberName(item.memberId))}` : `${typeLabel} · ${esc(memberName(item.memberId))}${item.unit ? ` · ${esc(item.unit)}` : ''}`;
    const button = item.kind === 'medication'
      ? `<button class="med-taken-button" data-med-taken="${esc(item.id)}" data-med-time="${esc(item.time)}" ${done ? 'disabled' : ''}>${done ? '已记录' : '记录已服'}</button>`
      : `<div class="reminder-inline-actions"><button class="med-taken-button" data-reminder-complete="${esc(item.id)}" data-reminder-time="${esc(item.time)}" ${done ? 'disabled' : ''}>${skipped ? '已跳过' : done ? (item.kind === 'measurement' ? '已记录' : '已完成') : (item.kind === 'measurement' ? '记录读数' : '完成')}</button>${!done ? `<button class="reminder-later" data-reminder-snooze="${esc(item.id)}" data-reminder-time="${esc(item.time)}">＋30分</button><button class="reminder-skip" data-reminder-skip="${esc(item.id)}" data-reminder-time="${esc(item.time)}">跳过</button>` : ''}</div>`;
    const snoozedText = log?.status === 'snoozed' ? ` · 已延后至 ${new Date(log.snoozedUntil).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}` : '';
    return `<div class="med-reminder-row ${done ? 'is-taken' : ''}"><time>${esc(item.time)}</time><div class="med-reminder-copy"><strong>${esc(item.title)} <i>${typeLabel}</i></strong><small>${subline}${esc(snoozedText)}</small></div>${button}</div>`;
  }).join('')}</div>`;
}

function reminderWeekdays(days = []) { return ['日','一','二','三','四','五','六'].filter((_, index) => days.includes(index)).map(day => `周${day}`).join('、') || '未设置'; }
function reminderOccurrenceKey(reminder, time, date = dateOffset(0)) { return `${date}|${reminder.id}|${time}`; }
function showReminderManager() {
  const members = state.familyMembers || [];
  const reminders = state.customReminders || [];
  const rows = reminders.length ? reminders.map(reminder => {
    const member = members.find(item => item.id === reminder.memberId)?.name || '陈兰英';
    const type = reminder.kind === 'measurement' ? '测量' : reminder.kind === 'activity' ? '活动' : '自定义';
    const schedule = `${esc(reminder.time)} · ${reminderWeekdays(reminder.days || [])}${reminder.endDate ? ` · 至 ${formatDate(reminder.endDate)}` : ''}`;
    return `<article class="reminder-manager-card"><div><strong>${esc(reminder.title)}</strong><small>${type} · ${esc(member)} · ${schedule}</small>${reminder.detail ? `<small>${esc(reminder.detail)}</small>` : ''}</div><button class="reminder-delete" data-reminder-delete="${esc(reminder.id)}" aria-label="删除${esc(reminder.title)}">删除</button></article>`;
  }).join('') : '<div class="med-empty med-empty-large">还没有自定义提醒。可添加量血压、测血糖、散步或任何需要记得做的事。</div>';
  const history = (state.measurementRecords || []).slice(0, 5).map(item => `<div class="reminder-history-row"><strong>${esc(item.title)}</strong><span>${esc(item.value)}${item.unit ? ` ${esc(item.unit)}` : ''}</span><small>${formatDate(item.date)} ${esc(item.time)} · ${esc(item.memberName || '陈兰英')}</small></div>`).join('');
  openModal(`${modalHead('按成员安排 · 家庭共享', '提醒管理', '服药提醒由已确认医嘱生成；血压、血糖、活动和其他事项由家人自定义。提醒保存在当前设备。')}
    <div class="reminder-manager-list">${rows}</div>
    <button class="primary-button" id="openAddReminder">新增提醒</button>
    <button class="secondary-button" id="openMedicationManager">管理服药提醒（医嘱）</button>
    ${history ? `<div class="share-log"><h3>最近测量记录</h3>${history}</div>` : ''}
    <button class="secondary-button" id="enableMedicationNotifications">开启浏览器通知</button>
    <p class="privacy-small">提醒记录用于家庭日常协同，不提供诊断或治疗建议。浏览器关闭后，定时通知暂不可用。</p>`);
}
function showReminderForm() {
  const members = state.familyMembers?.length ? state.familyMembers : seed.familyMembers;
  const memberOptions = members.map(member => `<option value="${esc(member.id)}">${esc(member.name)}${member.relationship ? `（${esc(member.relationship)}）` : ''}</option>`).join('');
  const weekdays = ['日','一','二','三','四','五','六'].map((day,index) => `<label class="reminder-day"><input type="checkbox" name="days" value="${index}" checked><span>周${day}</span></label>`).join('');
  openModal(`${modalHead('家庭自定义 · 按成员记录', '新增提醒', '不限于预设项目，写下家人需要记住的事项。测量类完成时会记录读数。')}
    <form class="reminder-form" id="reminderForm">
      <label><span class="field-label-block">提醒对象</span><select class="input-field" name="memberId" required>${memberOptions}</select></label>
      <label><span class="field-label-block">项目类型</span><select class="input-field" name="kind" id="reminderKind"><option value="measurement">健康测量</option><option value="activity">活动 / 训练</option><option value="custom">自定义事项</option></select></label>
      <div class="reminder-template-row"><span class="field-label-block">快速选择，也可自己填写</span><div><button type="button" class="reminder-template" data-reminder-template="bloodPressure">测血压</button><button type="button" class="reminder-template" data-reminder-template="bloodSugar">测血糖</button><button type="button" class="reminder-template" data-reminder-template="walk">散步</button></div></div>
      <label><span class="field-label-block">提醒名称</span><input class="input-field" name="title" maxlength="40" placeholder="例如：测量血压、散步、复诊前准备" required></label>
      <label id="metricTypeRow"><span class="field-label-block">记录方式</span><select class="input-field" name="metricType"><option value="bloodPressure">血压（收缩压 / 舒张压）</option><option value="bloodSugar">血糖（数值）</option><option value="custom">其他指标（自定义数值）</option></select></label>
      <label id="metricUnitRow"><span class="field-label-block">单位</span><input class="input-field" name="unit" value="mmHg" maxlength="12" placeholder="例如 mmol/L、次、分钟"></label>
      <label><span class="field-label-block">说明（选填）</span><input class="input-field" name="detail" maxlength="100" placeholder="例如：饭后两小时；如身体不适请及时告知家人"></label>
      <label><span class="field-label-block">提醒时间</span><input class="input-field" name="time" type="time" required value="08:00"></label>
      <div><span class="field-label-block">重复日期</span><div class="reminder-days">${weekdays}</div></div>
      <label><span class="field-label-block">开始日期</span><input class="input-field" name="startDate" type="date" value="${dateOffset(0)}" required></label>
      <label><span class="field-label-block">结束日期（选填）</span><input class="input-field" name="endDate" type="date"></label>
      <button class="primary-button" type="submit">保存提醒</button>
    </form><p class="privacy-small">设置的时间和频次请以医生、药师或家庭实际安排为准。</p>`);
  document.getElementById('reminderKind')?.addEventListener('change', event => {
    const isMeasurement = event.target.value === 'measurement';
    document.getElementById('metricTypeRow').hidden = !isMeasurement;
    document.getElementById('metricUnitRow').hidden = !isMeasurement;
  });
  document.getElementById('reminderKind')?.dispatchEvent(new Event('change'));
  document.querySelector('[name="metricType"]')?.addEventListener('change', event => {
    const unit = document.querySelector('[name="unit"]');
    if (unit) unit.value = event.target.value === 'bloodPressure' ? 'mmHg' : event.target.value === 'bloodSugar' ? 'mmol/L' : '';
  });
  document.querySelectorAll('[data-reminder-template]').forEach(button => button.addEventListener('click', () => {
    const title = document.querySelector('[name="title"]');
    const kind = document.getElementById('reminderKind');
    const metricType = document.querySelector('[name="metricType"]');
    if (button.dataset.reminderTemplate === 'bloodPressure') { kind.value = 'measurement'; title.value = '测量血压'; metricType.value = 'bloodPressure'; }
    if (button.dataset.reminderTemplate === 'bloodSugar') { kind.value = 'measurement'; title.value = '测量血糖'; metricType.value = 'bloodSugar'; }
    if (button.dataset.reminderTemplate === 'walk') { kind.value = 'activity'; title.value = '散步'; }
    kind.dispatchEvent(new Event('change'));
    metricType.dispatchEvent(new Event('change'));
  }));
}
function showReminderCompletion(id, time) {
  const reminder = state.customReminders.find(item => item.id === id);
  if (!reminder) return;
  const key = reminderOccurrenceKey(reminder, time);
  if (state.reminderLogs?.[key]?.status === 'done') return;
  const measurementFields = reminder.kind === 'measurement'
    ? reminder.metricType === 'bloodPressure'
      ? `<div class="reading-inputs"><label><span>收缩压 (mmHg)</span><input class="input-field" name="systolic" type="number" min="60" max="260" required></label><label><span>舒张压 (mmHg)</span><input class="input-field" name="diastolic" type="number" min="40" max="160" required></label></div>`
      : `<label><span class="field-label-block">${esc(reminder.title)}${reminder.unit ? `（${esc(reminder.unit)}）` : ''}</span><input class="input-field" name="value" type="number" step="any" required></label>`
    : '';
  openModal(`${modalHead(`${esc(reminder.time)} · ${esc(reminder.title)}`, reminder.kind === 'measurement' ? '记录测量结果' : '记录完成情况', `记录对象：${esc((state.familyMembers.find(item => item.id === reminder.memberId)?.name) || '陈兰英')}`)}
    <form class="reminder-form" id="reminderCompletionForm" data-reminder-id="${esc(id)}" data-reminder-time="${esc(time)}">${measurementFields}
      <label><span class="field-label-block">备注（选填）</span><textarea class="input-field" name="note" maxlength="120" placeholder="记录当时情况"></textarea></label>
      <button class="primary-button" type="submit">保存记录</button>
    </form><p class="privacy-small">测量值按原样记录，不自动判断是否正常。</p>`);
}
function completeCustomReminder(reminder, time, formData) {
  const today = dateOffset(0);
  const key = reminderOccurrenceKey(reminder, time, today);
  const member = state.familyMembers.find(item => item.id === reminder.memberId);
  const entry = { status: 'done', memberId: reminder.memberId, actor: '小林', completedAt: nowLabel(), note: String(formData.get('note') || '').trim() };
  if (reminder.kind === 'measurement') {
    if (reminder.metricType === 'bloodPressure') {
      entry.value = `${formData.get('systolic')}/${formData.get('diastolic')}`;
      entry.unit = 'mmHg';
      const reading = { systolic: Number(formData.get('systolic')), diastolic: Number(formData.get('diastolic')) };
      state.healthReadings.unshift({ id: `bp-reminder-${Date.now()}`, date: today, time: new Date().toTimeString().slice(0,5), memberId: reminder.memberId, ...reading, source: '提醒记录' });
    } else {
      entry.value = String(formData.get('value') || '').trim();
      entry.unit = reminder.unit || '';
    }
    state.measurementRecords.unshift({ id: `measure-${Date.now()}`, reminderId: reminder.id, memberId: reminder.memberId, memberName: member?.name || '陈兰英', title: reminder.title, value: entry.value, unit: entry.unit, date: today, time: new Date().toTimeString().slice(0,5), note: entry.note });
  }
  state.reminderLogs = { ...(state.reminderLogs || {}), [key]: entry };
  saveState(); renderRecords(); closeModal(); toast(reminder.kind === 'measurement' ? '测量结果已保存' : '已记录完成');
}
function snoozeCustomReminder(id, time) {
  const reminder = state.customReminders.find(item => item.id === id);
  if (!reminder) return;
  const key = reminderOccurrenceKey(reminder, time);
  if (['done','skipped'].includes(state.reminderLogs?.[key]?.status)) return;
  const until = new Date(Date.now() + 30 * 60 * 1000);
  state.reminderLogs = { ...(state.reminderLogs || {}), [key]: { ...(state.reminderLogs?.[key] || {}), status: 'snoozed', memberId: reminder.memberId, actor: '小林', snoozedAt: nowLabel(), snoozedUntil: until.toISOString() } };
  saveState(); renderRecords(); toast(`已延后到 ${until.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`);
}
function skipCustomReminder(id, time) {
  const reminder = state.customReminders.find(item => item.id === id);
  if (!reminder) return;
  const key = reminderOccurrenceKey(reminder, time);
  if (['done','skipped'].includes(state.reminderLogs?.[key]?.status)) return;
  state.reminderLogs = { ...(state.reminderLogs || {}), [key]: { status: 'skipped', memberId: reminder.memberId, actor: '小林', completedAt: nowLabel() } };
  saveState(); renderRecords(); toast('已跳过本次提醒');
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
function checkCustomReminders() {
  const now = new Date();
  const today = dateOffset(0);
  const day = now.getDay();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  let changed = false;
  for (const reminder of state.customReminders || []) {
    if (reminder.active === false || (reminder.startDate && reminder.startDate > today) || (reminder.endDate && reminder.endDate < today) || !(reminder.days || [0,1,2,3,4,5,6]).includes(day)) continue;
    const [hour, minute] = String(reminder.time || '').split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) continue;
    const delta = currentMinute - (hour * 60 + minute);
    const key = reminderOccurrenceKey(reminder, reminder.time, today);
    const log = state.reminderLogs?.[key];
    if (['done','skipped'].includes(log?.status)) continue;
    const snoozedUntil = log?.status === 'snoozed' ? Date.parse(log.snoozedUntil) : NaN;
    const notificationKey = Number.isFinite(snoozedUntil) && now.getTime() >= snoozedUntil ? `${key}|snooze|${log.snoozedUntil}` : key;
    const shouldNotify = Number.isFinite(snoozedUntil) ? now.getTime() >= snoozedUntil : delta >= 0 && delta <= 3;
    if (shouldNotify && !state.reminderNotified?.[notificationKey]) {
      state.reminderNotified = { ...(state.reminderNotified || {}), [notificationKey]: true };
      changed = true;
      const member = state.familyMembers.find(item => item.id === reminder.memberId)?.name || '家人';
      const message = `${member}：${reminder.title}${reminder.detail ? ` · ${reminder.detail}` : ''}`;
      if ('Notification' in window && Notification.permission === 'granted') new Notification('康伴提醒', { body: message, tag: notificationKey });
      else if (document.visibilityState === 'visible') toast(`康伴提醒：${reminder.title} · ${reminder.time}`);
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
    host.innerHTML = `<div class="alert-card alert-card-calm"><span class="alert-icon">✓</span><div><strong>近期没有需要处理的预警</strong><small>录入血压读数或同步手表数据后，规则引擎会自动评估。</small></div><button class="text-button" data-action="alerts">录入 →</button></div>`;
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
      <strong>录入血压读数（演示）</strong>
      <div class="reading-inputs">
        <label><span>收缩压</span><input class="input-field" id="readingSystolic" type="number" min="60" max="260" placeholder="mmHg" /></label>
        <label><span>舒张压</span><input class="input-field" id="readingDiastolic" type="number" min="40" max="160" placeholder="mmHg" /></label>
        <label><span>脉搏</span><input class="input-field" id="readingPulse" type="number" min="30" max="220" placeholder="次/分" /></label>
      </div>
      <button class="primary-button" id="saveReading">保存并评估</button>
      <button class="secondary-button" id="mockWatchSync">模拟手表同步一次读数</button>
      <button class="secondary-button" id="mockFallEvent">模拟手表跌倒事件</button>
      <p class="privacy-small">演示读数保存在本机。真实手表接入（华为 Health Kit / 小米运动健康）属于后续版本。</p>
    </div>`);
  document.getElementById('mockWatchSync')?.addEventListener('click', () => {
    const pool = [ [128, 82, 72], [146, 92, 78], [168, 104, 86], [122, 80, 70] ];
    const [sys, dia, pulse] = pool[Math.floor(Math.random() * pool.length)];
    saveReading({ systolic: sys, diastolic: dia, pulse, source: '模拟手表' });
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
    saveReading({ systolic, diastolic, pulse, source: '手动录入' });
  });
}
function saveReading(reading) {
  const entry = { id: `bp-${state.nextReadingId++}`, date: dateOffset(0), time: nowLabel().split(' ')[1], ...reading };
  state.healthReadings.unshift(entry);
  const result = evaluateReading(entry);
  let message = '读数正常，未触发预警';
  if (result) {
    createAlert(result.level, result.title, result.detail, `${entry.source} · 血压 ${entry.systolic}/${entry.diastolic}`);
    message = `已触发${ALERT_META[result.level].label}预警并完成分级告知`;
  }
  saveState(); renderHomeAlerts(); closeModal(); toast(message);
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
    <button class="secondary-button" id="returnToReminderCenter">管理其他提醒</button>
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
  openModal(`${modalHead('演示角色登录', '选择进入哪一端', '这是同一台设备上的角色演示，不是真实账号登录。预约记录会在两个角色间共享。')}
    <div class="role-choice-list">
      <button class="role-choice" data-role="family"><span class="role-choice-avatar">林</span><span><strong>家庭端 · 小林</strong><small>整理资料、发起陪诊预约、完成评价</small></span><b>${state.currentRole === 'family' ? '当前' : '进入 →'}</b></button>
      <button class="role-choice" data-role="escort"><span class="role-choice-avatar escort-choice-avatar">${esc(state.companionProfile.name.slice(0,1))}</span><span><strong>陪诊员端 · ${esc(state.companionProfile.name)}</strong><small>编辑介绍、回应预约、完成陪诊、评价家庭</small></span><b>${state.currentRole === 'escort' ? '当前' : '进入 →'}</b></button>
    </div><p class="privacy-small">预约数据保存在这台设备的浏览器中。跨设备真实登录、消息通知和线上派单需要服务端。</p>`);
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
function showCompletionReportForm(orderId) {
  const order = state.companionOrders.find(item => item.id === orderId);
  if (!order || order.status !== 'accepted' || !executionProgress(order).all) { toast('请先完成全部履约项目'); return; }
  openModal(`${modalHead('陪诊服务反馈', '提交就诊后反馈', '向家属说明服务经过、后续待办和患者离院交接情况。请只记录亲历事实，不代替医生解释诊疗意见。')}
    <form class="service-report-form" id="serviceReportForm" data-order-id="${esc(orderId)}">
      <label><span class="field-label-block">本次服务情况</span><textarea class="input-field" name="summary" maxlength="500" required placeholder="例如：已陪同完成挂号、就诊和检查，医生资料已交给患者。"></textarea></label>
      <label><span class="field-label-block">需要家属跟进的事项（选填）</span><textarea class="input-field" name="followUp" maxlength="300" placeholder="例如：协助预约复诊、确认是否已安全到家。诊疗建议请按医院原文记录。"></textarea></label>
      <label><span class="field-label-block">患者离院 / 交接状态</span><select class="input-field" name="handoff" required><option value="">请选择</option><option>已当面交接给家属</option><option>已陪同患者安全到家</option><option>患者选择自行离院，已确认去向</option><option>尚未完成交接，需要家属联系</option></select></label>
      <label class="consent-row"><input type="checkbox" name="needsFamily" value="yes" /><span>标记为需要家属尽快跟进（如联系不上患者、交接未完成或出现安全顾虑）</span></label>
      <button class="primary-button" type="submit">提交反馈并完成服务</button>
    </form><p class="privacy-small">演示版反馈保存在本机浏览器；真实跨设备通知、身份核验与紧急联络需接入服务端。</p>`);
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
  const tab = event.target.closest('[data-tab]');
  if (tab) { navigate(tab.dataset.tab); return; }
  const nav = event.target.closest('[data-nav]');
  if (nav) { navigate(nav.dataset.nav); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'upload') showUpload();
  if (action === 'medications') showMedicationManager();
  if (action === 'reminders') showReminderManager();
  if (action === 'add-reminder') showReminderForm();
  if (action === 'add-medication') showUpload();
  if (action === 'health-card') showHealthCard();
  if (action === 'share') showShare();
  if (action === 'alerts') showAlertCenter();
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
      planned.push({ id: `med-${Date.now()}-${planned.length}`, memberId: 'member-mom', name, dose, times, frequencyLabel: `每日${count}次`, instruction });
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
  if (event.target.closest('#openAddReminder')) showReminderForm();
  if (event.target.closest('#openMedicationManager')) showMedicationManager();
  if (event.target.closest('#returnToReminderCenter')) showReminderManager();
  const deleteReminder = event.target.closest('[data-reminder-delete]');
  if (deleteReminder) {
    const reminder = state.customReminders.find(item => item.id === deleteReminder.dataset.reminderDelete);
    state.customReminders = state.customReminders.filter(item => item.id !== deleteReminder.dataset.reminderDelete);
    saveState(); renderRecords(); showReminderManager();
    if (reminder) toast(`已删除提醒：${reminder.title}`);
  }
  const completeReminder = event.target.closest('[data-reminder-complete]');
  if (completeReminder) showReminderCompletion(completeReminder.dataset.reminderComplete, completeReminder.dataset.reminderTime);
  const snoozeReminder = event.target.closest('[data-reminder-snooze]');
  if (snoozeReminder) snoozeCustomReminder(snoozeReminder.dataset.reminderSnooze, snoozeReminder.dataset.reminderTime);
  const skipReminder = event.target.closest('[data-reminder-skip]');
  if (skipReminder) skipCustomReminder(skipReminder.dataset.reminderSkip, skipReminder.dataset.reminderTime);
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
        showCompletionReportForm(order.id);
        return;
      }
      order.status = actionName === 'accept' ? 'accepted' : 'declined';
      if (order.status === 'accepted') ensureExecution(order);
      saveState(); renderRecords();
      toast(order.status === 'accepted' ? '已接受预约，请按履约清单逐项执行' : '已标记暂不接单');
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

document.addEventListener('submit', event => {
  if (event.target.id === 'reminderForm') {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const days = data.getAll('days').map(Number).filter(day => day >= 0 && day <= 6);
    const title = String(data.get('title') || '').trim();
    const startDate = String(data.get('startDate') || '');
    const endDate = String(data.get('endDate') || '');
    if (!title) { toast('请填写提醒名称'); return; }
    if (!days.length) { toast('至少选择一个重复日期'); return; }
    if (endDate && endDate < startDate) { toast('结束日期不能早于开始日期'); return; }
    const kind = String(data.get('kind') || 'custom');
    const reminder = {
      id: `reminder-${Date.now()}`,
      memberId: String(data.get('memberId') || 'member-mom'),
      kind: ['measurement','activity','custom'].includes(kind) ? kind : 'custom',
      title,
      detail: String(data.get('detail') || '').trim(),
      time: String(data.get('time') || '08:00'),
      days,
      startDate,
      endDate: endDate || '',
      metricType: kind === 'measurement' ? String(data.get('metricType') || 'custom') : '',
      unit: kind === 'measurement' ? String(data.get('unit') || '').trim() : '',
      active: true
    };
    state.customReminders = [...(state.customReminders || []), reminder];
    saveState(); renderRecords(); showReminderManager(); toast('提醒已保存');
    return;
  }
  if (event.target.id === 'reminderCompletionForm') {
    event.preventDefault();
    const form = event.target;
    const reminder = state.customReminders.find(item => item.id === form.dataset.reminderId);
    if (!reminder) { toast('找不到这条提醒'); return; }
    completeCustomReminder(reminder, form.dataset.reminderTime, new FormData(form));
    return;
  }
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
  if (event.target.id === 'serviceReportForm') {
    event.preventDefault();
    const form = event.target; const data = new FormData(form);
    const order = state.companionOrders.find(item => item.id === form.dataset.orderId);
    if (!order || order.status !== 'accepted' || !executionProgress(order).all) { toast('订单状态已变化，请重新确认'); closeModal(); return; }
    order.serviceReport = {
      summary: data.get('summary').trim(),
      followUp: data.get('followUp').trim(),
      handoff: data.get('handoff'),
      needsFamily: data.get('needsFamily') === 'yes',
      submittedAt: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    order.completedAt = new Date().toISOString();
    order.status = 'completed';
    saveState(); closeModal(); renderRecords();
    toast(order.serviceReport.needsFamily || order.serviceReport.handoff.includes('尚未') ? '反馈已提交，提醒家属尽快跟进' : '反馈已提交，家庭端可查看');
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
setInterval(checkCustomReminders, 60000);
setTimeout(checkCustomReminders, 1800);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
