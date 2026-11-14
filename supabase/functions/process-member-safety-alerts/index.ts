const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const cors = { ...corsHeaders, 'Content-Type': 'application/json' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors })

function deliveryConfig() {
  const endpoint = Deno.env.get('SAFETY_ALERT_EMAIL_ENDPOINT') || 'https://api.resend.com/emails'
  const apiKey = Deno.env.get('SAFETY_ALERT_EMAIL_API_KEY') || ''
  const from = Deno.env.get('SAFETY_ALERT_EMAIL_FROM') || ''
  const cronToken = Deno.env.get('SAFETY_ALERT_CRON_TOKEN') || ''
  const appUrl = Deno.env.get('KANGBAN_APP_URL') || 'https://kangban.netlify.app'
  const explicitlyReady = Deno.env.get('SAFETY_ALERT_DELIVERY_READY') === 'true'
  let secureEndpoint = false
  let secureAppUrl = false
  try { secureEndpoint = new URL(endpoint).protocol === 'https:' } catch { /* invalid endpoint */ }
  try { secureAppUrl = new URL(appUrl).protocol === 'https:' } catch { /* invalid app URL */ }
  return { endpoint, apiKey, from, appUrl, ready: explicitlyReady && !!apiKey && !!from && !!cronToken && secureEndpoint && secureAppUrl }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const config = deliveryConfig()
  let body: { action?: string } = {}
  try { body = await request.json() } catch { return json({ error: 'invalid_json' }, 400) }
  if (body.action === 'status') return json({ ready: config.ready, reason: config.ready ? null : 'email_delivery_not_verified' })

  const cronToken = Deno.env.get('SAFETY_ALERT_CRON_TOKEN') || ''
  if (!cronToken || request.headers.get('Authorization') !== `Bearer ${cronToken}`) return json({ error: 'unauthorized' }, 401)
  if (!config.ready) return json({ error: 'email_delivery_not_verified' }, 503)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) return json({ error: 'supabase_server_credentials_missing' }, 500)
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
  const claimResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/claim_due_member_safety_alerts`, {
    method: 'POST', headers, body: JSON.stringify({ p_now: new Date().toISOString() }),
  })
  if (!claimResponse.ok) return json({ error: 'claim_failed', status: claimResponse.status }, 502)
  const notifications = await claimResponse.json() as Array<Record<string, unknown>>

  let sent = 0
  let failed = 0
  for (const notification of notifications) {
    const notificationId = String(notification.notification_id || '')
    const email = String(notification.recipient_email || '')
    const memberLabel = String(notification.member_label || '家庭成员')
    const lastSignalAt = notification.last_signal_at ? new Date(String(notification.last_signal_at)).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '未知'
    const kind = notification.notification_kind === 'follow_up' ? '跟进提醒' : '平安提醒'
    const member = escapeHtml(memberLabel)
    const text = `康伴${kind}\n${memberLabel} 已超过 48 小时没有新的平安信号。最后信号：${lastSignalAt}。请尽快联系核实。\n登录家庭账号查看：${config.appUrl}\n未收到信号不代表发生意外。`
    const html = `<p>康伴${kind}</p><p><b>${member}</b> 已超过 48 小时没有新的平安信号。</p><p>最后信号：${escapeHtml(lastSignalAt)}</p><p>请尽快联系核实。<a href="${escapeHtml(config.appUrl)}">登录康伴家庭账号查看</a></p><p>未收到信号不代表发生意外。</p>`
    let success = false
    let providerMessageId = ''
    let errorCode = 'email_provider_error'
    try {
      if (!email.includes('@')) throw new Error('invalid_recipient')
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)
      const response = await fetch(config.endpoint, {
        method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': notificationId },
        body: JSON.stringify({ from: config.from, to: [email], subject: `康伴家庭${kind}`, text, html }), signal: controller.signal,
      }).finally(() => clearTimeout(timeout))
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(`provider_${response.status}`)
      success = true
      providerMessageId = String(result.id || '')
    } catch (error) {
      errorCode = error instanceof Error ? error.message.slice(0, 80) : 'email_provider_error'
    }
    const completeResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/complete_member_safety_notification`, {
      method: 'POST', headers,
      body: JSON.stringify({ p_notification_id: notificationId, p_success: success, p_provider_message_id: providerMessageId, p_error_code: success ? null : errorCode }),
    })
    if (!completeResponse.ok) failed += 1
    else if (success) sent += 1
    else failed += 1
  }
  return json({ claimed: notifications.length, sent, failed })
})
