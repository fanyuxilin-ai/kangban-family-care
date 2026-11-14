# 安心报平安预警 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 登录家庭用户可为任意成员开启 48 小时未收到平安信号告警，云端及时通知家庭联系人并支持确认处理。

**Architecture:** 保持单页应用结构，通过 Supabase 表/RPC 保存最小化信号时间、守护设置和告警；云端定时函数按规则幂等生成告警并经服务器端邮件适配器投递。前端首页提供成员级「我平安」操作与告警处理入口，健康记录成功保存后只报告信号，不向邮件服务发送健康值。

**Tech Stack:** 现有静态 HTML/CSS/JavaScript、Supabase Postgres/RLS/RPC、Supabase Edge Functions/Cron、服务器端事务邮件 API。

**Spec:** `docs/superpowers/specs/2026-11-14-safety-checkin-alert-design.md`

## Global Constraints

- 48 小时无信号触发；扫描目标为到期后不超过 5 分钟。
- 手动「我平安」与已成功保存的血压、血糖、体重等日常健康记录都更新信号；打开页面、附件和就诊资料不更新信号。
- 新健康信号重置计时，但不能静默关闭已触发告警；老人报平安或家属确认已联系平安才关闭。
- 创建告警时通知所有已验证邮箱；2 小时仍未处理时最多跟进一次。
- 只有家庭 owner/caregiver 可管理守护规则和收件人，且启用时必须确认已告知并获得同意或有权代为管理。
- 收件人限已加入同一家庭且邮箱已验证的账号；邮件处理入口要求登录家庭账号。
- 邮件及外部发送请求只带必要通知字段，不带健康值、诊断、处方或附件；所有邮件凭据仅存在服务器端 Secrets。
- 本机演示/游客模式不显示远程守护已启用，不做后台告警承诺。

## Review Focus

- 恰好到达 48 小时及扫描延迟：只在截止时间后触发，扫描延迟不得超过 5 分钟；归 Task 3 的规则验证。
- 同一告警周期内 Cron 并发或重试：仅生成一条告警和一封首发邮件；归 Task 1/3 的幂等约束验证。
- 伪造其他家庭/成员 ID：RPC 拒绝越权写入和处理；归 Task 1 的 RLS/RPC 验证。
- 健康记录保存失败或离线本机记录：不能向云端确认成功信号；归 Task 2 的 UI/API 验证。
- 邮件服务失败、守护暂停或成员/接收人失效：状态可观察、可重试且不能误显示“已发送”；归 Task 3 的重试验证。

---

### Task 1: 云端模型、权限与安全 RPC

**Files:**
- Create: `supabase/migrations/20261114090000_member_safety_checkin.sql`
- Modify: `tests/schema-contract.test.js`（仅在获准执行自动化测试时）

**Interfaces:**
- Produces tables `member_safety_settings`, `member_safety_signals`, `member_safety_alerts`, and `member_safety_recipients`.
- Produces RPC `record_member_safety_signal(p_family_id uuid, p_member_id uuid, p_source text) returns timestamptz`.
- Produces RPC `resolve_member_safety_alert(p_alert_id uuid, p_resolution text, p_note text default null) returns jsonb`.
- Produces server-only RPC `claim_due_member_safety_alerts(p_now timestamptz default now()) returns setof jsonb`; execution is revoked from `anon` and `authenticated`.

- [x] **Step 1: Define schema and uniqueness constraints** — UUID family/member references, source/status checks, event history, and per-cycle alert deduplication; family/member deletion cascades.
- [x] **Step 2: Add RLS and grants** — family read policies, owner/caregiver RPC management, server-only outbox and claiming.
- [x] **Step 3: Implement `record_member_safety_signal`** — validate family membership/member ownership; self-check resolves active alert, measurements only reset the timer.
- [x] **Step 4: Implement `resolve_member_safety_alert`** — allow only the three approved handling states, preserve actor/event history, and reset the timer only after explicit safe confirmation.
- [x] **Step 5: Implement idempotent due-alert claiming** — 48-hour threshold, active-alert suppression, verified recipients, outbox lease and bounded retry.
- [x] **Step 6: Inspect migration safety** — automated schema contract checks confirm RLS coverage and server-only grants. Cloud execution remains pending.

