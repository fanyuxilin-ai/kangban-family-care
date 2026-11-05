# 康伴明显缺口补齐实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐云端演示的可复现配置、管理员审核入口、云端任务分享授权、数据访问门面和准确的运行文档。

**Architecture:** 保留当前 17 张表；使用现有订单分享字段及 SECURITY DEFINER RPC 承载分享码授权与审核，不新增业务表。页面只通过 `KangbanAPI` 访问 Supabase；服务端管理密钥只允许一次性本机初始化脚本读取。

**Tech Stack:** 静态 JavaScript、Supabase Auth/Postgres/Storage、SQL migrations、Node 内置 fetch。

**Spec:** 用户已批准的《康伴 · 登录 + 社区 + 真实后端》要求及本次“补齐明显缺口”的指示。

## Global Constraints

- 不改 main；仅在 `feat/auth-community-backend` 工作。
- 前端只使用 publishable key；service-role key 不进入仓库或站点产物。
- 陪诊师任务隐私须由数据库授权检查，不以隐藏按钮代替访问控制。
- 继续使用 17 张业务表，不把收入或评价宣传成真实支付功能。

## Review Focus

- 未登录或非参与者不能操作审核或任务分享 RPC。
- 已选陪诊师在有效分享码前不能读诊前自我描述。
- 演示账号初始化可重复执行，不重复创建用户。
- 云端 API 错误必须向用户显式呈现，不静默写入本机。

## Tasks

### Task 1: Centralize cloud mutations

- [ ] Add `KangbanAPI.upsert`, `selectOne`/filtered update helpers, and narrowly scoped domain methods for profile, orders, and memberships.
- [ ] Replace direct Supabase calls in `app.js`.
- [ ] Write API contract tests first; verify fail then pass.

### Task 2: Cloud task sharing

- [ ] Add migration RPCs to create/revoke/validate task shares and append access logs; return only authorized task data after checking code, expiry, revocation, active escort, and assigned order.
- [ ] Keep raw six-digit codes only in browser memory; persist SHA-256 hashes.
- [ ] Add cloud UI actions; keep order summaries free of patient/self-description data until share validation.
- [ ] Add SQL contract/API tests and verify fail then pass.

### Task 3: Admin escort review and demo account provisioning

- [ ] Add admin-claim-guarded RPCs and an admin queue in the UI; document one-time trusted-admin promotion.
- [ ] Add idempotent local provisioning script requiring URL, publishable key, service-role key, and explicit demo password through environment variables only.
- [ ] Add tests for admin guards and script input validation.

### Task 4: Documentation and release

- [ ] Correct contradictory README and M1 deployment notes; distinguish local demos, cloud demo accounts, and production capabilities.
- [ ] Run the full existing test suite and smoke checks, deploy the migration, rerun real-cloud permission checks, package and publish the Site.
- [ ] Commit each cohesive milestone in Chinese; report any cloud-side step that cannot be completed.
