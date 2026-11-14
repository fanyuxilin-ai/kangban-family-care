-- The five-minute job is harmless until both Vault secrets exist; it then becomes active automatically.
-- Required Vault names: kangban_safety_project_url, kangban_safety_cron_token.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname='kangban-member-safety-alerts') then
    perform cron.unschedule('kangban-member-safety-alerts');
  end if;
  perform cron.schedule('kangban-member-safety-alerts','*/5 * * * *',$job$
    with safety_secrets as (
      select
        max(decrypted_secret) filter (where name='kangban_safety_project_url') as project_url,
        max(decrypted_secret) filter (where name='kangban_safety_cron_token') as cron_token
      from vault.decrypted_secrets
      where name in ('kangban_safety_project_url','kangban_safety_cron_token')
    )
    select net.http_post(
      url := safety_secrets.project_url || '/functions/v1/process-member-safety-alerts',
      headers := jsonb_build_object(
        'Authorization','Bearer ' || safety_secrets.cron_token,
        'Content-Type','application/json'
      ),
      body := '{"action":"process"}'::jsonb
    ) from safety_secrets
    where safety_secrets.project_url is not null and safety_secrets.cron_token is not null
  $job$);
end;
$$;