### Task 2: Frontend settings, signals, and alert handling

**Files:**
- Modify: `api.js`
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `README.md`

**Interfaces:**
- Consumes Task 1 RPCs and tables.
- Produces `KangbanAPI.recordMemberSafetySignal({ familyId, memberId, source })`, `KangbanAPI.resolveMemberSafetyAlert({ alertId, resolution, note })`, and methods to list/save/pause settings and recipients.

- [x] **Step 1: Add API methods with explicit cloud/local behavior** — cloud RPC methods; local mode refuses remote guard and reports unsupported.
- [x] **Step 2: Add the member-level home check-in** — home button and latest signal time for the selected member.
- [x] **Step 3: Connect successful daily health saves** — persist the cloud workspace first, then record a signal; failures do not record one.
- [x] **Step 4: Add守护 settings UI** — verified household recipient selection, consent, pause, and readiness gate.
- [x] **Step 5: Add family alert handling** — statuses and explicit safe confirmation; other statuses leave the alert open.
- [x] **Step 6: Handle state refresh and device sizes** — re-render after login and actions; responsive mobile styles added. Real-device acceptance remains pending.
- [x] **Step 7: Document setup and limits** — cloud-only behavior, email prerequisites, and responsibility boundary.

### Task 3: Scheduled alert processing and email delivery

**Files:**
- Create: `supabase/functions/process-member-safety-alerts/index.ts`
- Modify: `supabase/config.toml`
- Create: `supabase/migrations/20261114100000_schedule_member_safety_alerts.sql`
- Modify: `README.md`

**Interfaces:**
- Consumes `claim_due_member_safety_alerts(p_now)` from Task 1.
- Produces an Edge Function invoked by Supabase Cron every five minutes; sends privacy-minimal email through a server-side provider configured by `SAFETY_ALERT_EMAIL_API_KEY` and `SAFETY_ALERT_EMAIL_FROM`.
- Uses provider-independent `sendSafetyAlertEmail({ to, memberLabel, lastSignalAt, appUrl, alertId })` inside the Edge Function; no client-side secret or public alert token.

- [x] **Step 1: Implement deterministic alert claim and email payload creation** — idempotent DB claim; message omits health values.
- [x] **Step 2: Add the email provider adapter** — HTTPS, server-side API key, idempotency key, bounded retry, and no stored body.
- [x] **Step 3: Schedule the function every five minutes** — pg_cron/pg_net use Vault secrets and a dedicated cron token; the job is inert until Vault values exist.
- [x] **Step 4: Implement one follow-up after two hours** — unique outbox kind and active-alert/setting checks prevent duplicates or post-resolution delivery.
- [x] **Step 5: Add operational visibility** — response counts and bounded error codes; setup instructions added.
- [ ] **Step 6: Verify deployment readiness** — requires the project owner to configure a test mailbox and provider credentials; not performed from this implementation workspace.

### Task 4: Final verification and release notes

**Files:**
- Modify: `README.md`
- Modify: `index.html` resource versions and `service-worker.js` cache version

**Interfaces:**
- Consumes completed Tasks 1–3.
- Produces a documented cloud setup checklist, manual acceptance checklist, and updated asset cache versions.

- [ ] **Step 1: Verify migration/RLS/RPC behavior** — local contract test passed; disposable Supabase execution pending.
- [ ] **Step 2: Verify alert timeline** — SQL clock-boundary and duplicate-job execution pending.
- [ ] **Step 3: Verify delivery failure and follow-up** — provider/mailbox end-to-end verification pending.
- [ ] **Step 4: Verify access and UI** — automated smoke and unit suites passed; real mobile/elder mode and cloud-role acceptance pending.
- [x] **Step 5: Update cache versions and setup docs** — cache version bumped; migrations, secrets and operator steps documented.

## Suggested Commit Boundaries

1. `新增安心守护云端数据与权限`
2. `增加平安信号与家庭预警界面`
3. `接入云端定时邮件告警`
4. `补充安心守护部署与验收说明`
