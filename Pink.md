# Pink · 项目修改记录

> 负责人：Pink（Pink1125）
> 分工：陪诊师端全部功能 + 社区端（需求区/接单大厅），对应需求文档 FR-09 / FR-10 / FR-11 / FR-12
> 开发分支：`pink/escort-side`（自 main 拉出，改动只落在本人负责的区块）
> 本文档按时间倒序记录每次修改，供队友 review 与答辩时追溯。

---

## 2026-11-05 ｜ 陪诊师端需求大厅、任务分享码、标准履约清单与收入模拟

- **提交**：`8565e9a`（分支 `pink/escort-side`，基线 main `120c295`）
- **对应需求**：FR-09-1 / FR-09-2 / FR-09-3 / FR-10 / FR-11 / FR-12

### 新增功能

1. **FR-12 社区需求区（家庭端侧）**
   - 「陪诊」Tab 新增可折叠「陪诊需求大厅」区块（`#demandPostList`）；
   - 发布需求帖表单：被陪护成员 / 医院 / 期望日期 / 服务项（带参考价）/ 预算（选填）/ 需求描述，提交前强制勾选知情授权（仅分享任务信息、不分享病历）；
   - 招募中的帖子可取消；种子内置 2 条演示需求帖（dp-1 周建国·检查陪同、dp-2 陈兰英·取药与报告）；
   - 需求帖状态机：`招募中 → 已接单 → 服务中 → 已完成 / 已取消`。

2. **FR-09-1 接单大厅（陪诊师端新 Tab）**
   - 陪诊师端主导航从 2 Tab 扩为 3 Tab：工作台 / **需求大厅** / 我的介绍；
   - 需求大厅实时展示招募中的需求帖（医院、时间、服务项、预算、参考报酬、需求描述），接单按钮一键接单 → 自动创建 `status=accepted` 订单（`source=demand`）并生成履约清单，需求帖转「已接单」；
   - 暂停接单状态下禁止接单（toast 提示先恢复接单）。

3. **FR-10 本次任务分享码（医疗隐私隔离红线）**
   - 家庭端：待确认/服务中的预约卡新增「生成本次任务分享码」入口 → 弹窗勾选分享范围（本次任务信息固定 + 诊前自我描述可选授权）→ 生成 6 位数字码，**10 分钟有效、可撤销、访问留痕**；同单已有有效码时直接展示详情而非重复生成；
   - 陪诊师端：工作台新增「本次任务信息 · 分享码」卡片，输入 6 位码校验（不存在 / 已撤销 / 已过期三种失败态分别提示），成功后展示任务信息及授权的诊前自我描述（仅最近一条，标注"仅用于代述病情"）；
   - 每次访问写入分享码 accessLogs 并同步到家庭端访问记录（`state.shares`）；**陪诊师端渲染代码不引用任何健康档案字段（allergies / conditions / medications 等）**。

4. **FR-09-2 标准化履约清单**
   - `EXECUTION_ITEMS` 由简化 3 套清单重构为**需求文档 4.1 八项标准模板**（`STANDARD_EXEC_TEMPLATE`）：电话确认 / 取号挂号 / 候诊陪同 / 代述病情 / 检查缴费取药 / 领取报告 / 复诊预约 / 服务小结；
   - 每项带佐证要求（`evidenceHint`）与必传标记（`evidenceRequired`）：**必传项不再提供手动勾选按钮，必须上传佐证照片后自动完成**；无佐证项（代述病情）与选填项（电话确认、服务小结）保留手动勾选；
   - 服务子集：全程陪诊 8 项、检查陪同 6 项、取药与报告 4 项；旧 localStorage 订单已有 execution.items 则跳过重建（向后兼容）。

5. **FR-09-3 信息同步闭环**
   - 服务单（`serviceReportForm`）新增「下次复诊日期（选填）/ 下次复诊事项（选填）」字段；
   - 提交服务单时若填写复诊日期，自动为被陪护成员创建单次家庭端提醒（08:00、起始=结束=复诊日、星期匹配），家庭端服务反馈卡显示"已自动创建家庭提醒"；
   - 履约动作完成（勾选 / 上传佐证）与订单完成时通过 `syncDemandPostByOrder` 联动需求帖状态（已接单→服务中→已完成）。

