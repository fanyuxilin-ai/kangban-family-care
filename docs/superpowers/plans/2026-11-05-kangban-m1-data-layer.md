# 康伴 M1 数据层实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 在不改变既有家属端和 Pink 陪诊师端业务行为的前提下，加入可审查的 Supabase 云数据层与无配置本地降级。

**Architecture:** Supabase Auth/Postgres/Storage 作为云端目标；浏览器只使用 publishable key，数据库启用 RLS。`api.js` 为现有 `kangban-demo-v7` 状态提供本地兼容模式，并在环境配置存在时提供 Supabase repository。云请求失败时报告错误，不静默写入本地，避免形成双写分叉。

**Tech Stack:** Vanilla JavaScript、Supabase JS v2、Postgres SQL migrations、Supabase Storage、Node.js built-in test runner。

**Spec:** 用户已批准的《康伴 · 登录 + 社区 + 真实后端》方案；当前仓库 `docs/康伴-架构文档.md` 与 `docs/康伴-需求文档.md`。

## Global Constraints

- 当前仓库为 `fanyuxilin-ai/kangban-family-care`；从最新 `main` 创建 `feat/auth-community-backend`，不改 main。
- 本里程碑只完成 M1，提交后暂停交付检查点，再继续 M2–M4。
- 保留 `STORAGE_KEY = kangban-demo-v7`、现有全局事件委托、Pink 的需求大厅/订单/履约/分享码/收入流程。
- 严格创建 17 张获批表；分享码及访问记录扩展存于 `companion_orders`，不另加表。
- 客户端不包含任何 Supabase secret/service-role key；Storage bucket 为私有。
- 无云配置时用本地状态运行并显示明确提示；云请求失败不得静默回退写本地。

## Review Focus

- 未配置 Supabase 时旧版家庭和陪诊师演示都继续工作，且显示本地模式提示。
- 任一敏感表缺 RLS/访问策略时，schema contract test 失败。
- 普通用户不得改自己的角色或审核状态。
- 需求公开流不含患者称呼和完整注意事项；详情只对家庭成员及订单指定陪诊师可见。
- 并发报名/确认不能生成重复订单；确认顺序必须保留双方确认。

### Task 1: 数据库 schema 与安全策略

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202611050001_kangban_cloud_core.sql`
- Create: `tests/schema-contract.test.js`

**Produces:** 17 张业务表、索引、RLS、私有 Storage bucket/策略；`apply_to_demand`、`confirm_post_signup`、`respond_companion_order` 等事务 RPC；profile 新用户初始化触发器。

- [ ] 先写 schema contract tests：表数和表名、每表 RLS、Storage bucket 私有、RPC 存在、role 更新限制。
- [ ] 运行测试确认因迁移文件缺失而失败。
- [ ] 编写 migration；业务表包括 `profiles`、`families`、`family_memberships`、`family_members`、`escort_profiles`、`body_metrics`、`daily_entries`、`medical_encounters`、`medical_records`、`insurance_policies`、`reimbursements`、`attachments`、`community_posts`、`community_post_details`、`post_signups`、`companion_orders`、`migration_runs`。
- [ ] 将 Pink 的任务分享码摘要、有效期、撤销时间、范围和访问记录字段纳入 `companion_orders`，确保既有能力可迁移且保持 17 表约束。
- [ ] 为家庭资料、社区摘要/详情、报名、订单、附件分别建立最小权限策略；用户角色/审核状态只能由受控 trigger/RPC 维护。
- [ ] 运行 schema contract tests；若本机 Supabase CLI 与 Docker 可用，再运行迁移 reset 和 pgTAP RLS 用例。

### Task 2: API 适配层与本地降级

**Files:**
- Create: `api.js`
- Create: `tests/api.test.js`

**Interface:** `window.KangbanAPI` 提供 `mode`、`isCloudEnabled()`、`select(table, query)`、`insert(table, row)`、`update(table, id, patch)`、`remove(table, id)`、`rpc(name, args)`、`uploadPrivateFile(file, path)`、`withLoading(label, fn)`。

- [ ] 先为无配置时的 `kangban-demo-v7` 本地兼容、状态事件、CRUD 与错误格式写测试并看见预期失败。
- [ ] 为 Supabase mock client 的成功/失败映射写测试。
- [ ] 实现安全配置读取、表名白名单、Supabase CRUD/RPC/Storage 调用和错误归一化。
- [ ] 仅在“未配置”时降级本地；云端操作错误返回可见失败，不做本地双写。
- [ ] 运行 API tests。

### Task 3: M1 可运行接入与回归

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `service-worker.js`

- [ ] 增加 API 客户端脚本入口和非阻断的本地模式提示；不改现有五个家庭 Tab 或 Pink 页面结构。
- [ ] 更新 service worker cache version/assets。
- [ ] 用本地静态服务器打开应用，无 Supabase 配置仍可进入现有家庭/陪诊师演示。
- [ ] 运行 `node tests/api.test.js` 和现有 `node smoke.test.js`。
- [ ] 确认 `git diff --check` 无空白问题，检查浏览器控制台及本地模式状态。

### Task 4: M1 交付

- [ ] 记录 schema/API 结果、本地预览方式和远端 Supabase 尚需人工配置之处。
- [ ] 提交中文 commit：`feat: 建立康伴 Supabase 数据层与本地兼容适配`。
- [ ] 向用户交付 M1 检查点；未获新的指示前不进入 M2。
