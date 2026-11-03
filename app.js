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
  nextRecordId: 5
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
  document.getElementById('homeTimeline').innerHTML = preview.map(record => `
    <div class="timeline-row"><span class="timeline-date">${formatDate(record.date)}</span><i class="timeline-marker"></i><div class="timeline-copy"><strong>${esc(record.title)}</strong><small>${esc(record.hospital.split(' · ')[0])}</small></div></div>`).join('');
  const orderHost = document.getElementById('companionOrders');
  const statusLabel = { pending: '待陪诊员确认', accepted: '已接单', declined: '未接单', completed: '已完成' };
  orderHost.innerHTML = `<div class="section-heading service-heading"><div><p class="eyebrow">预约、评价与再次预约</p><h2>我的陪诊安排</h2></div></div>${state.companionOrders.length ? `<div class="family-order-list">${state.companionOrders.map(o => `
    <article class="family-order-card"><div class="family-order-top"><strong>${esc(o.service)}</strong><span class="record-status">${statusLabel[o.status] || '待确认'}</span></div>
      <p>${esc(o.hospital)} · ${esc(o.date)}<br>${esc(o.providerName || state.companionProfile.name)}</p>
      ${o.status === 'completed' && !o.reviews?.family ? `<button class="text-button" data-order-review="${esc(o.id)}" data-review-role="family">评价本次陪诊 →</button>` : ''}
      ${o.status === 'completed' && o.reviews?.family ? `<small class="review-complete">你已完成评价${o.reviews?.escort ? ' · 双方已互评' : ' · 等待陪诊员评价'}</small>` : ''}${reviewSummary(o)}
      ${(o.status === 'completed' || o.status === 'declined') ? `<button class="text-button" data-rebook="${esc(o.id)}">再次预约 →</button>` : ''}
    </article>`).join('')}</div>` : `<div class="family-empty-card"><p>还没有陪诊预约。可以先查看陪诊员介绍并提交一笔演示预约。</p><button class="primary-button" data-action="book-profile">预约陪诊员</button></div>`}`;
  renderMedicationReminders();
  renderCompanionViews();
  renderHomeCompanionModule();
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
  const count = (status) => orders.filter(order => order.status === status).length;
  const pendingCount = document.getElementById('escortPendingCount');
  if (pendingCount) {
    pendingCount.textContent = count('pending');
    document.getElementById('escortAcceptedCount').textContent = count('accepted');
    document.getElementById('escortCompletedCount').textContent = count('completed');
    const host = document.getElementById('escortOrders');
    host.innerHTML = orders.length ? orders.map(order => {
      const label = { pending: '待确认', accepted: '待服务', declined: '未接单', completed: '已完成' }[order.status] || '待确认';
      const actions = order.status === 'pending' ? `<div class="order-actions"><button class="secondary-button" data-order-action="decline" data-order-id="${esc(order.id)}">暂不接单</button><button class="primary-button" data-order-action="accept" data-order-id="${esc(order.id)}">接受预约</button></div>` : order.status === 'accepted' ? `<button class="primary-button" data-order-action="complete" data-order-id="${esc(order.id)}">标记陪诊已完成</button>` : order.status === 'completed' && !order.reviews?.escort ? `<button class="primary-button" data-order-review="${esc(order.id)}" data-review-role="escort">评价本次家庭</button>` : order.status === 'completed' ? `<small class="review-complete">你已评价${order.reviews?.family ? ' · 双方已互评' : ' · 等待家庭评价'}</small>` : '';
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
      if (delta < 0 || delta > 3 || state.medicationTaken?.[key] || state.medicationNotified?.[key]) continue;
      state.medicationNotified = { ...(state.medicationNotified || {}), [key]: true };
      changed = true;
      const message = `${med.name}${med.dose ? ` · ${med.dose}` : ''}，请按已确认医嘱核对。`;
      if ('Notification' in window && Notification.permission === 'granted') new Notification('康伴服药提醒', { body: message, tag: key });
      else if (document.visibilityState === 'visible') toast(`服药提醒：${med.name} · ${time}`);
    }
  }
  if (changed) saveState();
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
  if (action === 'add-medication') showUpload();
  if (action === 'health-card') showHealthCard();
  if (action === 'share') showShare();
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
  const roleChoice = event.target.closest('[data-role]');
  if (roleChoice) setRole(roleChoice.dataset.role);
  const orderAction = event.target.closest('[data-order-action]');
  if (orderAction) {
    const order = state.companionOrders.find(item => item.id === orderAction.dataset.orderId);
    if (order) {
      const actionName = orderAction.dataset.orderAction;
      order.status = actionName === 'accept' ? 'accepted' : actionName === 'complete' ? 'completed' : 'declined';
      if (order.status === 'completed') order.completedAt = new Date().toISOString();
      saveState(); renderRecords();
      toast(order.status === 'accepted' ? '已接受预约，家庭端状态已更新' : order.status === 'completed' ? '已完成陪诊，可开始互评' : '已标记暂不接单');
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
  if (event.target.closest('#bellButton')) showAppointment();
  if (event.target.closest('#profileSwitch')) showRoleSwitcher();
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
document.getElementById('modalClose').addEventListener('click', closeModal);
document.querySelectorAll('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelectorAll('.filter-chip').forEach(item => item.classList.remove('selected')); chip.classList.add('selected');
  const category = chip.textContent.trim();
  document.querySelectorAll('.record-item').forEach(item => {
    const type = item.dataset.recordType;
    item.hidden = category === '全部' ? false : category === '检查报告' ? type !== '检查报告' : type !== '用药记录';
  });
}));
displayToday(); renderRole(); renderRecords(); navigate(state.currentRole === 'escort' ? 'escort' : 'home');
setInterval(checkMedicationReminders, 60000);
setTimeout(checkMedicationReminders, 1500);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