6. **FR-11 陪诊师个人经营（模拟金额）**
   - `SERVICE_PRICES`：全程陪诊 ¥268 / 检查陪同 ¥168 / 取药与报告 ¥98（演示金额，不产生真实支付）；
   - 陪诊师端订单卡显示报酬；工作台新增收入条（累计收入 / 已完成订单 / 单均）；「我的介绍」页新增统计卡（完成订单 / 累计收入 / 家庭评分）。

### 修改的文件

| 文件 | 改动 |
| --- | --- |
| `app.js` | 重构履约清单模板；新增模块「社区需求区 / 任务分享码 / 收入统计」（`orderPrice`、`renderDemandPosts`、`showDemandForm`、`renderEscortHall`、`acceptDemandPost`、`cancelDemandPost`、`syncDemandPostByOrder`、`showTaskShareForm`、`generateTaskShare`、`showTaskShareDetail`、`revokeTaskShare`、`lookupTaskShareCode`、`renderEscortIncome`、`createVisitReminderFromReport`）；loadState 归一化 demandPosts / taskShares / 订单新字段；预约表单加成员选择与参考价；服务单加复诊字段与自动提醒 |
| `index.html` | 家庭端需求大厅区块；陪诊师端第 3 Tab 与 `view-escort-hall`；工作台分享码卡片与收入条；我的介绍统计卡；资源版本 v17→v18 |
| `styles.css` | 追加需求帖卡片、收入条、任务分享码卡片/结果/大号码等样式 |
| `service-worker.js` | 缓存名 baseline-15→baseline-16 |
| `smoke.test.js` | **新增** Node + DOM 桩运行时冒烟测试，18 项断言 |
| `README.md` | 「当前功能」补充 4 条新能力 bullet；「建议演示流程」更新为含需求帖与分享码的完整闭环 |

### 数据与兼容

- `state` 新增字段：`demandPosts[]`（帖子：id/patient/patientMemberId/requester/hospital/date/service/need/budget/status/createdAt/orderId）、`taskShares[]`（code/orderId/withSelfDescription/expiresAt/revokedAt/accessLogs）；
- 订单新增字段：`source`（family/demand）、`demandPostId`、`patientMemberId`、`price`、`taskUnlocked`，loadState 对旧数据补默认值；
- 存储键仍为 `kangban-demo-v7`，旧用户数据无需迁移。

### 验证

- `node --check app.js` 通过；本地 `python -m http.server 4173` 服务 200；
- `node smoke.test.js` **18/18 PASS**：八项清单生成 / 必传佐证标记 / 代述病情免佐证 / 进度门控 / 需求帖全状态流转 / 接单生成订单 / 分享码生成与撤销 / 复诊提醒创建（成员+日期+星期匹配）/ 收入汇总 / 隐私红线（陪诊师端渲染不含档案字段引用）。

### 待办 / 已知边界

- PR 需在网页创建（GitHub 集成无建 PR 权限）：https://github.com/fanyuxilin-ai/kangban-family-care/pull/new/pink/escort-side
- 分享码为同设备演示（无真实扫码/跨设备校验）；真实版按架构文档 §4.3 走网关校验 + scope 最小字段集；
- 商城（FR-12-1 服务者侧上架/筛选）为下一步计划，当前仅单陪诊员演示。

---

## 修改记录模板（后续每次修改按此追加）

```markdown
## YYYY-MM-DD ｜ 一句话概括本次修改

- **提交**：`<commit-hash>`（分支 `<branch>`，基线 <base>）
- **对应需求**：FR-XX-X
- **改动内容**：
  1. …
- **修改的文件**：…
- **数据与兼容**：…
- **验证**：…
- **待办 / 已知边界**：…
```
