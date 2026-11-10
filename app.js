const STORAGE_KEY = 'kangban-demo-v7';
let activeStorageKey = STORAGE_KEY;
function dateOffset(days) {
  const date = new Date(); date.setHours(12,0,0,0); date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
const seed = {
  records: [
    { id: 'r1', memberId: 'm1', type: '门诊病历', title: '心内科门诊病历', hospital: '市第一人民医院 · 心内科', date: dateOffset(-3), state: '已核对', icon: '⌂',
      summary: '高血压复诊：近期晨间血压偏高（166/102），调整氨氯地平方案，一周后复测' },
    { id: 'r2', memberId: 'm2', type: '用药记录', title: '日常用药清单', hospital: '家属补充 · 最近核对', date: dateOffset(-5), state: '已核对', icon: '＋',
      summary: '日常用药整理：降压 + 降糖方案核对，二甲双胍随餐服用' },
    { id: 'r3', memberId: 'm1', type: '医疗费用发票', title: '门诊医疗费用发票', hospital: '市第一人民医院 · 收费处', date: dateOffset(-3), state: '已核对', icon: '▤' },
    { id: 'r4', memberId: 'm2', type: '费用明细', title: '住院费用明细清单', hospital: '市第一人民医院 · 住院部', date: dateOffset(-25), state: '已核对', icon: '≣',
      summary: '住院费用结算资料：医保统筹 + 个人账户分段支付' },
    { id: 'r5', memberId: 'm1', type: '出院小结', title: '心内科出院小结', hospital: '市第一人民医院 · 心内科住院部', date: dateOffset(-26), state: '已核对', icon: '⌂',
      summary: '不稳定型心绞痛住院 5 天，出院带药阿司匹林 + 他汀，建议心内科门诊随访' },
    { id: 'r6', memberId: 'm2', type: '门诊病历', title: '内分泌科门诊病历（糖尿病随访）', hospital: '市中医院 · 内分泌科', date: dateOffset(-6), state: '已核对', icon: '⌂',
      summary: '2 型糖尿病随访：空腹血糖 8.2 偏高，二甲双胍加量，控制主食并复查糖化血红蛋白' },
    { id: 'r7', memberId: 'm2', type: '医疗费用发票', title: '门诊医疗费用发票', hospital: '市中医院 · 收费处', date: dateOffset(-6), state: '已核对', icon: '▤' },
    { id: 'r8', memberId: 'm3', type: '疾病诊断证明书', title: '甲状腺结节疾病诊断证明书', hospital: '市第一人民医院 · 甲状腺外科', date: dateOffset(-12), state: '已核对', icon: '⌂',
      summary: '甲状腺结节随访：细针穿刺倾向良性，建议 6 个月后超声复查' },
    { id: 'r9', memberId: 'm4', type: '外伤门诊病历', title: '外伤门诊病历（左踝扭伤）', hospital: '区人民医院 · 急诊外科', date: dateOffset(-4), state: '已核对', icon: '⌂',
      summary: '打篮球致左踝扭伤：X 光未见骨折，软组织损伤，冰敷制动 + 外用止痛药，一周后复诊',
      ocrText: '患者自述打篮球时左踝扭伤，外踝肿胀、压痛明显，前抽屉试验阴性。X 光：左踝未见明确骨折征象。诊断：左踝软组织损伤。处理：休息冰敷，外用双氯芬酸二乙胺乳胶剂，一周后复诊。' },
    { id: 'r10', memberId: 'm4', type: '医疗费用发票', title: '急诊医疗费用发票', hospital: '区人民医院 · 收费处', date: dateOffset(-4), state: '已核对', icon: '▤' },
    { id: 'r11', memberId: 'm4', type: '费用明细', title: '急诊费用明细清单', hospital: '区人民医院 · 收费处', date: dateOffset(-4), state: '已核对', icon: '≣' },
  ],
  companionOrders: [],
  /* 需求区帖子（FR-12）：家庭发布 → 陪诊师接单 → 转入标准陪诊订单 */
  demandPosts: [
    { id: 'dp-1', patient: '周建国', patientMemberId: 'm2', requester: '周晓林', hospital: '市第一人民医院', date: dateOffset(6), service: '检查陪同', need: '父亲做腹部 B 超和空腹抽血，需要有人陪同引导路线、协助取报告', budget: '150–200 元', status: '招募中', createdAt: '演示数据' },
    { id: 'dp-2', patient: '陈兰英', patientMemberId: 'm1', requester: '周晓东', hospital: '市中医院', date: dateOffset(9), service: '取药与报告', need: '代取上周检查报告，顺便帮妈妈带一个月的降压药', budget: '面议', status: '招募中', createdAt: '演示数据' }
  ],
  /* 本次任务分享码（FR-10）：家庭生成 → 陪诊师输入查看，短时效、可撤销、留痕 */
  taskShares: [],
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
  alerts: [],
  missedAlerts: {},
  nextAlertId: 1,
  alertsSeeded: false,
  /* 预警来源开关：设备类默认关（未接入设备），由设备管理里的接入开关联动点亮 */
  alertSources: { device: false, missedDose: true, checkup: true, manual: true },
  /* 设备注册表：首页「设备预警」区块仅在任一设备接入后显示；真机接入后此处换成真实绑定 */
  devices: { glucose: false, bp: false, watch: false },
  familyMembers: [
    { id: 'm1', name: '陈兰英', role: '母亲', age: 68, conditions: '高血压', allergies: '青霉素', medications: '氨氯地平 5mg · 每日一次；阿司匹林 100mg · 每日一次', surgeries: '无记录', avatarClass: 'member-avatar-1' },
    { id: 'm2', name: '周建国', role: '父亲', age: 71, conditions: '2型糖尿病 · 高血压', allergies: '无已知过敏', medications: '二甲双胍 0.5g · 每日两次', surgeries: '2019年 白内障手术', avatarClass: 'member-avatar-2' },
    { id: 'm3', name: '周晓林', role: '女儿', age: 38, conditions: '无慢性病', allergies: '花粉过敏', medications: '无需长期用药', surgeries: '无记录', avatarClass: 'member-avatar-3' },
    { id: 'm4', name: '周晓东', role: '儿子', age: 42, conditions: '高血脂 · 超重', allergies: '无已知过敏', medications: '阿托伐他汀 20mg · 每晚一次', surgeries: '无记录', avatarClass: 'member-avatar-4' }
  ],
  currentMemberId: 'm1',
  nextMetricId: 37,
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
    { id: 'bm-22', memberId: 'm1', metric: '收缩压', value: 152, unit: 'mmHg', date: dateOffset(-2), time: '08:10', source: '手动录入', channel: 'daily' },
    { id: 'bm-23', memberId: 'm1', metric: '舒张压', value: 94, unit: 'mmHg', date: dateOffset(-2), time: '08:10', source: '手动录入', channel: 'daily' },
    { id: 'bm-24', memberId: 'm1', metric: '收缩压', value: 149, unit: 'mmHg', date: dateOffset(-1), time: '08:05', source: '模拟手表', channel: 'daily' },
    { id: 'bm-25', memberId: 'm1', metric: '舒张压', value: 93, unit: 'mmHg', date: dateOffset(-1), time: '08:05', source: '模拟手表', channel: 'daily' },
    { id: 'bm-26', memberId: 'm1', metric: '收缩压', value: 166, unit: 'mmHg', date: dateOffset(0), time: '07:50', source: '模拟手表', channel: 'daily' },
    { id: 'bm-27', memberId: 'm1', metric: '舒张压', value: 102, unit: 'mmHg', date: dateOffset(0), time: '07:50', source: '模拟手表', channel: 'daily' },
    { id: 'bm-28', memberId: 'm2', metric: '收缩压', value: 148, unit: 'mmHg', date: dateOffset(-3), time: '09:15', source: '欧姆龙血压计', channel: 'daily' },
    { id: 'bm-29', memberId: 'm2', metric: '舒张压', value: 91, unit: 'mmHg', date: dateOffset(-3), time: '09:15', source: '欧姆龙血压计', channel: 'daily' },
    { id: 'bm-30', memberId: 'm2', metric: '收缩压', value: 158, unit: 'mmHg', date: dateOffset(0), time: '08:20', source: '模拟手表', channel: 'daily' },
    { id: 'bm-31', memberId: 'm2', metric: '舒张压', value: 96, unit: 'mmHg', date: dateOffset(0), time: '08:20', source: '模拟手表', channel: 'daily' },
    { id: 'bm-32', memberId: 'm1', metric: '血糖', value: 6.3, unit: 'mmol/L', date: dateOffset(-1), time: '07:20', source: '手动录入', channel: 'daily' },
    { id: 'bm-33', memberId: 'm1', metric: '血氧', value: 97, unit: '%', date: dateOffset(0), time: '07:50', source: '模拟手表', channel: 'daily' },
    { id: 'bm-34', memberId: 'm1', metric: '体重', value: 58.6, unit: 'kg', date: dateOffset(0), time: '07:30', source: '体重秤', channel: 'daily' },
    { id: 'bm-35', memberId: 'm2', metric: '心率', value: 102, unit: '次/分', date: dateOffset(-1), time: '09:15', source: '模拟手表', channel: 'daily' },
    { id: 'bm-36', memberId: 'm2', metric: '血糖', value: 7.9, unit: 'mmol/L', date: dateOffset(0), time: '08:00', source: '血糖仪', channel: 'daily' }
  ],
  insurancePolicies: [
    { id: 'pol-1', memberId: 'm1', type: 'social', name: '深圳市职工医保', company: '深圳市医保局', policyNo: 'DEMO-4403-0001', coverage: '按医保目录', start: '2024-01-01', end: '2026-12-31',
      terms: '医保目录内门诊 / 住院费用按规定比例结算，个人账户或统筹支付。',
      duties: ['普通门诊统筹：社区首诊，年度限额内按比例报销', '住院医疗：目录内费用统筹基金按比例支付，退休人员比例更高', '门诊特定病种：高血压、糖尿病等慢病可申请门特待遇'],
      exclusions: ['非医保目录药品与诊疗项目（自费部分）', '第三方责任、工伤、生育保险支付的情形'],
      hospital: '深圳市医保定点医疗机构', renewal: '按年缴费持续参保即可享受待遇' },
    { id: 'pol-2', memberId: 'm1', type: 'commercial', category: 'medical', name: '好医保·终身防癌医疗险', company: '人保健康（支付宝投保）', policyNo: 'DEMO-COM-2001', coverage: '400 万', start: '2025-03-15', end: '2099-12-31',
      terms: '恶性肿瘤医疗费用 0 免赔、经社保结算后 100% 报销；三高、糖尿病人群可投保。纯体检 / 一般检查不在赔付范围。',
      deductible: '0 免赔', ratio: '经社保结算 100%；未经社保结算 60%', waiting: '90 天', hospital: '二级及以上公立医院普通部',
      duties: ['恶性肿瘤住院医疗费用（床位费、药品费、手术费等）', '恶性肿瘤特殊门诊：放化疗、靶向、免疫治疗等', '质子重离子医疗费用（100% 报销）', '恶性肿瘤院外特定药品费用（清单内，直付）'],
      exclusions: ['非恶性肿瘤原因的住院与门诊费用', '投保前已有疾病及其并发症', '纯体检 / 一般健康检查、司法鉴定类检查', '未在约定医院范围就诊的费用'],
      renewal: '保证续保终身，费率可调整，产品停售不影响已续保期间' },
    { id: 'pol-3', memberId: 'm2', type: 'social', name: '广州市城乡居民医保', company: '广州市医保局', policyNo: 'DEMO-4401-0002', coverage: '按医保目录', start: '2024-01-01', end: '2026-12-31',
      terms: '城乡居民医保住院与门诊待遇按广州医保规定结算。',
      duties: ['住院医疗：目录内费用按医院等级比例支付', '普通门诊统筹：基层首诊按比例报销', '门诊特定病种：糖尿病、高血压等病种限额报销'],
      exclusions: ['非医保目录内项目', '境外就医费用'],
      hospital: '广州市医保定点医疗机构', renewal: '每年 9–12 月集中参保缴费，次年享受待遇' },
    { id: 'pol-4', memberId: 'm2', type: 'commercial', category: 'medical', name: '好医保·终身防癌医疗险', company: '人保健康（支付宝投保）', policyNo: 'DEMO-COM-2002', coverage: '400 万', start: '2025-06-01', end: '2099-12-31',
      terms: '恶性肿瘤医疗费用 0 免赔、经社保结算后 100% 报销；三高、糖尿病人群可投保。',
      deductible: '0 免赔', ratio: '经社保结算 100%；未经社保结算 60%', waiting: '90 天', hospital: '二级及以上公立医院普通部',
      duties: ['恶性肿瘤住院医疗费用', '恶性肿瘤特殊门诊：放化疗、靶向治疗等', '质子重离子医疗费用', '恶性肿瘤院外特定药品费用（清单内）'],
      exclusions: ['非恶性肿瘤原因的医疗费用', '投保前已有疾病及其并发症', '纯体检 / 一般健康检查'],
      renewal: '保证续保终身，费率可调整' },
    { id: 'pol-5', memberId: 'm3', type: 'social', name: '广州市职工医保', company: '广州市医保局', policyNo: 'DEMO-4401-0003', coverage: '按医保目录', start: '2023-07-01', end: '2026-12-31',
      terms: '职工医保门诊 / 住院按规定比例结算，个人账户支付门诊费用。',
      duties: ['普通门诊：选点就医按比例报销', '住院医疗：目录内费用统筹支付', '门诊特定病种待遇'],
      exclusions: ['非医保目录内项目'],
      hospital: '广州市医保定点医疗机构', renewal: '随单位按月缴费' },
    { id: 'pol-6', memberId: 'm3', type: 'commercial', category: 'medical', name: '好医保·长期医疗险（20年版）', company: '人保健康（支付宝投保）', policyNo: 'DEMO-COM-2004', coverage: '一般医疗 200 万 · 重疾医疗 400 万', start: '2025-01-10', end: '2045-01-09',
      terms: '一般医疗及重疾医疗费用，经社保结算后 100% 报销，免赔额 1 万（重疾 0 免赔）；20 年保证续保。',
      deductible: '一般医疗 1 万/年；重疾医疗 0 免赔', ratio: '经社保结算 100%；未经社保结算 60%', waiting: '90 天', hospital: '二级及以上公立医院普通部',
      duties: ['一般住院医疗费用（200 万）', '121 种重大疾病住院医疗费用（400 万）', '特殊门诊：门诊肾透析、门诊恶性肿瘤治疗等', '住院前 7 天后 30 天门急诊费用', '质子重离子医疗（100% 报销）'],
      exclusions: ['投保前已有疾病及其并发症', '牙科、视力矫正等非疾病治疗项目', '疗养、康复、体检类费用', '同一张发票不可在社保与商业险重复报销原件'],
      renewal: '20 年保证续保，期满经保险公司审核后续保新版产品' },
    { id: 'pol-7', memberId: 'm3', type: 'commercial', category: 'critical', name: '健康福·重疾险1号（一年期）', company: '人保健康（支付宝投保）', policyNo: 'DEMO-COM-2005', coverage: '重疾给付 30 万', start: '2025-01-01', end: '2026-12-31',
      terms: '确诊 120 种重大疾病中的一种即一次性给付保额；给付型，与医疗费报销不冲突。',
      waiting: '90 天',
      duties: ['120 种重大疾病：确诊即一次性给付基本保额', '40 种轻症：给付 30% 基本保额', '重疾赔付后轻症责任继续有效'],
      exclusions: ['等待期内确诊的重大疾病', '投保前已患疾病及其并发症', '遗传性疾病、先天性畸形、变形或染色体异常'],
      renewal: '一年期产品，续保需重新健康告知与核保' },
    { id: 'pol-8', memberId: 'm4', type: 'social', name: '广州市职工医保', company: '广州市医保局', policyNo: 'DEMO-4401-0004', coverage: '按医保目录', start: '2022-04-01', end: '2026-12-31',
      terms: '职工医保门诊 / 住院按规定比例结算。',
      duties: ['普通门诊：选点就医按比例报销', '住院医疗：目录内费用统筹支付'],
      exclusions: ['非医保目录内项目'],
      hospital: '广州市医保定点医疗机构', renewal: '随单位按月缴费' },
    { id: 'pol-9', memberId: 'm4', type: 'commercial', category: 'medical', name: '好医保·住院医疗（2020版）', company: '众安保险（支付宝投保）', policyNo: 'DEMO-COM-2006', coverage: '300 万', start: '2025-02-01', end: '2027-01-31',
      terms: '疾病或意外住院医疗费用，经社保结算后 100% 报销，免赔额 1 万。',
      deductible: '1 万/年', ratio: '经社保结算 100%；未经社保结算 60%', waiting: '30 天', hospital: '二级及以上公立医院普通部',
      duties: ['住院医疗费用（疾病或意外）', '特殊门诊医疗费用', '住院前后门急诊费用', '恶性肿瘤院外特定药品费用'],
      exclusions: ['投保前已有疾病及其并发症', '非处方自行购药费用', '整形美容、不孕不育治疗'],
      renewal: '6 年保证续保，期满经审核续保' },
    { id: 'pol-10', memberId: 'm4', type: 'commercial', category: 'accident', name: '无忧保·综合意外险', company: '众安保险（支付宝投保）', policyNo: 'DEMO-COM-2007', coverage: '意外身故/伤残 50 万 · 意外医疗 2 万', start: '2025-01-01', end: '2027-01-01',
      terms: '意外身故 / 伤残一次性给付 + 意外门急诊、住院医疗费用报销（0 免赔，社保内 100%）。猝死不属于意外。',
      deductible: '意外医疗 0 免赔', ratio: '意外医疗：社保内 100%；未经社保 80%', waiting: '无（投保次日生效）', hospital: '二级及以上公立医院',
      duties: ['意外身故：一次性给付 50 万', '意外伤残：按 1–10 级伤残比例给付', '意外门急诊与住院医疗费用报销', '意外住院津贴 50 元/天（单次限 90 天）'],
      exclusions: ['猝死（不属于意外伤害）', '高风险运动：潜水、攀岩、赛车等', '酒驾、无证驾驶', '既往疾病导致的伤害'],
      renewal: '一年期，到期自动续保扣费（可关闭）' }
  ],
  reimbursements: [
    { id: 'claim-1', memberId: 'm1', policyId: 'pol-2', recordId: 'r1', scene: '门诊治疗', createdAt: dateOffset(-2), status: '整理中', materials: [
      { label: '理赔申请书（保险公司模板）', done: false },
      { label: '医疗费用发票原件', done: false },
      { label: '费用明细清单', done: true },
      { label: '病历及检查报告（门诊病历已入库）', done: true },
      { label: '被保险人身份证复印件', done: false },
      { label: '受益人银行账户信息', done: false }
    ] },
    { id: 'claim-2', memberId: 'm4', policyId: 'pol-10', recordId: 'r9', scene: '意外伤害治疗', createdAt: dateOffset(-3), status: '整理中', materials: [
      { label: '理赔申请书（保险公司模板）', done: false },
      { label: '意外事故经过说明', done: false },
      { label: '门诊病历及X光 / 检查报告（外伤病历已入库）', done: true },
      { label: '医疗费用发票原件', done: false },
      { label: '费用明细清单', done: false },
      { label: '被保险人身份证复印件', done: false }
    ] }
  ],
  nextClaimId: 3,
  nextPolicyId: 11
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
let communityFilter = 'all';
let communityRegion = 'all';
let communityPostCache = [];
let cloudOrderCache = new Map();
let cloudEvidenceTarget = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(activeStorageKey) || '{}');
    const loaded = { ...seed, ...saved };
    loaded.currentRole = saved.currentRole === 'escort' ? 'escort' : 'family';
    loaded.companionProfile = { ...seed.companionProfile, ...(saved.companionProfile || {}) };
    loaded.companionOrders = (saved.companionOrders || []).map((order, index) => ({
      ...order,
      id: order.id || `legacy-order-${index}`,
      status: order.status || 'pending',
      patient: order.patient || '陈兰英',
      requester: order.requester || '小林',
      source: order.source || 'family',
      patientMemberId: order.patientMemberId || 'm1',
      price: Number(order.price ?? 0),
      reviews: order.reviews || { family: null, escort: null }
    }));
    loaded.demandPosts = Array.isArray(saved.demandPosts) ? saved.demandPosts.map((post, index) => ({
      ...post,
      id: post.id || `legacy-dp-${index}`,
      status: post.status || '招募中',
      service: post.service || '全程陪诊',
      budget: post.budget || ''
    })) : structuredClone(seed.demandPosts);
    loaded.taskShares = Array.isArray(saved.taskShares) ? saved.taskShares.map(share => ({ ...share, accessLogs: Array.isArray(share.accessLogs) ? share.accessLogs : [] })) : [];
    loaded.metricDefs = saved.metricDefs || {};
    loaded.familyMembers = saved.familyMembers || structuredClone(seed.familyMembers);
    loaded.bodyMetrics = saved.bodyMetrics || structuredClone(seed.bodyMetrics);
    loaded.currentMemberId = saved.currentMemberId || 'm1';
    loaded.nextMetricId = saved.nextMetricId || 37;
    loaded.customReminders = Array.isArray(saved.customReminders) ? saved.customReminders.map(reminder => ({ ...reminder, memberId: reminder.memberId === 'member-mom' || !reminder.memberId ? 'm1' : reminder.memberId })) : [];
    loaded.reminderLogs = saved.reminderLogs && typeof saved.reminderLogs === 'object' ? saved.reminderLogs : {};
    loaded.reminderNotified = saved.reminderNotified && typeof saved.reminderNotified === 'object' ? saved.reminderNotified : {};
    loaded.measurementRecords = Array.isArray(saved.measurementRecords) ? saved.measurementRecords : [];
    /* 旧版本预警没有生命周期字段，补默认值（默认视为未处理，可在预警中心处理归档） */
    loaded.alerts = (saved.alerts || []).map(alert => ({ status: 'open', times: 1, ackedAt: '', resolvedAt: '', resolvedNote: '', dedupKey: '', memberName: '', ...alert }));
    loaded.alertSources = { device: false, missedDose: true, checkup: true, manual: true, ...(saved.alertSources || {}) };
    loaded.devices = { glucose: false, bp: false, watch: false, ...(saved.devices || {}) };
    loaded.missedAlerts = saved.missedAlerts || {};
    loaded.nextAlertId = saved.nextAlertId || 1;
    loaded.insurancePolicies = saved.insurancePolicies || structuredClone(seed.insurancePolicies);
    loaded.nextPolicyId = saved.nextPolicyId || 8;
    loaded.reimbursements = Array.isArray(saved.reimbursements) ? saved.reimbursements : structuredClone(seed.reimbursements);
    loaded.nextClaimId = saved.nextClaimId || 2;
    return loaded;
  } catch { return structuredClone(seed); }
}
let workspaceSaveTimer = null;
function saveState() {
  const snapshot = JSON.stringify(state);
  localStorage.setItem(activeStorageKey, snapshot);
  const auth = window.KangbanAuth;
  if (auth?.mode === 'cloud' && auth.session?.familyId) {
    clearTimeout(workspaceSaveTimer);
    workspaceSaveTimer = setTimeout(() => window.KangbanAPI.saveFamilyWorkspace(auth.session.familyId, state).catch(error => toast(`云端保存失败：${error.message || error}`)), 300);
  }
}
function attachmentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kangban-demo-attachments', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function putAttachment(id, file) {
  if (!file) return { cloudSaved: false, localSaved: false };
  const auth = window.KangbanAuth;
  let cloudSaved = false;
  let localSaved = false;
  if (auth?.mode === 'cloud') {
    const familyId = auth.session?.familyId;
    if (auth.role !== 'family' || !familyId) throw new Error('只有已登录的家庭账号可以上传家庭附件。');
    const path = `${familyId}/attachments/${encodeURIComponent(id)}-${encodeURIComponent(file.name || 'attachment')}`;
    await window.KangbanAPI.uploadPrivateFile(file, path);
    state.cloudAttachmentPaths = { ...(state.cloudAttachmentPaths || {}), [id]: path };
    cloudSaved = true;
  }
  if ('indexedDB' in window) {
    let db;
    try {
      db = await attachmentDb();
      await new Promise((resolve, reject) => {
        const request = db.transaction('files', 'readwrite').objectStore('files').put({ id, name: file.name, type: file.type, blob: file, savedAt: new Date().toISOString() });
        request.onsuccess = resolve; request.onerror = () => reject(request.error);
      });
      localSaved = true;
    } catch (error) {
      // A cloud copy is still usable when the browser blocks local IndexedDB storage.
      if (!cloudSaved) throw error;
    } finally { db?.close(); }
  } else if (!cloudSaved) throw new Error('当前浏览器不支持本机附件存储。');
  if (auth?.mode === 'cloud') saveState();
  return { cloudSaved, localSaved };
}
async function persistWorkspaceNow() {
  clearTimeout(workspaceSaveTimer);
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud' || !auth.session?.familyId) return { cloudSaved: false };
  await window.KangbanAPI.saveFamilyWorkspace(auth.session.familyId, state);
  return { cloudSaved: true };
}
async function getAttachment(id) {
  const auth = window.KangbanAuth;
  if (auth?.mode === 'cloud') {
    const path = state.cloudAttachmentPaths?.[id];
    if (!path) return null;
    const blob = await window.KangbanAPI.downloadPrivateFile(path);
    let name = path.split('/').pop() || '云端附件';
    const prefix = `${encodeURIComponent(id)}-`;
    if (name.startsWith(prefix)) name = name.slice(prefix.length);
    try { name = decodeURIComponent(name); } catch { /* keep the stored filename */ }
    return { id, name, type: blob.type || '', blob, cloud: true };
  }
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
function appointmentLabel(member) {
  const visit = new Date(); visit.setHours(12,0,0,0); visit.setDate(visit.getDate()+4);
  return `${visit.getMonth()+1}月${visit.getDate()}日 · ${member ? esc(member.name) : '心内科'}复诊`;
}
/* 就诊准备清单公共定义与进度（清单全部勾选后才可生成就诊分享码） */
const APPOINTMENT_ITEMS = [
  ['idCard', '医保卡与身份证', '就诊时出示'],
  ['reports', '近期检查报告', '血常规、心电图等资料'],
  ['medicines', '当前用药清单', '可带药盒或核对档案'],
  ['questions', '想问医生的问题', '提前记下最关心的几件事'],
  ['selfDescription', '诊前自我描述', '记录近期症状、变化、饮食和生活情况']
];
/* 清单勾选状态：早期全局 appointmentChecks 作为基线，按成员勾选覆盖。
   早前两套状态源互斥（byMember 一旦有值就丢掉全局默认），会导致 UI 显示 5/5、闸门却只算到 4 项 */
function memberChecks(memberId) {
  return { ...(state.appointmentChecks || {}), ...((state.appointmentChecksByMember || {})[memberId] || {}) };
}
function appointmentProgress(member) {
  const checks = memberChecks(member.id);
  return APPOINTMENT_ITEMS.filter(([key]) => key === 'selfDescription' ? (checks[key] || preVisitEntries(member.id).length > 0) : checks[key]).length;
}
function displayToday() {
  const now = new Date();
  document.getElementById('todayLabel').textContent = `${now.getMonth()+1}月${now.getDate()}日 · 家庭健康档案`;
}
function renderRecords() {
  const sorted = [...state.records].sort((a,b) => b.date.localeCompare(a.date));
  /* 资料库已下沉进医疗资料 Tab 的成员块（renderDocs）；这里只维护首页时间线 */
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
      ${['pending','accepted'].includes(o.status) ? `<button class="text-button" data-task-share="${esc(o.id)}">生成本次任务分享码 →</button>` : ''}
      ${exec}
      ${o.status === 'completed' && o.serviceReport ? `<section class="service-report-card"><div class="service-report-heading"><strong>陪诊反馈</strong><small>${esc(o.serviceReport.submittedAt || '')} · ${esc(o.providerName || state.companionProfile.name)}</small></div><p><b>服务情况</b>${esc(o.serviceReport.summary)}</p>${o.serviceReport.followUp ? `<p><b>后续待办</b>${esc(o.serviceReport.followUp)}</p>` : ''}<p><b>离院交接</b>${esc(o.serviceReport.handoff)}</p>${o.serviceReport.nextVisitDate ? `<p><b>下次复诊</b>${formatDate(o.serviceReport.nextVisitDate)}${o.serviceReport.nextVisitNote ? ` · ${esc(o.serviceReport.nextVisitNote)}` : ''} · 已自动创建家庭提醒</p>` : ''}${o.serviceReport.needsFamily ? '<div class="service-report-alert">陪诊员标记需要家属跟进，请尽快联系患者或陪诊员确认。</div>' : ''}<small class="privacy-small">陪诊过程记录仅供家庭沟通参考；诊疗和用药安排请以医院原始资料为准。</small></section>` : ''}
      ${o.status === 'completed' && !o.reviews?.family ? `<button class="text-button" data-order-review="${esc(o.id)}" data-review-role="family">评价本次陪诊 →</button>` : ''}
      ${o.status === 'completed' && o.reviews?.family ? `<small class="review-complete">你已完成评价${o.reviews?.escort ? ' · 双方已互评' : ' · 等待陪诊员评价'}</small>` : ''}${reviewSummary(o)}
      ${(o.status === 'completed' || o.status === 'declined') ? `<button class="text-button" data-rebook="${esc(o.id)}">再次预约 →</button>` : ''}
    </article>`;
  }).join('')}</div>` : `<div class="family-empty-card"><p>还没有陪诊预约。可以先查看陪诊员介绍并提交一笔演示预约。</p><button class="primary-button" data-action="book-profile">预约陪诊员</button></div>`}</div></div>`;
  renderMedicationReminders();
  updateHero();
  renderHomeTodayBar();
  renderHomeTodo(homeTodoItems());
  renderHomeMemberStrip();
  renderHomeCompanionModule();
  renderHealth();
  renderDocs();
  renderCompanionViews();
}

/* ============ 健康档案 Tab（FR-01：模拟账号 · 四人档案 · 体检看板） ============ */
const METRIC_DEFS = {
  '体重': { unit: 'kg' },
  'BMI': { unit: '', low: 18.5, high: 24 },
  '空腹血糖': { unit: 'mmol/L', low: 3.9, high: 6.1 },
  '血糖': { unit: 'mmol/L', low: 3.9, high: 6.1 },
  '收缩压': { unit: 'mmHg', low: 90, high: 139 },
  '舒张压': { unit: 'mmHg', low: 60, high: 89 },
  '心率': { unit: '次/分', low: 60, high: 100 },
  '血氧': { unit: '%', low: 95 },
  '体温': { unit: '℃', low: 35.5, high: 37.3 },
  '总胆固醇': { unit: 'mmol/L', high: 5.2 },
  '尿酸': { unit: 'μmol/L', low: 208, high: 428 }
};
/* 日常录入常用指标（一键加行 / AI 联想） */
const DAILY_METRICS = ['血压', '血糖', '心率', '血氧', '体重', '体温', '尿酸'];
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
  const abnormal = Object.values(byMetric).filter(entry => metricStatus(entry.metric, entry.value) !== 'normal');
  /* 血压对合并：同一时刻的收缩压+舒张压都异常时合并为一条「血压 166/102」，与日常记录展示口径一致，同一读数不重复出现 */
  const sys = abnormal.find(entry => entry.metric === '收缩压');
  const dia = abnormal.find(entry => entry.metric === '舒张压');
  if (sys && dia && sys.date === dia.date && (sys.time || '') === (dia.time || '')) {
    return abnormal.filter(entry => entry !== sys && entry !== dia).concat([{ ...sys, metric: '血压', value: `${sys.value}/${dia.value}`, unit: 'mmHg' }]);
  }
  return abnormal;
}
/* 合并血压行（metric='血压', value='166/102'）的判定与展示 */
function bpReadingState(value) {
  const [sys, dia] = String(value).split('/').map(Number);
  const abnormal = sys >= 140 || dia >= 90;
  const level = sys >= 180 || dia >= 110 ? 'red' : sys >= 160 || dia >= 100 ? 'yellow' : 'blue';
  return { abnormal, level, label: abnormal ? '需要关注' : '正常', tag: abnormal ? 'reading-tag-yellow' : 'reading-tag-ok' };
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

/* 长列表预览通用结构：默认只显示一条，可展开/收起（原则：涉及长的都可伸缩折叠） */
function previewRows(rows, key) {
  const open = previewOpen.has(key);
  const visible = open ? rows : rows.slice(0, 1);
  const toggle = rows.length > 1 ? `<button class="text-button preview-toggle" data-preview-toggle="${key}">${open ? '收起 ⌃' : `展开全部 ${rows.length} 条 ⌄`}</button>` : '';
  return `${visible.join('')}${toggle}`;
}

function renderHealth() {
  const host = document.getElementById('memberArchiveList');
  if (host) {
    host.innerHTML = state.familyMembers.map(member => {
      const open = expandedMembers.has(member.id);
      const entries = memberMetricEntries(member.id);
      const tracking = latestAbnormal(member.id);
      const trackRows = tracking.map(entry => {
        if (entry.metric === '血压') {
          const bp = bpReadingState(entry.value);
          return `<div class="track-row"><div><strong>血压 ${esc(String(entry.value))} <small>mmHg</small></strong><small>${formatDate(entry.date)} 录入 · 收缩压<140 且舒张压<90 为正常</small></div><span class="reading-tag ${bp.tag}">跟踪中</span></div>`;
        }
        return `<div class="track-row"><div><strong>${esc(entry.metric)} ${entry.value} ${esc(entry.unit || '')}</strong><small>${formatDate(entry.date)} 录入 · ${refText(entry.metric)}</small></div><span class="reading-tag ${statusTagOf(entry.value, entry.metric)}">跟踪中</span></div>`;
      });
      const trackingHtml = tracking.length
        ? `<div class="member-tracking"><span class="member-tracking-title">异常指标跟踪 · 共 ${tracking.length} 项</span>${previewRows(trackRows, `track-${member.id}`)}</div>`
        : `<p class="member-tracking-empty">无异常指标，继续保持 ✓</p>`;
      /* 日常记录列表收敛到底部【日常记录】按钮（弹窗内查看完整列表+录入），卡内不再重复展示 */
      return `<article class="member-archive ${open ? 'is-open' : ''}">
        <button class="member-archive-head" data-member-toggle="${member.id}" aria-expanded="${open}">
          <span class="member-avatar ${member.avatarClass}">${esc(member.name.slice(0, 1))}</span>
          <div class="member-archive-title"><strong>${esc(member.name)}</strong><small>${esc(member.role)} · ${member.age != null && member.age !== '' ? `${member.age}岁` : '年龄未填写'} · ${entries.length} 条指标${tracking.length ? ` · <b class="member-alert-count">${tracking.length} 项异常跟踪</b>` : ' · 无异常'}</small></div>
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
          <div class="member-archive-actions">
            <button class="primary-button member-dashboard-button" data-member-dashboard="${member.id}">数据看板（日常记录 + 体检单）</button>
          </div>
          <div class="member-archive-actions member-archive-actions-3">
            <button class="secondary-button" data-member-edit="${member.id}">编辑档案</button>
            <button class="secondary-button" data-member-daily="${member.id}">日常记录</button>
            <button class="secondary-button" data-checkup-import="${member.id}">导入体检单</button>
          </div>
        </div>` : ''}
      </article>`;
    }).join('');
  }
}

function showFamilyMemberAdd() {
  const cloudFamily = window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth?.role === 'family';
  const saveNote = cloudFamily
    ? '只填写你愿意在家庭档案中共同维护的信息；保存后会同步到当前家庭云端。'
    : '只填写你愿意在家庭档案中共同维护的信息。本机演示内容保存在当前浏览器；登录家庭账号后可同步至家庭空间。';
  openModal(`${modalHead('家庭健康档案', '新增家庭成员', '新成员加入后，可单独维护健康档案，并在医疗资料和陪诊预约中选择。年龄与健康信息可稍后补充。')}
    <form class="member-edit-form" id="familyMemberAddForm">
      <label><span class="field-label-block">姓名</span><input class="input-field" name="name" maxlength="40" required placeholder="请输入姓名" /></label>
      <label><span class="field-label-block">与家庭关系</span><input class="input-field" name="role" maxlength="20" required placeholder="例如：父亲、女儿" /></label>
      <label><span class="field-label-block">年龄（选填）</span><input class="input-field" name="age" type="number" min="0" max="120" inputmode="numeric" placeholder="请输入年龄" /></label>
      <label><span class="field-label-block">慢病情况（选填）</span><input class="input-field" name="conditions" maxlength="200" placeholder="例如：高血压" /></label>
      <label><span class="field-label-block">过敏史（选填）</span><input class="input-field" name="allergies" maxlength="200" placeholder="例如：青霉素过敏；不清楚可填写未知" /></label>
      <label><span class="field-label-block">长期用药（选填）</span><input class="input-field" name="medications" maxlength="300" placeholder="药名及用法，按医嘱填写" /></label>
      <label><span class="field-label-block">手术史（选填）</span><input class="input-field" name="surgeries" maxlength="200" placeholder="无手术史可填写无" /></label>
      <button class="primary-button" type="submit">保存并加入家庭</button>
    </form><p class="privacy-small">${saveNote}</p>`);
  const form = document.getElementById('familyMemberAddForm');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    const values = new FormData(form);
    const name = String(values.get('name') || '').trim();
    const role = String(values.get('role') || '').trim();
    const ageText = String(values.get('age') || '').trim();
    const age = ageText ? Number(ageText) : null;
    if (!name || !role || (age !== null && (!Number.isInteger(age) || age < 0 || age > 120))) {
      toast('请填写姓名和家庭关系；年龄须为 0–120 的整数。');
      if (submit) submit.disabled = false;
      return;
    }
    const id = `member-${rootCryptoId()}`;
    const member = {
      id, name, role, age,
      conditions: String(values.get('conditions') || '').trim(),
      allergies: String(values.get('allergies') || '').trim(),
      medications: String(values.get('medications') || '').trim(),
      surgeries: String(values.get('surgeries') || '').trim(),
      avatarClass: `member-avatar-${(state.familyMembers.length % 4) + 1}`
    };
    const auth = window.KangbanAuth;
    let cloudRow = null;
    try {
      if (auth?.mode === 'cloud') {
        if (!auth.session?.familyId) throw new Error('家庭空间尚未建立，请重新登录后再试。');
        cloudRow = await window.KangbanAPI.insert('family_members', {
          family_id: auth.session.familyId,
          legacy_id: member.id,
          name: member.name,
          relationship: member.role,
          age: member.age,
          health_profile: { conditions: member.conditions, allergies: member.allergies, medications: member.medications, surgeries: member.surgeries },
          display_order: state.familyMembers.length
        });
      }
      state.familyMembers.push(member);
      state.currentMemberId = member.id;
      expandedMembers.add(member.id);
      saveState();
      if (auth?.mode === 'cloud' && auth.session?.familyId) {
        clearTimeout(workspaceSaveTimer);
        await window.KangbanAPI.saveFamilyWorkspace(auth.session.familyId, state);
      }
      renderHealth(); renderDocs(); renderRole(); closeModal();
      toast(`${name}已加入家庭`);
    } catch (error) {
      state.familyMembers = state.familyMembers.filter(item => item.id !== member.id);
      expandedMembers.delete(member.id);
      saveState();
      if (cloudRow?.id) window.KangbanAPI.remove('family_members', cloudRow.id).catch(() => {});
      if (submit) submit.disabled = false;
      toast(`添加失败：${error.message || error}`);
    }
  });
}

function rootCryptoId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
    <p class="privacy-small">演示版：数值可修改后入库；异常仅为范围提示，不做真实医疗判断。导入体检单请回成员卡点「导入体检单」。</p>`);
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
    saveState(); renderHealth();
    if (histEditContext === 'daily') { showDailyLog(entry.memberId); } else { showMemberDashboard(entry.memberId); }
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
      state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId, metric: row.metric, value: row.value, unit: row.unit, date: dateOffset(0), source: '体检导入', category: row.category, channel: 'checkup' });
    });
    saveState(); renderHealth(); closeModal();
    const abnormal = edited.filter(row => checkupRowStatus(row, row.value) !== 'normal');
    toast(`已导入 ${edited.length} 项指标${learned ? `（新登记 ${learned} 项指标范围）` : ''}${abnormal.length ? `，${abnormal.length} 项异常进入跟踪` : '，全部正常'}`);
    if (abnormal.length && state.alertSources?.checkup !== false) {
      createAlert('blue', '体检指标异常已入库', `${member.name}本次体检 ${abnormal.map(row => `${row.metric} ${row.value}${row.unit || ''}（${tagLabel(checkupRowStatus(row, row.value))}）`).join('、')}，超出参考范围，已进入异常指标跟踪，建议下次复查关注。`, '体检导入 · 异常跟踪', `${member.id}|体检|${dateOffset(0)}`, member.name);
    }
    showMemberDashboard(memberId);
  });
}

/* ============ 保险报销 · 家庭成员保险档案（成员B负责模块） ============ */
const POLICY_TYPE_LABEL = { social: '社保医保', commercial: '商业保险' };
/* 险种分类标签（商业险细分） */
const POLICY_CATEGORY_LABEL = { social: '社保医保', medical: '医疗险', critical: '重疾险', accident: '意外险' };
/* ============ 报销联动引擎：医疗资料 → 自动匹配保单 + 材料清单（FR-07 演示） ============ */
const CLAIM_MATERIALS = {
  social: ['医疗费用发票原件', '费用明细清单', '门诊病历或诊断证明', '社保卡 / 身份证复印件', '本人银行账户信息'],
  medical: ['理赔申请书（保险公司模板）', '医疗费用发票原件', '费用明细清单', '病历及检查报告', '被保险人身份证复印件', '受益人银行账户信息'],
  critical: ['理赔申请书（保险公司模板）', '疾病诊断证明书原件', '病理检查 / 化验报告', '被保险人身份证复印件', '受益人银行账户信息'],
  accident: ['理赔申请书（保险公司模板）', '意外事故经过说明', '门诊病历及X光 / 检查报告', '医疗费用发票原件', '费用明细清单', '被保险人身份证复印件']
};
const RECORD_SCENE = {
  '门诊病历': '门诊治疗',
  '就诊资料': '门诊就诊',
  '检查报告': '门诊检查 / 化验',
  '用药记录': '门诊用药',
  '出院小结': '住院治疗',
  '疾病诊断证明书': '重大疾病确诊',
  '外伤门诊病历': '意外伤害治疗',
  '医疗费用发票': '医疗费用结算',
  '费用明细': '医疗费用结算'
};
/* 各资料类型可触发的报销通道：纯检查 / 体检报告无费用票据，仅走医保；
   重疾险按「疾病诊断证明书」触发（确诊给付型）；意外险按「外伤门诊病历」触发 */
const RECORD_CHANNELS = {
  '检查报告': ['social'],
  '疾病诊断证明书': ['critical'],
  '外伤门诊病历': ['accident']
};
function policyChannel(policy) {
  return policy.type === 'social' ? 'social' : (policy.category || 'medical');
}
function policyChip(policy) {
  const cat = policyChannel(policy);
  return `<span class="policy-type policy-type-${cat}">${POLICY_CATEGORY_LABEL[cat] || POLICY_TYPE_LABEL[policy.type] || '保险'}</span>`;
}
/* 某成员在某日期可用（生效中）的保单 */
function activePoliciesAt(memberId, date) {
  const today = dateOffset(0);
  return (state.insurancePolicies || []).filter(policy => policy.memberId === memberId
    && (!policy.start || policy.start <= (date || today))
    && (!policy.end || policy.end >= (date || today)));
}
/* 资料录入后自动检索：符合什么报销条件 → 可用保单 + 对应材料清单（按险种通道过滤） */
function matchReimbursements(record) {
  const scene = RECORD_SCENE[record.type] || '门诊就诊';
  const channels = RECORD_CHANNELS[record.type] || ['social', 'medical'];
  return activePoliciesAt(record.memberId, record.date)
    .filter(policy => channels.includes(policyChannel(policy)))
    .map(policy => ({
      policy,
      scene,
      materials: CLAIM_MATERIALS[policyChannel(policy)] || CLAIM_MATERIALS.social
    }));
}
/* 报销提醒：录入资料后自动检索 → 命中即自动开启提醒（同一资料 + 同一保单只开一次） */
function showReimbursementMatches(record) {
  const member = state.familyMembers.find(item => item.id === record.memberId);
  const matches = matchReimbursements(record);
  if (!matches.length) {
    toast(`${member?.name || '该成员'}名下没有在此日期生效、且覆盖该资料类型的保单，暂无报销匹配`);
    return;
  }
  matches.forEach(({ policy, scene, materials }) => {
    const exists = (state.reimbursements || []).some(claim => claim.recordId === record.id && claim.policyId === policy.id);
    if (exists) return;
    state.reimbursements.push({
      id: `claim-${state.nextClaimId++}`,
      memberId: record.memberId,
      policyId: policy.id,
      recordId: record.id,
      scene,
      createdAt: dateOffset(0),
      status: '整理中',
      materials: materials.map(label => ({ label, done: /病历|诊断证明|检查报告/.test(label) && ['门诊病历', '出院小结', '疾病诊断证明书', '外伤门诊病历'].includes(record.type) }))
    });
  });
  saveState(); renderDocs();
  const blocks = matches.map(({ policy, scene, materials }, index) => {
    const st = policyStateOf(policy);
    return `<div class="claim-match-block">
      <div class="claim-match-head">${policyChip(policy)}<strong>${esc(policy.name)}</strong><span class="reading-tag ${st.tag}">${st.label}</span></div>
      <small class="claim-match-scene">报销条件匹配：${esc(scene)} · ${esc(member?.name || '')} · ${formatDate(record.date)}${policy.coverage ? ` · 保额 ${esc(policy.coverage)}` : ''}</small>
      ${policy.terms ? `<p class="claim-terms">条款要点：${esc(policy.terms)}</p>` : ''}
      <p class="claim-materials-title">需要准备的资料</p>
      <ul class="claim-materials">${materials.map(item => `<li>□ ${esc(item)}</li>`).join('')}</ul>
      <button class="text-button" data-policy-detail="${policy.id}">查看该保险全部条款 →</button>
      ${index === 0 ? '<small class="privacy-small" style="display:block;margin-top:4px">已自动开启报销提醒，材料清单可在医疗资料 · 保险报销区逐项勾选。</small>' : ''}
      ${policy.type === 'commercial' && record.type === '检查报告' ? '<small class="privacy-small" style="display:block">注意：纯检查 / 体检报告通常不满足商业医疗险赔付条件（无费用票据），一般仅可用医保个人账户或门诊统筹。</small>' : ''}
      ${index === 0 ? '<small class="privacy-small" style="display:block">社保与商业险通常不可用同一张发票原件重复报销，可用发票复印件 + 理赔分割单向商业险申请。</small>' : ''}
    </div>`;
  }).join('');
  openModal(`${modalHead('报销提醒 · 自动检索', `已自动开启 ${matches.length} 条报销提醒`, `${esc(record.title)} 已存入 ${esc(member?.name || '')} 的档案。系统按保单生效时段与条款范围自动检索，以下保险的报销条件命中，材料清单已记入保险档案。`)}
    <div class="claim-match-list">${blocks}</div>
    <button class="primary-button" id="closeClaimAuto">我知道了，去准备材料</button>
    <p class="privacy-small">材料清单为演示口径，实际以参保地医保局和保险公司要求为准；演示版不做报销金额计算。</p>`);
  document.getElementById('closeClaimAuto')?.addEventListener('click', closeModal);
}
function policyStateOf(policy) {
  const today = dateOffset(0);
  if (policy.end && policy.end < today) return { label: '已失效', tag: 'reading-tag-muted' };
  const days = policy.end ? Math.round((new Date(policy.end) - new Date(today)) / 86400000) : Infinity;
  if (days <= 60) return { label: '即将到期', tag: 'reading-tag-yellow' };
  return { label: '生效中', tag: 'reading-tag-ok' };
}
/* 报销提醒行 / 保单行（医疗资料成员块与保险档案共用） */
function claimRowHtml(claim, showMember = true) {
  const member = state.familyMembers.find(item => item.id === claim.memberId);
  const policy = (state.insurancePolicies || []).find(item => item.id === claim.policyId);
  const record = state.records.find(item => item.id === claim.recordId);
  const done = claim.materials.filter(item => item.done).length;
  const ready = done === claim.materials.length;
  return `<button class="claim-reminder-row" data-claim-detail="${claim.id}">
    <div class="claim-reminder-copy"><strong>${showMember ? `${esc(member?.name || '')} · ` : ''}${esc(policy?.name || '保单已删除')}</strong><small>来源：${esc(record?.title || '资料已删除')} · ${esc(claim.scene)} · 材料 ${done}/${claim.materials.length}</small></div>
    <span class="reading-tag ${ready ? 'reading-tag-ok' : 'reading-tag-yellow'}">${ready ? '材料齐全' : '待补材料'}</span>
  </button>`;
}
function policyRowHtml(policy) {
  const st = policyStateOf(policy);
  return `<button class="policy-row" data-policy-detail="${policy.id}">
    ${policyChip(policy)}
    <span class="policy-copy"><strong>${esc(policy.name)}</strong><small>${esc(policy.company || '')}${policy.coverage ? ` · 保额 ${esc(policy.coverage)}` : ''} · ${esc(policy.start || '')} ~ ${esc(policy.end || '长期')} · 点看条款</small></span>
    <span class="reading-tag ${st.tag}">${st.label}</span>
  </button>`;
}
/* 医疗资料 Tab：按成员展开 —— 就医信息卡 · 就医资料库（按就诊日期归档） · 保险报销 */
const expandedDocsMembers = new Set();
/* 就诊资料按日期归组：同一天的资料 = 一次就诊；AI 概括取组内主资料（病历类优先）的 summary */
const RECORD_SUMMARY_PRIORITY = ['门诊病历', '出院小结', '疾病诊断证明书', '外伤门诊病历', '就诊资料', '用药记录', '检查报告', '医疗费用发票', '费用明细'];
function autoSummary(type, title) {
  if (type === '外伤门诊病历') return `意外受伤就诊 · ${title}`;
  if (type === '出院小结') return `住院治疗结束 · ${title}`;
  if (type === '疾病诊断证明书') return `疾病诊断确认 · ${title}`;
  if (type === '医疗费用发票' || type === '费用明细') return `医疗费用结算 · ${title}`;
  if (type === '用药记录') return `用药方案整理 · ${title}`;
  if (type === '检查报告') return `检查 / 化验结果 · ${title}`;
  return `门诊就诊 · ${title}`;
}
function visitGroups(memberId) {
  const byDate = new Map();
  state.records.filter(record => record.memberId === memberId).forEach(record => {
    if (!byDate.has(record.date)) byDate.set(record.date, []);
    byDate.get(record.date).push(record);
  });
  return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => {
    items.sort((a, b) => RECORD_SUMMARY_PRIORITY.indexOf(a.type) - RECORD_SUMMARY_PRIORITY.indexOf(b.type));
    const main = items.find(record => record.summary) || items[0];
    const override = (state.visitSummaries || {})[`${memberId}|${date}`]; // 家属修改过的概括优先于 AI 生成
    return { date, records: items, summary: override || main?.summary || autoSummary(main?.type, main?.title) };
  });
}
/* 某次就诊详情：AI 概括 + 当天全部资料（病历 / 发票 / 明细等都能传） */
function showVisitDetail(memberId, date) {
  const member = state.familyMembers.find(item => item.id === memberId);
  const visit = visitGroups(memberId).find(group => group.date === date);
  if (!visit) return;
  const rows = visit.records.map(record => {
    const claimable = activePoliciesAt(memberId, record.date).length > 0;
    return `<button class="visit-material-row" data-open-record="${esc(record.id)}">
      <span class="record-icon ${record.type === '用药记录' ? 'medicine' : ''}">${esc(record.icon || '▤')}</span>
      <span class="visit-material-copy"><strong>${esc(record.title)}</strong><small>${esc(record.type)} · ${esc(record.hospital)} · ${esc(record.state)}</small></span>
      ${claimable ? '<span class="record-status claimable">可报销</span>' : ''}
      <span class="member-chevron">›</span>
    </button>`;
  }).join('');
  openModal(`${modalHead(`${esc(member?.name || '')} · 就诊记录`, formatDate(date), `当天共 ${visit.records.length} 份资料；AI 概括仅供整理参考，可编辑修正。`)}
    <div class="visit-summary-card" id="visitSummaryBlock">
      <div class="visit-summary-head"><span class="ai-chip">AI 概括</span><button class="text-button" id="editVisitSummary">编辑</button></div>
      <p id="visitSummaryText">${esc(visit.summary)}</p>
    </div>
    <p class="claim-materials-title">本次就诊资料（${visit.records.length}）</p>
    <div class="visit-material-list">${rows}</div>
    <button class="secondary-button" data-action="upload" data-upload-member="${esc(memberId)}" style="margin-top:8px">＋ 补传本次就诊资料</button>
    <p class="privacy-small">病历、发票、费用明细、用药记录等都可以上传；同一天上传的资料自动归到同一次就诊，并生成 AI 病症概括。</p>`);
  document.getElementById('editVisitSummary')?.addEventListener('click', () => {
    const block = document.getElementById('visitSummaryBlock'); if (!block) return;
    block.innerHTML = `<div class="visit-summary-head"><span class="ai-chip">AI 概括 · 可修改</span></div>
      <textarea class="ocr-text-area" id="visitSummaryInput" style="min-height:76px;margin-top:6px">${esc(visit.summary)}</textarea>
      <div class="visit-summary-ops"><button class="primary-button" id="saveVisitSummary" style="margin-top:8px">保存概括</button></div>`;
    document.getElementById('saveVisitSummary')?.addEventListener('click', () => {
      const text = document.getElementById('visitSummaryInput')?.value.trim();
      if (!text) { toast('概括不能为空，可恢复为原文'); return; }
      state.visitSummaries = state.visitSummaries || {};
      state.visitSummaries[`${memberId}|${date}`] = text;
      saveState(); renderDocs();
      toast('就诊概括已更新，列表同步生效');
      showVisitDetail(memberId, date);
    });
  });
}
function renderDocs() {
  const host = document.getElementById('docsMemberList');
  if (!host) return;
  host.innerHTML = state.familyMembers.map(member => {
    const open = expandedDocsMembers.has(member.id);
    const records = state.records.filter(record => record.memberId === member.id);
    const visits = visitGroups(member.id);
    const list = (state.insurancePolicies || []).filter(policy => policy.memberId === member.id);
    const claims = (state.reimbursements || []).filter(claim => claim.memberId === member.id && claim.status !== '已提交');
    const visitRows = visits.map(visit => {
      const claimable = visit.records.some(record => activePoliciesAt(member.id, record.date).length > 0);
      const types = [...new Set(visit.records.map(record => record.type))];
      return `<article class="record-item visit-item" data-visit-open="${esc(member.id)}|${esc(visit.date)}" tabindex="0" role="button" aria-label="查看${formatDate(visit.date)}就诊记录">
        <span class="record-icon">▤</span>
        <div class="record-body">
          <strong>${esc(visit.summary)}<span class="ai-chip">AI 概括</span></strong>
          <small>${formatDate(visit.date)} · ${visit.records.length} 份资料（${esc(types.join(' · '))}）</small>
        </div>
        ${claimable ? '<span class="record-status claimable">可报销</span>' : ''}
      </article>`;
    });
    return `<article class="insurance-member docs-member">
      <button class="insurance-member-head docs-member-head" data-docs-toggle="${member.id}" aria-expanded="${open}">
        <span class="mini-avatar ${member.avatarClass || ''}">${esc(member.name.slice(0, 1))}</span>
        <div class="insurance-member-title"><strong>${esc(member.name)}</strong><small>${esc(member.role)} · ${records.length} 份资料 · ${list.length} 份保单${claims.length ? ` · <b class="member-alert-count">${claims.length} 条报销待办</b>` : ''}</small></div>
        <span class="member-chevron">${open ? '⌃' : '⌄'}</span>
      </button>
      ${open ? `<div class="docs-member-body">
        <div class="docs-sub-head"><span>就医信息卡</span><span class="docs-sub-ops"><button class="text-button" data-member-edit="${member.id}">编辑</button><button class="text-button" data-action="health-card" data-card-member="${member.id}">查看全部 →</button></span></div>
        <div class="info-grid">
          <div><span class="field-label">慢病</span><strong>${esc(member.conditions)}</strong></div>
          <div><span class="field-label">过敏史</span><strong class="${/无/.test(member.allergies) ? '' : 'alert-text'}">${esc(member.allergies)}</strong></div>
          <div><span class="field-label">长期用药</span><strong>${esc(member.medications)}</strong></div>
          <div><span class="field-label">手术史</span><strong>${esc(member.surgeries)}</strong></div>
        </div>
        <div class="docs-member-ops single">
          <button class="secondary-button" data-action="appointment" data-appointment-member="${member.id}">就诊准备清单 · 完成后生成分享码</button>
        </div>
        <div class="docs-sub-head"><span>就医资料库 · 按就诊日期归档</span><button class="text-button" data-action="upload" data-upload-member="${member.id}">＋ 添加</button></div>
        ${visitRows.length ? `<div class="record-list">${previewRows(visitRows, `docsrec-${member.id}`)}</div>` : '<p class="empty-hint" style="margin:2px 0">暂无就诊资料，点右上「＋ 添加」上传，同一天的资料自动归为一次就诊。</p>'}
        <small class="privacy-small" style="display:block;margin:4px 0 2px">点某次就诊可查看当天全部资料；AI 概括病症仅供整理参考。体检 / 化验报告在「健康档案 · 导入体检单」录入。</small>
        <div class="docs-sub-head"><span>保险报销</span></div>
        ${claims.length ? claims.map(claim => claimRowHtml(claim, false)).join('') : '<p class="empty-hint" style="margin:2px 0">暂无报销提醒，录入资料后自动匹配保单生成。</p>'}
        ${list.map(policy => policyRowHtml(policy)).join('') || '<p class="empty-hint" style="margin:4px 0">暂无保单，点下方「录入保单」添加。</p>'}
        <button class="text-button" data-member-policy-add="${member.id}" style="margin-top:7px">＋ 录入保单</button>
      </div>` : ''}
    </article>`;
  }).join('');
}
/* 报销清单详情：材料勾选 + 提交 */
function showClaimDetail(claimId) {
  const claim = (state.reimbursements || []).find(item => item.id === claimId);
  if (!claim) return;
  const member = state.familyMembers.find(item => item.id === claim.memberId);
  const policy = (state.insurancePolicies || []).find(item => item.id === claim.policyId);
  const record = state.records.find(item => item.id === claim.recordId);
  const done = claim.materials.filter(item => item.done).length;
  const ready = done === claim.materials.length;
  openModal(`${modalHead(`报销提醒 · ${esc(member?.name || '')}`, `${esc(policy?.name || '保单已删除')}`, '勾选已准备好的材料，全部齐备后即可提交报销 / 理赔申请。材料清单为演示口径，以实际参保地与承保机构要求为准。')}
    <div class="insurance-channel-card">${policy ? policyChip(policy) : ''}<strong>来源资料：${esc(record?.title || '已删除')}（${formatDate(record?.date || claim.createdAt)}）</strong><small>${esc(claim.scene)} · 记录于 ${formatDate(claim.createdAt)}${policy?.coverage ? ` · 保额 ${esc(policy.coverage)}` : ''}</small></div>
    ${policy?.terms ? `<p class="claim-terms">条款要点：${esc(policy.terms)}</p>` : ''}
    ${policy ? `<button class="text-button" data-policy-detail="${policy.id}" style="margin-bottom:6px">查看该保险全部条款 →</button>` : ''}
    <p class="claim-materials-title">材料清单（勾选 ${done}/${claim.materials.length}）</p>
    <div class="claim-check-list">${claim.materials.map((item, index) => `<button class="claim-check-row ${item.done ? 'is-done' : ''}" data-claim-toggle="${index}" data-claim-id="${claim.id}"><span class="claim-check-mark">${item.done ? '✓' : '□'}</span>${esc(item.label)}</button>`).join('')}</div>
    ${ready && claim.status !== '已提交' ? '<div class="health-highlight">材料已齐备，可以提交报销 / 理赔申请了。</div>' : ''}
    ${claim.status === '已提交' ? '<div class="health-highlight">已提交，等待受理结果（演示到此为止）。</div>' : ''}
    <div class="policy-detail-ops">
      ${claim.status !== '已提交' ? `<button class="primary-button" data-claim-submit="${claim.id}" ${ready ? '' : 'disabled'}>标记为已提交</button>` : ''}
      <button class="secondary-button" data-claim-del="${claim.id}">删除提醒</button>
    </div>`);
}
/* ============ 录入保单：上传保单文件 → AI 识别检索条款 → 人工核实确认（原件可随时查看） ============ */
let policyUploadFile = null;    // 待入库的保单原件（照片 / PDF）
let policyRecognized = null;    // AI 识别生成的预填保单
let policyConfirmCtx = null;    // 核实页上下文（查看原件后返回用）
const POLICY_DEMO_TEXT = '电子保单 好医保 长期医疗险 20年版 人保健康 一般医疗保额200万 重疾医疗保额400万 免赔额1万 等待期90天 保证续保20年';
/* AI 检索：识别文字 → 保单产品库（关键词匹配，命中即带出整套条款） */
function matchPolicyTemplate(text) {
  const content = String(text || '');
  const rules = [
    { keys: ['防癌'], name: '好医保·终身防癌医疗险' },
    { keys: ['长期医疗', '20 年版', '20年版'], name: '好医保·长期医疗险（20年版）' },
    { keys: ['健康福', '重疾'], name: '健康福·重疾险1号（一年期）' },
    { keys: ['无忧保', '意外'], name: '无忧保·综合意外险' },
    { keys: ['住院医疗'], name: '好医保·住院医疗（2020版）' }
  ];
  for (const rule of rules) {
    if (rule.keys.some(key => content.includes(key))) {
      const tpl = seed.insurancePolicies.find(policy => policy.name === rule.name);
      if (tpl) return { ...tpl };
    }
  }
  const social = /医保|社保/.test(content) ? seed.insurancePolicies.find(policy => policy.type === 'social') : null;
  return { ...(social || seed.insurancePolicies.find(policy => policy.name === '好医保·长期医疗险（20年版）')) };
}
/* 演示电子保单：canvas 生成一张保单样式图片，作为可查看的原件 */
function makeDemoPolicyFile() {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 860;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f7f6f2'; ctx.fillRect(0, 0, 640, 860);
  ctx.fillStyle = '#2f4a38'; ctx.fillRect(0, 0, 640, 90);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('电子保单（演示）', 30, 58);
  ctx.fillStyle = '#333333'; ctx.font = '20px sans-serif';
  const lines = [
    '产品名称：好医保·长期医疗险（20年版）', '承保机构：人保健康', '保单号：DEMO-COM-2004（演示）',
    '被保险人：（演示数据）', '保障期间：2025-01-10 至 2045-01-09', '一般医疗保额：200 万元',
    '重疾医疗保额：400 万元', '免赔额：1 万/年（重疾 0 免赔）', '等待期：90 天',
    '—— 保险责任 ——', '· 一般住院医疗费用', '· 121 种重大疾病住院医疗', '· 特殊门诊 / 住院前后门急诊',
    '—— 除外责任 ——', '· 投保前已有疾病及其并发症', '· 牙科、视力矫正等非疾病治疗'
  ];
  lines.forEach((line, index) => ctx.fillText(line, 30, 150 + index * 36));
  return new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob], '演示电子保单.png', { type: 'image/png' })), 'image/png'));
}
/* 第一步：选择成员 + 上传保单文件（照片 / PDF） */
function showPolicyEntry(memberId = '', policyId = '') {
  const policy = policyId ? (state.insurancePolicies || []).find(item => item.id === policyId) : null;
  if (policy) { showPolicyConfirm(policy, null, true); return; }
  policyUploadFile = null; policyRecognized = null;
  openModal(`${modalHead('保险档案 · 家庭成员', '录入保单 · 上传保单文件', '保单买好后保险公司会给电子保单（PDF）或凭证截图。上传后 AI 自动识别并检索条款，核对确认后入档。')}
    <label class="extraction-row"><span>所属成员</span><select id="policyMember" class="extraction-select">${state.familyMembers.map(member => `<option value="${member.id}" ${member.id === (memberId || state.currentMemberId) ? 'selected' : ''}>${esc(member.name)}（${esc(member.role)}）</option>`).join('')}</select></label>
    <div class="upload-choice">
      <button class="upload-option" data-policy-source="file"><span>▤</span><strong>上传保单照片 / PDF</strong></button>
    </div>
    <button class="secondary-button sample-report-button" id="policyDemoScan">用演示电子保单体验 AI 识别</button>
    <p class="privacy-small">支持图片与 PDF；识别在本机完成，原件仅保存在当前浏览器，不会上传云端。请勿上传真实保单，演示数据请脱敏。</p>`);
}
/* 第二步：AI 识别（图片走本机 OCR；PDF 用演示识别）→ 检索产品库 → 生成预填保单 */
async function showPolicyRecognize(file) {
  const memberId = document.getElementById('policyMember')?.value || state.currentMemberId;
  openModal(`${modalHead('录入保单 · AI 识别', '正在识别保单文件…', '本机识别保单上的产品与关键信息，并自动检索对应条款，随后请你核实确认。')}
    <div class="file-chip"><b>▤</b><span>${esc(file?.name || '保单文件')}</span><span id="policyOcrStatus" style="margin-left:auto;color:#789078">准备识别…</span></div>
    ${file?.type?.startsWith('image/') ? '<img class="report-preview" id="policyPreview" alt="保单原件预览" />' : ''}`);
  if (file?.type?.startsWith('image/')) {
    const preview = document.getElementById('policyPreview');
    if (preview) preview.src = URL.createObjectURL(file);
  }
  const status = document.getElementById('policyOcrStatus');
  let text = '';
  if (file && file.type.startsWith('image/')) {
    try {
      if (status) status.textContent = '正在准备本机中文识别…首次载入会稍慢。';
      const worker = await getOcrWorker();
      const result = await worker.recognize(file);
      text = result.data.text || '';
      if (status) status.textContent = `识别完成（${text.length} 字），正在检索保单产品库…`;
    } catch {
      if (status) status.textContent = '本机识别未完成，改用演示识别结果，请人工核实。';
      text = POLICY_DEMO_TEXT;
    }
  } else if (file) {
    if (status) status.textContent = 'PDF 解析为演示能力，已生成模拟识别结果，请人工核实。';
    text = POLICY_DEMO_TEXT;
  } else {
    text = POLICY_DEMO_TEXT;
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  const template = matchPolicyTemplate(text);
  policyRecognized = {
    memberId,
    type: template.type,
    category: template.category || 'medical',
    name: template.name,
    company: template.company,
    policyNo: `AI-${Date.now().toString().slice(-6)}`,
    coverage: template.coverage || '',
    terms: template.terms || '',
    deductible: template.deductible || '',
    ratio: template.ratio || '',
    waiting: template.waiting || '',
    hospital: template.hospital || '',
    renewal: template.renewal || '',
    duties: [...(template.duties || [])],
    exclusions: [...(template.exclusions || [])],
    termsList: [],
    start: dateOffset(0),
    end: dateOffset(365)
  };
  showPolicyConfirm(policyRecognized, file, false);
}
/* 第三步：核实确认表单（可改）+ 底部「查看原件」按钮 */
function showPolicyConfirm(policy, file, editing) {
  policyConfirmCtx = { policy: editing ? policy : null, editing, file: file || policyUploadFile };
  const current = editing ? policy : policyRecognized;
  if (!current) { showPolicyEntry(); return; }
  const memberOptions = state.familyMembers.map(member => `<option value="${member.id}" ${member.id === current.memberId ? 'selected' : ''}>${esc(member.name)}（${esc(member.role)}）</option>`).join('');
  openModal(`${modalHead('录入保单 · 请核实', editing ? `编辑保单 · ${esc(policy.name)}` : 'AI 已识别保单 · 请核实确认', editing ? '以下信息可修改，确认后保存到成员名下。' : `AI 从保单文件识别出以下信息，并自动从产品库检索出条款。请逐项核实（重点：保额、保障期间、条款），确认后入档。`)}
    <div class="file-chip"><b>▤</b><span>${esc(file?.name || '保单原件（本机）')}</span><button class="text-button" id="viewPolicyFile" style="margin-left:auto">查看原件</button></div>
    <form class="member-edit-form" id="policyForm">
      <label><span class="field-label-block">所属成员</span><select class="input-field" name="memberId">${memberOptions}</select></label>
      <label><span class="field-label-block">类型</span><select class="input-field" name="type">
        <option value="social" ${current.type === 'social' ? 'selected' : ''}>社保医疗保险</option>
        <option value="commercial" ${current.type === 'commercial' ? 'selected' : ''}>商业保险</option>
      </select></label>
      <label><span class="field-label-block">商业险种（商业保险适用）</span><select class="input-field" name="category">
        <option value="medical" ${(current.category || 'medical') === 'medical' ? 'selected' : ''}>医疗险（费用报销型）</option>
        <option value="critical" ${current.category === 'critical' ? 'selected' : ''}>重疾险（确诊给付型）</option>
        <option value="accident" ${current.category === 'accident' ? 'selected' : ''}>意外险</option>
      </select></label>
      <label><span class="field-label-block">保险名称</span><input class="input-field" name="name" required placeholder="例：好医保·长期医疗险" value="${esc(current.name)}" /></label>
      <label><span class="field-label-block">承保机构</span><input class="input-field" name="company" placeholder="例：人保健康（支付宝投保）" value="${esc(current.company)}" /></label>
      <label><span class="field-label-block">保单号（选填）</span><input class="input-field" name="policyNo" placeholder="演示数据请勿输入真实号码" value="${esc(current.policyNo)}" /></label>
      <label><span class="field-label-block">保额（选填）</span><input class="input-field" name="coverage" placeholder="例：200 万 / 按医保目录" value="${esc(current.coverage)}" /></label>
      <label><span class="field-label-block">条款摘要（选填）</span><input class="input-field" name="terms" placeholder="例：住院医疗费用经社保结算后 100% 报销" value="${esc(current.terms || '')}" /></label>
      <label><span class="field-label-block">条款明细（选填，每行一条：标题｜内容）</span><textarea class="input-field" name="termsExtra" rows="3" placeholder="免赔额｜1 万/年${'\n'}等待期｜90 天${'\n'}除外责任｜投保前已有疾病">${esc((current.termsList || []).map(item => `${item.title}｜${item.text}`).join('\n'))}</textarea></label>
      <label><span class="field-label-block">生效日期</span><input class="input-field" name="start" type="date" value="${esc(current.start)}" /></label>
      <label><span class="field-label-block">到期日期</span><input class="input-field" name="end" type="date" value="${esc(current.end)}" /></label>
      <button class="primary-button" type="submit">${editing ? '保存修改' : '核实无误，确认入档'}</button>
    </form>
    <p class="privacy-small">AI 识别与条款检索为演示能力（关键词匹配产品库），实际以保单合同原件为准；演示版不做承保判断。</p>`);
  document.getElementById('viewPolicyFile')?.addEventListener('click', () => showPolicyAttachment(policyConfirmCtx.file, editing ? policy.id : null));
  document.getElementById('policyForm')?.addEventListener('submit', ev => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    const record = {
      memberId: data.get('memberId'),
      type: data.get('type'),
      category: data.get('category') || 'medical',
      name: String(data.get('name') || '').trim(),
      company: String(data.get('company') || '').trim(),
      policyNo: String(data.get('policyNo') || '').trim(),
      coverage: String(data.get('coverage') || '').trim(),
      terms: String(data.get('terms') || '').trim(),
      termsList: parseTermsLines(data.get('termsExtra')),
      start: String(data.get('start') || ''),
      end: String(data.get('end') || '')
    };
    if (!record.name) { toast('请填写保险名称'); return; }
    if (editing && !record.termsList.length) record.termsList = policy.termsList || []; // 编辑时未填则保留原条款明细
    let member = state.familyMembers.find(item => item.id === record.memberId);
    if (editing) {
      Object.assign(policy, record);
      saveState(); renderDocs(); closeModal();
      toast(`${member?.name || '成员'} 的「${record.name}」已更新`);
    } else {
      const saved = { id: `pol-${state.nextPolicyId++}`, ...record };
      /* AI 识别出的结构化条款（产品库带出）随保单一并保存 */
      ['deductible', 'ratio', 'waiting', 'hospital', 'renewal'].forEach(key => { if (current[key]) saved[key] = current[key]; });
      if (current.duties?.length) saved.duties = [...current.duties];
      if (current.exclusions?.length) saved.exclusions = [...current.exclusions];
      state.insurancePolicies.push(saved);
      saveState(); renderDocs(); closeModal();
      if (policyUploadFile) {
        putAttachment(saved.id, policyUploadFile)
          .then(() => toast(`${member?.name || '成员'} 的「${record.name}」已入档，原件保存在本机`))
          .catch(() => toast(`${member?.name || '成员'} 的「${record.name}」已入档，原件保存失败`));
      } else {
        toast(`${member?.name || '成员'} 的「${record.name}」已入档`);
      }
    }
  });
}
/* 查看保单原件：新上传文件或本机已存附件（图片 / PDF 内嵌预览） */
async function showPolicyAttachment(file, policyId) {
  if (!file && policyId) {
    try {
      const item = await getAttachment(policyId);
      if (item?.blob) file = { name: item.name, type: item.type, blob: item.blob };
    } catch { /* 本机附件可能不存在 */ }
  }
  if (!file || (!file.blob && !(file instanceof File))) { toast('没有找到保单原件；可通过「上传保单文件」重新录入'); return; }
  const url = URL.createObjectURL(file.blob || file);
  const name = file.name || '保单原件';
  const media = file.type?.startsWith('image/')
    ? `<img class="report-preview" src="${url}" alt="${esc(name)}" />`
    : file.type === 'application/pdf'
      ? `<iframe class="policy-pdf-frame" src="${url}" title="${esc(name)}"></iframe>`
      : `<p class="privacy-small">当前格式暂不支持内嵌预览（演示）。</p>`;
  const locationLabel = file.cloud ? '康伴私有云端' : '本机保存';
  openModal(`${modalHead(`保单原件 · ${locationLabel}`, esc(name), '原件保存在家庭私有空间，用于人工核实 AI 识别结果。')}${media}
    <button class="primary-button" id="policyFileDone">返回核实</button>`);
  document.getElementById('policyFileDone')?.addEventListener('click', () => {
    if (policyConfirmCtx?.editing && policyConfirmCtx.policy) showPolicyConfirm(policyConfirmCtx.policy, null, true);
    else if (policyConfirmCtx && !policyConfirmCtx.editing) showPolicyConfirm(policyRecognized, policyUploadFile, false);
    else closeModal();
  });
}
/* 条款明细 textarea（每行「标题｜内容」）→ 结构化条款列表 */
function parseTermsLines(text) {
  return String(text || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split(/｜|\||：|:/);
    return { title: (parts[0] || '').trim(), text: parts.slice(1).join('：').trim() };
  }).filter(item => item.title && item.text);
}
/* 保单详情：全部条款信息 + 关联报销提醒 + 编辑删除 */
function showPolicyDetail(policyId) {
  const policy = (state.insurancePolicies || []).find(item => item.id === policyId);
  if (!policy) return;
  const member = state.familyMembers.find(item => item.id === policy.memberId);
  const st = policyStateOf(policy);
  const claims = (state.reimbursements || []).filter(item => item.policyId === policy.id);
  const termsRows = [
    ['免赔额', policy.deductible],
    ['报销比例', policy.ratio],
    ['等待期', policy.waiting],
    ['医院范围', policy.hospital],
    ['续保条件', policy.renewal],
    ...parseTermsLines((policy.termsList || []).map(item => `${item.title}｜${item.text}`).join('\n')).map(item => [item.title, item.text])
  ].filter(([, value]) => value);
  const hasDetail = termsRows.length || policy.duties?.length || policy.exclusions?.length;
  openModal(`${modalHead(`保险档案 · ${esc(member?.name || '')}`, `${esc(policy.name)}`, '点击保单即可查看这份保险的全部条款信息；报销与理赔从这份保单发起。')}
    <div class="insurance-channel-card">${policyChip(policy)}<strong>${esc(policy.name)} · ${esc(member?.name || '')}</strong><small>保单号 ${esc(policy.policyNo || '未填写')} · ${esc(policy.company || '承保机构未填')}${policy.coverage ? ` · 保额 ${esc(policy.coverage)}` : ''}</small><small>保障期间 ${esc(policy.start || '')} ~ ${esc(policy.end || '长期')} · ${st.label}</small></div>
    ${policy.terms ? `<p class="claim-terms">条款摘要：${esc(policy.terms)}</p>` : ''}
    ${hasDetail ? `<div class="policy-terms">
      <h3>条款信息</h3>
      ${termsRows.map(([label, value]) => `<div class="terms-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}
      ${policy.duties?.length ? `<p class="claim-materials-title">保险责任（保什么）</p><ul class="terms-list">${policy.duties.map(item => `<li>● ${esc(item)}</li>`).join('')}</ul>` : ''}
      ${policy.exclusions?.length ? `<p class="claim-materials-title">除外责任（不保什么）</p><ul class="terms-list terms-list-ex">${policy.exclusions.map(item => `<li>✕ ${esc(item)}</li>`).join('')}</ul>` : ''}
    </div>` : '<p class="empty-hint" style="margin:4px 0">暂无结构化条款，可通过「编辑保单」补充条款明细。</p>'}
    <div class="share-log"><h3>关联报销提醒（${claims.length}）</h3>
      ${claims.length ? claims.map(claim => claimRowHtml(claim, false)).join('') : '<p class="empty-hint" style="margin:2px 0">暂无报销提醒；上传对应病历资料后会自动检索这份保单并开启提醒。</p>'}
    </div>
    <div class="health-highlight">报销从对应成员的保单发起：上传病历 → 自动检索条款 → 命中即开启提醒 → 勾材料 → 提交。演示版不做承保与赔付金额判断。</div>
    <div class="policy-detail-ops">
      <button class="secondary-button" data-policy-attachment="${policy.id}">查看原件</button>
      <button class="secondary-button" data-policy-edit="${policy.id}">编辑保单</button>
    </div>
    <div class="policy-detail-ops" style="margin-top:8px">
      <button class="secondary-button policy-del-button" data-policy-del="${policy.id}">删除</button>
    </div>
    <p class="privacy-small">演示版：条款为模拟内容（支付宝在售产品风格），实际以保单合同条款为准。</p>`);
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
/* 模拟服务价格（FR-11：收入与订单记录用模拟金额，不做真实支付） */
const SERVICE_PRICES = { '全程陪诊': 268, '检查陪同': 168, '取药与报告': 98 };
/* 标准化服务清单模板（需求文档 4.1，可按需增减）：evidence 为佐证要求，optional 表示可不上传佐证直接勾选 */
const STANDARD_EXEC_TEMPLATE = [
  { label: '就诊前电话确认（时间/集合点/带齐物品）', evidence: '沟通记录截图', optional: true },
  { label: '协助取号 / 挂号', evidence: '挂号凭证照片' },
  { label: '候诊陪同至就诊', evidence: '候诊 / 就诊场景照' },
  { label: '代述病情（仅转述家庭端准备的自我描述）', evidence: '' },
  { label: '陪同检查、缴费、取药', evidence: '缴费单 / 药袋照片' },
  { label: '领取 / 整理检查报告', evidence: '报告照片' },
  { label: '协助下次复诊预约', evidence: '预约凭证' },
  { label: '服务小结与信息回传', evidence: '服务单提交', optional: true }
];
const EXECUTION_ITEMS = {
  '全程陪诊': [0, 1, 2, 3, 4, 5, 6, 7],
  '检查陪同': [0, 1, 2, 4, 5, 7],
  '取药与报告': [0, 1, 5, 7]
};
function executionChecklist(service) {
  return EXECUTION_ITEMS[service] || EXECUTION_ITEMS['全程陪诊'];
}
function ensureExecution(order) {
  if (order.status !== 'accepted' && order.status !== 'completed') return order;
  if (order.execution?.items?.length) return order;
  const items = executionChecklist(order.service).map(seq => {
    const template = STANDARD_EXEC_TEMPLATE[seq];
    return { key: `exec-${seq}-${template.label}`, label: template.label, evidenceHint: template.evidence, evidenceRequired: !template.optional && Boolean(template.evidence), done: false, doneAt: null, evidenceId: null, evidenceName: null };
  });
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

function orderPrice(order) { return Number(order.price || SERVICE_PRICES[order.service] || 0); }
function taskShareActive(share) { return share && !share.revokedAt && Date.now() < Date.parse(share.expiresAt); }

/* ============ 社区需求区（FR-12）：家庭发布需求帖 → 陪诊师接单大厅 ============ */
function demandPostStatusChip(status) {
  const label = POST_STATUS_LABEL[status] || status || '';
  const map = { '招募中': 'record-status', '已接单': 'record-status', '服务中': 'record-status', '已完成': 'record-status', '已取消': 'record-status' };
  return `<span class="${map[label] || 'record-status'}">${esc(label)}</span>`;
}
const GUEST_COMMUNITY_FEED = [
  { id: 'guest-post-1', type: 'demand', status: 'open', service_type: '检查陪同', hospital_name: '市第一人民医院', service_date: dateOffset(6), summary: '需要一位陪诊员协助完成检查流程与院内引导', author_label: '家庭用户', region: '深圳 · 南山区', budget_min: 150, budget_max: 200, created_at: hoursAgoIso(2) },
  { id: 'guest-post-2', type: 'demand', status: 'open', service_type: '取药与报告', hospital_name: '市中医院', service_date: dateOffset(9), summary: '希望协助取药、领取报告并整理就诊材料', author_label: '家庭用户', region: '深圳 · 福田区', budget_min: 80, budget_max: 120, created_at: hoursAgoIso(26) },
  { id: 'guest-post-3', type: 'availability', status: 'open', service_type: '门诊全程陪诊', region: '深圳 · 南山区', service_date: dateOffset(3), start_time: '09:00', end_time: '12:00', summary: '熟悉市一院、南山医院门诊流程，可协助挂号、院内引导、取报告', created_at: hoursAgoIso(20), _profile: { display_name: '李陪诊员', experience: '5 年经验 · 已完成 86 单', review_status: 'approved' } },
  { id: 'guest-post-4', type: 'availability', status: 'booked', service_type: '代取药 · 代取报告', region: '深圳 · 福田区', service_date: dateOffset(5), start_time: '14:00', end_time: '17:00', summary: '工作日下午可代取药和报告，常跑市中医院、港大医院', created_at: hoursAgoIso(30), _profile: { display_name: '陈陪诊员', experience: '已完成 42 单', review_status: 'approved' } }
];
const POST_STATUS_LABEL = { open: '招募中', has_applicants: '有人报名', awaiting_confirmation: '待双方确认', confirmed: '已确认', in_service: '服务中', completed: '服务完成', cancelled: '已取消', closed: '已关闭', pending_booking: '待确认', booked: '已约', pending_escort_confirmation: '待确认', arrived: '已到场' };
const SUPPLY_STATUS_META = { open: ['可约', 'ok'], pending_booking: ['待确认', 'pending'], booked: ['已约', 'taken'], cancelled: ['已下架', 'expired'] };
function hoursAgoIso(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
function relativeTime(iso) {
  if (!iso) return '';
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';
  const diff = Date.now() - time;
  if (diff < 60000) return '刚刚';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(time).toLocaleDateString('zh-CN');
}
function isPostExpired(post) {
  return post.type === 'availability' && post.status === 'open' && post.service_date && String(post.service_date) < new Date().toISOString().slice(0, 10);
}
function supplyStatusChip(post) {
  const meta = isPostExpired(post) ? ['已过期', 'expired'] : (SUPPLY_STATUS_META[post.status] || [POST_STATUS_LABEL[post.status] || post.status, '']);
  return `<span class="supply-status-chip is-${meta[1] || 'idle'}">${esc(meta[0])}</span>`;
}
function postTimeLine(post) {
  const time = relativeTime(post.created_at);
  return time ? `<p class="community-time">发布于 ${esc(time)}</p>` : '';
}
function escortTrustLine(post) {
  const profile = post._profile;
  if (!profile) return '';
  const name = profile.display_name || post.author_label || '陪诊师';
  const approved = profile.review_status === 'approved';
  return `<div class="escort-line"><span class="escort-ava">${esc(name.slice(0, 1))}</span><span><b>${esc(name)}</b>${profile.experience ? ` · ${esc(profile.experience)}` : ''}${approved ? ' <span class="tag-verified">✓ 已审核</span>' : ''}</span></div>`;
}
function renderCommunityPost(post, { guest = false, escort = false, signupLookupFailed = false } = {}) {
  const isDemand = post.type === 'demand' || !post.type;
  const privateActions = !guest && post.id && !String(post.id).startsWith('guest-');
  const kindChip = `<span class="community-kind-chip ${isDemand ? 'kind-demand' : 'kind-supply'}">${isDemand ? '需求' : '服务'}</span>`;
  const applicantCount = post._applicants?.length;
  if (!isDemand) {
    /* 服务卡（陪诊师发布的陪诊服务）：信任信息 + 状态机（可约→待确认→已约）+ 预约/管理操作 */
    const slot = [post.service_date, post.start_time ? String(post.start_time).slice(0, 5) : '', post.end_time ? String(post.end_time).slice(0, 5) : ''].filter(Boolean).join(' ');
    const dimmed = isPostExpired(post) || ['booked', 'cancelled'].includes(post.status) ? ' is-dimmed' : '';
    let actions = '';
    if (privateActions && !escort) {
      if (post.status === 'open' && !isPostExpired(post) && !post._myBooking) actions = '<button class="primary-button" data-community-book>预约该时段</button>';
      else if (post._myBooking?.status === 'applied') actions = `<small class="privacy-small">已提交预约申请，等待陪诊师确认。</small><div class="order-actions"><button class="text-button" data-community-cancel-booking="${esc(post._myBooking.id)}">撤销申请</button></div>`;
    }
    if (privateActions && escort && post._mine) {
      if (post.status === 'pending_booking' && post._incoming?.length) {
        actions = `<div class="community-applicants is-open">${post._incoming.map(booking => `<div class="applicant-row"><span><b>${esc(booking.booker_label || '家庭用户')}</b> 申请预约${booking.note ? ` · ${esc(booking.note)}` : ''}</span><span class="applicant-ops"><button class="secondary-button compact" data-community-respond="${esc(booking.id)}" data-accept="1">接受</button><button class="text-button" data-community-respond="${esc(booking.id)}">拒绝</button></span></div>`).join('')}</div>`;
      } else if (post.status === 'open' && !isPostExpired(post)) {
        actions = `<div class="order-actions"><button class="secondary-button compact" data-community-edit-slot="${esc(post.id)}">编辑时段</button><button class="text-button" data-community-cancel-post="${esc(post.id)}">下架</button></div>`;
      } else if (post.status === 'booked') {
        actions = '<small class="privacy-small">该时段已生成陪诊订单，进度见「我的陪诊安排」。</small>';
      }
    }
    return `<article class="demand-post-card community-post${dimmed}" data-community-type="availability" ${post.id && !String(post.id).startsWith('guest-') ? `data-post-id="${esc(post.id)}"` : ''}>
    <div class="family-order-top"><strong>${esc(post.service_type || post.service || '陪诊服务')}${guest && post.author_label ? ` · ${esc(post.author_label)}` : ''}</strong>${supplyStatusChip(post)}</div>
    <p class="community-meta">${kindChip}${esc(post.region || '服务区域待补充')}${slot ? ` · ${esc(slot)}` : ''}</p>
    ${post.summary ? `<p>${esc(post.summary)}</p>` : ''}
    ${escortTrustLine(post)}
    ${postTimeLine(post)}
    ${guest ? '<small class="privacy-small">游客仅浏览脱敏虚构内容；登录家庭账号后，此处下方会出现「预约该服务」按钮。</small>' : ''}
    ${actions}
  </article>`;
  }
  /* 需求卡：医院 · 日期 · 区域 + 摘要 + 预算/报名数信息行 */
  const budget = post.budget || (post.budget_min ? `¥${post.budget_min}${post.budget_max ? `–${post.budget_max}` : ''}` : '');
  const cancelDemand = privateActions && !escort && post._mine && ['open', 'has_applicants'].includes(post.status) ? `<div class="order-actions"><button class="text-button" data-community-cancel-post="${esc(post.id)}">取消需求</button></div>` : '';
  const mySignup = post._mySignup;
  let signupAction = '';
  if (privateActions && escort && ['open','has_applicants'].includes(post.status)) {
    if (signupLookupFailed) signupAction = '<small class="privacy-small">暂时无法确认报名状态，请刷新后再试，避免重复提交。</small>';
    else if (mySignup?.status === 'applied') signupAction = '<small class="privacy-small">你已报名，等待家庭查看你的介绍与简历。</small>';
    else if (mySignup?.status === 'selected') signupAction = '<small class="privacy-small">家庭已选中你，请到「我的陪诊」确认安排。</small>';
    else if (mySignup?.status === 'declined') signupAction = '<small class="privacy-small">家庭已选择其他陪诊师。</small>';
    else if (mySignup?.status === 'withdrawn') signupAction = `<button class="primary-button" data-community-apply="${esc(post.id)}">重新报名</button>`;
    else signupAction = `<button class="primary-button" data-community-apply="${esc(post.id)}">报名陪诊需求</button>`;
  }
  return `<article class="demand-post-card community-post" data-community-type="demand">
    <div class="family-order-top"><strong>${esc(post.service_type || post.service || '陪诊需求')} · ${esc(guest ? '家庭用户' : (post.author_label || post.requester || '家庭用户'))}</strong>${demandPostStatusChip(post.status)}</div>
    <p class="community-meta">${kindChip}${esc(post.hospital_name || post.hospital || '医院待补充')}${post.region && post.region !== '本地' ? ` · ${esc(post.region)}` : ''} · ${esc(post.service_date || post.date || '时间待沟通')}</p>
    <p>${esc(post.summary || post.need || '陪诊服务信息')}</p>
    ${budget || applicantCount ? `<p class="community-facts">${budget ? `<span>预算 <b>${esc(budget)}</b></span>` : ''}${applicantCount ? `<span>${applicantCount} 位陪诊师已报名</span>` : ''}</p>` : ''}
    ${postTimeLine(post)}
    ${guest ? '<small class="privacy-small">游客仅浏览脱敏虚构内容；登录陪诊师账号后，此处下方会出现「报名」按钮。</small>' : ''}
    ${signupAction}
    ${privateActions && !escort && post.status === 'has_applicants' ? `<div class="community-applicants" data-applicants-for="${esc(post.id)}"><small>加载报名信息…</small></div>` : ''}
    ${privateActions && !escort && ['awaiting_confirmation','confirmed','in_service'].includes(post.status) ? `<small class="privacy-small">家庭确认陪诊员后，患者资料只对家庭成员和已选陪诊员开放。</small>` : ''}
    ${cancelDemand}
  </article>`;
}
async function renderCommunity() {
  const host = document.getElementById('communityFeed');
  if (!host) return;
  const auth = window.KangbanAuth;
  host.innerHTML = auth?.mode === 'cloud'
    ? '<div class="empty-hint community-loading" role="status" aria-live="polite">正在加载云端社区…</div>'
    : '';
  const guest = auth?.role === 'guest';
  const escort = auth?.role === 'escort';
  const status = document.getElementById('communityStatus');
  /* 发布与管理操作已归位：家庭在「陪诊·需求大厅」，陪诊师在「我的」页；社区只负责浏览与筛选 */
  const reviewNotice = escort && auth?.mode === 'cloud' && auth.session?.status === 'pending_review' ? '陪诊师账号正在等待审核；审核通过前不能发布时段或报名。' : '';
  if (status) status.innerHTML = guest ? '游客模式 · 仅展示脱敏虚构社区内容 <button class="text-button" data-action="logout">切换登录 →</button>' : auth?.mode === 'cloud' ? '正在加载云端社区…' : '本机演示社区 · 数据保存在当前浏览器';
  /* 社区大厅人人一致：家庭/陪诊师/游客看到同一份帖子流，区别只在卡上按钮；家庭发布与管理入口在「陪诊 · 我的发布」 */
  let posts = [];
  let signupLookupFailed = false;
  try {
    if (guest) posts = GUEST_COMMUNITY_FEED;
    else if (auth?.mode === 'cloud') {
      const [cloudPosts, profiles, bookingContext] = await Promise.all([
        window.KangbanAPI.select('community_posts', { order: { column: 'created_at', ascending: false }, limit: 100 }),
        window.KangbanAPI.select('escort_profiles').catch(() => []),
        window.KangbanAPI.rpc('list_my_availability_bookings').catch(() => [])
      ]);
      posts = cloudPosts.filter(post => !isVisibleTestFixture(post));
      const profileById = Object.fromEntries(profiles.map(profile => [profile.user_id, escortProfileForDisplay(profile)]));
      const myUserId = auth.session?.user?.id;
      const myFamilyId = auth.session?.familyId;
      let mySignups = [];
      if (escort && myUserId) {
        try { mySignups = await window.KangbanAPI.select('post_signups', { filters: { escort_id: myUserId } }); }
        catch (error) { signupLookupFailed = true; console.warn('无法读取当前陪诊师的报名状态', error); }
      }
      const mySignupByPost = new Map(mySignups.map(signup => [signup.post_id, signup]));
      if (escort) auth.session.escortProfile = profileById[myUserId] || null;
      for (const post of posts) {
        post._profile = profileById[post.author_id] || null;
        post._mine = escort ? post.author_id === myUserId : post.family_id === myFamilyId;
        if (escort) post._mySignup = mySignupByPost.get(post.id) || null;
      }
      if (escort) {
        const incoming = (bookingContext || []).filter(booking => booking.status === 'applied');
        for (const post of posts) post._incoming = incoming.filter(booking => booking.post_id === post.id);
      } else {
        const mine = posts.filter(post => post.family_id === myFamilyId);
        const signupsByPost = await Promise.all(mine.map(async post => ({ post, signups: await window.KangbanAPI.select('post_signups', { filters: { post_id: post.id, status: 'applied' } }) })));
        for (const { post, signups } of signupsByPost) post._applicants = signups.map(signup=>{const p=profileById[signup.escort_id]||{};return {...signup,display_name:p.display_name||'待核验陪诊师',experience:p.experience||'',service_area:p.service_area||'',bio:p.bio||''};});
        for (const booking of (bookingContext || []).filter(booking => booking.status === 'applied')) {
          const post = posts.find(item => item.id === booking.post_id);
          if (post) post._myBooking = booking;
        }
      }
    } else posts = (state.demandPosts || []).map(post => ({ ...post, type: 'demand', status: ({ '招募中':'open','已接单':'confirmed','服务中':'in_service','已完成':'completed','已取消':'cancelled' })[post.status] || post.status }));
    communityPostCache = posts;
  } catch (error) { if (status) status.textContent = `社区加载失败：${error.message || error}`; }
  if (auth?.mode === 'cloud' && status && !status.textContent.startsWith('社区加载失败')) status.innerHTML = `${reviewNotice || `云端社区 · ${escort ? '陪诊师' : '家庭'}账号`}${!escort ? ' <button class="text-button" data-action="local-import">导入本机演示数据 →</button>' : ''}`;
  const regionSelect = document.getElementById('communityRegion');
  if (regionSelect) {
    const regions = [...new Set(posts.map(post => String(post.region || '').trim()).filter(Boolean))];
    if (communityRegion !== 'all' && !regions.includes(communityRegion)) communityRegion = 'all';
    regionSelect.innerHTML = ['<option value="all">全部区域</option>', ...regions.map(region => `<option value="${esc(region)}"${communityRegion === region ? ' selected' : ''}>${esc(region)}</option>`)].join('');
    regionSelect.value = communityRegion;
  }
  posts = posts.filter(post => (communityFilter === 'all' || (communityFilter === 'demand' ? (post.type === 'demand' || !post.type) : post.type === 'availability')) && (communityRegion === 'all' || String(post.region || '').includes(communityRegion)));
  posts = [...posts.filter(post => !isPostExpired(post)), ...posts.filter(post => isPostExpired(post))];
  const emptyHints = {
    all: guest ? '社区还没有内容。登录后，家庭可发布陪诊需求，陪诊师可发布陪诊服务。' : '目前没有社区内容。你可以发布陪诊需求。',
    demand: '还没有陪诊需求帖。家庭登录后点「发布需求」，把医院、日期和需要帮忙的事写清楚。',
    availability: '还没有陪诊师发布陪诊服务。通过审核的陪诊师登录后，点「发布陪诊服务」即可发布。'
  };
  host.innerHTML = posts.length ? `<div class="demand-post-list">${posts.map(post => renderCommunityPost(post, { guest, escort, signupLookupFailed })).join('')}</div>` : `<div class="empty-hint">${emptyHints[communityFilter] || emptyHints.all}</div>`;
  if (auth?.mode === 'cloud' && !escort) {
    for (const post of posts.filter(item => item._applicants?.length)) {
      const applicantBox = host.querySelector(`[data-applicants-for="${CSS.escape(post.id)}"]`);
      if (applicantBox) applicantBox.innerHTML = `<p class="privacy-small">${post._applicants.length} 位陪诊师报名</p>${post._applicants.map(signup => `<div class="applicant-row"><div class="applicant-copy"><b>${esc(signup.display_name)}</b><small>${signup.note ? esc(signup.note.length > 72 ? `${signup.note.slice(0, 72)}…` : signup.note) : '未填写自我介绍'}${signup.experience ? ` · ${esc(signup.experience)}` : ''}</small></div><div class="applicant-ops">${signup.resume_path ? `<button class="secondary-button compact" data-signup-resume="${esc(signup.resume_path)}">看简历</button>` : ''}<button class="primary-button compact" data-community-confirm="${esc(signup.id)}">查看介绍并确认</button></div></div>`).join('')}`;
    }
  }
  if (auth?.mode === 'cloud') renderCloudOrders();
  if (auth?.mode === 'cloud' && !escort) renderMigrationSummary();
}
async function renderMigrationSummary() {
  const host=document.getElementById('migrationStatus'); if(!host) return;
  try {
    const runs=await window.KangbanAPI.select('migration_runs',{filters:{user_id:window.KangbanAuth.session.user.id},order:{column:'created_at',ascending:false},limit:3});
    if(!runs.length){host.hidden=true;host.innerHTML='';return;}
    const labels={pending:'等待导入',running:'正在导入',failed:'上次导入中断，可续传',completed:'最近一次导入已完成'};
    host.hidden=false;
    host.innerHTML=`<strong>本机数据迁移记录</strong>${runs.map(run=>`<div><span>${esc(labels[run.status]||run.status)} · ${esc(new Date(run.created_at).toLocaleString('zh-CN'))}</span><small>${Object.entries(run.category_counts||{}).map(([key,count])=>`${esc(key)} ${Number(count)||0}`).join(' · ')}</small></div>`).join('')}`;
  } catch(error) { host.hidden=false; host.textContent=`迁移记录暂不可用：${error.message||error}`; }
}
async function renderCloudEscortProfile() {
  const host=document.getElementById('cloudEscortProfileView'); if(!host) return;
  try {
    const [rawProfile]=await window.KangbanAPI.select('escort_profiles',{filters:{user_id:window.KangbanAuth.session.user.id},limit:1});
    const profile = escortProfileForDisplay(rawProfile);
    if(!profile){host.innerHTML='<div class="empty-hint">陪诊师资料尚未初始化，请重新登录。</div>';return;}
    const approved=profile.review_status==='approved';
    const paused=profile.available===false;
    host.innerHTML=`<div class="me-idcard"><div class="me-id-top"><div class="me-ava">${esc((profile.display_name||'陪').slice(0,1))}</div><div><b>${esc(profile.display_name||'陪诊师')}</b><small>${approved?'陪诊师账号 · 已审核':'陪诊师账号 · 审核中'}</small></div></div><div class="me-status"><span class="me-dot"></span>${paused?'已暂停接单 · 家庭暂不能预约你的时段':'接单中 · 社区大厅可被家庭预约'}</div></div><section class="section-block escort-profile-cloud"><div class="section-heading"><div><p class="eyebrow">陪诊师资料</p><h2>我的介绍</h2></div></div><form class="escort-profile-form" id="cloudEscortProfileForm"><label><span class="field-label-block">称呼</span><input class="input-field" name="display_name" maxlength="48" value="${esc(profile.display_name)}" required></label><label><span class="field-label-block">陪诊经验</span><input class="input-field" name="experience" maxlength="100" value="${esc(profile.experience||'')}"></label><label><span class="field-label-block">服务区域</span><input class="input-field" name="service_area" maxlength="160" value="${esc(profile.service_area||'')}"></label><label><span class="field-label-block">自我介绍</span><textarea name="bio" maxlength="500">${esc(profile.bio||'')}</textarea></label><button class="secondary-button" type="submit">保存介绍</button></form><p class="privacy-small">发布陪诊服务与管理发布都在工作台；这里维护面向家庭展示的介绍资料。</p></section>`;
  } catch(error){host.innerHTML=`<div class="empty-hint">陪诊师资料加载失败：${esc(error.message||error)}</div>`;}
}
function showAvailabilityForm(post = null) {
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud' || auth?.role !== 'escort' || auth.session?.status !== 'active') { toast('陪诊师账号审核通过后才可发布陪诊服务'); return; }
  const editing = Boolean(post);
  const serviceOptions = ['门诊全程陪诊', '检查陪同', '代取药 · 代取报告', '住院日间陪护', '报告解读'].map(service => `<option value="${esc(service)}"${post?.service_type === service ? ' selected' : ''}>${esc(service)}</option>`).join('');
  const prefillRegion = post?.region || auth.session?.escortProfile?.service_area || '';
  openModal(`${modalHead('陪诊师社区', editing ? '编辑陪诊服务' : '发布陪诊服务', '只展示服务区域、日期与服务内容，不发布个人证件或患者信息。')}
    <form class="order-form" id="availabilityForm" ${editing ? `data-edit-id="${esc(post.id)}"` : ''}><label><span class="field-label-block">服务区域</span><input class="input-field" name="region" maxlength="100" required placeholder="例如：深圳南山区" value="${esc(prefillRegion)}"></label><label><span class="field-label-block">服务类型</span><select class="input-field" name="serviceType" required>${serviceOptions}</select></label><label><span class="field-label-block">可约日期</span><input class="input-field" name="date" type="date" value="${esc(post?.service_date || dateOffset(3))}" required></label><div class="form-two-col"><label><span class="field-label-block">开始时间</span><input class="input-field" name="start" type="time" value="${esc(post?.start_time ? String(post.start_time).slice(0, 5) : '09:00')}" required></label><label><span class="field-label-block">结束时间</span><input class="input-field" name="end" type="time" value="${esc(post?.end_time ? String(post.end_time).slice(0, 5) : '12:00')}" required></label></div><label><span class="field-label-block">服务介绍（选填）</span><textarea class="input-field" name="summary" maxlength="200" placeholder="例如：熟悉市一院流程，可协助挂号与院内引导">${esc(post?.summary || '')}</textarea></label><button class="primary-button" type="submit">${editing ? '保存修改' : '发布时段'}</button></form>`);
}
async function showMyPosts() {
  /* 陪诊师发布管理已收进工作台「我的发布」抽屉；此入口保留兜底，直接展开抽屉 */
  escortMyPostsOpen = true;
  if (currentTab !== 'escort') navigate('escort');
  else renderCloudWorkbench();
}
function showBookAvailabilityModal(post) {
  openModal(`${modalHead('预约陪诊服务', '提交预约申请', '陪诊师确认后生成正式订单，确认前可随时撤销；患者资料在成单前不会开放。')}
    <form class="order-form" id="bookAvailabilityForm" data-post-id="${esc(post.id)}"><p class="privacy-small">${esc(post.service_type || '陪诊服务')} · ${esc(post.region || '')} · ${esc(post.service_date || '')}${post.start_time ? ` ${esc(String(post.start_time).slice(0, 5))}` : ''}</p><label><span class="field-label-block">想说明的情况（选填）</span><textarea class="input-field" name="note" maxlength="200" placeholder="例如：母亲周三复查，希望全程陪同"></textarea></label><button class="primary-button" type="submit">提交预约申请</button></form>`);
}
/* ===== 云端订单时间线（双端共用）：已确认→已到场→服务中→履约清单→完成互评 ===== */
function fmtClock(iso) { return iso ? new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''; }
function isVisibleTestFixture(record = {}) {
  const sample = ['service_type', 'hospital_name', 'region', 'summary', 'need_summary', 'author_label', 'requester', 'patient_label']
    .map(key => String(record[key] || '')).join(' ');
  return /E2E|虚构演示(?:医院|区域|资料)|测试专用/i.test(sample);
}
function isDemoEscortAccount() {
  return String(window.KangbanAuth?.session?.user?.email || '').toLowerCase() === 'kangban-escort-demo@example.com';
}
function escortProfileForDisplay(profile) {
  if (!profile || !isDemoEscortAccount()) return profile;
  return {
    ...profile,
    experience: profile.experience || '5 年门诊陪诊服务经验',
    service_area: profile.service_area || '深圳 · 南山区、福田区',
    bio: profile.bio || '熟悉门诊检查、取药与报告领取流程，可协助整理就诊材料；不提供诊断、治疗或用药建议。'
  };
}
function cloudOrderTimeline(order, isEscort) {
  const arrived = Boolean(order.arrived_at);
  const inService = order.status === 'in_service';
  const completed = order.status === 'completed';
  const items = order.execution?.items || [];
  const doneCount = items.filter(item => item.done).length;
  const rows = [{ done: true, label: '双方已确认', sub: isEscort ? '家庭确认 · 你已接受订单' : '陪诊师已接单', side: fmtClock(order.escort_confirmed_at) }];
  if (completed) rows.push({ done: true, label: '已到场', sub: '陪诊师已到达医院', side: fmtClock(order.arrived_at) });
  else rows.push({ done: arrived, now: !arrived && order.status === 'confirmed', label: '已到场', sub: arrived ? '陪诊师已到达医院' : (isEscort ? '点击下方「我已到场」回传' : '等待陪诊师回传到场'), side: arrived ? fmtClock(order.arrived_at) : '' });
  if (completed) rows.push({ done: true, label: `服务中 · 履约 ${doneCount} / ${items.length}`, sub: '已按清单完成全部履约项目', side: '' });
  else rows.push({ done: false, now: inService, label: `服务中 · 履约 ${doneCount} / ${items.length}`, sub: inService ? '陪诊师正在逐项完成并回传' : '确认到场后开始服务', side: inService ? '进行中' : '' });
  rows.push(completed ? { done: true, label: '完成服务 · 互评', sub: '本单服务已完成', side: fmtClock(order.updated_at) } : { done: false, label: '完成服务 · 互评', sub: '全部清单完成后标记完成', side: '' });
  return `<div class="order-timeline">${rows.map(row => `<div class="otl-row${row.done ? ' done' : ''}${row.now ? ' now' : ''}"><span class="otl-dot">${row.done ? '✓' : row.now ? '●' : ''}</span><div class="otl-copy"><strong>${esc(row.label)}</strong><small>${esc(row.sub)}</small></div>${row.side ? `<span class="otl-side">${esc(row.side)}</span>` : ''}</div>`).join('')}</div>`;
}
function renderCloudOrderCard(order, isEscort) {
  const items = order.execution?.items || [];
  const doneCount = items.filter(item => item.done).length;
  const active = ['pending_escort_confirmation', 'confirmed', 'in_service'].includes(order.status);
  const chip = { pending_escort_confirmation: ['待确认', 'is-pending'], confirmed: [order.arrived_at ? '已到场' : '待服务', 'is-ok'], in_service: ['服务中', 'is-pending'], completed: ['已完成', 'is-ok'], cancelled: ['已取消', 'is-taken'] }[order.status] || [POST_STATUS_LABEL[order.status] || order.status, ''];
  const needLine = !isEscort || order.share_authorized ? `<br>需求：${esc(order.need_summary || '未补充')}` : '';
  const whoLine = `${isEscort && !order.share_authorized ? '' : `<b>${esc(order.patient_label || '家庭成员')}</b> · `}${esc(order.hospital_name)} · ${esc(order.service_date)}${order.starts_at ? ` · ${fmtClock(order.starts_at)} 开始` : ''}${needLine}`;
  /* 履约清单：服务中/完成后双方可见（家庭实时看进度与佐证） */
  const showChecklist = ['in_service', 'completed'].includes(order.status) && items.length;
  const checklist = showChecklist ? `<div class="exec-block"><div class="exec-progress"><strong>履约进度 ${doneCount} / ${items.length}</strong>${order.status === 'in_service' ? '<span>实时同步</span>' : '<span class="exec-progress-done">已全部完成</span>'}</div><div class="exec-list">${items.map(item => {
    const canToggle = isEscort && order.status === 'in_service' && !item.done;
    const evidence = item.evidence_path
      ? `<button class="exec-evidence has-evidence" data-cloud-evidence-view="${esc(item.evidence_path)}" data-evidence-label="${esc(item.label)}">查看佐证</button>`
      : canToggle && item.evidence_required ? `<button class="exec-evidence" data-cloud-evidence="${esc(item.key)}" data-order-id="${esc(order.id)}">上传佐证</button>` : '';
    return `<div class="exec-row ${item.done ? 'is-done' : ''}">${item.done ? '✓' : '○'}<div class="exec-copy"><strong>${esc(item.label)}</strong><small>${item.done ? '已完成' : item.evidence_required ? '需上传佐证照片' : '待执行'}</small></div>${!item.done && canToggle && !item.evidence_required ? `<button class="exec-toggle" data-cloud-task="${esc(item.key)}" data-order-id="${esc(order.id)}">完成</button>` : evidence}</div>`;
  }).join('')}</div></div>` : '';
  let actions = '';
  if (isEscort && order.status === 'pending_escort_confirmation') actions = `<button class="primary-button" data-cloud-order-confirm="${esc(order.id)}">确认订单</button>`;
  else if (isEscort && order.status === 'confirmed' && !order.arrived_at) actions = `<button class="primary-button" data-cloud-order-transition="arrive" data-order-id="${esc(order.id)}">我已到场</button>`;
  else if (isEscort && order.status === 'confirmed') actions = `<button class="primary-button" data-cloud-order-transition="start" data-order-id="${esc(order.id)}">开始服务</button>`;
  else if (isEscort && order.status === 'in_service') actions = items.length && doneCount === items.length ? `<button class="primary-button" data-cloud-order-transition="complete" data-order-id="${esc(order.id)}">完成服务</button>` : '<small class="privacy-small">按八项标准履约清单逐项完成并回传，家庭端实时可见。</small>';
  const cancel = active ? `<button class="text-button" data-cloud-order-transition="cancel" data-order-id="${esc(order.id)}">取消订单</button>` : '';
  const familyShare = !isEscort && ['confirmed', 'in_service'].includes(order.status)
    ? `<button class="secondary-button" data-cloud-task-share="${esc(order.id)}">${order.share_expires_at && !order.share_revoked_at && Date.parse(order.share_expires_at) > Date.now() ? '查看分享状态 / 重新生成' : '生成本次任务分享码'}</button>${order.share_access_logs?.length ? `<div class="share-log"><h3>分享访问记录</h3>${order.share_access_logs.map(log => `<div class="log-row"><span>陪诊师已访问</span><small>${esc(new Date(log.accessed_at).toLocaleString('zh-CN'))} · ${esc(log.what || '本次任务信息')}</small></div>`).join('')}</div>` : ''}` : '';
  const review = order.status === 'completed' && !order.reviews?.[isEscort ? 'escort' : 'family']
    ? `<button class="secondary-button" data-cloud-order-review="${esc(order.id)}" data-review-role="${isEscort ? 'escort' : 'family'}">评价本次服务</button>` : '';
  const escortPrivacy = isEscort && !order.share_authorized && active ? '<small class="privacy-small">患者信息与详细需求需由家属通过本次任务分享码授权。</small>' : '';
  const reviewed = order.status === 'completed' && order.reviews?.[isEscort ? 'family' : 'escort'] ? '<small class="privacy-small">对方已提交本单评价。</small>' : '';
  const timeline = order.status === 'cancelled'
    ? '<p class="privacy-small order-cancelled-note">订单已取消，后续服务与履约已结束。</p>'
    : cloudOrderTimeline(order, isEscort);
  return `<article class="demand-post-card cloud-order-card${active ? ' is-active' : ''}"><div class="family-order-top"><strong>${esc(order.service_type)} · ${esc(chip[0])}</strong><span class="supply-status-chip ${chip[1]}">${esc(chip[0])}</span></div><p class="community-meta">${whoLine}</p>${timeline}${checklist}${escortPrivacy}${actions}${cancel}${familyShare}${review}${reviewed}</article>`;
}
/* ===== 云端陪诊师工作台（接真数据） ===== */
async function renderCloudWorkbench() {
  const host = document.getElementById('escortWorkbenchCloud');
  if (!host || window.KangbanAuth?.mode !== 'cloud' || window.KangbanAuth.role !== 'escort') return;
  host.hidden = false;
  try {
    const [profileRows, orders, bookings, myPosts, mySignups, allPosts] = await Promise.all([
      window.KangbanAPI.select('escort_profiles', { filters: { user_id: window.KangbanAuth.session.user.id }, limit: 1 }),
      window.KangbanAPI.rpc('list_my_companion_orders'),
      window.KangbanAPI.rpc('list_my_availability_bookings').catch(() => []),
      window.KangbanAPI.select('community_posts', { filters: { author_id: window.KangbanAuth.session.user.id }, order: { column: 'created_at', ascending: false }, limit: 50 }).catch(() => []),
      window.KangbanAPI.select('post_signups', { filters: { escort_id: window.KangbanAuth.session.user.id }, order: { column: 'created_at', ascending: false }, limit: 20 }).catch(() => []),
      window.KangbanAPI.select('community_posts', { order: { column: 'created_at', ascending: false }, limit: 100 }).catch(() => [])
    ]);
    const profile = escortProfileForDisplay(profileRows[0] || null);
    if (profile) window.KangbanAuth.session.escortProfile = profile;
    const visibleOrders = orders.filter(order => !isVisibleTestFixture(order));
    const visibleBookings = (bookings || []).filter(booking => !isVisibleTestFixture(booking));
    const visiblePosts = (myPosts || []).filter(post => !isVisibleTestFixture(post));
    const fixturePostIds = new Set((allPosts || []).filter(post => isVisibleTestFixture(post)).map(post => post.id));
    const visibleSignups = (mySignups || []).filter(signup => !fixturePostIds.has(signup.post_id));
    cloudOrderCache = new Map(visibleOrders.map(order => [order.id, order]));
    const pendingBookings = visibleBookings.filter(booking => booking.status === 'applied');
    const activeOrders = visibleOrders.filter(order => ['pending_escort_confirmation', 'confirmed', 'in_service'].includes(order.status));
    const completedOrders = visibleOrders.filter(order => order.status === 'completed');
    const paused = profile && profile.available === false;
    const shareLookup = `<section class="section-block"><div class="section-heading"><div><p class="eyebrow">家庭授权</p><h2>输入本次任务分享码</h2></div></div><form class="order-form" id="cloudTaskShareLookup"><label><span class="field-label-block">6 位分享码</span><input class="input-field" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button class="primary-button" type="submit">验证并查看授权内容</button></form><div id="cloudTaskShareResult"></div></section>`;
    host.innerHTML = `
      <div class="escort-status-card"><div><span class="cloud-pill">云端生效 · 预约申请实时校验</span><strong>${paused ? '暂停接单' : '可预约'}</strong><small>${paused ? '家庭暂时不能预约你的服务时段' : '社区页可被家庭预约你的服务时段'}</small></div><button class="status-btn" data-escort-toggle-availability="${paused ? '1' : '0'}">${paused ? '恢复接单' : '暂停接单'}</button></div>
      ${profile && profile.review_status !== 'approved' ? '<div class="boundary-note"><strong>审核中</strong><p>审核通过前不能发布时段或报名需求。</p></div>' : ''}
      <div class="escort-stat-grid"><div><strong>${pendingBookings.length + visibleOrders.filter(order => order.status === 'pending_escort_confirmation').length}</strong><span>待确认</span></div><div><strong>${activeOrders.filter(order => order.status !== 'pending_escort_confirmation').length}</strong><span>进行中</span></div><div><strong>${completedOrders.length}</strong><span>已完成</span></div></div>
      ${pendingBookings.length ? `<section class="section-block" style="margin-top:4px"><div class="section-heading"><h2>新的预约申请</h2></div>${pendingBookings.map(booking => `<div class="invite-card"><div class="family-order-top"><strong>${esc(booking.booker_label || '家庭用户')} 预约了你的时段</strong><span class="supply-status-chip is-pending">待确认</span></div><p class="community-meta">${esc(booking.note || '未附言')} · ${esc(new Date(booking.created_at).toLocaleString('zh-CN'))}</p><div class="order-actions-2"><button class="secondary-button compact" data-community-respond="${esc(booking.id)}" data-accept="0">婉拒</button><button class="primary-button compact" data-community-respond="${esc(booking.id)}" data-accept="1">接受预约</button></div></div>`).join('')}</section>` : ''}
      <section class="section-block" style="margin-top:4px"><div class="section-heading"><h2>我的陪诊安排</h2></div>${visibleOrders.length ? `<div class="demand-post-list">${visibleOrders.map(order => renderCloudOrderCard(order, true)).join('')}</div>` : `<div class="empty-link">还没有订单。发布陪诊服务等家庭预约，或去社区报名别人的需求 <b data-nav="community">→ 打开社区</b></div>`}</section>
      <div id="escortMyPostsArea"></div>
      ${shareLookup}
      <div class="boundary-note"><strong>服务边界</strong><p>陪诊员协助就医流程，不提供诊断、治疗或用药建议。患者资料仅经家庭分享码授权后可见。</p></div>`;
    renderEscortMyPosts(visiblePosts, pendingBookings.length, visibleSignups, Object.fromEntries((allPosts || []).filter(post => !isVisibleTestFixture(post)).map(post => [post.id, post])));
  } catch (error) { host.innerHTML = `<div class="empty-hint">工作台加载失败：${esc(error.message || error)} <button class="text-button" data-action="escort-reload">重试</button></div>`; }
}
/* ===== 陪诊师「我的发布」抽屉（对称家庭端：发布管理归事务中心）：默认收缩一行，有新预约时高亮；
   抽屉内两组：我的服务（发布管理 + 收到的预约计数）+ 我的报名（我报名的需求跟进，填补报名→成单盲区） ===== */
let escortMyPostsOpen = false;
let escortMyPostsCache = { posts: [], newBookings: 0, signups: [], postById: {} };
function renderEscortMyPosts(posts = escortMyPostsCache.posts, newBookings = escortMyPostsCache.newBookings, signups = escortMyPostsCache.signups, postById = escortMyPostsCache.postById) {
  const host = document.getElementById('escortMyPostsArea');
  if (!host) return;
  escortMyPostsCache = { posts: posts || [], newBookings: newBookings || 0, signups: signups || [], postById: postById || {} };
  const rows = escortMyPostsCache.posts;
  const mySignups = escortMyPostsCache.signups;
  const pendingSignups = mySignups.filter(signup => signup.status === 'applied').length;
  if (!rows.length && !mySignups.length) {
    host.hidden = false;
    host.innerHTML = `<section class="section-block my-posts-drawer"><button type="button" class="my-posts-bar" id="escortMyPostsToggle"><strong>我的发布</strong><span class="mp-facts">还没有发布陪诊服务</span><span class="mp-arrow">${escortMyPostsOpen ? '▾' : '▸'}</span></button><div class="my-posts-detail" ${escortMyPostsOpen ? '' : 'hidden'}><p class="empty-hint">发布陪诊服务后，家庭可以在社区大厅直接向你提交预约申请。</p><div class="mp-head"><button class="primary-button compact" data-action="availability-form">＋ 发布陪诊服务</button></div></div></section>`;
    return;
  }
  const inProgress = rows.filter(post => ['open', 'has_applicants', 'awaiting_confirmation'].includes(post.status)).length;
  const listHtml = rows.map(post => {
    const label = post.type === 'availability' ? '服务 · 时段' : '需求';
    const info = post.type === 'availability' ? `${post.region || ''} · ${post.service_date || ''}${post.start_time ? ` ${String(post.start_time).slice(0, 5)}` : ''}` : `${post.hospital_name || ''} · ${post.service_date || ''}`;
    const cancellable = post.type === 'demand' ? ['open', 'has_applicants'].includes(post.status) : post.status === 'open';
    const editable = post.type === 'availability' && post.status === 'open';
    return `<div class="my-post-row"><div><strong>${esc(post.service_type)}</strong><small>${esc(label)} · ${esc(info)} · ${esc(POST_STATUS_LABEL[post.status] || post.status)}</small></div><div class="applicant-ops">${editable ? `<button class="secondary-button compact" data-my-edit="${esc(post.id)}">编辑</button>` : ''}${cancellable ? `<button class="text-button" data-my-cancel="${esc(post.id)}">取消</button>` : ''}</div></div>`;
  }).join('');
  /* 我的报名组：状态 applied=待家庭挑选 / selected=已选中 / declined=未被选中 / withdrawn=已撤回 */
  const signupsHtml = mySignups.length ? `<div class="mp-subhead">我的报名</div>${mySignups.map(signup => {
    const post = escortMyPostsCache.postById[signup.post_id] || {};
    const label = SIGNUP_STATUS_LABEL[signup.status] || signup.status;
    const note = signup.note ? ` · 附言：${esc(signup.note.length > 36 ? `${signup.note.slice(0, 36)}…` : signup.note)}` : '';
    const tail = signup.status === 'selected' ? ' · 成单后见「我的陪诊安排」' : '';
    return `<div class="my-post-row"><div><strong>${esc(post.service_type || '陪诊需求报名')}</strong><small>${esc(label)} · ${esc(post.hospital_name || '')}${post.service_date ? ` · ${esc(post.service_date)}` : ''}${note}${tail}</small></div></div>`;
  }).join('')}` : '';
  const facts = [inProgress ? `${inProgress} 条进行中` : '', escortMyPostsCache.newBookings ? `<b>${escortMyPostsCache.newBookings} 个新预约</b>` : '', pendingSignups ? `${pendingSignups} 个报名待确认` : ''].filter(Boolean).join(' · ');
  host.hidden = false;
  host.innerHTML = `<section class="section-block my-posts-drawer"><button type="button" class="my-posts-bar${escortMyPostsCache.newBookings ? ' has-new' : ''}" id="escortMyPostsToggle"><strong>我的发布</strong><span class="mp-facts">${facts || '暂无进行中'}</span><span class="mp-arrow">${escortMyPostsOpen ? '▾' : '▸'}</span></button><div class="my-posts-detail" ${escortMyPostsOpen ? '' : 'hidden'}><div class="mp-head"><button class="text-button" data-action="availability-form">＋ 发布陪诊服务</button></div>${rows.length ? `<div class="mp-subhead">我发布的服务</div>${listHtml}` : ''}${signupsHtml}</div></section>`;
}
/* ===== 家庭端陪诊 Tab 实时动态 + 首页当天入口 ===== */
async function renderCloudFamilyOrders() {
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud' || auth.role !== 'family') return;
  const host = document.getElementById('companionLiveOrders');
  try {
    const orders = (await window.KangbanAPI.rpc('list_my_companion_orders')).filter(order => !isVisibleTestFixture(order));
    cloudOrderCache = new Map(orders.map(order => [order.id, order]));
    const active = orders.filter(order => ['pending_escort_confirmation', 'confirmed', 'in_service'].includes(order.status));
    const needReview = orders.filter(order => order.status === 'completed' && !order.reviews?.family);
    if (host) {
      host.hidden = !active.length && !needReview.length;
      host.innerHTML = `${active.length ? `<section class="section-block" style="margin-top:2px"><div class="section-heading"><div><p class="eyebrow">陪诊实时动态</p><h2>进行中的陪诊</h2></div></div><div class="demand-post-list">${active.map(order => renderCloudOrderCard(order, false)).join('')}</div></section>` : ''}${needReview.length ? `<section class="section-block"><div class="section-heading"><h2>待评价</h2></div><div class="demand-post-list">${needReview.slice(0, 3).map(order => renderCloudOrderCard(order, false)).join('')}</div></section>` : ''}`;
    }
    /* 首页统领区接云端：Hero 显示当天陪诊；总览条与待办队列用云端订单+新报名 */
    const todayOrder = active.find(order => order.service_date === dateOffset(0));
    updateHero(todayOrder);
    renderHomeTodayBar(orders);
    const match = await fetchCloudFamilyMatch();
    renderHomeTodo(homeTodoItems(orders).concat(match.items));
    /* 红点单一来源：有新报名点亮陪诊 Tab（子页签角标已取消，通知文案引导回「我的陪诊」） */
    setHallDot(match.items.length > 0);
    /* 「我的发布」抽屉：撮合中事务收在事务中心，默认收缩（含我发出的预约申请） */
    renderFamilyMyPosts(match.posts, orders, match.bookings, match.postById);
    renderHomeMemberStrip();
  } catch (error) {
    updateHero();
    if (host) host.innerHTML = `<div class="empty-hint">陪诊动态加载失败：${esc(error.message || error)}</div>`;
  }
}
/* ===== 云端操作后的上下文刷新（取代单一 renderCommunity） ===== */
async function refreshCloudAfterAction() {
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud') { await renderCommunity(); return; }
  if (auth.role === 'escort') { try { await renderCloudWorkbench(); } catch { /* 忽略 */ } }
  else { try { await renderCompanionViews(); } catch { /* 忽略 */ } }
  if (currentTab === 'community' || (currentTab === 'companion' && companionSub === 'hall')) await renderCommunity();
}
/* ===== Tab 红点提示 ===== */
function setTabDot(tab, on) {
  document.querySelectorAll(`.tab[data-tab="${tab}"]`).forEach(el => el.classList.toggle('has-dot', on));
}
/* 红点单一来源：家庭端只认「陪诊 Tab」，子页签角标已取消 */
function setHallDot(on) {
  setTabDot('companion', on);
}
/* ===== Realtime 订阅：对方状态一变，本端自动刷新 + 提示 ===== */
let cloudRealtimeChannel = null;
function subscribeCloudRealtime() {
  const auth = window.KangbanAuth;
  const client = window.KangbanAPI?.client;
  if (auth?.mode !== 'cloud' || !auth.session?.user?.id || !client?.channel) return;
  if (cloudRealtimeChannel) { try { client.removeChannel(cloudRealtimeChannel); } catch { /* 忽略 */ } }
  const dotTab = auth.role === 'escort' ? 'escort' : 'companion';
  cloudRealtimeChannel = client.channel(`kangban-live-${auth.session.user.id.slice(0, 8)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'companion_orders' }, payload => {
      const active = ['confirmed', 'in_service', 'pending_escort_confirmation', 'completed'].includes(payload?.new?.status);
      toast(active ? '陪诊安排有更新' : '订单已更新');
      if (currentTab !== dotTab) setTabDot(dotTab, true);
      refreshCloudAfterAction();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_bookings' }, () => {
      toast('预约申请有更新');
      if (currentTab !== dotTab) setTabDot(dotTab, true);
      refreshCloudAfterAction();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_signups' }, () => {
      /* 家庭发的需求帖来了新报名：主动把人推回事务中心处理 */
      if (auth.role === 'family') {
        toast('有人报名你的需求，去「我的陪诊」处理');
        if (currentTab !== 'companion') setTabDot('companion', true);
        refreshCloudAfterAction();
      }
    })
    .subscribe();
}
function unsubscribeCloudRealtime() {
  const client = window.KangbanAPI?.client;
  if (cloudRealtimeChannel && client?.removeChannel) { try { client.removeChannel(cloudRealtimeChannel); } catch { /* 忽略 */ } }
  cloudRealtimeChannel = null;
}
/* ===== 社区页：只保留管理员审核队列（撮合页不挂订单） ===== */
async function renderCloudOrders() {
  const host = document.getElementById('communityOrders');
  if (!host || window.KangbanAuth?.mode !== 'cloud') return;
  host.innerHTML = '';
  await renderCloudAdminQueue(host);
}
async function renderCloudAdminQueue(host=document.getElementById('communityOrders')) {
  if (!host || !window.KangbanAuth.session?.isAdmin) return;
  try {
    const pending = await window.KangbanAPI.rpc('list_pending_escorts');
    host.insertAdjacentHTML('beforeend', `<section class="section-block admin-review-queue"><div class="section-heading"><div><p class="eyebrow">管理员</p><h2>陪诊师审核 · ${pending.length}</h2></div></div>${pending.length ? `<div class="demand-post-list">${pending.map(person=>`<article class="demand-post-card"><strong>${esc(person.display_name||'未填写称呼')}</strong><p>${esc(person.experience||'暂无经验说明')}<br>${esc(person.service_area||'未填写服务区域')}<br>${esc(person.bio||'')}</p><button class="primary-button" data-admin-review="${esc(person.user_id)}" data-decision="approved">通过审核</button><button class="text-button" data-admin-review="${esc(person.user_id)}" data-decision="rejected">拒绝</button></article>`).join('')}</div>`:'<p class="empty-hint">当前没有待审核账号。</p>'}</section>`);
  } catch(error) { host.insertAdjacentHTML('beforeend', `<p class="privacy-small">审核队列加载失败：${esc(error.message||error)}</p>`); }
}
function showCloudTaskShareForm(orderId) {
  const order=cloudOrderCache.get(orderId);
  if(!order || !['confirmed','in_service'].includes(order.status)) { toast('只有已确认或服务中的订单可以生成分享码'); return; }
  openModal(`${modalHead('本次任务分享码 · 10 分钟有效','生成陪诊授权码','分享码仅向当前订单的已审核陪诊师开放。患者资料不会出现在陪诊师订单列表中。')}
    <form class="order-form" id="cloudTaskShareForm" data-order-id="${esc(orderId)}"><label class="share-toggle"><span><strong>附上诊前自我描述</strong><small>${order.patient_member_id?'仅共享该成员最近一条文字描述，不共享病史、用药或报告。':'当前订单尚未关联家庭成员，暂不能分享诊前描述。'}</small></span><input type="checkbox" name="withSelfDescription" ${order.patient_member_id?'':'disabled'}><span class="switch"></span></label><button class="primary-button" type="submit">生成 6 位分享码</button></form>`);
}
function showCloudOrderReview(orderId,role) {
  const order=cloudOrderCache.get(orderId);
  if(!order || order.status!=='completed') { toast('只有已完成订单可以评价'); return; }
  openModal(`${modalHead('云端订单评价','评价本次陪诊','评价仅对本订单双方可见，不公开展示。')}
    <form class="review-form" id="cloudOrderReviewForm" data-order-id="${esc(orderId)}"><label><span class="field-label-block">整体体验</span><select class="input-field" name="score"><option value="5">5 分 · 很满意</option><option value="4">4 分 · 满意</option><option value="3">3 分 · 一般</option><option value="2">2 分 · 不太满意</option><option value="1">1 分 · 不满意</option></select></label><label><span class="field-label-block">补充说明</span><textarea name="comment" maxlength="160"></textarea></label><button class="primary-button" type="submit">提交评价</button></form>`);
}
async function createCloudTaskShare(form) {
  const orderId=form.dataset.orderId;
  const order=cloudOrderCache.get(orderId);
  if(!order) throw new Error('订单已更新，请重新打开社区。');
  const random=new Uint32Array(1); crypto.getRandomValues(random);
  const code=String(100000+(random[0]%900000));
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
  const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  const expiresAt=await window.KangbanAPI.rpc('create_order_task_share',{p_order_id:orderId,p_code_hash:hash,p_with_self_description:new FormData(form).get('withSelfDescription')==='on'});
  const date=new Date(expiresAt);
  openModal(`${modalHead('云端任务分享码','请让陪诊师输入此码',`仅本订单的陪诊师可验证；有效至 ${date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}。关闭后不会再次显示完整码。`)}<div class="share-card"><h3 class="task-share-code">${esc(code)}</h3><div class="code-caption">10 分钟后失效 · 可随时撤销</div></div><button class="primary-button" id="cloudShareDone">完成</button>`);
  document.getElementById('cloudShareDone')?.addEventListener('click',()=>{closeModal();renderCommunity();});
}
async function lookupCloudTaskShare(code,host) {
  if(!/^\d{6}$/.test(code)) throw new Error('请输入 6 位数字分享码。');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
  const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  const data=await window.KangbanAPI.rpc('lookup_order_task_share',{p_code_hash:hash});
  host.innerHTML=`<div class="task-share-result"><div class="family-order-top"><strong>${esc(data.patient_label||'家庭成员')} · 本次任务信息</strong><span class="record-status">已授权</span></div><p>${esc(data.service_type)} · ${esc(data.service_date)}<br>${esc(data.hospital_name)}<br>需求：${esc(data.need_summary||'未补充')}</p>${data.self_description?`<div class="exec-block"><div class="exec-progress"><strong>诊前自我描述（家属授权）</strong><span>仅用于代述病情</span></div><p class="task-share-desc">${esc(data.self_description.text||'未添加文字说明')}</p><small class="privacy-small">${esc(data.self_description.created_at||'')}</small></div>`:''}<small class="privacy-small">访问已记入云端记录；陪诊师不能查看健康档案、用药或完整病历。</small></div>`;
}
async function showCloudEvidencePreview(path, label) {
  try {
    const blob = await window.KangbanAPI.downloadPrivateFile(path);
    const url = URL.createObjectURL(blob);
    const media = blob.type?.startsWith('image/') ? `<img class="report-preview" src="${url}" alt="${esc(label)}">`
      : blob.type === 'application/pdf' ? `<iframe class="policy-pdf-frame" src="${url}" title="${esc(label)}"></iframe>`
      : '<p class="privacy-small">此格式暂不支持内嵌预览。</p>';
    openModal(`${modalHead('云端履约佐证', esc(label), '文件来自本次订单的私有云端空间；只有家庭成员和已选陪诊师可查看。')}${media}<button class="primary-button" id="closeCloudEvidencePreview">返回订单</button>`);
    document.getElementById('closeCloudEvidencePreview')?.addEventListener('click', closeModal);
  } catch (error) { toast(`无权查看或附件暂不可用：${error.message || error}`); }
}
/* 陪诊师报名页：自我介绍（预填资料页简介）+ 简历/资质上传，家庭据此判断是否选择 */
let demandApplyFile = null;
async function showDemandApplyForm(postId) {
  let post = (communityPostCache || []).find(item => item.id === postId);
  if (!post) {
    /* 工作台直接报名时社区缓存可能未填充，回云端补读一次 */
    try { post = await window.KangbanAPI.select('community_posts', { filters: { id: postId }, limit: 1 }).then(list => list[0] || null); }
    catch (error) { console.warn('补读需求帖失败', error); }
  }
  if (!post) { toast('需求不存在或已刷新，请重试'); return; }
  let bio = '', experience = '';
  try { const [profile] = await window.KangbanAPI.select('escort_profiles', { filters: { user_id: window.KangbanAuth.session.user.id }, limit: 1 }); bio = profile?.bio || ''; experience = profile?.experience || ''; } catch { /* 预填失败不阻断报名 */ }
  openModal(`${modalHead('报名陪诊需求', post.service_type || post.service || '陪诊需求', `${esc(post.hospital_name || post.hospital || '')} · ${esc(post.service_date || '')}${post.region ? ` · ${esc(post.region)}` : ''}`)}
    <form class="order-form" id="demandApplyForm" data-post-id="${esc(postId)}">
      <label><span class="field-label-block">自我介绍 · 家庭会据此判断是否选择你</span><textarea name="note" maxlength="500" required placeholder="介绍一下陪诊经验、擅长的服务类型、为什么适合这单…">${esc(bio)}</textarea></label>
      <label><span class="field-label-block">简历 / 资质材料（选填 · 支持图片或 PDF）</span><input class="input-field" type="file" id="demandApplyFile" accept="image/*,application/pdf" /></label>
      <p class="privacy-small" id="demandApplyFileLabel">未选择文件</p>
      ${experience ? `<p class="privacy-small">资料页经验：${esc(experience)}（可到「我的介绍」修改）</p>` : ''}
      <button class="primary-button" type="submit">提交报名</button>
    </form>`);
  document.getElementById('demandApplyFile')?.addEventListener('change', event => {
    demandApplyFile = event.target.files?.[0] || null;
    document.getElementById('demandApplyFileLabel').textContent = demandApplyFile ? `已选择：${demandApplyFile.name}` : '未选择文件';
  });
}
/* 报名记录补全展示字段（缓存里已带，兜底直查时需要自己拼） */
function signupForDisplay(signup, profile) {
  const shown = escortProfileForDisplay(profile) || {};
  return {
    ...signup,
    display_name: shown.display_name || signup.display_name || '待核验陪诊师',
    experience: shown.experience || signup.experience || '',
    service_area: shown.service_area || signup.service_area || '',
    bio: shown.bio || signup.bio || ''
  };
}
/* 家庭端审阅报名者：完整介绍 + 资质 + 简历预览，确认后才锁定 */
async function showSignupConfirmModal(signupId) {
  let signup = (communityPostCache || []).find(item => item._applicants?.some(applicant => applicant.id === signupId))?._applicants?.find(item => item.id === signupId);
  if (!signup) {
    /* 抽屉可以从首页直接进入：没逛过社区大厅时 communityPostCache 是空的，
       这里回云端补读一次，避免「报名信息已刷新」空壳弹窗 */
    try {
      const [row] = await window.KangbanAPI.select('post_signups', { filters: { id: signupId }, limit: 1 });
      if (row) {
        const profile = await window.KangbanAPI.select('escort_profiles', { filters: { user_id: row.escort_id }, limit: 1 }).then(list => list[0] || null).catch(() => null);
        signup = signupForDisplay(row, profile);
      }
    } catch (error) { console.warn('补读报名信息失败', error); }
  }
  if (!signup) { toast('报名信息已刷新，请重新打开'); return; }
  openModal(`${modalHead('审阅报名者', signup.display_name, `${esc(signup.experience || '经验待补充')}${signup.service_area ? ` · ${esc(signup.service_area)}` : ''}`)}
    <div class="signup-review">
      <p class="signup-review-label">报名附言</p>
      <p>${esc(signup.note || '未填写自我介绍')}</p>
      ${signup.bio && signup.bio !== signup.note ? `<p class="signup-review-label">资料页介绍</p><p>${esc(signup.bio)}</p>` : ''}
      ${signup.resume_path ? `<button class="secondary-button" data-signup-resume="${esc(signup.resume_path)}">查看简历 / 资质材料</button>` : '<p class="privacy-small">该陪诊师未上传简历附件。</p>'}
      <div class="order-actions">
        <button class="text-button" id="signupReviewBack">返回</button>
        <button class="primary-button" id="signupReviewConfirm">选择这位陪诊师</button>
      </div>
    </div>`);
  document.getElementById('signupReviewBack')?.addEventListener('click', closeModal);
  document.getElementById('signupReviewConfirm')?.addEventListener('click', async () => {
    try { await window.KangbanAPI.rpc('confirm_post_signup', { p_signup_id: signupId }); closeModal(); toast('已选定陪诊师，请等待双方确认'); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '确认失败'); }
  });
}
function renderDemandPosts() {
  const host = document.getElementById('demandPostList');
  if (!host) return;
  if (window.KangbanAuth?.mode === 'cloud') { host.innerHTML='<div class="empty-hint">云端陪诊需求统一在「社区」发布、报名与确认，避免本地演示数据和云端订单混用。<button class="text-button" data-nav="community">打开云端社区 →</button></div>'; return; }
  const posts = state.demandPosts || [];
  host.innerHTML = posts.length ? `<div class="demand-post-list">${posts.map(post => `
    <article class="demand-post-card">
      <div class="family-order-top"><strong>${esc(post.service)} · ${window.KangbanAuth?.role === 'guest' ? '家庭用户' : esc(post.patient)}</strong>${demandPostStatusChip(post.status)}</div>
      <p>${esc(post.hospital)} · ${esc(post.date)}<br>需求：${esc(post.need || '未补充')}${post.budget ? `<br>预算：${esc(post.budget)}` : ''}</p>
      <small class="privacy-small">发布人：${esc(post.requester || '家庭成员')} · 需求帖不含任何健康档案信息。</small>
      ${post.status === '招募中' ? `<div class="order-actions"><button class="secondary-button" data-demand-cancel="${esc(post.id)}">取消需求</button></div>` : ''}
      ${post.status === '已接单' || post.status === '服务中' ? `<small class="privacy-small">陪诊员已接单，进度可在上方「我的陪诊安排」查看。</small>` : ''}
    </article>`).join('')}</div>` : '<div class="empty-hint">还没有发布需求。点「发布需求」，把医院、日期和需要帮忙的事写清楚，陪诊员会在需求大厅看到。</div>';
}
function showDemandForm() {
  const members = state.familyMembers?.length ? state.familyMembers : seed.familyMembers;
  const memberOptions = members.map(member => `<option value="${esc(member.id)}">${esc(member.name)}（${esc(member.role)}）</option>`).join('');
  const serviceOptions = Object.keys(SERVICE_PRICES).map(service => `<option value="${esc(service)}">${esc(service)} · 参考 ¥${SERVICE_PRICES[service]}</option>`).join('');
  openModal(`${modalHead('社区需求区 · 发布陪诊需求', '发布一条需求帖', '需求帖只包含医院、时间、服务项和需求描述，不包含健康档案；陪诊师在需求大厅看到后会接单。')}
    <form class="order-form" id="demandForm">
      <label><span class="field-label-block">需要陪诊的家人</span><select class="input-field" name="patientMemberId" required>${memberOptions}</select></label>
      <label><span class="field-label-block">就诊医院</span><input class="input-field" name="hospital" value="市第一人民医院" required /></label>
      <label><span class="field-label-block">所在区域</span><input class="input-field" name="region" maxlength="100" value="深圳 · 南山区" required /></label>
      <label><span class="field-label-block">期望日期</span><input class="input-field" name="date" type="date" value="${dateOffset(5)}" required /></label>
      <label><span class="field-label-block">需要的服务</span><select class="input-field" name="service" required>${serviceOptions}</select></label>
      <label><span class="field-label-block">预算区间（选填）</span><div class="form-two-col"><input class="input-field" name="budgetMin" type="number" min="0" inputmode="numeric" placeholder="最低 ¥" /><input class="input-field" name="budgetMax" type="number" min="0" inputmode="numeric" placeholder="最高 ¥" /></div></label>
      <label><span class="field-label-block">需要帮忙的事</span><input class="input-field" name="need" maxlength="80" placeholder="例如：陪同做检查、引导院内路线" /></label>
      <label class="consent-row"><input type="checkbox" name="shareConsent" required /><span>我同意需求帖仅展示医院、时间和服务需求，不包含完整病历。</span></label>
      <button class="primary-button" type="submit">发布需求</button>
    </form><p class="privacy-small">演示版需求帖保存在本机浏览器，接单后转入标准陪诊订单流程。</p>`);
}
/* 陪诊师端 · 接单大厅（FR-09-1）：展示需求帖与预约单，不含医疗隐私 */
function renderEscortHall() {
  const host = document.getElementById('escortHallList');
  if (!host) return;
  if (window.KangbanAuth?.mode === 'cloud') { host.innerHTML='<div class="empty-hint">需求大厅已并入云端社区：报名需求、发布时段都在社区完成；接单后的履约与回传在工作台处理。<button class="text-button" data-nav="community">打开云端社区 →</button></div>'; return; }
  const posts = state.demandPosts || [];
  const recruiting = posts.filter(post => post.status === '招募中');
  const others = posts.filter(post => post.status !== '招募中');
  host.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">招募中 · ${recruiting.length} 条</p><h2>可接需求</h2></div></div>
    ${recruiting.length ? `<div class="demand-post-list">${recruiting.map(post => `
      <article class="demand-post-card">
        <div class="family-order-top"><strong>${esc(post.service)} · ${esc(post.patient)}</strong>${demandPostStatusChip(post.status)}</div>
        <p>${esc(post.hospital)} · ${esc(post.date)}<br>需求：${esc(post.need || '未补充')}${post.budget ? `<br>预算：${esc(post.budget)}` : ''}<br>参考报酬：¥${SERVICE_PRICES[post.service] || 268}（模拟）</p>
        <small class="privacy-small">发布人：${esc(post.requester || '家庭成员')} · 仅任务信息，不含健康档案。</small>
        <div class="order-actions"><button class="primary-button" data-demand-accept="${esc(post.id)}">接下这个需求</button></div>
      </article>`).join('')}</div>` : '<div class="empty-hint">暂无招募中的需求。家庭端在「陪诊 · 需求大厅」发布后，会实时出现在这里。</div>'}
    ${others.length ? `<div class="section-heading" style="margin-top:18px"><div><p class="eyebrow">已处理需求</p><h2>历史需求帖</h2></div></div><div class="demand-post-list">${others.map(post => `
      <article class="demand-post-card demand-post-card-done">
        <div class="family-order-top"><strong>${esc(post.service)} · ${esc(post.patient)}</strong>${demandPostStatusChip(post.status)}</div>
        <p>${esc(post.hospital)} · ${esc(post.date)}</p>
      </article>`).join('')}</div>` : ''}`;
}
function acceptDemandPost(postId) {
  if (window.KangbanAuth?.mode === 'cloud') { showDemandApplyForm(postId).catch(error => toast(error.message || '打开报名表单失败')); return; }
  const post = (state.demandPosts || []).find(item => item.id === postId);
  if (!post || post.status !== '招募中') { toast('这条需求已被处理'); return; }
  if (!state.companionProfile.available) { toast('你已暂停接单，请先在工作台恢复接单'); return; }
  const order = {
    id: `order-${Date.now()}`,
    source: 'demand',
    demandPostId: post.id,
    service: post.service,
    hospital: post.hospital,
    date: post.date,
    need: post.need,
    patient: post.patient,
    patientMemberId: post.patientMemberId || 'm1',
    requester: post.requester,
    providerName: state.companionProfile.name,
    price: SERVICE_PRICES[post.service] || 268,
    status: 'accepted',
    reviews: { family: null, escort: null },
    createdAt: new Date().toISOString()
  };
  post.status = '已接单';
  post.orderId = order.id;
  state.companionOrders.unshift(order);
  ensureExecution(order);
  saveState(); renderRecords();
  toast(`已接单：${post.service} · ${post.hospital}，请按履约清单逐项执行`);
}
function cancelDemandPost(postId) {
  const post = (state.demandPosts || []).find(item => item.id === postId);
  if (!post || post.status !== '招募中') { toast('只有招募中的需求可以取消'); return; }
  post.status = '已取消';
  saveState(); renderRecords(); renderCompanionViews();
  toast('需求帖已取消');
}
/* 需求帖状态联动：陪诊订单开始履约 → 服务中；完成 → 已完成 */
function syncDemandPostByOrder(order) {
  if (!order?.demandPostId) return;
  const post = (state.demandPosts || []).find(item => item.id === order.demandPostId);
  if (!post) return;
  if (order.status === 'completed' && post.status !== '已完成') post.status = '已完成';
  else if (order.status === 'accepted' && post.status === '已接单') post.status = '服务中';
}

/* ============ 本次任务分享码（FR-10 医疗隐私隔离）：家庭生成 → 陪诊师输入查看 ============ */
function showTaskShareForm(orderId) {
  const order = state.companionOrders.find(item => item.id === orderId);
  if (!order || !['pending', 'accepted'].includes(order.status)) { toast('只有待确认或服务中的预约可以生成任务分享码'); return; }
  const existing = (state.taskShares || []).find(share => share.orderId === orderId && taskShareActive(share));
  if (existing) { showTaskShareDetail(existing.id); return; }
  const member = state.familyMembers.find(item => item.id === (order.patientMemberId || 'm1'));
  const descriptionCount = preVisitEntries(member?.id || 'm1').length;
  openModal(`${modalHead('本次任务分享码 · 10 分钟有效', `向陪诊员分享${esc(order.patient)}的本次任务`, '分享码是陪诊员获取任务信息的唯一通道：仅包含本次医院、时间与服务需求；勾选后才会附上诊前自我描述。')}
    <form class="order-form" id="taskShareForm" data-order-id="${esc(orderId)}">
      <div class="task-share-scope">
        <label class="share-toggle"><span><strong>本次任务信息</strong><small>${esc(order.hospital)} · ${esc(order.date)} · ${esc(order.service)}</small></span><input type="checkbox" checked disabled /><span class="switch"></span></label>
        <label class="share-toggle"><span><strong>附上诊前自我描述</strong><small>${descriptionCount ? `最近 ${descriptionCount} 条描述，用于陪诊员代述病情` : '暂无描述，可先在就诊准备清单中补充'}</small></span><input type="checkbox" name="withSelfDescription" ${descriptionCount ? '' : 'disabled'} /><span class="switch"></span></label>
      </div>
      <button class="primary-button" type="submit">生成 6 位分享码</button>
    </form>
    <p class="privacy-small">演示版分享码保存在本机：短时效、可撤销、访问留痕。陪诊员端无法查看健康档案、病史或用药信息。</p>`);
}
function generateTaskShare(orderId, withSelfDescription) {
  const order = state.companionOrders.find(item => item.id === orderId);
  if (!order) return null;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const share = {
    id: `tshare-${Date.now()}`,
    code,
    orderId,
    patient: order.patient,
    patientMemberId: order.patientMemberId || 'm1',
    hospital: order.hospital,
    date: order.date,
    service: order.service,
    need: order.need || '',
    withSelfDescription: Boolean(withSelfDescription),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    revokedAt: null,
    accessLogs: []
  };
  state.taskShares = [share, ...(state.taskShares || [])].slice(0, 20);
  saveState();
  return share;
}
function showTaskShareDetail(shareId) {
  const share = (state.taskShares || []).find(item => item.id === shareId);
  if (!share) { toast('没有找到这条分享'); return; }
  const active = taskShareActive(share);
  const expireText = new Date(share.expiresAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const logs = share.accessLogs || [];
  openModal(`${modalHead('本次任务分享码 · 10 分钟有效', `分享${esc(share.patient)}的本次任务`, active ? `有效至 ${expireText}；陪诊员输入此码可查看任务信息${share.withSelfDescription ? '与诊前自我描述' : ''}。` : '此分享码已失效或被撤销。')}
    <div class="share-card"><span class="pill pill-light"><span class="status-dot"></span> 本次任务信息${share.withSelfDescription ? ' · 诊前自我描述' : ''}</span><h3 class="task-share-code">${active ? esc(share.code) : '已失效'}</h3><div class="code-caption">${active ? `仅供现场演示 · ${expireText} 后失效` : share.revokedAt ? '家属已撤销此分享' : '已超过 10 分钟有效期'}</div></div>
    <div class="share-log"><h3>访问记录</h3>${logs.length ? logs.map(entry => `<div class="log-row"><span>${esc(entry.who)}</span><small>${esc(entry.when)} · 查看了${esc(entry.what)}</small></div>`).join('') : '<p class="privacy-small">陪诊员还没有查看。</p>'}</div>
    ${active ? `<button class="secondary-button" data-task-share-revoke="${esc(share.id)}">撤销此分享码</button>` : ''}
    <p class="privacy-small">陪诊员端通过分享码只能看到勾选范围的内容；每次查看都会记录在这里。</p>`);
}
function revokeTaskShare(shareId) {
  const share = (state.taskShares || []).find(item => item.id === shareId);
  if (!share || share.revokedAt) { toast('此分享码已撤销'); return; }
  share.revokedAt = new Date().toISOString();
  saveState(); renderRecords();
  toast('分享码已撤销，陪诊员端将无法再查看');
  showTaskShareDetail(shareId);
}
/* 陪诊师端：输入分享码 → 校验 → 展示任务信息（唯一数据通道，留痕） */
function lookupTaskShareCode() {
  const input = document.getElementById('taskShareCodeInput');
  const host = document.getElementById('taskShareResult');
  const code = String(input?.value || '').trim();
  if (!/^\d{6}$/.test(code)) { if (host) host.innerHTML = ''; toast('请输入 6 位数字分享码'); return; }
  const share = (state.taskShares || []).find(item => item.code === code);
  if (!share) { if (host) host.innerHTML = '<p class="privacy-small task-share-error">分享码不存在，请向家属确认。</p>'; return; }
  if (share.revokedAt) { if (host) host.innerHTML = '<p class="privacy-small task-share-error">此分享码已被家属撤销。</p>'; return; }
  if (Date.now() >= Date.parse(share.expiresAt)) { if (host) host.innerHTML = '<p class="privacy-small task-share-error">此分享码已超过 10 分钟有效期，请家属重新生成。</p>'; return; }
  const member = state.familyMembers.find(item => item.id === share.patientMemberId);
  const latestDescription = share.withSelfDescription ? preVisitEntries(share.patientMemberId)[0] : null;
  const when = new Date().toLocaleString('zh-CN', { hour12: false });
  share.accessLogs.push({ who: `陪诊员 · ${state.companionProfile.name}`, when, what: share.withSelfDescription ? '本次任务信息 · 诊前自我描述' : '本次任务信息' });
  state.shares = [...(state.shares || []), { who: `陪诊员 · ${state.companionProfile.name}`, when }];
  const order = state.companionOrders.find(item => item.id === share.orderId);
  if (order) order.taskUnlocked = true;
  saveState(); renderRecords();
  if (host) host.innerHTML = `<div class="task-share-result">
    <div class="family-order-top"><strong>${esc(share.patient)} · 本次任务信息</strong><span class="record-status">已授权查看</span></div>
    <p>${esc(share.service)} · ${esc(share.date)}<br>${esc(share.hospital)}<br>需求：${esc(share.need || '未补充')}</p>
    ${latestDescription ? `<div class="exec-block"><div class="exec-progress"><strong>诊前自我描述（家属授权）</strong><span>仅用于代述病情</span></div><p class="task-share-desc">${esc(latestDescription.text || '未添加文字说明')}</p><small class="privacy-small">记录时间：${esc(latestDescription.createdAt || '')}</small></div>` : ''}
    <small class="privacy-small order-share-note">以上为家属通过分享码授权的全部内容。陪诊员端不提供健康档案、病史、用药或报告的查看入口。</small>
  </div>`;
  if (input) input.value = '';
  toast('任务信息已展示，本次查看已记录并同步家属');
}
/* 陪诊师端 · 收入与订单记录（FR-11，模拟金额） */
function renderEscortIncome() {
  const strip = document.getElementById('escortIncomeStrip');
  if (strip) {
    const completed = state.companionOrders.filter(order => order.status === 'completed');
    const income = completed.reduce((sum, order) => sum + orderPrice(order), 0);
    strip.innerHTML = `<div><strong>¥${income}</strong><span>累计收入（模拟）</span></div><div><strong>${completed.length}</strong><span>已完成订单</span></div><div><strong>${completed.length ? `¥${Math.round(income / completed.length)}` : '—'}</strong><span>单均（模拟）</span></div>`;
  }
  const bioCompleted = document.getElementById('escortBioCompleted');
  if (bioCompleted) {
    const completed = state.companionOrders.filter(order => order.status === 'completed');
    const income = completed.reduce((sum, order) => sum + orderPrice(order), 0);
    bioCompleted.textContent = String(completed.length);
    document.getElementById('escortBioIncome').textContent = `¥${income}`;
    const ratings = state.companionOrders.flatMap(order => order.reviews?.family ? [order.reviews.family.score] : []);
    document.getElementById('escortBioRating').textContent = ratings.length ? `${(ratings.reduce((sum, score) => sum + Number(score || 0), 0) / ratings.length).toFixed(1)} 分` : '新加入';
  }
}
/* 服务单提交后：下次复诊信息自动转成家庭端提醒（FR-09-3） */
function createVisitReminderFromReport(order, nextVisitDate, nextVisitNote) {
  if (!nextVisitDate) return false;
  const visitDay = new Date(`${nextVisitDate}T12:00:00`).getDay();
  const reminder = {
    id: `reminder-visit-${Date.now()}`,
    memberId: order.patientMemberId || 'm1',
    kind: 'custom',
    title: `复诊提醒 · ${nextVisitNote || order.hospital}`,
    detail: `${order.hospital}${nextVisitNote ? ` · ${nextVisitNote}` : ''} · 由陪诊服务单自动生成`,
    time: '08:00',
    days: [visitDay],
    startDate: nextVisitDate,
    endDate: nextVisitDate,
    active: true
  };
  state.customReminders = [...(state.customReminders || []), reminder];
  return true;
}

async function renderCompanionViews() {
  /* 云端模式：陪诊师 → 云端工作台；家庭 → 陪诊 Tab 实时动态。本地演示 DOM 全部让位 */
  const cloudAuth = window.KangbanAuth;
  if (cloudAuth?.mode === 'cloud') {
    const localOrders = document.getElementById('companionOrders');
    if (localOrders) localOrders.hidden = true;
    if (cloudAuth.role === 'escort') { try { await renderCloudWorkbench(); } catch (error) { console.warn('工作台加载失败', error); } }
    else {
      /* 云端家庭：「我的陪诊」子页签只留实时动态；本地演示块（装饰卡/认识服务人员/选择服务）让位给「社区大厅」 */
      ['companionIntro', 'companionProfileSection', 'companionServicesSection'].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; });
      try { await renderCloudFamilyOrders(); } catch (error) { console.warn('陪诊动态加载失败', error); }
    }
    return;
  }
  const localOrdersReset = document.getElementById('companionOrders');
  if (localOrdersReset) localOrdersReset.hidden = false;
  ['companionIntro', 'companionProfileSection', 'companionServicesSection'].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = false; });
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
            ${item.evidenceRequired && !item.evidenceId ? '<span class="exec-mark" title="此项需上传佐证后自动完成">◎</span>' : `<button class="exec-toggle" data-exec-toggle="${esc(item.key)}" data-order-id="${esc(order.id)}" ${item.done ? 'disabled' : ''}>${item.done ? '✓' : ''}</button>`}
            <div class="exec-copy"><strong>${esc(item.label)}</strong>${item.done ? `<small>完成于 ${esc(item.doneAt || '')}</small>` : `<small>待执行${item.evidenceHint ? ` · 佐证：${esc(item.evidenceHint)}${item.evidenceRequired ? '（必传）' : ''}` : ''}</small>`}</div>
            ${item.evidenceId ? `<button class="exec-evidence has-evidence" data-evidence-view="${esc(item.key)}" data-order-id="${esc(order.id)}">查看佐证</button>` : item.evidenceHint ? `<button class="exec-evidence" data-exec-evidence="${esc(item.key)}" data-order-id="${esc(order.id)}">上传佐证</button>` : ''}
          </div>`).join('')}</div></div>`;
      }
      const actions = order.status === 'pending' ? `<div class="order-actions"><button class="secondary-button" data-order-action="decline" data-order-id="${esc(order.id)}">暂不接单</button><button class="primary-button" data-order-action="accept" data-order-id="${esc(order.id)}">接受预约</button></div>`
        : order.status === 'accepted' ? (() => { const progress = executionProgress(order); return `${executionBlock}${progress.all ? `<button class="primary-button" data-order-action="complete" data-order-id="${esc(order.id)}">标记陪诊已完成</button>` : '<small class="review-complete">完成全部履约项目后才能标记完成</small>'}`; })()
        : order.status === 'completed' ? `${executionBlock}${!order.reviews?.escort ? `<button class="primary-button" data-order-review="${esc(order.id)}" data-review-role="escort">评价本次家庭</button>` : `<small class="review-complete">你已评价${order.reviews?.family ? ' · 双方已互评' : ' · 等待家庭评价'}</small>`}`
        : '';
      const shareCodeHint = order.status === 'accepted'
        ? `<small class="privacy-small order-share-note">${order.taskUnlocked ? '已通过分享码查看本次任务信息。' : '如需诊前自我描述等更多信息，请让家属在预约卡上生成本次任务分享码，在上方输入查看。'}</small>`
        : '<small class="privacy-small order-share-note">本次申请仅分享以上预约信息，不包含完整病历。</small>';
      return `<article class="escort-order-card"><div class="family-order-top"><strong>${esc(order.patient || '家庭预约')}</strong><span class="record-status">${label}</span></div><p>${esc(order.service)} · ${esc(order.date)}<br>${esc(order.hospital)}<br>需求：${esc(order.need || '未补充')}<br>报酬：¥${orderPrice(order)}（模拟）</p>${shareCodeHint}${reviewSummary(order)}${actions}</article>`;
    }).join('') : '<div class="empty-hint">还没有预约申请。家庭端可直接预约，或在需求大厅发布需求帖，你接单后就会出现在这里。</div>';
  }
  renderEscortHall();
  renderDemandPosts();
  renderEscortIncome();
  /* 本地演示家庭：我的发布抽屉同样收在「我的陪诊」（本机数据） */
  if (state.currentRole !== 'escort') renderFamilyMyPosts([], state.companionOrders);
}

function renderRole() {
  if (window.KangbanAuth?.mode === 'cloud') state.currentRole = window.KangbanAuth.role;
  const isEscort = state.currentRole === 'escort';
  const cloudEscort = window.KangbanAuth?.mode === 'cloud' && isEscort;
  const guest = window.KangbanAuth?.role === 'guest';
  const member = currentMember();
  document.getElementById('roleAvatar').textContent = isEscort ? state.companionProfile.name.slice(0, 1) : (member?.name.slice(0, 1) || '家');
  document.getElementById('roleLabel').textContent = isEscort ? `陪诊员端 · ${state.companionProfile.name}` : `家庭端 · ${member?.name || '家人'}`;
  document.body.classList?.toggle('cloud-escort-mode',cloudEscort);
  /* 陪诊 Tab 子页签（我的陪诊/社区大厅）只在家庭端显示 */
  document.body.classList?.toggle('family-mode', !guest && !isEscort);
  document.getElementById('familyTabs').hidden = guest || isEscort;
  document.getElementById('escortTabs').hidden = !isEscort || cloudEscort;
  const cloudNav = document.getElementById('cloudEscortTabs');
  if (cloudNav) cloudNav.hidden = !cloudEscort;
  const localWorkbench = document.getElementById('escortWorkbenchLocal');
  const cloudWorkbenchHost = document.getElementById('escortWorkbenchCloud');
  if (localWorkbench) localWorkbench.hidden = cloudEscort;
  if (cloudWorkbenchHost) cloudWorkbenchHost.hidden = !cloudEscort;
  const localProfileHost = document.getElementById('escortProfileLocal');
  const cloudProfileHost = document.getElementById('cloudEscortProfileView');
  if (localProfileHost) localProfileHost.hidden = cloudEscort;
  if (cloudProfileHost) cloudProfileHost.hidden = !cloudEscort;
  document.querySelector('#profileSwitch')?.classList.toggle('auth-hidden', guest || window.KangbanAuth?.mode === 'cloud');
  document.querySelector('#logoutButton')?.classList.toggle('auth-hidden', !window.KangbanAuth?.session || guest);
  const greetName = document.querySelector('#view-home .greeting-row h1 span');
  if (greetName && member) greetName.textContent = member.name;
  /* 云端模式下，预警/提醒等仍读本机数据的区块诚实标注来源 */
  document.body.classList?.toggle('kb-cloud', window.KangbanAuth?.mode === 'cloud');
  document.querySelectorAll('.local-data-badge').forEach(badge => { badge.hidden = window.KangbanAuth?.mode !== 'cloud'; });
  renderCompanionViews();
  renderMePage();
}

/* ===== 「我的」页 v4 · 纯文字：身份卡 + 两组纯文字行，无图标无废话 ===== */
function meRow(label, value, action, valueOn) {
  return `<button class="me-row" data-action="${action}"><b>${esc(label)}</b>${value ? `<span class="v${valueOn ? ' on' : ''}">${esc(value)}</span>` : ''}<span class="arr">›</span></button>`;
}
function renderMePage() {
  const idHost = document.getElementById('meIdCard');
  if (!idHost) return;
  const auth = window.KangbanAuth;
  const cloud = auth?.mode === 'cloud' && auth.session?.user;
  const deviceCount = Object.values(state.devices || {}).filter(Boolean).length;
  const memberCount = (state.familyMembers || []).length;
  const notifyGranted = typeof window !== 'undefined' && window.Notification?.permission === 'granted';
  if (cloud) {
    const email = String(auth.session.user.email || '');
    const at = email.indexOf('@');
    const masked = at > 0 ? `${email.slice(0, Math.min(2, at))}***${email.slice(at)}` : email;
    idHost.innerHTML = `<div class="me-id-top"><div class="me-ava">${esc((auth.session.displayName || '家').slice(0, 1))}</div><div><b>${esc(auth.session.displayName || '家庭成员')}</b><small>${esc(masked)}</small></div><button class="me-out" data-action="logout">退出登录</button></div><div class="me-status"><span class="me-dot"></span>已连接云端 · 多端同步</div>`;
    document.getElementById('mePrimaryRows').innerHTML = meRow('家庭成员', memberCount ? String(memberCount) : '', 'family') + meRow('设备管理', deviceCount ? String(deviceCount) : '', 'devices') + meRow('账号安全', '', 'account-security');
    document.getElementById('meGeneralRows').innerHTML = meRow('通知设置', notifyGranted ? '已开启' : '未开启', 'notify-settings', notifyGranted) + meRow('分享码与授权', '', 'share') + meRow('帮助与服务说明', '', 'help') + meRow('关于康伴', 'v0.9', 'about');
  } else {
    idHost.innerHTML = `<div class="me-id-top"><div class="me-ava me-ava-local">⌂</div><div><b>本机演示模式</b><small>数据保存在当前浏览器</small></div><button class="me-out me-out-login" data-action="logout">登录 / 注册</button></div>`;
    document.getElementById('mePrimaryRows').innerHTML = meRow('家庭成员', memberCount ? String(memberCount) : '', 'family') + meRow('设备管理', deviceCount ? String(deviceCount) : '', 'devices');
    document.getElementById('meGeneralRows').innerHTML = meRow('分享码与授权', '', 'share') + meRow('帮助与服务说明', '', 'help') + meRow('关于康伴', 'v0.9', 'about');
  }
}
function showAccountSecurity() {
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud' || !auth.session?.user) { toast('本机演示模式没有云端账号'); return; }
  openModal(`${modalHead('账号安全', '云端账号信息', '健康档案与陪诊安排保存在家庭云端空间，换设备登录即可恢复；如需修改密码，退出后在登录页操作。')}
    <div class="account-security"><div class="my-post-row"><div><strong>${esc(String(auth.session.user.email || ''))}</strong><small>登录邮箱 · ${auth.session.role === 'family' ? '家庭账号' : '陪诊师账号'}${auth.session.isAdmin ? ' · 管理员' : ''}</small></div></div><div class="my-post-row"><div><strong>多端同步已开启</strong><small>同一账号在其他设备登录，数据自动保持一致。</small></div></div></div>
    <button class="secondary-button" data-action="logout" style="margin-top:12px">退出登录</button>`);
}

function setRole(role) {
  if (window.KangbanAuth?.mode === 'cloud') { toast('云端账号角色由注册身份确定，不能在这里切换'); return; }
  state.currentRole = role === 'escort' ? 'escort' : 'family';
  saveState();
  renderRole();
  navigate(state.currentRole === 'escort' ? 'escort' : 'home');
  closeModal();
}
/* 今日提醒项统一提取（今日提醒区块 / 首页总览条 / 成员状态行共用一个数据源） */
function todayReminderItems() {
  const today = dateOffset(0);
  const day = new Date(`${today}T12:00:00`).getDay();
  const memberName = id => state.familyMembers.find(member => member.id === id)?.name || '陈兰英';
  const items = [
    ...(state.medications || []).flatMap(med => (med.times || []).map(time => ({ id: med.id, kind: 'medication', title: med.name, detail: med.dose || med.frequencyLabel || '按已确认医嘱', time, memberId: med.memberId === 'member-mom' || !med.memberId ? 'm1' : med.memberId, med }))),
    ...(state.customReminders || []).filter(reminder => reminder.active !== false && (!reminder.startDate || reminder.startDate <= today) && (!reminder.endDate || reminder.endDate >= today) && (reminder.days || [0,1,2,3,4,5,6]).includes(day)).map(reminder => ({ ...reminder, kind: reminder.kind || 'custom' }))
  ].sort((a,b) => a.time.localeCompare(b.time));
  return items.map(item => {
    const key = `${today}|${item.id}|${item.time}`;
    const log = item.kind === 'medication' ? null : state.reminderLogs?.[key];
    const skipped = log?.status === 'skipped';
    const done = item.kind === 'medication' ? Boolean(state.medicationTaken?.[key]) : log?.status === 'done' || skipped;
    const typeLabel = item.kind === 'medication' ? '服药' : item.kind === 'measurement' ? '测量' : item.kind === 'activity' ? '活动' : '自定义';
    return { ...item, key, done, skipped, skipReason: log?.reason || '', typeLabel, memberName: memberName(item.memberId) };
  });
}
/* 提醒行（带打卡操作）：主列表只渲染未完成项（完成后折叠进「已完成」条）；
   行内只留主操作 + 延后，跳过收进「···」菜单需确认原因——完成才消失，闭环可追溯 */
function reminderRowHtml(item) {
  const subline = item.kind === 'medication' ? `${esc(item.detail)} · ${esc(item.memberName)}` : `${item.typeLabel} · ${esc(item.memberName)}${item.unit ? ` · ${esc(item.unit)}` : ''}`;
  const button = item.kind === 'medication'
    ? `<button class="med-taken-button" data-med-taken="${esc(item.id)}" data-med-time="${esc(item.time)}">记录已服</button>`
    : `<div class="reminder-inline-actions"><button class="med-taken-button" data-reminder-complete="${esc(item.id)}" data-reminder-time="${esc(item.time)}">${item.kind === 'measurement' ? '记录读数' : '完成'}</button><button class="reminder-later" data-reminder-snooze="${esc(item.id)}" data-reminder-time="${esc(item.time)}">延后</button><button class="reminder-more" data-reminder-skip="${esc(item.id)}" data-reminder-time="${esc(item.time)}" aria-label="更多操作">···</button></div>`;
  const snoozedText = state.reminderLogs?.[item.key]?.status === 'snoozed' ? ` · 已延后至 ${new Date(state.reminderLogs[item.key].snoozedUntil).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}` : '';
  return `<div class="med-reminder-row"><time>${esc(item.time)}</time><div class="med-reminder-copy"><strong>${esc(item.title)} <i>${item.typeLabel}</i></strong><small>${subline}${esc(snoozedText)}</small></div>${button}</div>`;
}
/* 已完成行的回看形态：✓ 已记录 / 已跳过 · 原因 */
function reminderDoneRowHtml(item) {
  const subline = item.skipped ? `已跳过${item.skipReason ? ` · ${esc(item.skipReason)}` : ''}` : (item.kind === 'medication' ? '已记录服药' : '已完成');
  return `<div class="med-reminder-row is-taken"><time>${esc(item.time)}</time><div class="med-reminder-copy"><strong>${esc(item.title)} <i>${item.typeLabel}</i></strong><small>${esc(item.memberName)} · ${subline}</small></div><span class="done-check">✓</span></div>`;
}
/* 今日提醒区块已并入首页总览条展开区；此函数保留为刷新入口 */
function renderMedicationReminders() {
  renderHomeTodayBar();
  renderHomeMemberStrip();
}

/* ===== 首页统领区：今日总览条 / Hero 真数据 / 待我处理 / 成员状态行 ===== */
function updateHero(cloudOrder) {
  const host = document.getElementById('homeHeroBody');
  if (!host) return;
  const today = dateOffset(0);
  const localToday = (state.companionOrders || []).find(order => order.date === today && ['pending', 'accepted'].includes(order.status));
  /* 常用服务随情境变化：今天有陪诊 → 分享码置前并标注 */
  renderHomeQuick(Boolean(cloudOrder || localToday));
  const hero = (pill, spark, kicker, title, meta, actionHtml, live = false) => {
    host.innerHTML = `<div class="hero-top"><span class="pill pill-light${live ? ' pill-live' : ''}"><span class="status-dot"></span> ${pill}</span><span class="hero-spark">${spark}</span></div><p class="hero-kicker">${kicker}</p><h2>${title}</h2><div class="appointment-meta">${meta}</div>${actionHtml}`;
  };
  if (cloudOrder) {
    const label = { pending_escort_confirmation: '等待陪诊师确认', confirmed: cloudOrder.arrived_at ? '陪诊师已到场 · 即将开始' : '已确认 · 待服务', in_service: '服务中 · 实时回传进度' }[cloudOrder.status] || '';
    hero(cloudOrder.status === 'in_service' ? '陪诊进行中' : '今日陪诊', '♡', '今天的服务', esc(cloudOrder.hospital_name || ''), `${esc(cloudOrder.service_type || '')} · ${cloudOrder.starts_at ? `${fmtClock(cloudOrder.starts_at)} · ` : ''}<span>${esc(label)}</span>`, `<button class="hero-action" data-nav="companion">查看陪诊动态 <span>→</span></button>`, true);
    return;
  }
  if (localToday) {
    hero('今日陪诊', '♡', '今天的服务', esc(localToday.hospital), `${esc(localToday.service)} · <span>${localToday.status === 'accepted' ? '陪诊员已接单' : '等待陪诊员确认'}</span>`, `<button class="hero-action" data-action="companion">查看安排 <span>→</span></button>`, true);
    return;
  }
  const upcoming = (state.companionOrders || []).filter(order => order.date > today && ['pending', 'accepted'].includes(order.status)).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (upcoming) {
    hero('家庭档案已就绪', '✳', '下一次就诊', esc(upcoming.hospital), `${esc(upcoming.service)} · <span>${formatDate(upcoming.date)}</span>`, `<button class="hero-action" data-action="companion">查看安排 <span>→</span></button>`);
    return;
  }
  hero('一切如常', '✳', '今天暂无就诊安排', '有空整理一下健康档案', '<span>录入读数，或去社区看看需求</span>', `<button class="hero-action" data-nav="health">查看健康档案 <span>→</span></button>`);
}
/* 常用服务：单行四列紧凑格，分享码常驻；就诊日加「今天用得上」角标 */
function renderHomeQuick(hasTodayOrder) {
  const host = document.getElementById('quickGrid');
  if (!host) return;
  const items = [
    { action: 'add-reading', icon: '↥', cls: 'icon-upload', title: '录入读数', sub: '手动 / 语音 / 拍照' },
    { action: 'docs-upload', icon: '▤', cls: 'icon-doc', title: '上传资料', sub: '病历 / 发票 · 配报销' },
    { action: 'home-share', icon: '⌁', cls: 'icon-share', title: '分享码', sub: '给陪诊师临时授权', hot: hasTodayOrder },
    { action: 'home-demand', icon: '♡', cls: 'icon-heart', title: '发需求', sub: '社区发单等报名' }
  ];
  host.innerHTML = items.map(item => `<button class="quick-item q4-compact ${item.hot ? 'quick-hot' : ''}" data-action="${item.action}">${item.hot ? '<span class="quick-corner">今天用得上</span>' : ''}<span class="quick-icon ${item.cls}">${item.icon}</span><strong>${item.title}</strong><small>${item.sub}</small></button>`).join('');
}
function homeTodoItems(cloudOrders) {
  const items = [];
  for (const order of state.companionOrders || []) {
    if (order.status === 'completed' && order.serviceReport?.needsFamily) items.push({ level: 'high', title: `${order.service} · 陪诊员标记需家属跟进`, sub: `${order.hospital} · ${order.date}`, action: '<button class="text-button" data-nav="companion">查看反馈 →</button>' });
    else if (order.status === 'pending') items.push({ level: 'mid', title: `${order.service} · 等待陪诊员确认`, sub: `${order.hospital} · ${order.date}`, action: '<button class="text-button" data-nav="companion">查看安排 →</button>' });
    else if (order.status === 'completed' && !order.reviews?.family) items.push({ level: 'low', title: `${order.service} · 待评价`, sub: `${order.hospital} · ${order.date}`, action: `<button class="text-button" data-order-review="${esc(order.id)}" data-review-role="family">去评价 →</button>` });
  }
  if (window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'family') {
    for (const order of cloudOrders || []) {
      if (order.status === 'pending_escort_confirmation') items.push({ level: 'mid', title: `${order.service_type} · 等待陪诊师确认`, sub: `${order.hospital_name} · ${order.service_date}`, action: '<button class="text-button" data-nav="companion">查看动态 →</button>' });
      else if (order.status === 'completed' && !order.reviews?.family) items.push({ level: 'low', title: `${order.service_type} · 待评价`, sub: `${order.hospital_name} · ${order.service_date}`, action: `<button class="text-button" data-cloud-order-review="${esc(order.id)}" data-review-role="family">去评价 →</button>` });
    }
  }
  return items;
}
async function fetchCloudFamilyMatch() {
  const auth = window.KangbanAuth;
  if (auth?.mode !== 'cloud' || auth.role !== 'family') return { items: [], posts: [], bookings: [], postById: {} };
  try {
    const [posts, bookings, allPosts] = await Promise.all([
      window.KangbanAPI.select('community_posts', { filters: { family_id: auth.session.familyId, type: 'demand' }, order: { column: 'created_at', ascending: false }, limit: 20 }),
      window.KangbanAPI.rpc('list_my_availability_bookings').catch(() => []),
      window.KangbanAPI.select('community_posts', { order: { column: 'created_at', ascending: false }, limit: 100 }).catch(() => [])
    ]);
    const visiblePosts = posts.filter(post => !isVisibleTestFixture(post));
    const openPosts = visiblePosts.filter(post => ['open', 'has_applicants'].includes(post.status));
    const counts = await Promise.all(openPosts.map(async post => ({ post, signups: await window.KangbanAPI.select('post_signups', { filters: { post_id: post.id, status: 'applied' } }).catch(() => []) })));
    let profileById = {};
    const escortIds = [...new Set(counts.flatMap(({ signups }) => signups.map(signup => signup.escort_id).filter(Boolean)))];
    if (escortIds.length) {
      const profiles = await window.KangbanAPI.select('escort_profiles').catch(() => []);
      profileById = Object.fromEntries(profiles.map(profile => [profile.user_id, escortProfileForDisplay(profile)]));
    }
    for (const { post, signups } of counts) {
      post._applicants = signups.map(signup => { const p = profileById[signup.escort_id] || {}; return { ...signup, display_name: p.display_name || '待核验陪诊师', experience: p.experience || '', service_area: p.service_area || '', bio: p.bio || '' }; });
    }
    const items = counts.filter(({ signups }) => signups.length).map(({ post }) => ({ level: 'mid', title: `${post.service_type || '陪诊需求'} · ${post._applicants.length} 位陪诊师报名`, sub: `${post.hospital_name || ''}${post.service_date ? ` · ${post.service_date}` : ''}`, action: '<button class="text-button" data-nav="companion" data-open-my-posts>去处理 →</button>' }));
    return {
      items,
      posts: visiblePosts,
      bookings: (bookings || []).filter(booking => !isVisibleTestFixture(booking)),
      postById: Object.fromEntries((allPosts || []).filter(post => !isVisibleTestFixture(post)).map(post => [post.id, post]))
    };
  } catch { return { items: [], posts: [], bookings: [], postById: {} }; }
}
/* ===== 家庭端「我的发布」抽屉（撮合中事务归我的陪诊）：默认收缩一行，有新报名时高亮；
   抽屉内两组：我的需求（报名跟进）+ 我的预约申请（对陪诊师服务的预约跟进） ===== */
let familyMyPostsOpen = false;
let familyMyPostsCache = { posts: [], orders: [], bookings: [], postById: {} };
const SIGNUP_STATUS_LABEL = { applied: '待家庭挑选', selected: '已选中', declined: '未被选中', withdrawn: '已撤回' };
const BOOKING_STATUS_LABEL = { applied: '待陪诊师确认', accepted: '已确认', rejected: '未通过', cancelled: '已撤销' };
function renderFamilyMyPosts(posts = familyMyPostsCache.posts, orders = familyMyPostsCache.orders, bookings = familyMyPostsCache.bookings, postById = familyMyPostsCache.postById) {
  const host = document.getElementById('familyMyPostsArea');
  if (!host) return;
  const auth = window.KangbanAuth;
  if (auth?.role === 'escort' || auth?.role === 'guest') { host.hidden = true; return; }
  const cloud = auth?.mode === 'cloud';
  familyMyPostsCache = cloud
    ? {
      posts: (posts || []).filter(post => !isVisibleTestFixture(post)),
      orders: (orders || []).filter(order => !isVisibleTestFixture(order)),
      bookings: (bookings || []).filter(booking => !isVisibleTestFixture(booking)),
      postById: Object.fromEntries(Object.entries(postById || {}).filter(([, post]) => !isVisibleTestFixture(post)))
    }
    : { posts: posts || [], orders: orders || [], bookings: bookings || [], postById: postById || {} };
  let rows;
  if (cloud) {
    rows = familyMyPostsCache.posts.map(post => ({ post, applicants: post._applicants || [] }));
  } else {
    const statusMap = { '招募中': 'open', '已接单': 'confirmed', '服务中': 'in_service', '已完成': 'completed', '已取消': 'cancelled' };
    rows = (state.demandPosts || []).map(post => ({ post: { ...post, type: 'demand', status: statusMap[post.status] || post.status }, applicants: [] }));
  }
  const activeOrders = familyMyPostsCache.orders.filter(order => ['pending_escort_confirmation', 'confirmed', 'in_service', 'pending', 'accepted'].includes(order.status)).length;
  const myBookings = cloud ? familyMyPostsCache.bookings : [];
  const pendingBookings = myBookings.filter(booking => booking.status === 'applied').length;
  /* 既无订单也无发布也无预约申请：空态引导卡，补齐发布入口撤出社区后的发现路径 */
  if (!rows.length && !myBookings.length) {
    if (!activeOrders) {
      host.hidden = false;
      host.innerHTML = `<div class="empty-guide-card"><strong>还没有陪诊安排</strong><p>发布第一个陪诊需求，审核通过的陪诊师会来报名；也可以去社区大厅预约陪诊师发布的陪诊服务。</p><div class="guide-ops"><button class="primary-button" data-action="demand-form">＋ 发布陪诊需求</button><button class="secondary-button" data-csub="hall">去社区大厅看看</button></div></div>`;
    } else host.hidden = true;
    return;
  }
  const inProgress = rows.filter(row => ['open', 'has_applicants', 'awaiting_confirmation', 'confirmed', 'in_service'].includes(row.post.status)).length;
  const newSignups = rows.reduce((sum, row) => sum + row.applicants.length, 0);
  const facts = [inProgress ? `${inProgress} 条进行中` : '', newSignups ? `<b>${newSignups} 个新报名</b>` : '', pendingBookings ? `<b>${pendingBookings} 个预约待确认</b>` : ''].filter(Boolean).join(' · ');
  const listHtml = rows.map(row => {
    const p = row.post;
    const label = POST_STATUS_LABEL[p.status] || p.status;
    const cancellable = ['open', 'has_applicants'].includes(p.status);
    const applicantsHtml = row.applicants.length ? `<div class="community-applicants is-open">${row.applicants.map(signup => `<div class="applicant-row"><div class="applicant-copy"><b>${esc(signup.display_name)}</b><small>${signup.note ? esc(signup.note.length > 72 ? `${signup.note.slice(0, 72)}…` : signup.note) : '未填写自我介绍'}${signup.experience ? ` · ${esc(signup.experience)}` : ''}</small></div><div class="applicant-ops">${signup.resume_path ? `<button class="secondary-button compact" data-signup-resume="${esc(signup.resume_path)}">看简历</button>` : ''}<button class="primary-button compact" data-community-confirm="${esc(signup.id)}">查看介绍并确认</button></div></div>`).join('')}</div>` : '';
    return `<div class="my-post-row"><div><strong>${esc(p.service_type || p.service || '陪诊需求')}</strong><small>${esc(label)} · ${esc(p.hospital_name || p.hospital || '医院待补充')} · ${esc(p.service_date || p.date || '时间待沟通')}${row.applicants.length ? ` · ${row.applicants.length} 位已报名` : ''}</small></div><div class="applicant-ops">${cancellable ? `<button class="text-button" data-${cloud ? 'community-cancel-post' : 'demand-cancel'}="${esc(p.id)}">取消</button>` : ''}</div></div>${applicantsHtml}`;
  }).join('');
  /* 我的预约申请组：跟进「家庭预约陪诊师服务」这条撮合线（RPC 已返回 post 上下文） */
  const bookingsHtml = myBookings.length ? `<div class="mp-subhead">我的预约申请</div>${myBookings.map(booking => {
    const post = familyMyPostsCache.postById[booking.post_id] || {};
    const label = BOOKING_STATUS_LABEL[booking.status] || booking.status;
    const note = booking.note ? ` · 附言：${esc(booking.note.length > 36 ? `${booking.note.slice(0, 36)}…` : booking.note)}` : '';
    const ops = booking.status === 'applied' ? `<button class="text-button" data-community-cancel-booking="${esc(booking.id)}">撤销申请</button>` : '';
    return `<div class="my-post-row"><div><strong>${esc(post.service_type || '陪诊服务预约')}</strong><small>${esc(label)} · ${esc(post.region || '')}${post.service_date ? ` · ${esc(post.service_date)}` : ''}${note}</small></div><div class="applicant-ops">${ops}</div></div>`;
  }).join('')}` : '';
  host.hidden = false;
  host.innerHTML = `<section class="section-block my-posts-drawer"><button type="button" class="my-posts-bar${newSignups || pendingBookings ? ' has-new' : ''}" id="familyMyPostsToggle"><strong>我的发布</strong><span class="mp-facts">${facts || '暂无进行中'}</span><span class="mp-arrow">${familyMyPostsOpen ? '▾' : '▸'}</span></button><div class="my-posts-detail" ${familyMyPostsOpen ? '' : 'hidden'}><div class="mp-head"><button class="text-button" data-action="demand-form">＋ 发布需求</button></div>${rows.length ? `<div class="mp-subhead">我发布的需求</div>${listHtml}` : ''}${bookingsHtml}</div></section>`;
}
let homeTodoCache = [];       // 待我处理队列（本地 + 云端 + 新报名，由 renderHomeTodo 喂入）
let homeCloudOrdersCache = []; // 云端订单缓存（总览条陪诊胶囊计数用）
let todayBarOpen = false;      // 总览条展开状态（重渲染后保持）
let todayDoneOpen = false;     // 「已完成」折叠条展开状态
function renderHomeTodo(items) {
  homeTodoCache = items || [];
  renderHomeTodayBar();
}
function renderHomeTodayBar(cloudOrders) {
  if (cloudOrders) homeCloudOrdersCache = cloudOrders;
  const host = document.getElementById('homeTodayBar');
  if (!host) return;
  const items = todayReminderItems();
  const activeOrders = window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'family'
    ? homeCloudOrdersCache.filter(order => ['pending_escort_confirmation', 'confirmed', 'in_service'].includes(order.status))
    : (state.companionOrders || []).filter(order => ['pending', 'accepted'].includes(order.status));
  /* 预警胶囊 = 首页「设备预警」窗口的未处理数（设备上报口径，与首页区块一致；手动渠道在预警中心） */
  const warnCount = (state.alerts || []).filter(alert => (alert.level === 'red' || alert.level === 'yellow') && alert.status !== 'resolved' && deviceAlert(alert)).length;
  const todoCount = homeTodoCache.length;
  const chip = (label, count, cls = '') => `<span class="tb-chip ${count ? cls : ''}">${label} ${count}</span>`;
  const chips = [chip('待提醒', items.filter(item => !item.done).length, 'tb-blue'), chip('陪诊', activeOrders.length, 'tb-green'), chip('预警', warnCount, 'tb-red'), chip('待办', todoCount, 'tb-amber')].join('');
  /* 展开区 = 今日提醒（可打卡，完成才消失） + 待我处理 + 新增提醒，原来的独立区块全部并入这里 */
  const pending = items.filter(item => !item.done);
  const doneItems = items.filter(item => item.done);
  let reminderGroup;
  if (!items.length) {
    reminderGroup = `<div class="med-empty"><span>今天暂无提醒安排。</span><button class="text-button" data-action="add-reminder">新增提醒 →</button></div>`;
  } else if (!pending.length) {
    reminderGroup = `<div class="all-done">✓ 今日提醒全部完成（${doneItems.length}/${items.length}）</div><button type="button" class="done-bar" data-done-toggle><span>▾ 已完成 ${doneItems.length}</span><span class="mut">${doneItems.some(item => item.skipped) ? '含已跳过' : ''}</span></button><div class="done-list" ${todayDoneOpen ? '' : 'hidden'}>${doneItems.map(reminderDoneRowHtml).join('')}</div>`;
  } else {
    const doneBlock = doneItems.length
      ? `<button type="button" class="done-bar" data-done-toggle><span>${todayDoneOpen ? '▾' : '▸'} 已完成 ${doneItems.length}</span><span class="mut">${doneItems.some(item => item.skipped) ? '含已跳过' : ''}</span></button><div class="done-list" ${todayDoneOpen ? '' : 'hidden'}>${doneItems.map(reminderDoneRowHtml).join('')}</div>`
      : '';
    reminderGroup = `<div class="tb-group-title">今日提醒 <i>${doneItems.length}/${items.length} 已完成</i></div>${pending.map(reminderRowHtml).join('')}${doneBlock}`;
  }
  const todoGroup = homeTodoCache.length
    ? `<div class="tb-group-title">待我处理 <i>${homeTodoCache.length} 项</i></div><div class="todo-list">${homeTodoCache.map(item => `<div class="todo-row todo-${item.level}"><span class="todo-mark">${item.level === 'high' ? '!' : '·'}</span><div class="todo-copy"><strong>${esc(item.title)}</strong><small>${esc(item.sub || '')}</small></div>${item.action}</div>`).join('')}</div>`
    : '';
  host.innerHTML = `<button type="button" class="today-bar" id="todayBarToggle"><span class="tb-date">今天</span><span class="tb-chips">${chips}</span><span class="tb-arrow">▾</span></button><div class="today-detail" id="todayDetail" ${todayBarOpen ? '' : 'hidden'}>${reminderGroup}${todoGroup}<button class="secondary-button reminder-add-home" data-action="add-reminder">＋ 新增自定义提醒</button><button class="text-button tb-all-link" data-action="reminders">查看全部提醒 →</button></div>`;
  host.querySelector('.today-bar')?.classList.toggle('open', todayBarOpen);
}
/* 读数时间标注：今天的带时刻，昨天标注「昨天」，更早显示日期——杜绝旧读数冒充最新 */
function readingTimeLabel(entry) {
  const today = dateOffset(0);
  if (entry.date === today) return entry.time ? `今天 ${entry.time}` : '今天';
  if (entry.date === dateOffset(-1)) return entry.time ? `昨天 ${entry.time}` : '昨天';
  return formatDate(entry.date);
}
function renderHomeMemberStrip() {
  const host = document.getElementById('homeMemberStrip');
  const section = document.getElementById('homeMemberSection');
  if (!host || !section) return;
  const members = state.familyMembers || [];
  if (!members.length) { section.hidden = true; return; }
  section.hidden = false;
  const cards = members.map(member => {
    const latestByMetric = {};
    memberMetricEntries(member.id).slice().sort((a, b) => `${b.date}${b.time || ''}`.localeCompare(`${a.date}${a.time || ''}`)).forEach(entry => { if (!latestByMetric[entry.metric]) latestByMetric[entry.metric] = entry; });
    let rows = Object.values(latestByMetric);
    const sys = rows.find(entry => entry.metric === '收缩压');
    const dia = rows.find(entry => entry.metric === '舒张压');
    if (sys && dia) rows = rows.filter(entry => entry !== sys && entry !== dia).concat([{ metric: '血压', value: `${sys.value}/${dia.value}`, unit: 'mmHg', date: sys.date, time: sys.time }]);
    const abnormalList = latestAbnormal(member.id);
    const abnormalNames = abnormalList.map(entry => entry.metric).slice(0, 2).join(' ');
    const readingLine = rows.slice(0, 2).map(entry => {
      const status = entry.metric === '血压' ? (bpReadingState(entry.value).abnormal ? '偏高' : '正常') : statusLabelOf(entry.value, entry.metric);
      const tag = entry.metric === '血压' ? bpReadingState(entry.value).tag : statusTagOf(entry.value, entry.metric);
      return `<span class="ms-reading"><em>${esc(entry.metric)}</em> ${esc(String(entry.value))}${entry.unit && entry.metric !== '血压' ? esc(entry.unit) : ''} <i class="${tag}">${status}</i><u class="ms-time">${esc(readingTimeLabel(entry))}</u></span>`;
    }).join('') || '<span class="ms-reading ms-empty">暂无读数</span>';
    const meds = todayReminderItems().filter(item => item.kind === 'medication' && item.memberId === member.id);
    const medLine = meds.length ? `<span class="ms-med">服药 ${meds.filter(item => item.done).length}/${meds.length}</span>` : '';
    const attention = abnormalList.length > 0;
    const headTag = abnormalList.length
      ? `<i class="ms-alert">${abnormalList.length} 项异常${abnormalNames ? ` · ${esc(abnormalNames)}` : ''}</i>`
      : '<i class="ms-ok">正常</i>';
    const emptyCta = rows.length ? '' : '<span class="ms-cta" data-action="add-reading">去录入 →</span>';
    return { attention, html: `<button type="button" class="member-strip-card ${attention ? 'ms-attention' : 'ms-calm'}" data-nav="health"><span class="ms-head"><b>${esc(member.name)}</b>${headTag}</span>${readingLine}${emptyCta}${medLine}</button>` };
  }).sort((a, b) => (b.attention ? 1 : 0) - (a.attention ? 1 : 0));
  host.innerHTML = cards.map(card => card.html).join('');
}
function showHomeSharePicker() {
  openModal(`${modalHead('生成就诊分享码', '选择成员', '分享码按成员生成；需先完成该成员的就诊准备清单，全部勾选后才能生成。')}
    <div class="my-posts-list">${(state.familyMembers || []).map(member => `<button class="my-post-row" data-action="share" data-share-member="${esc(member.id)}"><span><strong>${esc(member.name)}</strong><small>${esc(member.role || member.relationship || '')} · 就诊准备 ${appointmentProgress(member)}/${APPOINTMENT_ITEMS.length} 项</small></span><span class="cls-arrow">→</span></button>`).join('')}</div>`);
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
/* 新增提醒（渐进式）：先选做什么（模板自动带出名称/记录方式/单位）→ 谁和什么时候 → 高级项折叠；隐藏字段名与旧表单一致，提交处理逻辑不变 */
const REMINDER_TPLS = [
  { key: 'bloodPressure', icon: '🩺', label: '测血压', kind: 'measurement', title: '测量血压', metricType: 'bloodPressure', unit: 'mmHg', fill: '已自动填好：名称「测量血压」· 记录方式「血压（收缩压 / 舒张压）」· 单位 mmHg' },
  { key: 'bloodSugar', icon: '🩸', label: '测血糖', kind: 'measurement', title: '测量血糖', metricType: 'bloodSugar', unit: 'mmol/L', fill: '已自动填好：名称「测量血糖」· 记录方式「血糖（数值）」· 单位 mmol/L' },
  { key: 'walk', icon: '🚶', label: '散步', kind: 'activity', title: '散步', fill: '已自动填好：名称「散步」· 类型「活动 / 训练」' },
  { key: 'visit', icon: '🏥', label: '复诊提醒', kind: 'custom', title: '复诊提醒', fill: '已自动填好：名称「复诊提醒」——想改可以直接改' },
  { key: 'custom', icon: '✏️', label: '自定义', kind: 'custom', title: '', fill: '自己起个名字，再选好对象和时间就行' }
];
function showReminderForm() {
  const members = state.familyMembers?.length ? state.familyMembers : seed.familyMembers;
  const weekdays = ['日','一','二','三','四','五','六'].map((day,index) => `<label class="reminder-day"><input type="checkbox" class="rf-day-check" value="${index}" ${index === 1 ? '' : 'checked'}><span>周${day}</span></label>`).join('');
  const memberChips = members.map((member, index) => `<button type="button" class="rf-mb ${index === 0 ? 'sel' : ''}" data-rf-member="${esc(member.id)}"><span class="rf-av">${esc(member.name[0] || '家')}</span>${esc(member.name)}</button>`).join('');
  const tplChips = REMINDER_TPLS.map(tpl => `<button type="button" class="rf-tpl ${tpl.key === 'bloodPressure' ? 'sel' : ''}" data-rf-tpl="${tpl.key}"><span class="rf-tpl-ic">${tpl.icon}</span>${tpl.label}</button>`).join('');
  openModal(`${modalHead('家庭自定义 · 按成员记录', '新增提醒', '先选要提醒的事，对象和时间跟着选；测量类完成时会记录读数。')}
    <form class="reminder-form" id="reminderForm">
      <input type="hidden" name="memberId" value="${esc(members[0]?.id || 'm1')}">
      <input type="hidden" name="kind" value="measurement">
      <input type="hidden" name="title" value="测量血压">
      <input type="hidden" name="metricType" value="bloodPressure">
      <input type="hidden" name="unit" value="mmHg">
      <input type="hidden" name="startDate" value="${dateOffset(0)}">
      <input type="hidden" name="time" value="08:00">
      ${[0,1,2,3,4,5,6].map(day => `<input type="hidden" name="days" value="${day}" data-rf-day="${day}" ${day === 1 ? 'disabled' : ''}>`).join('')}
      <div class="f-label">要提醒什么？点一个就行</div>
      <div class="rf-tpl-grid">${tplChips}</div>
      <div class="rf-autofill" id="rfAutofill">${REMINDER_TPLS[0].fill}</div>
      <label id="rfNameRow" hidden><span class="field-label-block">提醒名称</span><input class="input-field" id="rfNameInput" maxlength="40" placeholder="例如：复查前禁食 8 小时"></label>
      <div class="f-label">提醒谁？</div>
      <div class="rf-mb-row">${memberChips}</div>
      <div class="f-label">什么时候提醒？</div>
      <div class="rf-seg" id="rfTimeSeg">
        <button type="button" class="sel" data-rf-time="08:00">早上 8:00</button>
        <button type="button" data-rf-time="12:00">中午 12:00</button>
        <button type="button" data-rf-time="20:00">晚上 8:00</button>
        <button type="button" data-rf-time="custom">自定义 ⏱</button>
      </div>
      <input class="input-field" id="rfTimeInput" type="time" value="08:00" hidden>
      <div class="f-label">重复</div>
      <div class="rf-seg" id="rfDaySeg">
        <button type="button" class="sel" data-rf-days="all">每天</button>
        <button type="button" data-rf-days="weekday">工作日</button>
        <button type="button" data-rf-days="custom">每周几…</button>
      </div>
      <div class="reminder-days" id="rfDayPicker" hidden>${weekdays}</div>
      <details class="rf-adv"><summary>▸ 高级（说明、结束日期）</summary>
        <label style="margin-top:8px"><span class="field-label-block">说明（选填）</span><input class="input-field" name="detail" maxlength="100" placeholder="例如：饭后两小时；如身体不适请及时告知家人"></label>
        <label style="margin-top:8px"><span class="field-label-block">结束日期（选填，默认长期有效）</span><input class="input-field" name="endDate" type="date"></label>
      </details>
      <button class="primary-button" type="submit" id="rfSave" style="margin-top:14px">完成（每天 8:00 · 提醒 ${esc(members[0]?.name || '家人')} 测量血压）</button>
    </form><p class="privacy-small">设置的时间和频次请以医生、药师或家庭实际安排为准。</p>`);
  const form = document.getElementById('reminderForm');
  const saveLabel = () => {
    const title = form.querySelector('[name="title"]').value || '自定义事项';
    const time = form.querySelector('[name="time"]').value || '08:00';
    const memberName = members.find(member => member.id === form.querySelector('[name="memberId"]').value)?.name || '家人';
    const dayMode = document.querySelector('#rfDaySeg .sel')?.dataset.rfDays;
    const repeatText = dayMode === 'weekday' ? '工作日' : dayMode === 'custom' ? '自定义重复' : '每天';
    document.getElementById('rfSave').textContent = `完成（${repeatText} ${time} · 提醒 ${memberName} ${title}）`;
  };
  form.querySelectorAll('[data-rf-tpl]').forEach(button => button.addEventListener('click', () => {
    form.querySelectorAll('[data-rf-tpl]').forEach(item => item.classList.remove('sel'));
    button.classList.add('sel');
    const tpl = REMINDER_TPLS.find(item => item.key === button.dataset.rfTpl);
    form.querySelector('[name="kind"]').value = tpl.kind;
    form.querySelector('[name="title"]').value = tpl.title;
    form.querySelector('[name="metricType"]').value = tpl.metricType || '';
    form.querySelector('[name="unit"]').value = tpl.unit || '';
    document.getElementById('rfAutofill').textContent = tpl.fill;
    document.getElementById('rfNameRow').hidden = tpl.key !== 'custom';
    const nameInput = document.getElementById('rfNameInput');
    if (tpl.key === 'custom') { nameInput.value = ''; nameInput.focus(); }
    saveLabel();
  }));
  document.getElementById('rfNameInput')?.addEventListener('input', event => { form.querySelector('[name="title"]').value = event.target.value.trim(); saveLabel(); });
  form.querySelectorAll('[data-rf-member]').forEach(button => button.addEventListener('click', () => {
    form.querySelectorAll('[data-rf-member]').forEach(item => item.classList.remove('sel'));
    button.classList.add('sel');
    form.querySelector('[name="memberId"]').value = button.dataset.rfMember;
    saveLabel();
  }));
  document.querySelectorAll('#rfTimeSeg [data-rf-time]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('#rfTimeSeg [data-rf-time]').forEach(item => item.classList.remove('sel'));
    button.classList.add('sel');
    const custom = button.dataset.rfTime === 'custom';
    document.getElementById('rfTimeInput').hidden = !custom;
    if (!custom) { form.querySelector('[name="time"]').value = button.dataset.rfTime; }
    else { form.querySelector('[name="time"]').value = document.getElementById('rfTimeInput').value || '08:00'; }
    saveLabel();
  }));
  document.getElementById('rfTimeInput')?.addEventListener('change', event => { form.querySelector('[name="time"]').value = event.target.value || '08:00'; saveLabel(); });
  const setDays = mode => {
    form.querySelectorAll('[data-rf-day]').forEach(input => { input.disabled = mode === 'weekday' ? !['1','2','3','4','5'].includes(input.dataset.rfDay) : false; });
    if (mode !== 'custom') document.querySelectorAll('.rf-day-check').forEach(box => { box.checked = mode === 'all' || ['1','2','3','4','5'].includes(box.value); });
    document.getElementById('rfDayPicker').hidden = mode !== 'custom';
    saveLabel();
  };
  document.querySelectorAll('#rfDaySeg [data-rf-days]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('#rfDaySeg [data-rf-days]').forEach(item => item.classList.remove('sel'));
    button.classList.add('sel');
    setDays(button.dataset.rfDays);
  }));
  document.querySelectorAll('.rf-day-check').forEach(box => box.addEventListener('change', () => {
    const input = form.querySelector(`[data-rf-day="${box.value}"]`);
    if (input) input.disabled = !box.checked;
    if (![...document.querySelectorAll('.rf-day-check')].some(item => item.checked)) { box.checked = true; toast('至少保留一天'); }
    saveLabel();
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
      const time = new Date().toTimeString().slice(0,5);
      state.nextMetricId = Number(state.nextMetricId || 1);
      state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId: reminder.memberId, metric: '收缩压', value: reading.systolic, unit: 'mmHg', date: today, time, source: '提醒记录', channel: 'daily' });
      state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId: reminder.memberId, metric: '舒张压', value: reading.diastolic, unit: 'mmHg', date: today, time, source: '提醒记录', channel: 'daily' });
    } else {
      entry.value = String(formData.get('value') || '').trim();
      entry.unit = reminder.unit || '';
      const metric = reminder.metricType === 'bloodSugar' ? '血糖' : reminder.title;
      state.nextMetricId = Number(state.nextMetricId || 1);
      state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId: reminder.memberId, metric, value: Number(entry.value), unit: entry.unit, date: today, time: new Date().toTimeString().slice(0,5), source: '提醒记录', channel: 'daily' });
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
function skipCustomReminder(id, time, reason = '') {
  const reminder = state.customReminders.find(item => item.id === id);
  if (!reminder) return;
  const key = reminderOccurrenceKey(reminder, time);
  if (['done','skipped'].includes(state.reminderLogs?.[key]?.status)) return;
  state.reminderLogs = { ...(state.reminderLogs || {}), [key]: { status: 'skipped', memberId: reminder.memberId, actor: '小林', reason, completedAt: nowLabel() } };
  saveState(); renderRecords(); toast(reason ? `已跳过并记录原因：${reason}` : '已跳过本次提醒');
}
/* 跳过 = 有记录的终态：必须给原因（外出未带 / 身体不适 / 医嘱已调整 / 其他） */
function showSkipConfirm(id, time) {
  const reminder = state.customReminders.find(item => item.id === id);
  if (!reminder) return;
  const reasons = ['外出未带', '身体不适', '医嘱已调整', '其他'];
  openModal(`${modalHead(`${esc(time)} · ${esc(reminder.title)}`, '为什么跳过？', '跳过会记入提醒记录并可追溯；漏服监测照常兜底，超过 90 分钟未处理仍会升级为预警。')}
    <div class="skip-reasons">${reasons.map(reason => `<button class="skip-reason-btn" data-skip-reason="${esc(id)}" data-skip-time="${esc(time)}" data-reason="${esc(reason)}">${esc(reason)}</button>`).join('')}</div>
    <p class="privacy-small">确认后本次提醒进入「已完成」区并标注原因。</p>`);
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
        if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') new window.Notification('康伴服药提醒', { body: message, tag: key });
        else if (document.visibilityState === 'visible') toast(`服药提醒：${med.name} · ${time}`);
      }
      if (delta > 90 && !state.medicationTaken?.[key] && !state.missedAlerts?.[key] && state.alertSources?.missedDose !== false) {
        state.missedAlerts = { ...(state.missedAlerts || {}), [key]: true };
        changed = true;
        const missedMember = state.familyMembers.find(m => m.id === med.memberId);
        createAlert('yellow', '提醒后仍未记录服药', `${med.name}（${med.dose || '按医嘱'}）计划 ${time} 服用，超过 90 分钟未记录已服。请联系${missedMember?.name || '本人'}确认是否漏服，不要自行补服处方药。`, '服药提醒闭环 · 漏服监测', `${med.memberId || 'family'}|漏服|${med.id}|${day}`, missedMember?.name || '');
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
      if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') new window.Notification('康伴提醒', { body: message, tag: notificationKey });
      else if (document.visibilityState === 'visible') toast(`康伴提醒：${reminder.title} · ${reminder.time}`);
    }
  }
  if (changed) saveState();
}

/* ============ 健康预警（统一规则引擎 + 生命周期 + 真实分级告知 FR-02/FR-04） ============ */
const ALERT_META = {
  red: { label: '紧急', badge: 'alert-badge-red', hint: '立即处理' },
  yellow: { label: '需要关注', badge: 'alert-badge-yellow', hint: '建议跟进' },
  blue: { label: '一般', badge: 'alert-badge-blue', hint: '日常留意' }
};
/* 生命周期：open 未处理 → acked 已确认关注 → resolved 已处理/自动恢复关闭 */
const ALERT_STATUS_LABEL = { open: '未处理', acked: '已确认', resolved: '已处理' };
/* 分级告知：只记录本端真实执行的通知动作（应用内提醒 + 系统通知），不再虚构电话外呼 */
function buildNotifyLog(level) {
  const familyCount = (state.familyMembers || []).length || 1;
  const log = [`已发送应用内${level === 'red' ? '强' : ''}提醒给全部 ${familyCount} 位家庭成员`];
  if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') log.push('已通过系统通知渠道推送到本设备');
  else log.push('系统通知未授权，已降级为应用内提醒（在浏览器设置中开启通知可升级推送）');
  log.push(level === 'red' ? '已置顶到首页「待我处理」队列' : '已加入今日健康汇总');
  return log;
}
/* 统一预警规则表：任何入口保存读数后自动逐条评估；desc 同时作为预警中心的规则说明 */
const ALERT_RULES = [
  { key: 'bp', label: '血压', unit: 'mmHg',
    level: (sys, dia) => (sys >= 180 || dia >= 110) ? 'red' : (sys >= 160 || dia >= 100) ? 'yellow' : (sys >= 140 || dia >= 90) ? 'blue' : null,
    title: level => level === 'red' ? '血压明显升高' : level === 'yellow' ? '血压偏高' : '血压轻度升高',
    detail: (level, sys, dia) => level === 'red'
      ? `收缩压 ${sys} mmHg / 舒张压 ${dia} mmHg，达到紧急阈值（≥180/≥110）。请立即联系本人确认情况，必要时就医。`
      : level === 'yellow'
        ? `收缩压 ${sys} mmHg / 舒张压 ${dia} mmHg，超过关注阈值（≥160/≥100）。建议今天复测一次并留意状态。`
        : `收缩压 ${sys} mmHg / 舒张压 ${dia} mmHg，轻度超过日常范围（≥140/≥90），已记入健康汇总。`,
    desc: '≥140/90 一般 · ≥160/100 需关注 · ≥180/110 紧急' },
  { key: '血糖', label: '血糖', unit: 'mmol/L',
    level: v => (v >= 16.7 || v <= 2.8) ? 'red' : (v >= 11.1 || v <= 3.9) ? 'yellow' : v >= 7.0 ? 'blue' : null,
    title: level => `血糖${level === 'red' ? '明显异常' : level === 'yellow' ? '异常 · 需要关注' : '轻度偏高'}`,
    detail: (level, v) => level === 'red'
      ? `血糖 ${v} mmol/L，${v <= 2.8 ? '达到低血糖紧急阈值（≤2.8）' : '达到紧急阈值（≥16.7）'}，请立即联系本人确认情况，必要时就医。`
      : level === 'yellow'
        ? `血糖 ${v} mmol/L，${v <= 3.9 ? '低于关注阈值（≤3.9），警惕低血糖' : '超过关注阈值（≥11.1）'}，建议今天复测一次。`
        : `血糖 ${v} mmol/L，轻度超过日常范围（≥7.0），已记入健康汇总。`,
    desc: '≥7.0 一般 · ≥11.1 需关注 · ≥16.7 紧急；≤3.9 需关注 · ≤2.8 紧急' },
  { key: '心率', label: '心率（静息）', unit: '次/分',
    level: v => (v > 150 || v < 45) ? 'red' : (v > 120 || v < 50) ? 'yellow' : v > 100 ? 'blue' : null,
    title: level => `心率${level === 'red' ? '明显异常' : level === 'yellow' ? '异常 · 需要关注' : '偏快'}`,
    detail: (level, v) => level === 'red'
      ? `静息心率 ${v} 次/分，超出安全范围（<45 或 >150），请立即确认本人状态。`
      : level === 'yellow'
        ? `静息心率 ${v} 次/分，超过关注阈值（<50 或 >120），建议复测并留意感受。`
        : `静息心率 ${v} 次/分，略高于日常范围（>100），持续偏快建议就诊评估。`,
    desc: '>100 一般 · >120 需关注 · >150 紧急；<50 需关注 · <45 紧急' },
  { key: '血氧', label: '血氧', unit: '%',
    level: v => v < 90 ? 'red' : v < 95 ? 'yellow' : null,
    title: level => `血氧${level === 'red' ? '过低' : '偏低 · 需要关注'}`,
    detail: (level, v) => level === 'red'
      ? `血氧 ${v}%，低于 90%，请立即确认呼吸状态，必要时就医。`
      : `血氧 ${v}%，低于 95%，建议复测并关注呼吸状态。`,
    desc: '<95% 需关注 · <90% 紧急' },
  { key: '体温', label: '体温', unit: '℃',
    level: v => (v >= 39 || (v > 0 && v < 35)) ? 'red' : v >= 37.3 ? 'yellow' : null,
    title: level => level === 'red' ? '体温明显异常' : '低热 · 需要关注',
    detail: (level, v) => level === 'red'
      ? `体温 ${v}℃，${v < 35 ? '低于 35℃，属低体温危险信号' : '达到高热阈值（≥39℃）'}，请立即处理并考虑就医。`
      : `体温 ${v}℃，超过 37.3℃，出现低热，建议多饮水并复测。`,
    desc: '≥37.3℃ 需关注 · ≥39℃ 紧急；<35℃ 紧急' }
];
/* 血压趋势：近 3 天第 3 次及以上偏高，轻度升级为需要关注（升级不影响单次紧急阈值） */
function bpTrendUpgrade(memberId, level) {
  if (level !== 'blue') return level;
  const cutoff = Date.now() - 3 * 86400000;
  const elevated = (state.bodyMetrics || []).filter(entry => entry.memberId === memberId && entry.metric === '收缩压' && entry.value >= 140 && Date.parse(entry.date) >= cutoff).length;
  return elevated >= 3 ? 'yellow' : level;
}
/* 统一评估：一组指标行（收缩压+舒张压成对）→ 预警结果列表，供所有录入入口复用 */
function evaluateMetricAlerts(memberId, rows) {
  const results = [];
  const get = metric => rows.find(row => row.metric === metric);
  const sys = get('收缩压'), dia = get('舒张压');
  const bp = ALERT_RULES[0];
  if (sys && dia) {
    const base = bp.level(Number(sys.value), Number(dia.value));
    const level = base ? bpTrendUpgrade(memberId, base) : null;
    if (level) {
      const upgraded = level !== base;
      results.push({ ruleKey: 'bp', level, metricLabel: `血压 ${sys.value}/${dia.value}`, title: bp.title(level) + (upgraded ? '（连续偏高）' : ''), detail: bp.detail(level, sys.value, dia.value) + (upgraded ? ' 近 3 天多次偏高，已上调关注级别。' : '') });
    }
  }
  ALERT_RULES.slice(1).forEach(rule => {
    const row = get(rule.key);
    if (!row || !Number.isFinite(Number(row.value))) return;
    const level = rule.level(Number(row.value));
    if (!level) return;
    results.push({ ruleKey: rule.key, level, metricLabel: `${rule.label} ${row.value}${rule.unit}`, title: rule.title(level), detail: rule.detail(level, row.value) });
  });
  return results;
}
/* 生成预警（含同日去重合并）：同成员同规则同一天已有未处理预警时，更新数值与次数而不是新增一条 */
function raiseAlert({ level, title, detail, source, dedupKey, memberName, createdAt }) {
  const existing = dedupKey ? (state.alerts || []).find(alert => alert.dedupKey === dedupKey && alert.status === 'open') : null;
  if (existing) {
    existing.times = (existing.times || 1) + 1;
    existing.level = level; existing.title = title; existing.detail = detail;
    existing.source = source || existing.source;
    existing.createdAt = createdAt || nowLabel();
    existing.notify = buildNotifyLog(level);
    saveState(); renderHomeAlerts();
    return existing;
  }
  const alert = { id: `alert-${state.nextAlertId++}`, level, title, detail, source: source || '规则引擎', createdAt: createdAt || nowLabel(), memberName: memberName || '', dedupKey: dedupKey || '', status: 'open', times: 1, ackedAt: '', resolvedAt: '', resolvedNote: '', notify: buildNotifyLog(level) };
  state.alerts.unshift(alert);
  saveState(); renderHomeAlerts();
  if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') new window.Notification(`康伴${ALERT_META[level].label}预警：${title}`, { body: detail, tag: alert.id });
  return alert;
}
function createAlert(level, title, detail, source, dedupKey, memberName) {
  return raiseAlert({ level, title, detail, source, dedupKey, memberName });
}
/* 恢复判定：某指标最新读数回到日常范围时，自动关闭该成员该指标的未处理预警并留档一条恢复记录 */
function settleRecovered(memberId, ruleKey, label, note, memberName) {
  const open = (state.alerts || []).filter(alert => alert.status === 'open' && (alert.dedupKey || '').startsWith(`${memberId}|${ruleKey}|`) && !(alert.dedupKey || '').includes('|恢复|'));
  if (!open.length) return false;
  open.forEach(alert => { alert.status = 'resolved'; alert.resolvedAt = nowLabel(); alert.resolvedNote = note; });
  raiseAlert({ level: 'blue', title: `${label}已恢复日常范围`, detail: `${memberName ? `${memberName} ` : ''}${note}。原预警已自动关闭并归档。`, source: '规则引擎 · 自动恢复', dedupKey: `${memberId}|${ruleKey}|恢复|${dateOffset(0)}`, memberName });
  return true;
}
/* 统一入口：读数入库后调用（保存读数 / 硬件同步 / 历史重放），返回触发的文案列表；来源开关关闭的渠道不产生预警 */
function evaluateAndRaise(memberId, memberName, rows, source, dedupDate, createdAt) {
  const fromDevice = /硬件|设备|手表/.test(source || '');
  const sources = state.alertSources || {};
  if (fromDevice ? sources.device !== true : sources.manual === false) return [];
  const messages = [];
  evaluateMetricAlerts(memberId, rows).forEach(result => {
    raiseAlert({ level: result.level, title: result.title, detail: result.detail, source: `${source} · ${result.metricLabel}`, dedupKey: dedupDate ? `${memberId}|${result.ruleKey}|${dedupDate}` : '', memberName, createdAt });
    messages.push(`${result.title}（${ALERT_META[result.level].label}）`);
  });
  const get = metric => rows.find(row => row.metric === metric)?.value;
  const bp = ALERT_RULES[0];
  const sys = get('收缩压'), dia = get('舒张压');
  if (sys != null && dia != null && !bp.level(Number(sys), Number(dia)) && settleRecovered(memberId, 'bp', '血压', `血压回落至日常范围（最新 ${sys}/${dia} mmHg）`, memberName)) messages.push('血压已恢复日常范围');
  ALERT_RULES.slice(1).forEach(rule => {
    const value = get(rule.key);
    if (value == null || rule.level(Number(value))) return;
    if (settleRecovered(memberId, rule.key, rule.label, `${rule.label}恢复日常范围（最新 ${value}${rule.unit}）`, memberName)) messages.push(`${rule.label}已恢复日常范围`);
  });
  return messages;
}
function nowLabel() {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
/* 设备注册表定义：接入开关 + 该设备的预警阈值说明（真机接入后换成真实绑定流程，前端结构不变） */
const DEVICES = [
  ['glucose', '🩸', '血糖监测仪', '预警：血糖 ≤ 3.9 警惕低血糖 · ≤ 2.8 紧急 · ≥ 16.7 紧急'],
  ['bp', '🩺', '血压监测仪', '预警：≥180/110 紧急 · ≥160/100 需关注'],
  ['watch', '⌚', '智能手表', '预警：疑似跌倒 · 心率异常 · 血氧过低']
];
const deviceAlert = alert => /硬件|设备|手表|跌倒/.test(alert.source || '');
function renderHomeAlerts() {
  const host = document.getElementById('homeAlerts');
  const section = document.getElementById('homeAlertsSection');
  if (!host) return;
  /* 首页「设备预警」窗口：只承载设备上报的危险预警（血糖危险低值 / 血压危险值 / 跌倒）；
     手动录入的异常只进预警中心，不上首页——未接入任何设备时整块隐藏 */
  const devicesOn = Object.values(state.devices || {}).some(Boolean);
  const open = (state.alerts || []).filter(alert => alert.status !== 'resolved' && deviceAlert(alert));
  const serve = open.sort((a, b) => ({ red: 0, yellow: 1 }[a.level] ?? 2) - ({ red: 0, yellow: 1 }[b.level] ?? 2));
  /* 铃铛红点：全局未处理红/黄预警（含手动渠道），点开预警中心可处理 */
  document.querySelectorAll('.notify-dot').forEach(dot => dot.classList.toggle('show', (state.alerts || []).some(alert => alert.status !== 'resolved' && (alert.level === 'red' || alert.level === 'yellow'))));
  if (section) section.hidden = !devicesOn;
  if (!devicesOn) { host.innerHTML = ''; return; }
  const onlineList = DEVICES.filter(([key]) => state.devices[key]);
  const statusRows = onlineList.map(([, icon, name]) => `<div class="dev-row"><span class="dev-ic">${icon}</span><div style="flex:1"><b>${esc(name)}</b><div class="mut"><span class="on-dot"></span>在线 · 已接入</div></div></div>`).join('');
  if (!serve.length) {
    host.innerHTML = `<div class="dev-online-card">${statusRows}<p class="dev-calm">设备已接入，暂无危险预警。设备上报异常时会在这里立即提醒。</p></div>`;
    return;
  }
  const latest = serve[0];
  const moreCount = open.length - 1;
  const moreLine = moreCount > 0 ? `<p class="more-line">另有 ${moreCount} 条设备预警记录，已在预警中心 <button class="text-button" data-action="alerts">查看</button></p>` : '';
  host.innerHTML = `<div class="dev-online-card">${statusRows}</div><div class="alert-card alert-card-${latest.level}"><span class="alert-icon alert-icon-${latest.level}">${latest.level === 'red' ? '!' : '△'}</span><div><strong>${esc(latest.title)}${latest.level === 'red' ? '（紧急）' : ''}</strong><small>${esc(latest.detail.split('。')[0])}。</small><small class="alert-time">${esc(latest.createdAt)} · 设备主动上报${latest.times > 1 ? ` · 同日 ${latest.times} 条已合并` : ''}</small></div><button class="text-button" data-action="alerts">处理 →</button></div>${moreLine}`;
}
let alertCenterFilter = 'open';
/* 预警来源开关：设备渠道由下方设备注册表联动（任一设备接入即开）；这里只列非设备渠道 */
const ALERT_SOURCES = [
  ['missedDose', '💊 漏服监测', '服药提醒后 90 分钟未记录'],
  ['checkup', '📋 体检异常', '导入体检单自动比对参考范围'],
  ['manual', '✍️ 手动读数异常', '家人录入 / 拍照 / 语音识别']
];
function showAlertCenter(filter) {
  alertCenterFilter = filter || 'open';
  const all = state.alerts || [];
  const openCount = all.filter(alert => alert.status !== 'resolved').length;
  const resolvedCount = all.length - openCount;
  const tabs = [['open', `未处理 ${openCount}`], ['resolved', `已处理 ${resolvedCount}`], ['all', `全部 ${all.length}`]];
  const list = all.filter(alert => alertCenterFilter === 'all' ? true : alertCenterFilter === 'open' ? alert.status !== 'resolved' : alert.status === 'resolved').map(alert => {
    const meta = ALERT_META[alert.level];
    const statusChip = alert.status === 'resolved' ? '<span class="alert-status-chip resolved">已处理</span>' : alert.status === 'acked' ? '<span class="alert-status-chip acked">已确认</span>' : '';
    const timesText = alert.times > 1 ? ` · 同日合并 ${alert.times} 条` : '';
    const resolvedLine = alert.status === 'resolved'
      ? `<small class="alert-source">处理记录：${esc(alert.resolvedNote || '已处理')} · ${esc(alert.resolvedAt || '')}</small>`
      : alert.status === 'acked' ? `<small class="alert-source">已确认持续关注 · ${esc(alert.ackedAt || '')}</small>` : '';
    const actions = alert.status !== 'resolved'
      ? `<div class="alert-actions"><button class="secondary-button" data-alert-act="ack" data-alert-id="${alert.id}">知道了，持续关注</button><button class="primary-button" data-alert-act="resolve" data-alert-id="${alert.id}">标记已处理</button></div>`
      : '';
    return `<article class="alert-detail-card"><div class="alert-detail-head"><span class="alert-badge ${meta.badge}">${meta.label}</span><strong>${esc(alert.title)}</strong><small>${esc(alert.createdAt)}${timesText}</small>${statusChip}</div><p>${esc(alert.detail)}</p><small class="alert-source">来源：${esc(alert.source)}</small>${resolvedLine}<div class="alert-notify"><strong>分级告知记录</strong>${(alert.notify || []).map(entry => `<small>› ${esc(entry)}</small>`).join('')}</div>${actions}</article>`;
  }).join('');
  const sources = state.alertSources || {};
  const srcRows = ALERT_SOURCES.map(([key, label, desc]) => `<div class="src-row"><div><b>${label}</b><small>${desc}</small></div><span class="sw ${sources[key] ? 'on' : ''}" data-src-toggle="${key}" role="switch" aria-checked="${!!sources[key]}" aria-label="${label}"></span></div>`).join('');
  const devRows = DEVICES.map(([key, icon, name, desc]) => `<div class="src-row"><span class="dev-ic">${icon}</span><div><b>${name}</b><small>${desc}</small></div><span class="sw ${state.devices?.[key] ? 'on' : ''}" data-dev-toggle="${key}" role="switch" aria-checked="${!!state.devices?.[key]}" aria-label="接入${name}"></span></div>`).join('');
  openModal(`${modalHead('预警自动生成 · 本页仅汇总与处理', '健康预警中心', '预警由健康档案的日常记录、体检单导入和服药提醒自动评估生成，指标恢复日常范围会自动关闭对应预警；这里只做汇总展示与处理，录入请到健康档案。')}
    <div class="src-block">
      <b>设备管理</b>
      <small>接入监测设备后，设备上报的危险预警会显示在首页「设备预警」窗口；未接入任何设备时首页不显示该区块（演示：录入读数 · 硬件同步里可模拟设备事件）</small>
      ${devRows}
    </div>
    <div class="src-block">
      <b>预警来源</b>
      <small>关掉的来源不再产生、也不再显示预警</small>
      ${srcRows}
    </div>
    <div class="alert-filter-chips">${tabs.map(([key, label]) => `<button class="metric-chip ${alertCenterFilter === key ? 'selected' : ''}" data-alert-filter="${key}">${label}</button>`).join('')}</div>
    ${list || '<p class="privacy-small" style="margin-top:18px">该状态下暂无预警记录。</p>'}`);
  document.querySelectorAll('[data-dev-toggle]').forEach(el => el.addEventListener('click', () => {
    const key = el.dataset.devToggle;
    state.devices = { ...(state.devices || {}), [key]: !(state.devices || {})[key] };
    state.alertSources = { ...(state.alertSources || {}), device: Object.values(state.devices).some(Boolean) };
    saveState(); renderHomeAlerts(); showAlertCenter();
    toast(state.devices[key] ? '设备已接入（演示）：设备上报的预警将显示在首页' : '设备已断开');
  }));
  document.querySelectorAll('[data-src-toggle]').forEach(el => el.addEventListener('click', () => {
    const key = el.dataset.srcToggle;
    state.alertSources = { ...(state.alertSources || {}), [key]: !(state.alertSources || {})[key] };
    saveState(); renderHomeAlerts(); showAlertCenter();
    toast(state.alertSources[key] ? '该预警来源已开启' : '该预警来源已关闭，之后不再产生此类预警');
  }));
  document.querySelectorAll('[data-alert-filter]').forEach(btn => btn.addEventListener('click', () => showAlertCenter(btn.dataset.alertFilter)));
  document.querySelectorAll('[data-alert-act]').forEach(btn => btn.addEventListener('click', () => {
    const alert = (state.alerts || []).find(item => item.id === btn.dataset.alertId);
    if (!alert) return;
    if (btn.dataset.alertAct === 'ack') { alert.status = 'acked'; alert.ackedAt = nowLabel(); toast('已确认为持续关注项'); }
    else { alert.status = 'resolved'; alert.resolvedAt = nowLabel(); alert.resolvedNote = '家人手动确认处理'; toast('已处理并归档'); }
    saveState(); renderHomeAlerts(); showAlertCenter();
  }));
}
/* ============ 录入读数（多通道：手动 / 语音 / 拍照 / 硬件，读数按成员归属） ============ */
let readingMemberId = 'm1';   // 当前录入读数的目标成员（设备数据各归各人）
let uploadMemberId = '';      // 「＋ 添加资料」预选的成员（医疗资料成员块内触发时传入）
let appointmentMemberId = ''; // 当前就诊准备清单对应的成员（弹窗间跳转保持上下文）
let preVisitMemberId = '';    // 当前诊前自我描述对应的成员
let histEditContext = 'dashboard'; // 编辑/删除后的返回上下文：dashboard / daily
const previewOpen = new Set();   // 成员卡内长列表预览展开状态（track-m1 / daily-m1 ...）
const READING_METHODS = [
  { id: 'manual', icon: '✍️', label: '手动录入', hint: '一句话描述读数，AI 识别后回填核对' },
  { id: 'voice', icon: '🎙', label: '语音录入', hint: '老人说一句话，自动转成读数' },
  { id: 'photo', icon: '📷', label: '拍照识别', hint: '拍血压计 / 血糖仪，OCR 读数' },
  { id: 'device', icon: '⌚', label: '硬件同步', hint: '智能手表自动同步与异常上报' }
];
/* 一句话 → 结构化指标行（可多指标混录，按原文出现顺序输出；演示版本地解析，正式版由大模型做意图抽取） */
function parseReadingRows(text) {
  const flat = String(text || '').replace(/[，,。;；！？、]/g, ' ');
  const found = [];
  const push = (index, metric, value, unit) => { if (Number.isFinite(value) && value > 0) found.push({ index, metric, value, unit }); };
  /* 血压：血压 152/94 / 血压 152 94 / 裸 152/94 */
  const slash = /血压[^\d]{0,4}(\d{2,3})\s*[\/／|到\-~]\s*(\d{2,3})/.exec(flat);
  const spoken = slash ? null : /血压[^\d]{0,4}(\d{2,3})\s+(\d{2,3})/.exec(flat);
  const bare = slash || spoken ? null : /(?<!\d)(\d{2,3})\s*[\/／]\s*(\d{2,3})(?!\d)/.exec(flat);
  const bp = slash || spoken || bare;
  if (bp) { push(bp.index, '收缩压', Number(bp[1]), 'mmHg'); push(bp.index, '舒张压', Number(bp[2]), 'mmHg'); }
  const words = [['血糖', '血糖', 'mmol/L'], ['体重', '体重', 'kg'], ['脉搏', '心率', '次/分'], ['心率', '心率', '次/分'], ['血氧', '血氧', '%'], ['体温', '体温', '℃'], ['尿酸', '尿酸', 'μmol/L'], ['胆固醇', '总胆固醇', 'mmol/L']];
  words.forEach(([word, metric, unit]) => {
    const m = new RegExp(`${word}[^\\d.]{0,4}(\\d+(?:\\.\\d+)?)`).exec(flat);
    if (m) push(m.index, metric, Number(m[1]), unit);
  });
  return found.sort((a, b) => a.index - b.index).map(({ metric, value, unit }) => ({ metric, value, unit }));
}
function showReadingEntry(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId) || currentMember();
  if (!member) return;
  readingMemberId = member.id;
  const method = READING_METHODS.some(item => item.id === readingMethod) ? readingMethod : 'manual';
  const chips = READING_METHODS.map(item => `<button class="metric-chip ${item.id === method ? 'selected' : ''}" data-reading-method="${item.id}">${item.icon} ${item.label}</button>`).join('');
  const quickChips = DAILY_METRICS.map(name => `<button class="metric-chip" data-quick-metric="${esc(name)}">＋ ${esc(name)}</button>`).join('') + `<button class="metric-chip" data-quick-metric="__custom">＋ 自定义</button>`;
  /* 四通道共用：可编辑指标行 + 保存（识别/同步结果都先落到行里，人工核对后入库） */
  const commonRows = `
    <div class="metric-chips quick-metric-chips">${quickChips}</div>
    <datalist id="metricSuggestions">${[...Object.keys(METRIC_DEFS), ...Object.keys(state.metricDefs || {})].map(name => `<option value="${esc(name)}"></option>`).join('')}</datalist>
    <div id="manualRows" class="manual-rows"></div>
    <button class="text-button" id="addManualRow">＋ 再记一项</button>
    <button class="primary-button" id="saveDailyEntries" style="margin-top:10px">核对无误，保存全部（来源：${esc(readingSource)}）</button>
    <p class="privacy-small">每一行都能改：指标名、数值、单位、增删行都可以。保存后记到 ${esc(member.name)} 名下并同步进数据看板；血压由规则引擎自动评估分级。</p>`;
  let capture = '';
  if (method === 'manual') {
    capture = `<div class="ai-parse-block">
      <strong>一句话 + AI 识别 · 支持多项指标混录</strong>
      <div class="ai-parse-row">
        <input class="input-field" id="manualText" placeholder="例：早上血糖 6.8，血压 152/94，脉搏 78" />
        <button class="secondary-button" id="aiParseReading">✳ AI 识别</button>
      </div>
      <div class="entry-result" id="aiParseResult" hidden></div>
    </div>`;
  } else if (method === 'voice') {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">🎙</div>
        <strong>语音录入（演示）· 全指标通用</strong>
        <p>老人对手机或音箱说一句，语音转文字 + AI 意图抽取，血糖、血压、心率等多个指标一次生成可编辑行。</p>
        <div class="entry-result" id="voiceResult" hidden></div>
        <button class="primary-button" id="voiceMock">▶ 模拟一句语音："妈妈今天血糖 6.8，血压 152 94，脉搏 78"</button>
        <p class="privacy-small">正式版接入语音识别（微信语音 / 讯飞）后支持自然表达与多方言。</p>
      </div>`;
  } else if (method === 'photo') {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">📷</div>
        <strong>拍照识别（模拟 OCR）· 全指标通用</strong>
        <p>血糖仪、血压计、体温计的读数屏都能拍，识别后生成可编辑指标行，家人核对确认。</p>
        <div class="entry-photo">🩺 血糖仪 + 电子血压计读数屏（模拟）<small>今日 07:50 · 两台设备</small></div>
        <div class="entry-result" id="photoResult" hidden></div>
        <button class="primary-button" id="photoMock">🔍 开始识别</button>
        <p class="privacy-small">识别结果需人工确认后入库；正式版使用端侧 OCR 模型。</p>
      </div>`;
  } else {
    capture = `<div class="entry-capture-card">
        <div class="entry-capture-icon">⌚</div>
        <strong>硬件设备同步（演示）· 全指标通用</strong>
        <p>智能手表、血压计、血糖仪各自通过厂商接口同步，多指标一次进表；跌倒检测自动触发紧急预警。</p>
        <div class="entry-result" id="deviceResult">${Object.entries(state.devices || {}).filter(([, on]) => on).length ? `已接入设备：${DEVICES.filter(([key]) => state.devices[key]).map(([, , name]) => name).join(' · ')} · 上次同步 ${nowLabel().split(' ')[1]}` : '尚未接入监测设备：到预警中心 · 设备管理里接入后可同步'}</div>
        <button class="primary-button" id="mockWatchSync">同步一次设备读数（血压 + 心率 + 血氧）</button>
        <button class="secondary-button" id="mockFallEvent">模拟手表跌倒事件（红色预警）</button>
        <p class="privacy-small">真实接入走华为 Health Kit / 小米运动健康等开放接口；同步数据同样人工可改、确认后入库。</p>
      </div>`;
  }
  const activeHint = READING_METHODS.find(item => item.id === method)?.hint || '';
  openModal(`${modalHead(`日常记录 · ${esc(member.name)}`, '录入读数', `四种通道全部生成可编辑的指标行：想记什么指标自己定，读数记到 ${esc(member.name)} 名下（各设备接口各归各人），保存后进入数据看板与预警评估。`)}
    <div class="metric-chips entry-method-chips">${chips}</div>
    <p class="privacy-small entry-hint">${esc(activeHint)}</p>
    ${capture}
    ${commonRows}`);
  /* 可编辑指标行：AI 识别 / 语音 / 拍照 / 硬件同步统一落到这里 */
  const manualRowsHost = document.getElementById('manualRows');
  const addManualRow = (metric = '', value = '', unit = '') => {
    if (!manualRowsHost) return;
    const row = document.createElement('div');
    row.className = 'manual-row';
    row.innerHTML = `<input class="input-field row-metric" list="metricSuggestions" placeholder="指标名" value="${esc(metric)}" />
      <input class="input-field row-value" type="number" step="0.1" placeholder="数值" value="${esc(String(value))}" />
      <input class="input-field row-unit" placeholder="单位" value="${esc(unit)}" />
      <button class="text-button row-del" type="button" aria-label="删除该行">×</button>`;
    row.querySelector('.row-del')?.addEventListener('click', () => row.remove());
    manualRowsHost.appendChild(row);
  };
  const fillRows = rows => {
    if (!manualRowsHost) return;
    manualRowsHost.innerHTML = '';
    rows.forEach(row => addManualRow(row.metric, row.value, row.unit));
  };
  const quickMetricUnits = { '血压': '', '血糖': 'mmol/L', '心率': '次/分', '血氧': '%', '体重': 'kg', '体温': '℃', '尿酸': 'μmol/L' };
  document.querySelectorAll('[data-quick-metric]').forEach(chip => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.quickMetric;
      if (name === '__custom') { addManualRow(); manualRowsHost?.lastElementChild?.querySelector('.row-metric')?.focus(); return; }
      if (name === '血压') { addManualRow('收缩压', '', 'mmHg'); addManualRow('舒张压', '', 'mmHg'); return; }
      addManualRow(name, '', quickMetricUnits[name] || '');
      manualRowsHost?.lastElementChild?.querySelector('.row-value')?.focus();
    });
  });
  if (manualRowsHost && !manualRowsHost.children.length) addManualRow();
  document.getElementById('addManualRow')?.addEventListener('click', () => addManualRow());
  const collectRows = () => [...document.querySelectorAll('.manual-row')].map(row => ({
    metric: row.querySelector('.row-metric')?.value.trim() || '',
    value: Number(row.querySelector('.row-value')?.value),
    unit: row.querySelector('.row-unit')?.value.trim() || ''
  })).filter(row => row.metric && Number.isFinite(row.value) && row.value > 0);
  document.getElementById('aiParseReading')?.addEventListener('click', () => {
    const text = document.getElementById('manualText')?.value || '';
    if (!text.trim()) { toast('先输入一句读数描述，再点 AI 识别'); return; }
    const parsed = parseReadingRows(text);
    const result = document.getElementById('aiParseResult');
    if (!parsed.length) {
      if (result) { result.hidden = false; result.textContent = `没能从「${text.trim()}」里识别出指标，试试「血糖 6.8」「血压 152/94」「体重 58.5」这种说法，或点下面的常用指标直接加行。`; }
      return;
    }
    fillRows(parsed);
    if (result) {
      result.hidden = false;
      result.textContent = `AI 识别出 ${parsed.length} 项指标：${parsed.map(row => `${row.metric} ${row.value}${row.unit || ''}`).join(' · ')}，已生成可编辑行，请核对后保存。`;
    }
    toast(`AI 识别出 ${parsed.length} 项指标，请核对`);
  });
  document.getElementById('voiceMock')?.addEventListener('click', () => {
    const sentence = '妈妈今天血糖 6.8，血压 152 94，脉搏 78';
    const parsed = parseReadingRows(sentence);
    const result = document.getElementById('voiceResult');
    if (result) { result.hidden = false; result.textContent = `“${sentence}” → AI 抽取出 ${parsed.length} 项指标，已生成可编辑行`; }
    readingSource = '语音录入';
    fillRows(parsed);
    toast(`语音识别出 ${parsed.length} 项指标，请核对`);
  });
  document.getElementById('photoMock')?.addEventListener('click', () => {
    const rows = [{ metric: '血糖', value: 7.2, unit: 'mmol/L' }, { metric: '收缩压', value: 146, unit: 'mmHg' }, { metric: '舒张压', value: 92, unit: 'mmHg' }, { metric: '心率', value: 78, unit: '次/分' }];
    const result = document.getElementById('photoResult');
    if (result) { result.hidden = false; result.textContent = `OCR 识别出 ${rows.length} 项指标（置信度 96%），已生成可编辑行`; }
    readingSource = '拍照识别';
    fillRows(rows);
    toast(`识别出 ${rows.length} 项指标，请核对`);
  });
  document.getElementById('mockWatchSync')?.addEventListener('click', () => {
    if (!state.devices?.watch) { toast('智能手表未接入：先到预警中心 · 设备管理里接入'); return; }
    const pool = [ [128, 82, 72, 98], [146, 92, 78, 96], [168, 104, 86, 95], [122, 80, 70, 97] ];
    const [sys, dia, pulse, spo2] = pool[Math.floor(Math.random() * pool.length)];
    const rows = [
      { metric: '收缩压', value: sys, unit: 'mmHg' },
      { metric: '舒张压', value: dia, unit: 'mmHg' },
      { metric: '心率', value: pulse, unit: '次/分' },
      { metric: '血氧', value: spo2, unit: '%' }
    ];
    const result = document.getElementById('deviceResult');
    if (result) { result.textContent = `手表同步成功（${nowLabel().split(' ')[1]}）：血压 + 心率 + 血氧共 ${rows.length} 项，已生成可编辑行`; }
    readingSource = '硬件同步';
    fillRows(rows);
    toast(`设备同步 ${rows.length} 项指标，请核对`);
  });
  document.getElementById('mockFallEvent')?.addEventListener('click', () => {
    if (!state.devices?.watch) { toast('智能手表未接入：先到预警中心 · 设备管理里接入'); return; }
    const member = state.familyMembers.find(item => item.id === readingMemberId) || currentMember();
    const who = member?.name || '本人';
    createAlert('red', '疑似跌倒事件', `已绑定的智能手表上报一次疑似跌倒（${nowLabel()}），定位：家中客厅。请立即联系 ${who} 确认情况，必要时就医。`, '硬件同步 · 跌倒监测', `${member?.id || 'x'}|跌倒|${Math.floor(Date.now() / 600000)}`, who);
    closeModal(); toast('已生成红色预警，已通过应用内强提醒通知全部家庭成员');
    showAlertCenter();
  });
  document.getElementById('saveDailyEntries')?.addEventListener('click', () => {
    const rows = collectRows();
    if (!rows.length) { toast('请至少填写一行有效的指标和数值'); return; }
    saveDailyEntries(readingMemberId, rows, readingSource);
  });
}
/* 通用日常录入：任意指标行入库；若包含收缩压+舒张压则联动血压预警引擎 */
function saveDailyEntries(memberId, rows, source) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member || !rows.length) return;
  const date = dateOffset(0);
  const time = nowLabel().split(' ')[1];
  rows.forEach(row => {
    state.bodyMetrics.push({ id: `bm-${state.nextMetricId++}`, memberId, metric: row.metric, value: row.value, unit: row.unit || metricDef(row.metric)?.unit || '', date, time, source, channel: 'daily' });
  });
  /* 全指标统一预警评估：触发分级预警 + 异常恢复时自动关闭旧预警 */
  const messages = evaluateAndRaise(memberId, member.name, rows, source, dateOffset(0));
  let message = `${member.name} 的 ${rows.length} 项日常记录已保存`;
  if (messages.length) message += `：${messages.join('、')}`;
  saveState(); renderHomeAlerts(); renderHealth();
  /* 若数据看板正开着，就地刷新，保证「日常记录 + 体检单」联动可见 */
  const boardTitle = document.getElementById('modalTitle')?.textContent || '';
  if (!document.getElementById('modalBackdrop')?.hidden && boardTitle.includes('数据看板')) showMemberDashboard(memberId);
  closeModal();
  toast(`${message}，可在数据看板查看趋势`);
}
/* 日常记录数据源：channel = daily 的指标（血压合并为一条展示用） */
function dailyEntries(memberId) {
  return (state.bodyMetrics || []).filter(entry => entry.memberId === memberId && entry.channel === 'daily')
    .slice().sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
}
/* 把同一时刻的 收缩压+舒张压 合并成一条 152/94 展示行 */
function mergeBpEntries(entries) {
  const merged = [];
  const used = new Set();
  entries.forEach(entry => {
    if (used.has(entry.id)) return;
    if (entry.metric === '收缩压') {
      const dia = entries.find(other => other.metric === '舒张压' && other.date === entry.date && (other.time || '') === (entry.time || '') && !used.has(other.id));
      if (dia) {
        used.add(dia.id);
        merged.push({ ...entry, metric: '血压', value: `${entry.value}/${dia.value}`, unit: 'mmHg' });
        return;
      }
    }
    merged.push(entry);
  });
  return merged;
}
function dailyEntryRow(entry) {
  const abnormal = entry.metric === '血压' ? null : metricStatus(entry.metric, Number(entry.value));
  const bp = entry.metric === '血压' ? bpReadingState(entry.value) : null;
  const tag = bp ? bp.tag : statusTagOf(Number(entry.value), entry.metric);
  const tagLabel = bp ? bp.label : statusLabelOf(Number(entry.value), entry.metric);
  return `<div class="reading-row"><div class="reading-copy"><strong>${esc(entry.metric)} ${esc(String(entry.value))} <small>${esc(entry.unit || '')}</small></strong><small>${formatDate(entry.date)}${entry.time ? ` ${esc(entry.time)}` : ''} · ${esc(entry.source || '手动录入')}</small></div><span class="reading-tag ${tag}">${tagLabel}</span></div>`;
}
/* 日常记录弹窗：某个成员的完整日常记录（任意指标，可编辑/删除） */
function showDailyLog(memberId) {
  const member = state.familyMembers.find(item => item.id === memberId);
  if (!member) return;
  const entries = mergeBpEntries(dailyEntries(memberId));
  const body = entries.length ? `<div class="reading-list">${entries.map(entry => `<div class="daily-log-row">${dailyEntryRow(entry)}<span class="daily-row-ops"><button class="text-button" data-hist-edit="${entry.id}" data-edit-context="daily">编辑</button><button class="text-button" data-hist-del="${entry.id}" data-edit-context="daily">删除</button></span></div>`).join('')}</div>` : '<p class="empty-hint">还没有日常记录，点下方按钮录入第一条。</p>';
  openModal(`${modalHead(`日常记录 · ${esc(member.name)}`, '任意健康指标 · 设备数据', '手动、语音、拍照、硬件四种通道的读数都按成员归属；指标可自由增删改，这些数据和体检单一起构成数据看板。')}
    ${body}
    <button class="primary-button" data-member-reading="${member.id}">＋ 录入读数（手动 / 语音 / 拍照 / 硬件）</button>
    <button class="secondary-button" data-member-dashboard="${member.id}">数据看板（日常记录 + 体检单） →</button>
    <p class="privacy-small">正式版中血糖仪、血压计、体温计、手表各自通过厂商接口接入，数据自动归到对应家庭成员名下。</p>`);
}

/* 陪诊 Tab 子页签：'mine' = 我的陪诊（履约） / 'hall' = 社区大厅（撮合）；家庭端社区已并入陪诊 Tab */
let companionSub = 'mine';
function setCompanionSub(sub, push = true) {
  companionSub = sub === 'hall' ? 'hall' : 'mine';
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === (companionSub === 'hall' ? 'view-community' : 'view-companion')));
  document.querySelectorAll('[data-csub]').forEach(el => el.classList.toggle('sel', el.dataset.csub === companionSub));
  if (companionSub === 'hall') renderCommunity();
  else if (window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'family') { try { renderCloudFamilyOrders(); } catch { /* 忽略 */ } }
  if (push) { try { history.pushState({ kangbanTab: 'companion', kangbanSub: companionSub }, ''); } catch { /* 忽略 */ }
    window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
function navigate(tab, fromPop = false) {
  if (window.KangbanAuth?.role === 'guest' && tab !== 'community') tab = 'community';
  /* 云端陪诊师：工作台 / 社区 / 我的 三页可去，其余一律回工作台 */
  if (window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'escort' && !['escort', 'community', 'escort-profile'].includes(tab)) tab = 'escort';
  if (window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'family' && tab.startsWith('escort')) tab = 'home';
  if (state.currentRole === 'escort' && !['escort', 'community', 'escort-profile', 'escort-hall'].includes(tab) && window.KangbanAuth?.mode !== 'cloud') tab = 'escort';
  if (state.currentRole !== 'escort' && tab.startsWith('escort')) tab = 'home';
  /* 家庭端（本地 + 云端）：社区并入陪诊 Tab 的「社区大厅」子页签；游客与陪诊师不受影响 */
  const isEscortRole = window.KangbanAuth?.mode === 'cloud' ? window.KangbanAuth.role === 'escort' : state.currentRole === 'escort';
  const isGuestRole = window.KangbanAuth?.role === 'guest';
  if (tab === 'community' && !isGuestRole && !isEscortRole) { companionSub = 'hall'; tab = 'companion'; }
  else if (tab === 'companion' && !fromPop) companionSub = 'mine';
  const changed = currentTab !== tab;
  currentTab = tab;
  document.body.classList?.toggle('guest-mode', window.KangbanAuth?.role === 'guest');
  const activeViewId = tab === 'companion' && companionSub === 'hall' ? 'view-community' : `view-${tab}`;
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === activeViewId));
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  document.querySelectorAll(`.tab[data-tab="${tab}"]`).forEach(el => el.classList.remove('has-dot'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (tab === 'community' || (tab === 'companion' && companionSub === 'hall')) renderCommunity();
  if (tab === 'escort' && window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'escort') renderCloudWorkbench();
  if (tab === 'companion' && companionSub === 'mine' && window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'family') renderCloudFamilyOrders();
  if (tab === 'escort-profile' && window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth.role === 'escort') renderCloudEscortProfile();
  /* 页面切换进历史栈：浏览器/手机返回手势可回上一层（子页签一并入栈） */
  if (!fromPop && changed) { try { history.pushState({ kangbanTab: tab, kangbanSub: tab === 'companion' ? companionSub : undefined }, ''); } catch { /* 历史接口不可用时静默降级 */ }
  }
}
/* 返回上一层：浏览器历史统一接管（页面 Tab + 弹窗） */
let modalHistoryActive = false;
window.addEventListener('popstate', event => {
  if (modalHistoryActive) { closeModal(true); return; }
  const tab = event.state?.kangbanTab;
  if (tab && tab !== currentTab) {
    if (event.state?.kangbanSub) companionSub = event.state.kangbanSub === 'hall' ? 'hall' : 'mine';
    navigate(tab, true);
  } else if (tab === 'companion' && event.state?.kangbanSub && event.state.kangbanSub !== companionSub) {
    /* 同一 Tab 内的子页签返回（我的陪诊 ↔ 社区大厅） */
    setCompanionSub(event.state.kangbanSub, false);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modalHistoryActive) closeModal();
});
function toast(message) {
  const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}
function openModal(content) {
  document.getElementById('modalContent').innerHTML = content;
  document.getElementById('modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  /* 弹窗也进历史栈：手机返回手势 / 浏览器后退 = 关闭当前弹窗回到上一层 */
  if (!modalHistoryActive) { try { history.pushState({ kangbanModal: true }, ''); } catch { /* 忽略 */ } }
  modalHistoryActive = true;
}
function closeModal(fromPop = false) {
  const wasOpen = modalHistoryActive;
  document.getElementById('modalBackdrop').hidden = true;
  document.body.style.overflow = '';
  stopListening();
  if (preVisitRecorder?.state === 'recording') preVisitRecorder.stop();
  if (preVisitAttachmentUrl) { URL.revokeObjectURL(preVisitAttachmentUrl); preVisitAttachmentUrl = null; }
  if (wasOpen && !fromPop && history.state?.kangbanModal) {
    modalHistoryActive = false;
    history.back(); /* 触发 popstate 后由 closeModal(true) 收尾 */
    return;
  }
  modalHistoryActive = false;
}
async function showLocalImportPreview() {
  const raw = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
  const attachments = await getAllAttachments().catch(() => []);
  const rows = [
    ['家庭成员', raw.familyMembers?.length || 0], ['医疗资料', raw.records?.length || 0], ['体检指标', raw.bodyMetrics?.length || 0],
    ['保单与报销', (raw.insurancePolicies?.length || 0) + (raw.reimbursements?.length || 0)], ['服药与自定义提醒', (raw.medications?.length || 0) + (raw.customReminders?.length || 0)],
    ['陪诊预约与需求', (raw.companionOrders?.length || 0) + (raw.demandPosts?.length || 0)], ['本机附件', attachments.length]
  ];
  openModal(`${modalHead('数据迁移 · 可续传', '导入本机演示数据', '先核对类别和数量。确认后会把本机资料写入当前家庭云空间，并将 IndexedDB 附件上传到私有 Storage。只导入虚构演示资料。')}
    <div class="import-count-list">${rows.map(([label,count]) => `<div><span>${esc(label)}</span><strong>${count}</strong></div>`).join('')}</div>
    <p class="privacy-small">导入记录会保存在 migration_runs；中断后可以重新点击导入并从已完成的附件继续。当前账号的云端空间会被本机状态快照更新。</p>
    <button class="primary-button" id="confirmLocalImport">确认导入并继续</button><button class="secondary-button" id="cancelLocalImport">取消</button>`);
}
async function getAllAttachments() {
  if (!('indexedDB' in window)) return [];
  const db = await attachmentDb();
  const rows = await new Promise((resolve,reject) => { const request=db.transaction('files','readonly').objectStore('files').getAll(); request.onsuccess=()=>resolve(request.result||[]); request.onerror=()=>reject(request.error); });
  db.close(); return rows;
}
async function importLocalWorkspace() {
  const auth = window.KangbanAuth.session;
  const source = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
  const attachments=await getAllAttachments();
  const fingerprint=JSON.stringify({state:source,files:attachments.map(file=>({id:file.id,name:file.name,type:file.type,size:file.blob?.size||0,savedAt:file.savedAt||''}))});
  const digest = crypto.subtle ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint)))).map(byte=>byte.toString(16).padStart(2,'0')).join('') : `length-${fingerprint.length}`;
  const sourceVersion = 'kangban-demo-v7';
  let run = (await window.KangbanAPI.select('migration_runs', { filters: { user_id: auth.user.id, source_version: sourceVersion, source_hash: digest }, limit: 1 }))[0];
  const counts = { members: source.familyMembers?.length||0, records: source.records?.length||0, metrics: source.bodyMetrics?.length||0, daily_entries: (source.customReminders?.length||0)+(source.medications?.length||0)+(source.reminderLogs?Object.keys(source.reminderLogs).length:0), policies: source.insurancePolicies?.length||0, reimbursements: source.reimbursements?.length||0, orders: source.companionOrders?.length||0, posts: source.demandPosts?.length||0, attachments: attachments.length };
  if (run?.status === 'completed') { toast('这份本机资料已导入'); return; }
  if (!run) run = await window.KangbanAPI.insert('migration_runs', { user_id: auth.user.id, source_version: sourceVersion, source_hash: digest, status: 'running', category_counts: counts, cursor: { uploadedPaths: [] }, started_at: new Date().toISOString() });
  else await window.KangbanAPI.update('migration_runs', run.id, { status: 'running', error_message: '' });
  let cursor = run.cursor || { uploadedPaths: [] };
  try {
    const members = source.familyMembers || [];
    if (members.length) {
      const payload = members.map((member,index)=>({ family_id:auth.familyId, legacy_id:String(member.id||`member-${index}`), name:String(member.name||'家庭成员'), relationship:String(member.role||member.relationship||'家庭成员'), age:Number.isFinite(Number(member.age))?Number(member.age):null, health_profile:{ conditions:member.conditions||'', allergies:member.allergies||'', medications:member.medications||'', surgeries:member.surgeries||'' }, display_order:index }));
      await window.KangbanAPI.upsert('family_members', payload, {onConflict:'family_id,legacy_id'});
    }
    source.cloudAttachmentPaths=source.cloudAttachmentPaths||{};
    for (const attachment of attachments) {
      if (!attachment.blob) continue;
      const path = `${auth.familyId}/legacy/${encodeURIComponent(attachment.id)}-${encodeURIComponent(attachment.name||'attachment')}`;
      if ((cursor.uploadedPaths||[]).includes(path)) { source.cloudAttachmentPaths[attachment.id]=path; continue; }
      await window.KangbanAPI.uploadPrivateFile(attachment.blob, path);
      source.cloudAttachmentPaths[attachment.id]=path;
      cursor = { ...cursor, uploadedPaths: [...(cursor.uploadedPaths||[]),path] };
      run.cursor = cursor;
      await window.KangbanAPI.update('migration_runs',run.id,{cursor,status:'running'});
    }
    await window.KangbanAPI.saveFamilyWorkspace(auth.familyId, source);
    await window.KangbanAPI.update('migration_runs',run.id,{cursor,status:'completed',completed_at:new Date().toISOString(),error_message:''});
    localStorage.setItem(`kangban-cloud-${auth.user.id}`,JSON.stringify(source));
    state = loadState();
    closeModal(); renderRole(); renderRecords(); renderCommunity(); toast('本机数据已导入云端家庭空间');
  } catch (error) {
    await window.KangbanAPI.update('migration_runs',run.id,{status:'failed',error_message:String(error.message||error),cursor}).catch(()=>{});
    toast(`导入中断，已记录续传位置：${error.message||error}`);
  }
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
      <label class="extraction-row"><span>所属成员</span><select id="extractMember" class="extraction-select">${state.familyMembers.map(member => `<option value="${member.id}" ${member.id === (uploadMemberId || state.currentMemberId) ? 'selected' : ''}>${esc(member.name)}（${esc(member.role)}）</option>`).join('')}</select></label>
      <label class="extraction-row"><span>资料类型</span><input id="extractType" value="门诊病历" placeholder="病历 / 发票 / 费用明细" /></label>
      <label class="extraction-row"><span>医院 / 科室</span><input id="extractHospital" value="" placeholder="请填写医院或科室" /></label>
      <label class="extraction-row"><span>检查日期</span><input id="extractDate" type="date" value="${iso}" /></label>
      <label class="extraction-row"><span>用户补充</span><input id="extractNote" value="${esc(note)}" placeholder="可补充就诊背景" /></label>
    </div>
    <label class="ocr-text-label" for="extractText">图片识别出的文字（可修改）</label><textarea class="ocr-text-area" id="extractText" placeholder="识别文字会显示在这里；也可以手动录入关键信息"></textarea>
    <button class="secondary-button medication-plan-button" id="buildMedicationPlan" hidden>从医嘱生成服药提醒</button>
    <p class="privacy-small">提取内容仅作为资料录入辅助，不构成诊断结论。请以原始报告为准。</p>
    <button class="primary-button" id="saveRecord">确认并加入档案 · 自动匹配报销</button>
    <p class="privacy-small">资料库只收就诊资料：病历、医疗费用发票、费用明细、用药记录等；体检 / 化验报告请到「健康档案 · 导入体检单」录入。</p>
    <button class="secondary-button" id="backToUpload">返回修改</button>`);
  const runButton = document.getElementById('rerunOcr');
  runButton?.addEventListener('click', () => runLocalOcr(file, iso));
  runLocalOcr(file, iso);
}
function showHealthCard(memberId = '') {
  const member = state.familyMembers.find(item => item.id === memberId) || state.familyMembers.find(item => item.id === state.currentMemberId) || state.familyMembers[0];
  const visits = visitGroups(member.id);
  const latest = visits[0];
  const contact = state.familyMembers.find(item => item.id !== member.id);
  const allergyAlert = member.allergies && !/无/.test(member.allergies);
  openModal(`${modalHead(`${esc(member.name)} · ${member.age}岁 · 最近核对`, '就医信息卡', '由家人协助整理，供就诊时主动展示。医生可按需查看原始报告。')}
    <div class="health-list">
      <div class="health-row"><span>过敏史</span><strong ${allergyAlert ? 'style="color:#a15d4c"' : ''}>${esc(member.allergies || '无')}</strong></div>
      <div class="health-row"><span>重要病史</span><strong>${esc(member.conditions || '无')}</strong></div>
      <div class="health-row"><span>长期用药</span><strong>${esc(member.medications || '无')}</strong></div>
      <div class="health-row"><span>手术史</span><strong>${esc(member.surgeries || '无')}</strong></div>
      <div class="health-row"><span>紧急联系人</span><strong>${esc(contact ? `${contact.name} · ${contact.role}` : '未填写')}</strong></div>
      <div class="health-row"><span>近期就诊</span><strong>${latest ? `${formatDate(latest.date)} · ${esc(latest.summary.slice(0, 18))}` : '暂无记录'}</strong></div>
    </div>
    <div class="health-highlight">${allergyAlert ? '过敏史已由家属核对，请主动告知医生。' : '信息已由家属核对。'}就诊时请以医生问诊和原始病历为准；本信息卡不替代医疗判断。</div>
    <button class="primary-button" id="openShareFromCard" data-share-member="${member.id}">生成就诊分享码</button>
    <button class="secondary-button" data-member-edit="${member.id}">编辑信息卡</button>`);
}
function showAppointment(memberId = '') {
  appointmentMemberId = memberId;
  const member = state.familyMembers.find(item => item.id === memberId) || state.familyMembers.find(item => item.id === state.currentMemberId) || state.familyMembers[0];
  const checks = memberChecks(member.id);
  const hasDescription = preVisitEntries(member.id).length > 0;
  const items = APPOINTMENT_ITEMS;
  const count = items.filter(([key]) => key === 'selfDescription' ? (checks[key] || hasDescription) : checks[key]).length;
  const ready = count === items.length;
  openModal(`${modalHead(appointmentLabel(member), `${esc(member.name)} · 就诊准备清单`, `和${esc(member.name)}一起确认要带的资料。全部确认后即可生成就诊分享码。`)}
    <div class="checklist-progress"><strong id="checklistCount">已准备 ${count} / ${items.length} 项</strong><span>${ready ? '已就绪 · 可生成分享码' : '逐项确认'}</span></div>
    <div class="appointment-checklist">${items.map(([key, title, hint]) => `<label class="checklist-row"><input type="checkbox" data-checklist="${key}" data-appointment-member="${member.id}" ${(key === 'selfDescription' ? (checks[key] || hasDescription) : checks[key]) ? 'checked' : ''} ${key === 'selfDescription' && hasDescription ? 'disabled' : ''}><span class="checkmark"></span><span class="checklist-copy"><strong>${title}</strong><small>${hint}</small></span></label>`).join('')}</div>
    <button class="secondary-button" id="openPreVisitDescription">${hasDescription ? '查看 / 补充诊前描述' : '添加诊前自我描述'}</button>
    <div class="health-highlight" id="appointmentHint">${ready ? '清单已全部确认，可以生成就诊分享码了。' : `还差 ${items.length - count} 项：全部勾选后解锁「生成就诊分享码」。`}</div>
    <button class="primary-button${ready ? '' : ' locked'}" id="appointmentShareBtn" data-action="share" data-share-member="${member.id}">${ready ? '生成就诊分享码' : `🔒 生成就诊分享码（还差 ${items.length - count} 项）`}</button>
    <button class="secondary-button" id="appointmentCard" data-card-member="${member.id}">打开${esc(member.name)}的就医信息卡</button>`);
}
/* 勾选后原地刷新计数、提示与解锁状态，不重建弹窗以免滚动位置跳动 */
function refreshAppointmentGate(memberId = appointmentMemberId) {
  const member = state.familyMembers.find(item => item.id === memberId) || state.familyMembers.find(item => item.id === state.currentMemberId) || state.familyMembers[0];
  if (!member) return;
  const total = APPOINTMENT_ITEMS.length;
  const count = appointmentProgress(member);
  const ready = count === total;
  const counter = document.getElementById('checklistCount');
  if (counter) counter.textContent = `已准备 ${count} / ${total} 项`;
  const status = document.querySelector('.checklist-progress span');
  if (status) status.textContent = ready ? '已就绪 · 可生成分享码' : '逐项确认';
  const hint = document.getElementById('appointmentHint');
  if (hint) hint.textContent = ready ? '清单已全部确认，可以生成就诊分享码了。' : `还差 ${total - count} 项：全部勾选后解锁「生成就诊分享码」。`;
  const button = document.getElementById('appointmentShareBtn');
  if (button) {
    button.classList.toggle('locked', !ready);
    button.textContent = ready ? '生成就诊分享码' : `🔒 生成就诊分享码（还差 ${total - count} 项）`;
  }
}
/* 诊前描述按成员隔离；早期演示数据未带成员标记，归到首位长辈名下 */
function preVisitEntries(memberId) {
  return (state.preVisitDescriptions || []).filter(entry => (entry.memberId || state.familyMembers[0]?.id) === memberId);
}
function showPreVisitDescription(memberId = '') {
  preVisitFiles = [];
  if (memberId) preVisitMemberId = memberId;
  const member = state.familyMembers.find(item => item.id === preVisitMemberId) || state.familyMembers.find(item => item.id === appointmentMemberId) || state.familyMembers[0];
  const entries = preVisitEntries(member.id);
  const cloudFamily = window.KangbanAuth?.mode === 'cloud' && window.KangbanAuth?.role === 'family';
  const attachmentNote = cloudFamily
    ? '可添加多张照片或录音；内容将同步至家庭私有云端，家庭成员可在授权范围内查看。'
    : '可添加多张照片或录音；演示内容仅保存在当前设备。登录家庭账号后可上传到家庭云端。';
  const history = entries.length ? `<div class="previsit-history">${entries.map(entry => `<article><small>${esc(entry.createdAt)}</small><p>${esc(entry.text || '未添加文字说明')}</p><div class="previsit-files">${(entry.attachments || []).map(file => `<button class="text-button" data-previsit-attachment="${esc(file.id)}" data-previsit-type="${esc(file.type)}">查看附件：${esc(file.name)}</button>`).join('') || '<small>无附件</small>'}</div></article>`).join('')}</div>` : '<p class="privacy-small">还没有诊前描述。可记录这次不舒服从什么时候开始、出现频率、饮食睡眠和已采取的处理。</p>';
  openModal(`${modalHead(`${esc(member.name)} · 就诊前记录`, '诊前自我描述', '把病人的主观感受和近期情况先记下来，方便就诊时向医生说明。可拍照、录音或语音转文字。')}
    ${history}
    <label class="ocr-text-label" for="preVisitText">病情、饮食及其他情况</label><textarea class="ocr-text-area" id="preVisitText" placeholder="例如：从周一开始饭后腹胀，近两天食欲下降；饮食、睡眠、排便或活动有哪些变化？"></textarea>
    <div class="voice-controls"><button class="secondary-button" id="preVisitDictate">语音转文字</button><button class="secondary-button" id="preVisitRecord">录制语音</button><button class="secondary-button" id="preVisitPhoto">添加照片</button><button class="secondary-button" id="preVisitAudioFile">上传录音</button></div>
    <small id="preVisitStatus" class="privacy-small">${attachmentNote}</small>
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
    state.preVisitDescriptions = [{ id: entryId, memberId: preVisitMemberId || appointmentMemberId || state.currentMemberId || state.familyMembers[0]?.id, text, createdAt: new Date().toLocaleString('zh-CN'), attachments }, ...(state.preVisitDescriptions || [])];
    state.appointmentChecks = { ...(state.appointmentChecks || {}), selfDescription: true };
    if (appointmentMemberId) {
      const byMember = state.appointmentChecksByMember || (state.appointmentChecksByMember = {});
      byMember[appointmentMemberId] = { ...(byMember[appointmentMemberId] || {}), selfDescription: true };
    }
    saveState(); preVisitFiles = []; closeModal(); showAppointment(appointmentMemberId); toast(window.KangbanAuth?.mode === 'cloud' ? '诊前描述和附件已保存到家庭云端' : '诊前描述和附件已保存在本机');
  } catch (error) { if (saveButton) saveButton.disabled = false; toast(`保存失败：${error.message || '请检查存储空间后重试'}`); }
}
async function showPreVisitAttachment(id, type) {
  const item = await getAttachment(id);
  if (!item?.blob) { toast('没有找到这份附件，或当前账号无权查看'); return; }
  const url = URL.createObjectURL(item.blob); preVisitAttachmentUrl = url;
  const media = type.startsWith('image/') ? `<img class="previsit-preview" src="${url}" alt="诊前描述附件">` : type.startsWith('audio/') ? `<audio class="previsit-audio" controls src="${url}"></audio>` : type === 'application/pdf' ? `<iframe class="policy-pdf-frame" src="${url}" title="${esc(item.name)}"></iframe>` : '<p class="privacy-small">当前设备无法预览此附件格式。</p>';
  openModal(`${modalHead('诊前附件', esc(item.name), item.cloud ? '从家庭私有云端读取，可在其他已授权设备查看。' : '附件保存在当前设备。')}${media}<button class="primary-button" id="closePreVisitAttachment">返回诊前描述</button>`);
  document.getElementById('closePreVisitAttachment')?.addEventListener('click', () => { closeModal(); showPreVisitDescription(preVisitMemberId); });
}
async function showRecord(recordId) {
  const record = state.records.find(item => item.id === recordId); if (!record) return;
  let attachment = null;
  try { attachment = await getAttachment(recordId); } catch { /* local attachment storage may be unavailable */ }
  const attachmentUrl = attachment ? URL.createObjectURL(attachment.blob) : '';
  const preview = attachment?.type?.startsWith('image/') ? `<img class="report-preview" src="${attachmentUrl}" alt="${esc(attachment.name)}" />` : attachment?.type === 'application/pdf' ? `<iframe class="policy-pdf-frame" src="${attachmentUrl}" title="${esc(attachment.name)}"></iframe>` : '';
  const fileLine = attachment ? `<div class="file-chip"><b>▤</b><span>${esc(attachment.name)}</span><span style="margin-left:auto;color:#789078">${attachment.cloud ? '家庭私有云端' : '本机附件'}</span></div>` : '<p class="privacy-small">此演示条目没有原始文件附件。</p>';
  const recognized = record.ocrText ? `<section class="saved-ocr" id="savedOcrBlock"><div class="saved-ocr-head"><strong>本机识别文字</strong><button class="text-button" id="editOcrText">编辑</button></div><p id="savedOcrText">${esc(record.ocrText)}</p></section>` : '';
  openModal(`${modalHead(esc(record.type), esc(record.title), `${esc(record.hospital)} · ${formatDate(record.date)}`)}${fileLine}${preview}${recognized}<div class="health-highlight">资料为家庭自行整理的信息。文字识别仅作录入辅助，不构成诊断意见；识别文字可编辑修正。</div><button class="primary-button" id="recordDone">返回家庭档案</button>`);
  document.getElementById('editOcrText')?.addEventListener('click', () => {
    const block = document.getElementById('savedOcrBlock'); if (!block) return;
    block.innerHTML = `<strong>本机识别文字（可修改）</strong><textarea class="ocr-text-area" id="savedOcrInput" style="min-height:96px;margin-top:7px">${esc(record.ocrText)}</textarea><button class="primary-button" id="saveOcrText" style="margin-top:8px">保存修改</button>`;
    document.getElementById('saveOcrText')?.addEventListener('click', () => {
      record.ocrText = document.getElementById('savedOcrInput')?.value.trim() || '';
      saveState(); toast('识别文字已更新');
      showRecord(recordId);
    });
  });
}
function showShare(memberId = '') {
  const member = state.familyMembers.find(item => item.id === memberId) || state.familyMembers.find(item => item.id === state.currentMemberId) || state.familyMembers[0];
  const done = appointmentProgress(member);
  /* 闸门：就诊准备清单全部勾选后才可生成就诊分享码 */
  if (done < APPOINTMENT_ITEMS.length) {
    openModal(`${modalHead(`还差 ${APPOINTMENT_ITEMS.length - done} 项 · ${esc(member.name)}`, '先完成就诊准备清单', `生成就诊分享码前，请先和${esc(member.name)}逐项确认要带的资料；全部勾选后即可生成。`)}
      <div class="checklist-progress"><strong>已准备 ${done} / ${APPOINTMENT_ITEMS.length} 项</strong><span>逐项确认</span></div>
      <button class="primary-button" data-action="appointment" data-appointment-member="${member.id}">回到就诊准备清单</button>
      <p class="privacy-small">清单包含医保卡证件、检查报告、用药清单、想问医生的问题和诊前自我描述。</p>`);
    return;
  }
  const recent = (state.shares || []).slice(-3).reverse();
  const allergyAlert = member.allergies && !/无/.test(member.allergies);
  const visits = visitGroups(member.id);
  /* 三大分享项：就医信息卡 / 当前用药清单 / 历史看诊记录（内含每次就诊小项，可单独勾选，过往折叠） */
  const scopes = [
    { key: 'card', label: '就医信息卡', hint: `慢病摘要${allergyAlert ? ' · 过敏史（红标）' : ' · 过敏史'} · 长期用药`, on: true },
    { key: 'meds', label: '当前用药清单', hint: '全部在服药物与频次', on: false },
    { key: 'visits', label: '历史看诊记录', hint: `${visits.length} 次就诊 · 勾选要分享的记录`, on: true }
  ];
  const visitRow = (visit, index) => `<label class="share-toggle share-visit-row"><span><strong>${formatDate(visit.date)} · ${esc(visit.summary.slice(0, 16))}</strong><small>${visit.records.length} 份资料</small></span><input type="checkbox" class="share-visit-check" ${index === 0 ? 'checked' : ''} /><span class="switch"></span></label>`;
  const firstVisits = visits.slice(0, 1).map((visit, index) => visitRow(visit, index)).join('');
  const restVisits = visits.slice(1).map((visit, index) => visitRow(visit, index + 1)).join('');
  openModal(`${modalHead('由患者或家属现场发起', `分享${esc(member.name)}的就医资料`, '清单已全部确认。勾选分享范围后出示二维码，历史看诊记录里可单独勾选每一次就诊。')}
    <div class="share-card"><span class="pill pill-light"><span class="status-dot"></span> ${esc(member.name)}的就医信息卡</span><h3>${visits[0] ? esc(visits[0].summary.slice(0, 16)) : '下次复诊'}</h3><p id="shareScopeSummary">就医信息卡 · 历史看诊记录 × 1</p><div class="share-code" aria-label="演示二维码"></div><div class="code-caption">仅供现场演示 · 10分钟后失效</div></div>
    <div class="share-scope-list">${scopes.map(item => `<label class="share-toggle"><span><strong>${item.label}</strong><small>${item.hint}</small></span><input type="checkbox" data-share-scope="${item.key}" data-share-summary="${item.label}" ${item.on ? 'checked' : ''} /><span class="switch"></span></label>`).join('')}
      <div id="shareVisitSub">
        ${firstVisits}
        <div id="shareVisitRest" hidden>${restVisits}</div>
        ${visits.length > 1 ? `<button class="text-button preview-toggle" id="shareVisitExpand">展开全部 ${visits.length} 次就诊 ⌄</button>` : ''}
        <p class="privacy-small" style="text-align:left;margin:4px 0 0">关闭「历史看诊记录」即不分享任何就诊资料。</p>
      </div>
    </div>
    <div class="share-log"><h3>最近访问记录</h3>${recent.length ? recent.map(entry => `<div class="log-row"><span>${esc(entry.who)}</span><small>${esc(entry.when)}</small></div>`).join('') : '<p class="privacy-small">还没有访问记录。</p>'}</div>
    <button class="primary-button" id="revokeShare">撤销此演示分享</button>
    <p class="privacy-small">演示二维码为界面模拟，未连接外部扫码服务；勾选仅改变摘要展示，不发送任何数据。</p>`);
  const updateSummary = () => {
    const labels = [...document.querySelectorAll('[data-share-scope]:checked')].map(item => item.dataset.shareSummary);
    const visitsOn = document.querySelector('[data-share-scope="visits"]')?.checked;
    const visitCount = visitsOn ? document.querySelectorAll('.share-visit-check:checked').length : 0;
    const parts = [...labels];
    if (visitCount) parts[parts.length - 1] = `历史看诊记录 × ${visitCount}`;
    const summary = document.getElementById('shareScopeSummary');
    if (summary) summary.textContent = parts.length ? parts.join(' · ') : '未选择任何内容（二维码不可用）';
  };
  document.querySelectorAll('[data-share-scope], .share-visit-check').forEach(input => input.addEventListener('change', event => {
    if (event.target.dataset.shareScope === 'visits') {
      const sub = document.getElementById('shareVisitSub');
      if (sub) sub.hidden = !event.target.checked;
    }
    updateSummary();
  }));
  document.getElementById('shareVisitExpand')?.addEventListener('click', event => {
    const rest = document.getElementById('shareVisitRest');
    if (!rest) return;
    const open = !rest.hidden;
    rest.hidden = open;
    event.currentTarget.textContent = open ? `展开全部 ${visits.length} 次就诊 ⌄` : '收起 ⌃';
  });
}
function showCompanionForm(service, sourceOrder = null) {
  if (!state.companionProfile.available) { showInfo('暂不可预约', `${state.companionProfile.name}目前暂停接单。你可以稍后再查看。`); return; }
  const members = state.familyMembers?.length ? state.familyMembers : seed.familyMembers;
  const memberOptions = members.map(member => `<option value="${esc(member.id)}" ${member.id === (sourceOrder?.patientMemberId || 'm1') ? 'selected' : ''}>${esc(member.name)}（${esc(member.role)}）</option>`).join('');
  openModal(`${modalHead('陪诊需求 · 演示流程', `预约${esc(service)}`, `向${esc(state.companionProfile.name)}提交申请；陪诊员接受后，家庭端会显示接单状态。参考服务费 ¥${SERVICE_PRICES[service] || 268}（演示金额，不产生真实支付）。`)}
    <form class="order-form" id="companionForm" data-rebook-id="${esc(sourceOrder?.id || '')}">
      <input type="hidden" name="service" value="${esc(service)}" />
      <label><span class="field-label-block">需要陪诊的家人</span><select class="input-field" name="patientMemberId" required>${memberOptions}</select></label>
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
        return `<button class="role-choice" data-member="${member.id}"><span class="role-choice-avatar ${member.avatarClass}">${esc(member.name.slice(0, 1))}</span><span><strong>家庭端 · ${esc(member.name)}</strong><small>${esc(member.role)} · ${member.age != null && member.age !== '' ? `${member.age}岁` : '年龄未填写'} · ${esc(member.conditions || '健康信息待补充')}</small></span><b>${isCurrent ? '当前' : '进入 →'}</b></button>`;
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
function showCompletionReportForm(orderId) {
  const order = state.companionOrders.find(item => item.id === orderId);
  if (!order || order.status !== 'accepted' || !executionProgress(order).all) { toast('请先完成全部履约项目'); return; }
  openModal(`${modalHead('陪诊服务反馈', '提交就诊后反馈', '向家属说明服务经过、后续待办和患者离院交接情况。请只记录亲历事实，不代替医生解释诊疗意见。')}
    <form class="service-report-form" id="serviceReportForm" data-order-id="${esc(orderId)}">
      <label><span class="field-label-block">本次服务情况</span><textarea class="input-field" name="summary" maxlength="500" required placeholder="例如：已陪同完成挂号、就诊和检查，医生资料已交给患者。"></textarea></label>
      <label><span class="field-label-block">需要家属跟进的事项（选填）</span><textarea class="input-field" name="followUp" maxlength="300" placeholder="例如：协助预约复诊、确认是否已安全到家。诊疗建议请按医院原文记录。"></textarea></label>
      <label><span class="field-label-block">患者离院 / 交接状态</span><select class="input-field" name="handoff" required><option value="">请选择</option><option>已当面交接给家属</option><option>已陪同患者安全到家</option><option>患者选择自行离院，已确认去向</option><option>尚未完成交接，需要家属联系</option></select></label>
      <label><span class="field-label-block">下次复诊日期（选填）</span><input class="input-field" name="nextVisitDate" type="date" min="${dateOffset(0)}" /></label>
      <label><span class="field-label-block">下次复诊事项（选填）</span><input class="input-field" name="nextVisitNote" maxlength="40" placeholder="例如：心内科复诊 · 带上检查报告" /></label>
      <label class="consent-row"><input type="checkbox" name="needsFamily" value="yes" /><span>标记为需要家属尽快跟进（如联系不上患者、交接未完成或出现安全顾虑）</span></label>
      <button class="primary-button" type="submit">提交反馈并完成服务</button>
    </form><p class="privacy-small">填写下次复诊日期后，会自动为该成员创建一条家庭端复诊提醒。演示版反馈保存在本机浏览器；真实跨设备通知、身份核验与紧急联络需接入服务端。</p>`);
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

function setAuthRegistrationView(enabled, step = 'role') {
  const form = document.getElementById('authForm');
  if (!form) return;
  window.authRegisterMode = !!enabled;
  const loginPanel = document.getElementById('authLoginPanel');
  const registerPanel = document.getElementById('authRegisterPanel');
  const roleStep = document.getElementById('authRegisterRoleStep');
  const credentials = document.getElementById('authRegisterCredentials');
  const next = document.getElementById('authRegisterNext');
  const submit = document.getElementById('authSubmit');
  const loginInputs = loginPanel?.querySelectorAll('input') || [];
  const registerInputs = credentials?.querySelectorAll('input') || [];
  if (loginPanel) loginPanel.hidden = !!enabled;
  if (registerPanel) registerPanel.hidden = !enabled;
  if (roleStep) roleStep.hidden = !enabled || step !== 'role';
  if (credentials) credentials.hidden = !enabled || step !== 'credentials';
  if (next) next.hidden = !enabled || step !== 'role';
  loginInputs.forEach(input => { input.disabled = !!enabled; input.required = !enabled && ['email', 'password'].includes(input.name); });
  registerInputs.forEach(input => {
    input.disabled = !enabled || step !== 'credentials';
    input.required = enabled && step === 'credentials';
    if (!enabled) input.value = '';
  });
  if (submit) {
    submit.hidden = !!enabled && step !== 'credentials';
    submit.textContent = enabled ? '注册并继续' : '登录';
  }
  const createAccount = document.getElementById('authRegister');
  const resetNotice = document.getElementById('authResetNotice');
  const experience = document.getElementById('authExperience');
  if (createAccount) createAccount.hidden = !!enabled;
  if (resetNotice) resetNotice.hidden = !!enabled;
  if (experience) experience.hidden = !!enabled;
  const message = document.getElementById('authMessage');
  if (message) message.textContent = '';
}

document.addEventListener('click', async event => {
  if (event.target.closest('[data-auth-role]')) {
    window.selectedAuthRole = event.target.closest('[data-auth-role]').dataset.authRole;
    document.querySelectorAll('[data-auth-role]').forEach(button => button.classList.toggle('selected', button.dataset.authRole === window.selectedAuthRole));
    /* 选中账号类型后直接进入第二步，无需再点「下一步」 */
    setAuthRegistrationView(true, 'credentials');
  }
  if (event.target.closest('[data-auth-guest]')) { window.KangbanAuth.enterGuest(); return; }
  const demoRole = event.target.closest('[data-auth-demo]')?.dataset.authDemo;
  if (demoRole) { window.KangbanAuth.enterLocalDemo(demoRole); return; }
  const cloudDemoRole = event.target.closest('[data-auth-cloud-demo]')?.dataset.authCloudDemo;
  if (cloudDemoRole) {
    const message = document.getElementById('authMessage');
    const email = cloudDemoRole === 'escort' ? 'kangban-escort-demo@example.com' : 'kangban-family-demo@example.com';
    const password = window.KANGBAN_DEMO_PASSWORD || '';
    if (!window.KangbanAPI?.isCloudEnabled()) { message.textContent = '尚未配置 Supabase，云端演示账号暂不可用。'; return; }
    if (!password) { message.textContent = '云端演示账号密码尚未配置，请联系管理员。'; return; }
    message.textContent = '正在登录云端演示账号…';
    try { await window.KangbanAuth.signIn(email, password); }
    catch (error) { message.textContent = error.message || '演示账号登录失败，请联系管理员。'; }
    return;
  }
  if (event.target.closest('#authRegister')) {
    window.selectedAuthRole = 'family';
    document.querySelectorAll('[data-auth-role]').forEach(button => button.classList.toggle('selected', button.dataset.authRole === 'family'));
    setAuthRegistrationView(true, 'role');
    return;
  }
  if (event.target.closest('#authRegisterNext')) {
    setAuthRegistrationView(true, 'credentials');
    return;
  }
  if (event.target.closest('#authRegisterBack')) {
    setAuthRegistrationView(true, 'role');
    return;
  }
  if (event.target.closest('#authRegisterCancel')) {
    setAuthRegistrationView(false);
    return;
  }
  if (event.target.closest('[data-community-filter]')) {
    communityFilter = event.target.closest('[data-community-filter]').dataset.communityFilter;
    document.querySelectorAll('[data-community-filter]').forEach(button => button.classList.toggle('selected', button.dataset.communityFilter === communityFilter));
    renderCommunity(); return;
  }
  const escortToggle = event.target.closest('[data-escort-toggle-availability]');
  if (escortToggle) {
    const resume = escortToggle.dataset.escortToggleAvailability === '1';
    try {
      await window.KangbanAPI.updateWhere('escort_profiles', { user_id: window.KangbanAuth.session.user.id }, { available: resume, updated_at: new Date().toISOString() });
      toast(resume ? '已恢复接单，家庭可预约你的时段' : '已暂停接单（云端立即生效）');
      await refreshCloudAfterAction();
    } catch (error) { toast(`操作失败：${error.message || error}`); }
    return;
  }
  if (event.target.closest('[data-action="escort-reload"]')) { renderCloudWorkbench(); return; }
  const communityApply = event.target.closest('[data-community-apply]');
  if (communityApply) { acceptDemandPost(communityApply.dataset.communityApply); return; }
  const communityBook = event.target.closest('[data-community-book]');
  if (communityBook) {
    const postId = communityBook.closest('[data-post-id]')?.dataset.postId;
    const post = communityPostCache.find(item => item.id === postId);
    if (post) { showBookAvailabilityModal(post); } else toast('帖子已更新，请刷新社区');
    return;
  }
  const communityRespond = event.target.closest('[data-community-respond]');
  if (communityRespond) {
    const accept = communityRespond.dataset.accept === '1';
    try { await window.KangbanAPI.rpc('respond_availability_booking', { p_booking_id: communityRespond.dataset.communityRespond, p_accept: accept }); toast(accept ? '已接受预约，订单已生成' : '已拒绝预约，时段重新开放'); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '操作失败'); }
    return;
  }
  const communityCancelBooking = event.target.closest('[data-community-cancel-booking]');
  if (communityCancelBooking) {
    try { await window.KangbanAPI.rpc('cancel_my_booking', { p_booking_id: communityCancelBooking.dataset.communityCancelBooking }); toast('已撤销预约申请'); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '操作失败'); }
    return;
  }
  const communityCancelPost = event.target.closest('[data-community-cancel-post]');
  if (communityCancelPost) {
    try { await window.KangbanAPI.rpc('cancel_my_post', { p_post_id: communityCancelPost.dataset.communityCancelPost }); toast('已取消该帖子'); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '操作失败'); }
    return;
  }
  const communityEditSlot = event.target.closest('[data-community-edit-slot]');
  if (communityEditSlot) {
    const post = communityPostCache.find(item => item.id === communityEditSlot.dataset.communityEditSlot);
    if (post) showAvailabilityForm(post);
    return;
  }
  const myEditPost = event.target.closest('[data-my-edit]');
  if (myEditPost) {
    const post = communityPostCache.find(item => item.id === myEditPost.dataset.myEdit) || await window.KangbanAPI.select('community_posts', { filters: { id: myEditPost.dataset.myEdit }, limit: 1 }).then(list => list[0]).catch(() => null);
    if (post) { closeModal(); showAvailabilityForm(post); }
    return;
  }
  const myCancelPost = event.target.closest('[data-my-cancel]');
  if (myCancelPost) {
    try { await window.KangbanAPI.rpc('cancel_my_post', { p_post_id: myCancelPost.dataset.myCancel }); toast('已取消'); closeModal(); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '操作失败'); }
    return;
  }
  const communityConfirm = event.target.closest('[data-community-confirm]');
  if (communityConfirm) { showSignupConfirmModal(communityConfirm.dataset.communityConfirm).catch(error => toast(error.message || '打开报名信息失败')); return; }
  const signupResume = event.target.closest('[data-signup-resume]');
  if (signupResume) { await showCloudEvidencePreview(signupResume.dataset.signupResume, '报名简历 / 资质材料'); return; }
  const cloudOrderConfirm = event.target.closest('[data-cloud-order-confirm]');
  if (cloudOrderConfirm) {
    try { const status = await window.KangbanAPI.rpc('respond_companion_order', { p_order_id: cloudOrderConfirm.dataset.cloudOrderConfirm, p_accept: true }); toast(status === 'confirmed' ? '双方已确认，预约完成' : '你的确认已记录，等待另一方确认'); await refreshCloudAfterAction(); }
    catch (error) { toast(error.message || '订单确认失败'); }
    return;
  }
  const cloudEvidenceView = event.target.closest('[data-cloud-evidence-view]');
  if (cloudEvidenceView) { await showCloudEvidencePreview(cloudEvidenceView.dataset.cloudEvidenceView, cloudEvidenceView.dataset.evidenceLabel || '陪诊履约佐证'); return; }
  const cloudShare = event.target.closest('[data-cloud-task-share]');
  if (cloudShare) { showCloudTaskShareForm(cloudShare.dataset.cloudTaskShare); return; }
  const cloudRevokeShare = event.target.closest('[data-cloud-task-share-revoke]');
  if (cloudRevokeShare) {
    try { await window.KangbanAPI.rpc('revoke_order_task_share',{p_order_id:cloudRevokeShare.dataset.cloudTaskShareRevoke}); toast('任务分享码已撤销'); await refreshCloudAfterAction(); }
    catch(error) { toast(`撤销失败：${error.message||error}`); }
    return;
  }
  const cloudReview = event.target.closest('[data-cloud-order-review]');
  if (cloudReview) { showCloudOrderReview(cloudReview.dataset.cloudOrderReview,cloudReview.dataset.reviewRole); return; }
  const adminReview = event.target.closest('[data-admin-review]');
  if (adminReview) {
    try { await window.KangbanAPI.rpc('review_escort_account',{p_user_id:adminReview.dataset.adminReview,p_decision:adminReview.dataset.decision}); toast(adminReview.dataset.decision==='approved'?'陪诊师审核已通过':'已拒绝该陪诊师申请'); await refreshCloudAfterAction(); }
    catch(error) { toast(`审核操作失败：${error.message||error}`); }
    return;
  }
  const cloudTask = event.target.closest('[data-cloud-task]');
  if (cloudTask) {
    try { await window.KangbanAPI.rpc('update_order_checklist',{p_order_id:cloudTask.dataset.orderId,p_item_key:cloudTask.dataset.cloudTask,p_evidence_path:null}); toast('履约进度已回传，家庭端实时可见'); await refreshCloudAfterAction(); }
    catch(error) { toast(error.message||'履约记录更新失败'); }
    return;
  }
  const cloudEvidence = event.target.closest('[data-cloud-evidence]');
  if (cloudEvidence) { cloudEvidenceTarget={orderId:cloudEvidence.dataset.orderId,key:cloudEvidence.dataset.cloudEvidence}; document.getElementById('cloudEvidenceInput')?.click(); return; }
  const cloudTransition = event.target.closest('[data-cloud-order-transition]');
  if (cloudTransition) {
    try { await window.KangbanAPI.rpc('transition_companion_order',{p_order_id:cloudTransition.dataset.orderId,p_action:cloudTransition.dataset.cloudOrderTransition}); toast('订单状态已更新'); await refreshCloudAfterAction(); }
    catch(error) { toast(error.message||'订单状态更新失败'); }
    return;
  }
  if (event.target.closest('[data-action="logout"]')) { try { await window.KangbanAuth.signOut(); } catch (error) { toast(error.message || '退出失败'); } return; }
  /* 首页待办「去处理」：跳我的陪诊并展开我的发布抽屉 */
  if (event.target.closest('[data-open-my-posts]')) familyMyPostsOpen = true;
  const myPostsToggle = event.target.closest('#familyMyPostsToggle');
  if (myPostsToggle) { familyMyPostsOpen = !familyMyPostsOpen; renderFamilyMyPosts(); return; }
  /* 陪诊师「我的发布」抽屉（工作台）：同一套收缩交互 */
  const escortMyPostsToggle = event.target.closest('#escortMyPostsToggle');
  if (escortMyPostsToggle) { escortMyPostsOpen = !escortMyPostsOpen; renderEscortMyPosts(); return; }
  if (event.target.closest('[data-action="local-import"]')) { showLocalImportPreview(); return; }
  if (event.target.closest('#confirmLocalImport')) { importLocalWorkspace(); return; }
  if (event.target.closest('#cancelLocalImport')) { closeModal(); return; }
  if (window.KangbanAuth?.role === 'guest') { if (event.target.closest('[data-action]')) toast('游客模式只可浏览脱敏社区，请登录后继续'); return; }
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
  /* 卡内更近处有 data-action（如成员卡里的「去录入」）时，动作优先于整卡跳转 */
  const innerAction = event.target.closest('[data-action]');
  if (nav && !(innerAction && nav.contains(innerAction))) { navigate(nav.dataset.nav); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'home-share') { showHomeSharePicker(); return; }
  if (action === 'home-demand') { navigate('companion'); showDemandForm(); return; }
  const csubBtn = event.target.closest('[data-csub]');
  if (csubBtn) {
    const auth = window.KangbanAuth;
    const escortView = auth?.mode === 'cloud' ? auth.role === 'escort' : state.currentRole === 'escort';
    if (auth?.role === 'guest') { toast('游客模式只可浏览社区，登录后可用我的陪诊'); return; }
    if (!escortView) setCompanionSub(csubBtn.dataset.csub);
    return;
  }
  if (event.target.closest('#todayBarToggle')) {
    const detail = document.getElementById('todayDetail');
    if (detail) { todayBarOpen = detail.hidden; detail.hidden = !detail.hidden; event.target.closest('.today-bar')?.classList.toggle('open', !detail.hidden); }
    return;
  }
  if (action === 'family-member-add') { showFamilyMemberAdd(); return; }
  if (action === 'availability-form') showAvailabilityForm();
  if (action === 'my-posts') { showMyPosts(); return; }
  if (action === 'upload') { uploadMemberId = event.target.closest('[data-upload-member]')?.dataset.uploadMember || ''; showUpload(); }
  if (action === 'medications') showMedicationManager();
  if (action === 'reminders') showReminderManager();
  if (action === 'add-reminder') showReminderForm();
  if (action === 'add-medication') showUpload();
  if (action === 'health-card') showHealthCard(event.target.closest('[data-card-member]')?.dataset.cardMember || '');
  if (action === 'share') showShare(event.target.closest('[data-share-member]')?.dataset.shareMember || '');
  if (action === 'alerts') showAlertCenter();
  if (action === 'device-mgr') showAlertCenter();
  if (action === 'add-reading') showReadingEntry();
  if (action === 'docs-upload') navigate('docs');
  if (action === 'insurance-entry') showPolicyEntry();
  if (action === 'insurance-social' || action === 'insurance-commercial') showPolicyEntry();
  if (action === 'ai-assistant') showInfo('AI 管理助手（规划中）', '规划能力：自动总结父母健康周报、回答健康咨询、生成就医准备清单，并支持「小康，今天该吃什么药」式语音交互。当前演示版可在「我的 · 健康趋势」查看固定统计。');
  if (action === 'devices') showInfo('设备管理（规划中）', '计划预留华为运动健康、小米运动健康等智能手表接入入口，同步睡眠、运动与跌倒监测数据。当前演示版可在预警中心「模拟手表同步」体验。');
  if (action === 'companion') navigate('companion');
  /* 「我的」页 v4：纯文字行动作 */
  if (action === 'family') { navigate('health'); return; }
  if (action === 'account-security') { showAccountSecurity(); return; }
  if (action === 'notify-settings') {
    if (!('Notification' in window)) { toast('当前浏览器不支持系统通知，提醒在应用内展示'); return; }
    if (Notification.permission === 'granted') { toast('系统通知已开启'); renderMePage(); return; }
    Notification.requestPermission().then(permission => { toast(permission === 'granted' ? '系统通知已开启' : '未开启通知，提醒仍在应用内展示'); renderMePage(); }).catch(() => toast('浏览器未能开启通知，请检查权限设置'));
    return;
  }
  if (action === 'about') { showInfo('关于康伴', '康伴 v0.9 演示版\n\n康伴帮助家庭整理就医资料、协同就诊准备，并提供经过审核的陪诊服务撮合。\n\n本原型为演示作品，病例均为虚构数据，不连接任何医疗机构或真实患者信息。'); return; }
  if (action === 'book-profile') showCompanionForm('全程陪诊');
  if (action === 'demand-form') showDemandForm();
  if (action === 'toggle-availability') {
    state.companionProfile.available = !state.companionProfile.available;
    saveState(); renderRole(); renderRecords();
    toast(state.companionProfile.available ? '已恢复接受预约' : '已暂停接受新预约');
  }
  if (action === 'appointment') showAppointment(event.target.closest('[data-appointment-member]')?.dataset.appointmentMember || '');
  if (action === 'previsit') showPreVisitDescription(event.target.closest('[data-previsit-member]')?.dataset.previsitMember || '');
  if (action === 'privacy') showInfo('隐私与资料管理', '本原型将演示资料保存在当前设备浏览器中。分享流程仅作交互展示，不会发送到网络。\n\n真实产品需提供资料导出、更正、删除和授权撤回功能。');
  if (action === 'help') showInfo('服务说明', '康伴帮助家庭整理就医资料和协同就诊准备。资料提取仅辅助整理，不替代医生判断。陪诊服务仅提供就诊流程协助。');
  if (event.target.closest('[data-upload-source="camera"]')) openFilePicker('camera');
  if (event.target.closest('[data-upload-source="library"]')) openFilePicker('library');
  if (event.target.closest('#loadSampleReport')) loadSampleReport();
  if (event.target.closest('#startVoice')) startListening();
  if (event.target.closest('#appointmentCard')) showHealthCard(event.target.closest('[data-card-member]')?.dataset.cardMember || appointmentMemberId);
  if (event.target.closest('#openPreVisitDescription')) showPreVisitDescription(appointmentMemberId);
  if (event.target.closest('#backToAppointment')) showAppointment(appointmentMemberId);
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
    const rxMemberId = document.getElementById('extractMember')?.value || state.currentMemberId || 'm1';
    const rxRecord = { id: recordId, memberId: rxMemberId, type: '用药记录', title: '处方用药医嘱', hospital: source.hospital, date: source.date, state: '已核对', icon: '＋', summary: autoSummary('用药记录', '处方用药医嘱'), ocrText: source.text };
    state.records.unshift(rxRecord);
    saveState(); renderRecords(); closeModal();
    if (source.file) putAttachment(recordId, source.file).then(() => toast('服药提醒与处方原图已保存在本机')).catch(() => toast('服药提醒已保存，处方原图未能存入本机'));
    else toast('每日服药提醒已创建');
    showReimbursementMatches(rxRecord);
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
  if (skipReminder) showSkipConfirm(skipReminder.dataset.reminderSkip, skipReminder.dataset.reminderTime);
  const skipReasonBtn = event.target.closest('[data-skip-reason]');
  if (skipReasonBtn) {
    skipCustomReminder(skipReasonBtn.dataset.skipReason, skipReasonBtn.dataset.skipTime, skipReasonBtn.dataset.reason || '');
    closeModal(); renderMedicationReminders();
  }
  if (event.target.closest('[data-done-toggle]')) {
    todayDoneOpen = !todayDoneOpen;
    renderHomeTodayBar();
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
    const saveButton = event.target.closest('#saveRecord');
    if (saveButton.disabled) return;
    saveButton.disabled = true;
    const date = document.getElementById('extractDate')?.value || new Date().toISOString().slice(0,10);
    const title = document.getElementById('extractType')?.value.trim() || '就医资料';
    const hospital = document.getElementById('extractHospital')?.value.trim() || '家属补充';
    const memberId = document.getElementById('extractMember')?.value || state.currentMemberId || 'm1';
    const recordId = `r${state.nextRecordId++}`;
    const inferType = title.includes('诊断证明') ? ['疾病诊断证明书', '⌂'] : (title.includes('意外') || title.includes('外伤')) ? ['外伤门诊病历', '⌂'] : (title.includes('出院') || title.includes('住院')) ? ['出院小结', '⌂'] : title.includes('药') ? ['用药记录', '＋'] : title.includes('发票') ? ['医疗费用发票', '▤'] : title.includes('明细') ? ['费用明细', '≣'] : title.includes('病历') ? ['门诊病历', '⌂'] : (title.includes('报告') || title.includes('检查') || title.includes('体检')) ? ['检查报告', '▤'] : ['就诊资料', '⌂'];
    const record = { id: recordId, memberId, type: inferType[0], title, hospital, date, state: '已核对', icon: inferType[1], summary: autoSummary(inferType[0], title), ocrText: document.getElementById('extractText')?.value || '' };
    state.records.unshift(record);
    state.voiceNote = document.getElementById('extractNote')?.value || ''; saveState(); renderRecords(); closeModal();
    /* 报销联动：入库后自动检索该成员保单，符合条件则弹报销提醒 */
    showReimbursementMatches(record);
    const attachment = selectedFile;
    selectedFile = null;
    let attachmentResult = null;
    let attachmentError = null;
    if (attachment) {
      try { attachmentResult = await putAttachment(recordId, attachment); }
      catch (error) { attachmentError = error; }
    }
    let workspaceError = null;
    try { await persistWorkspaceNow(); }
    catch (error) { workspaceError = error; }
    const cloudMode = window.KangbanAuth?.mode === 'cloud';
    if (workspaceError) {
      toast(`记录暂存在当前设备，云端保存失败：${workspaceError.message || workspaceError}`);
    } else if (cloudMode) {
      if (attachmentResult?.cloudSaved) toast('就诊记录和原始图片已保存到云端');
      else if (attachmentError) toast(`就诊记录已保存到云端，原始图片上传失败：${attachmentError.message || attachmentError}`);
      else if (attachmentResult?.localSaved) toast('就诊记录已保存到云端，原始图片保存在当前设备');
      else if (attachment) toast('就诊记录已保存到云端，但原始图片未能保存');
      else toast('就诊记录已保存到云端');
    } else if (attachmentError) {
      toast(`资料已保存在本机，原始图片保存失败：${attachmentError.message || attachmentError}`);
    } else if (attachmentResult?.localSaved) toast('资料和原始图片已保存在本机');
    else toast('资料已加入本机家庭档案');
  }
  if (event.target.closest('#backToUpload')) showUpload();
  if (event.target.closest('#openShareFromCard')) showShare(event.target.closest('[data-share-member]')?.dataset.shareMember || appointmentMemberId);
  const checklistInput = event.target.closest('[data-checklist]');
  if (checklistInput) {
    const checklistMember = checklistInput.dataset.appointmentMember;
    if (checklistMember) {
      const byMember = state.appointmentChecksByMember || (state.appointmentChecksByMember = {});
      byMember[checklistMember] = { ...(byMember[checklistMember] || {}), [checklistInput.dataset.checklist]: checklistInput.checked };
    } else {
      state.appointmentChecks = { ...(state.appointmentChecks || {}), [checklistInput.dataset.checklist]: checklistInput.checked };
    }
    saveState();
    refreshAppointmentGate(checklistMember);
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
  const previewToggle = event.target.closest('[data-preview-toggle]');
  if (previewToggle) {
    const key = previewToggle.dataset.previewToggle;
    if (previewOpen.has(key)) previewOpen.delete(key); else previewOpen.add(key);
    renderHealth(); renderDocs(); // 展开按钮在健康档案与医疗资料两个 Tab 都可能出现，各自有空容器守卫
    return;
  }
  const memberEditButton = event.target.closest('[data-member-edit]');
  if (memberEditButton) { showMemberEdit(memberEditButton.dataset.memberEdit); return; }
  const memberReadingButton = event.target.closest('[data-member-reading]');
  if (memberReadingButton) { showReadingEntry(memberReadingButton.dataset.memberReading); return; }
  const memberDailyButton = event.target.closest('[data-member-daily]');
  if (memberDailyButton) { showDailyLog(memberDailyButton.dataset.memberDaily); return; }
  const docsToggle = event.target.closest('[data-docs-toggle]');
  if (docsToggle) {
    const id = docsToggle.dataset.docsToggle;
    if (expandedDocsMembers.has(id)) expandedDocsMembers.delete(id); else expandedDocsMembers.add(id);
    renderDocs();
    return;
  }
  const policyDetailButton = event.target.closest('[data-policy-detail]');
  if (policyDetailButton) { showPolicyDetail(policyDetailButton.dataset.policyDetail); return; }
  if (event.target.closest('[data-policy-source]')) { document.getElementById('policyFileInput')?.click(); return; }
  if (event.target.closest('#policyDemoScan')) {
    makeDemoPolicyFile().then(file => { policyUploadFile = file; showPolicyRecognize(file); });
    return;
  }
  const policyAttachmentButton = event.target.closest('[data-policy-attachment]');
  if (policyAttachmentButton) { showPolicyAttachment(null, policyAttachmentButton.dataset.policyAttachment); return; }
  const policyEditButton = event.target.closest('[data-policy-edit]');
  if (policyEditButton) { showPolicyEntry('', policyEditButton.dataset.policyEdit); return; }
  const policyDelButton = event.target.closest('[data-policy-del]');
  if (policyDelButton) {
    const policy = (state.insurancePolicies || []).find(item => item.id === policyDelButton.dataset.policyDel);
    if (policy) {
      state.insurancePolicies = state.insurancePolicies.filter(item => item.id !== policy.id);
      saveState(); renderDocs(); closeModal();
      toast(`已删除保单「${policy.name}」`);
    }
    return;
  }
  const memberPolicyAddButton = event.target.closest('[data-member-policy-add]');
  if (memberPolicyAddButton) { showPolicyEntry(memberPolicyAddButton.dataset.memberPolicyAdd); return; }
  /* 报销提醒：详情 / 材料勾选 / 提交 / 删除 */
  const claimDetailButton = event.target.closest('[data-claim-detail]');
  if (claimDetailButton) { showClaimDetail(claimDetailButton.dataset.claimDetail); return; }
  const claimToggle = event.target.closest('[data-claim-toggle]');
  if (claimToggle) {
    const claim = (state.reimbursements || []).find(item => item.id === claimToggle.dataset.claimId);
    const index = Number(claimToggle.dataset.claimToggle);
    if (claim && claim.materials[index]) {
      claim.materials[index].done = !claim.materials[index].done;
      saveState(); showClaimDetail(claim.id); renderDocs();
    }
    return;
  }
  const claimSubmit = event.target.closest('[data-claim-submit]');
  if (claimSubmit) {
    const claim = (state.reimbursements || []).find(item => item.id === claimSubmit.dataset.claimSubmit);
    if (claim) {
      claim.status = '已提交';
      saveState(); renderDocs(); closeModal();
      toast('已标记提交（演示），受理结果由医保局 / 保险公司反馈');
    }
    return;
  }
  const claimDel = event.target.closest('[data-claim-del]');
  if (claimDel) {
    state.reimbursements = (state.reimbursements || []).filter(item => item.id !== claimDel.dataset.claimDel);
    saveState(); renderDocs(); closeModal();
    toast('已删除这条报销提醒');
    return;
  }
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
  if (histEdit) { histEditContext = histEdit.dataset.editContext || 'dashboard'; showHistEdit(histEdit.dataset.histEdit); return; }
  const histDel = event.target.closest('[data-hist-del]');
  if (histDel) {
    const entry = (state.bodyMetrics || []).find(item => item.id === histDel.dataset.histDel);
    if (entry) {
      let removed = [entry.id];
      /* 日常记录里血压成对展示：删除收缩压时把同时刻的舒张压一并删除 */
      if (histDel.dataset.editContext === 'daily' && entry.metric === '收缩压') {
        state.bodyMetrics.filter(item => item.memberId === entry.memberId && item.metric === '舒张压' && item.date === entry.date && (item.time || '') === (entry.time || '')).forEach(item => removed.push(item.id));
      }
      state.bodyMetrics = state.bodyMetrics.filter(item => !removed.includes(item.id));
      saveState(); renderHealth();
      if (histDel.dataset.editContext === 'daily') { showDailyLog(entry.memberId); } else { showMemberDashboard(entry.memberId); }
      toast(`已删除 ${entry.metric} 记录（${formatDate(entry.date)}）`);
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
  const demandAccept = event.target.closest('[data-demand-accept]');
  if (demandAccept) acceptDemandPost(demandAccept.dataset.demandAccept);
  const demandCancel = event.target.closest('[data-demand-cancel]');
  if (demandCancel) cancelDemandPost(demandCancel.dataset.demandCancel);
  const taskShareButton = event.target.closest('[data-task-share]');
  if (taskShareButton) showTaskShareForm(taskShareButton.dataset.taskShare);
  const taskShareRevoke = event.target.closest('[data-task-share-revoke]');
  if (taskShareRevoke) revokeTaskShare(taskShareRevoke.dataset.taskShareRevoke);
  if (event.target.closest('#taskShareLookup')) lookupTaskShareCode();
  const visitOpen = event.target.closest('[data-visit-open]');
  if (visitOpen) {
    const [visitMemberId, visitDate] = visitOpen.dataset.visitOpen.split('|');
    showVisitDetail(visitMemberId, visitDate);
    return;
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
      syncDemandPostByOrder(order);
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

/* 社区地区筛选 */
document.addEventListener('change', event => {
  if (event.target.id === 'communityRegion') { communityRegion = event.target.value; renderCommunity(); }
});


document.addEventListener('submit', async event => {
  if (event.target.id === 'cloudTaskShareForm') {
    event.preventDefault();
    try { await createCloudTaskShare(event.target); }
    catch(error) { toast(`生成分享码失败：${error.message||error}`); }
    return;
  }
  if (event.target.id === 'cloudTaskShareLookup') {
    event.preventDefault();
    const code=String(new FormData(event.target).get('code')||'').trim();
    const host=document.getElementById('cloudTaskShareResult');
    if(host) host.innerHTML='<p class="privacy-small">正在核验分享码…</p>';
    try { await lookupCloudTaskShare(code,host); }
    catch(error) { if(host) host.innerHTML=`<p class="privacy-small task-share-error">${esc(error.message||'分享码无法验证')}</p>`; }
    return;
  }
  if (event.target.id === 'cloudOrderReviewForm') {
    event.preventDefault();
    const form=event.target, data=new FormData(form);
    try { await window.KangbanAPI.rpc('submit_companion_order_review',{p_order_id:form.dataset.orderId,p_score:Number(data.get('score')),p_comment:String(data.get('comment')||'').trim()}); closeModal(); toast('评价已保存到云端订单'); await refreshCloudAfterAction(); }
    catch(error) { toast(`评价失败：${error.message||error}`); }
    return;
  }
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
      memberId: String(data.get('memberId') || 'm1'),
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
    const patientMemberId = String(data.get('patientMemberId') || 'm1');
    const patientMember = state.familyMembers.find(member => member.id === patientMemberId);
    const order = {
      id: `order-${Date.now()}`,
      service: data.get('service'),
      hospital: data.get('hospital'),
      date: data.get('date'),
      need: data.get('need'),
      patient: patientMember?.name || '陈兰英',
      patientMemberId,
      requester: '小林',
      source: 'family',
      price: SERVICE_PRICES[data.get('service')] || 268,
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
    const nextVisitDate = String(data.get('nextVisitDate') || '').trim();
    const nextVisitNote = String(data.get('nextVisitNote') || '').trim();
    order.serviceReport = {
      summary: data.get('summary').trim(),
      followUp: data.get('followUp').trim(),
      handoff: data.get('handoff'),
      nextVisitDate,
      nextVisitNote,
      needsFamily: data.get('needsFamily') === 'yes',
      submittedAt: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    order.completedAt = new Date().toISOString();
    order.status = 'completed';
    const reminderCreated = createVisitReminderFromReport(order, nextVisitDate, nextVisitNote);
    syncDemandPostByOrder(order);
    saveState(); closeModal(); renderRecords();
    toast(reminderCreated ? `反馈已提交，${formatDate(nextVisitDate)}的复诊提醒已自动创建` : order.serviceReport.needsFamily || order.serviceReport.handoff.includes('尚未') ? '反馈已提交，提醒家属尽快跟进' : '反馈已提交，家庭端可查看');
  }
  if (event.target.id === 'demandForm') {
    event.preventDefault(); const data = new FormData(event.target);
    if (window.KangbanAuth?.mode === 'cloud') {
      const auth = window.KangbanAuth.session;
      try {
        if (!auth?.familyId) throw new Error('家庭空间尚未建立，请重新登录。');
        const localMemberId=String(data.get('patientMemberId')||'');
        const localMember=state.familyMembers.find(member=>String(member.id)===localMemberId);
        if(!localMember) throw new Error('请选择本次就诊成员。');
        const [cloudMember]=await window.KangbanAPI.upsert('family_members',[{
          family_id:auth.familyId,legacy_id:String(localMember.id),name:String(localMember.name||'家庭成员'),
          relationship:String(localMember.role||localMember.relationship||'家庭成员'),age:Number.isFinite(Number(localMember.age))?Number(localMember.age):null
        }],{onConflict:'family_id,legacy_id'});
        if(!cloudMember?.id) throw new Error('家庭成员资料未能保存，请重试。');
        const service = String(data.get('service') || '全程陪诊');
        const budgetMin = Number.parseFloat(String(data.get('budgetMin') || '')) || null;
        const budgetMax = Number.parseFloat(String(data.get('budgetMax') || '')) || null;
        await window.KangbanAPI.rpc('create_demand_post', {
          p_family_id: auth.familyId, p_patient_member_id: cloudMember.id, p_author_label: '家庭用户',
          p_region: String(data.get('region') || '本地').trim(), p_hospital_name: String(data.get('hospital') || '').trim(), p_service_date: String(data.get('date') || ''),
          p_service_type: service, p_summary: `需要${service}服务，协助院内就医流程`, p_need_text: String(data.get('need') || '').trim() || '具体需求待家庭与陪诊师沟通',
          p_budget_min: budgetMin, p_budget_max: budgetMax
        });
        closeModal(); toast('需求已发布，等陪诊师报名；有新报名会提醒你'); await refreshCloudAfterAction();
      } catch (error) { toast(`发布失败：${error.message || error}`); }
      return;
    }
    const patientMemberId = String(data.get('patientMemberId') || 'm1');
    const patientMember = state.familyMembers.find(member => member.id === patientMemberId);
    const budgetMin = String(data.get('budgetMin') || '').trim();
    const budgetMax = String(data.get('budgetMax') || '').trim();
    const post = {
      id: `dp-${Date.now()}`,
      patient: patientMember?.name || '家庭成员',
      patientMemberId,
      requester: (state.familyMembers.find(member => member.id === state.currentMemberId)?.name) || '家庭成员',
      hospital: String(data.get('hospital') || '').trim(),
      region: String(data.get('region') || '').trim(),
      date: String(data.get('date') || ''),
      service: String(data.get('service') || '全程陪诊'),
      need: String(data.get('need') || '').trim(),
      budget: budgetMin && budgetMax ? `¥${budgetMin}–${budgetMax}` : (budgetMin || budgetMax ? `¥${budgetMin || budgetMax}` : ''),
      status: '招募中',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    state.demandPosts = [post, ...(state.demandPosts || [])];
    saveState(); renderRecords(); renderCompanionViews(); closeModal();
    toast('需求已发布，陪诊员在需求大厅可见');
  }
  if (event.target.id === 'availabilityForm') {
    event.preventDefault();
    const data = new FormData(event.target); const auth = window.KangbanAuth.session;
    const editId = event.target.dataset.editId;
    const payload = {
      region: String(data.get('region') || '').trim(),
      serviceType: String(data.get('serviceType') || '陪诊服务'),
      date: String(data.get('date') || ''),
      start: String(data.get('start') || ''),
      end: String(data.get('end') || ''),
      summary: String(data.get('summary') || '').trim()
    };
    try {
      if (editId) {
        await window.KangbanAPI.rpc('update_availability', { p_post_id: editId, p_region: payload.region, p_service_type: payload.serviceType, p_service_date: payload.date, p_start_time: payload.start, p_end_time: payload.end, p_summary: payload.summary });
        closeModal(); toast('时段已更新');
      } else {
        const [escortProfile] = await window.KangbanAPI.select('escort_profiles', { filters: { user_id: auth.user.id }, limit: 1 });
        if (escortProfile?.review_status !== 'approved' || auth.status !== 'active') throw new Error('陪诊师账号尚未审核通过，暂不能发布可约时段。');
        await window.KangbanAPI.insert('community_posts', {
          type:'availability', author_id:auth.user.id, family_id:null, author_label:auth.displayName||'陪诊师',
          region:payload.region, hospital_name:'', service_date:payload.date,
          start_time:payload.start, end_time:payload.end, service_type:payload.serviceType,
          summary:payload.summary || '可预约陪诊时段，服务范围由陪诊师本人确认', status:'open'
        });
        closeModal(); toast('陪诊服务已发布');
      }
      await renderCommunity();
    } catch(error) { toast(`操作失败：${error.message||error}`); }
  }
  if (event.target.id === 'bookAvailabilityForm') {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = '正在提交…'; }
    const data = new FormData(form);
    try {
      await window.KangbanAPI.rpc('book_availability', { p_post_id: form.dataset.postId, p_note: String(data.get('note') || '').trim() });
      closeModal(); toast('预约申请已提交，等待陪诊师确认'); await refreshCloudAfterAction();
    } catch (error) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = '提交预约申请'; }
      toast(`预约失败：${error.message || error}`);
    }
  }
  if (event.target.id === 'demandApplyForm') {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = '正在提交…'; }
    const data = new FormData(form);
    const note = String(data.get('note') || '').trim();
    try {
      let resumePath = null;
      if (demandApplyFile) {
        const uid = window.KangbanAuth.session.user.id;
        resumePath = `resumes/${uid}/${Date.now()}-${encodeURIComponent(demandApplyFile.name || 'resume')}`;
        await window.KangbanAPI.uploadPrivateFile(demandApplyFile, resumePath);
      }
      demandApplyFile = null;
      await window.KangbanAPI.rpc('apply_to_demand', { p_post_id: form.dataset.postId, p_note: note, p_resume_path: resumePath });
      closeModal(); toast('报名已提交，家庭会看到你的介绍与简历'); await refreshCloudAfterAction();
    } catch (error) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = '提交报名'; }
      toast(`报名失败：${error.message || error}`);
    }
  }
  if (event.target.id === 'cloudEscortProfileForm') {
    event.preventDefault(); const data=new FormData(event.target); const auth=window.KangbanAuth.session;
    try {
      await window.KangbanAPI.updateWhere('escort_profiles', { user_id: auth.user.id }, {display_name:String(data.get('display_name')||'').trim(),experience:String(data.get('experience')||'').trim(),service_area:String(data.get('service_area')||'').trim(),bio:String(data.get('bio')||'').trim()});
      toast('陪诊师介绍已保存'); await refreshCloudAfterAction();
    } catch(error){toast(`保存失败：${error.message||error}`);}
  }
  if (event.target.id === 'taskShareForm') {
    event.preventDefault();
    const orderId = event.target.dataset.orderId;
    const share = generateTaskShare(orderId, new FormData(event.target).get('withSelfDescription') === 'on');
    if (!share) { toast('没有找到这笔预约'); return; }
    showTaskShareDetail(share.id);
  }
});

document.addEventListener('change', async event => {
  if (event.target.id === 'cloudEvidenceInput') {
    const file=event.target.files?.[0], target=cloudEvidenceTarget; event.target.value=''; cloudEvidenceTarget=null;
    if (!file||!target) return;
    try {
      const order=cloudOrderCache.get(target.orderId) || (await window.KangbanAPI.rpc('list_my_companion_orders')).find(item=>item.id===target.orderId);
      if (!order) throw new Error('找不到云端订单');
      const fileName=`${Date.now()}-${encodeURIComponent(file.name||'evidence')}`;
      const path=`${order.family_id}/${order.id}/${fileName}`;
      await window.KangbanAPI.uploadPrivateFile(file,path);
      await window.KangbanAPI.rpc('update_order_checklist',{p_order_id:order.id,p_item_key:target.key,p_evidence_path:path});
      toast('佐证已上传，履约项已完成'); await refreshCloudAfterAction();
    } catch(error) { toast(`上传失败：${error.message||error}`); }
    return;
  }
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
document.getElementById('policyFileInput').addEventListener('change', event => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  policyUploadFile = file;
  showPolicyRecognize(file);
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
    syncDemandPostByOrder(order);
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
  /* 历史读数重放：按时间正序走同一套统一规则引擎（评估 / 同日去重合并 / 恢复自动关闭），与实时录入口径完全一致 */
  const buckets = new Map();
  (state.bodyMetrics || []).forEach(entry => {
    if (entry.metric === '舒张压') return; // 舒张压与同时刻收缩压合成一组评估
    const key = `${entry.memberId}|${entry.date}|${entry.time || ''}`;
    const bucket = buckets.get(key) || { memberId: entry.memberId, date: entry.date, time: entry.time || '', rows: [], source: entry.source || '手动录入' };
    if (entry.metric === '收缩压') {
      const dia = (state.bodyMetrics || []).find(d => d.metric === '舒张压' && d.memberId === entry.memberId && d.date === entry.date && (d.time || '') === (entry.time || ''));
      if (dia) bucket.rows.push({ metric: '收缩压', value: entry.value, unit: 'mmHg' }, { metric: '舒张压', value: dia.value, unit: 'mmHg' });
    } else {
      bucket.rows.push({ metric: entry.metric, value: entry.value, unit: entry.unit });
    }
    buckets.set(key, bucket);
  });
  [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).forEach(bucket => {
    if (!bucket.rows.length) return;
    const member = state.familyMembers.find(item => item.id === bucket.memberId);
    evaluateAndRaise(bucket.memberId, member?.name || '', bucket.rows, bucket.source, bucket.date, `${formatDate(bucket.date)} ${bucket.time}`.trim());
  });
  saveState();
}
function setPasswordRecoveryView(enabled) {
  const isRecovery = !!enabled;
  const form = document.getElementById('authForm');
  const emailLabel = form?.querySelector('#authLoginPanel label:first-of-type');
  const emailInput = form?.querySelector('#authLoginPanel [name="email"]');
  const passwordLabel = form?.querySelector('#authLoginPanel label:nth-of-type(2) span');
  const passwordInput = form?.querySelector('#authLoginPanel [name="password"]');
  if (!form || !passwordInput) return;
  setAuthRegistrationView(false);
  emailLabel.hidden = isRecovery;
  emailInput.required = !isRecovery;
  emailInput.disabled = isRecovery;
  document.getElementById('authRegister').hidden = isRecovery;
  document.getElementById('authForgotPassword').hidden = true;
  document.getElementById('authResetNotice').hidden = isRecovery;
  document.getElementById('authExperience').hidden = isRecovery;
  passwordLabel.textContent = isRecovery ? '新密码' : '密码';
  passwordInput.autocomplete = isRecovery ? 'new-password' : 'current-password';
  passwordInput.placeholder = isRecovery ? '请设置至少 8 位新密码' : '至少 8 位';
  passwordInput.value = '';
  document.getElementById('authSubmit').textContent = isRecovery ? '保存新密码' : window.authRegisterMode ? '注册并继续' : '登录';
}

document.getElementById('authForgotPassword')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const email = document.querySelector('#authForm [name="email"]')?.value || '';
  const message = document.getElementById('authMessage');
  button.disabled = true; message.textContent = '正在发送重置邮件…';
  try {
    await window.KangbanAuth.requestPasswordReset(email);
    message.textContent = '如果该邮箱已注册，密码重置邮件已发送。请在能打开本机康伴页面的电脑上打开邮件链接。';
  } catch (error) { message.textContent = error.message || '重置邮件发送失败，请稍后重试。'; }
  finally { button.disabled = false; }
});

document.getElementById('authForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = document.getElementById('authMessage');
  const button = document.getElementById('authSubmit');
  const email = String(form.get(window.authRegisterMode ? 'registerEmail' : 'email') || '').trim();
  const password = String(form.get(window.authRegisterMode ? 'registerPassword' : 'password') || '');
  if (window.authRegisterMode && password !== String(form.get('passwordConfirm') || '')) {
    message.textContent = '两次输入的密码不一致，请重新确认。';
    return;
  }
  message.textContent = '正在连接…'; button.disabled = true;
  try {
    if (window.KangbanAuth.isPasswordRecovery) {
      await window.KangbanAuth.updatePassword(String(form.get('password') || ''));
      window.authRegisterMode = false;
      setPasswordRecoveryView(false);
      event.currentTarget.reset();
      message.textContent = '密码已更新，请使用新密码登录。';
    } else if (window.authRegisterMode) {
      const result = await window.KangbanAuth.signUp({ email, password, displayName: '康伴用户', role:window.selectedAuthRole||'family' });
      if (result.pendingEmailConfirmation) message.textContent = '注册成功。请到邮箱完成验证，再返回登录。';
      else event.currentTarget.reset();
    } else {
      await window.KangbanAuth.signIn(email, password);
      event.currentTarget.reset();
    }
  } catch (error) { message.textContent = error.message || '操作失败，请稍后重试。'; }
  finally { button.disabled = false; }
});
async function applyAuthSession(session) {
  const gate = document.getElementById('authGate');
  if (window.KangbanAuth?.isPasswordRecovery) {
    document.body.classList.remove('authenticated','guest-mode','family-mode');
    gate.hidden = false;
    window.authRegisterMode = false;
    setPasswordRecoveryView(true);
    document.getElementById('authMessage').textContent = '请输入新密码并保存。';
    return;
  }
  if (!session) {
    document.body.classList.remove('authenticated','guest-mode','family-mode'); gate.hidden = false;
    setAuthRegistrationView(false);
    unsubscribeCloudRealtime();
    document.getElementById('familyTabs').hidden = false; document.getElementById('escortTabs').hidden = true;
    return;
  }
  document.body.classList.add('authenticated'); gate.hidden = true;
  if (window.KangbanAuth.mode === 'cloud') {
    activeStorageKey = `kangban-cloud-${session.user.id}`;
    if (session.role === 'family' && session.familyId) {
      try {
        const cloudState = await window.KangbanAPI.loadFamilyWorkspace(session.familyId);
        if (cloudState) {
          const cloudText = JSON.stringify(cloudState);
          if (localStorage.getItem(activeStorageKey) !== cloudText) { localStorage.setItem(activeStorageKey,cloudText); window.location.reload(); return; }
        }
      } catch (error) { toast(`云端家庭资料加载失败：${error.message||error}`); }
    }
    state = loadState(); state.currentRole = session.role;
  } else if (window.KangbanAuth.mode === 'local-demo') {
    activeStorageKey = STORAGE_KEY; state = loadState(); state.currentRole = session.role;
  } else {
    state.currentRole = 'family';
  }
  renderRole();
  if (session.role === 'guest') navigate('community');
  else navigate(session.role === 'escort' ? 'escort' : 'home');
  /* 登录后重置历史栈基线：从这里开始记录返回层级 */
  try { history.replaceState({ kangbanTab: currentTab }, ''); } catch { /* 忽略 */ }
  /* 云端会话订阅订单实时变更：对方状态一变，本端自动刷新 + 提示 */
  if (window.KangbanAuth.mode === 'cloud' && session.role !== 'guest') subscribeCloudRealtime();
}
window.addEventListener('kangban:auth-change', event => { applyAuthSession(event.detail.session); });
if (window.KangbanAuth) window.KangbanAuth.initialize().then(applyAuthSession).catch(error => {
  const message = document.getElementById('authMessage'); if (message) message.textContent = `登录状态读取失败：${error.message||error}`;
  const gate = document.getElementById('authGate'); if (gate) gate.hidden = false;
});
displayToday(); renderHomeAlerts(); renderRole(); renderRecords(); navigate(state.currentRole === 'escort' ? 'escort' : 'home');
setInterval(checkMedicationReminders, 60000);
setTimeout(checkMedicationReminders, 1500);
setInterval(checkCustomReminders, 60000);
setTimeout(checkCustomReminders, 1800);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./service-worker.js').catch(() => {});

/* Netlify 免费版角标避让
   线上访问时 Netlify 会注入 iframe#nl-badge-frame（固定右下角 202×64，z-index 极高），
   会压住底部 Tab 栏与弹窗主操作按钮。检测到就给 <html> 打标记，由 styles.css 让出安全区。
   iframe 由 Netlify 在页面加载后异步插入，所以用 MutationObserver 等它出现。 */
(function watchNetlifyBadge() {
  const selector = '#nl-badge-frame, iframe[id^="nl-badge"]';
  const mark = () => {
    if (!document.querySelector(selector)) return false;
    document.documentElement.classList.add('nl-badge-on');
    return true;
  };
  if (mark()) return;
  const observer = new MutationObserver(() => { if (mark()) observer.disconnect(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
