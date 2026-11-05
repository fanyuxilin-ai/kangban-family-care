-- 报名附言 + 简历：陪诊师报名时上传自我介绍与简历/资质材料，家庭据此判断是否选择
alter table public.post_signups add column if not exists resume_path text;

-- apply_to_demand 支持简历附件（重复报名保留旧简历除非重新上传）
create or replace function public.apply_to_demand(p_post_id uuid, p_note text default '', p_resume_path text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_signup uuid;
begin
  if not public.is_active_escort() then raise exception '陪诊师账号尚未审核通过'; end if;
  perform 1 from public.community_posts p where p.id=p_post_id and p.type='demand' and p.status in ('open','has_applicants') for update;
  if not found then raise exception '需求已关闭或不存在'; end if;
  if p_resume_path is not null and split_part(p_resume_path,'/',1) <> 'resumes' then raise exception '简历路径不合法'; end if;
  insert into public.post_signups(post_id,escort_id,note,resume_path,status)
  values(p_post_id,(select auth.uid()),coalesce(p_note,''),p_resume_path,'applied')
  on conflict(post_id,escort_id) do update
    set note=excluded.note, resume_path=coalesce(excluded.resume_path,public.post_signups.resume_path), status='applied', updated_at=now()
  returning id into v_signup;
  update public.community_posts set status='has_applicants',updated_at=now() where id=p_post_id and status='open';
  return v_signup;
end $$;

-- 简历文件可见性：报名者本人 或 该报名所属需求的家庭成员
create or replace function public.can_view_resume_file(object_name text)
returns boolean language sql security definer set search_path='' stable as $$
  select coalesce((
    select true from public.post_signups s
    join public.community_posts p on p.id = s.post_id
    where s.resume_path = object_name
      and (s.escort_id = auth.uid() or public.is_family_member(p.family_id))
    limit 1), false);
$$;

drop policy if exists kangban_storage_insert_escort_resume on storage.objects;
create policy kangban_storage_insert_escort_resume on storage.objects for insert
with check (
  bucket_id = 'kangban-private'
  and split_part(name,'/',1) = 'resumes'
  and split_part(name,'/',2) = auth.uid()::text
);

drop policy if exists kangban_storage_read_resume_participants on storage.objects;
create policy kangban_storage_read_resume_participants on storage.objects for select
using (
  bucket_id = 'kangban-private'
  and split_part(name,'/',1) = 'resumes'
  and (split_part(name,'/',2) = auth.uid()::text or public.can_view_resume_file(name))
);
