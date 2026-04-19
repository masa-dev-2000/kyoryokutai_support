-- ================================================================
-- Row Level Security ポリシー
-- 根拠: docs/07_non_functional.md §2、docs/08_technical_design.md §4
-- 原則: 隊員は自分のみ / 役場は担当のみ / 管理者は自治体内 / スーパーは全て
-- ================================================================

-- ================================================================
-- ヘルパ関数(auth schema に置く)
-- ================================================================

create or replace function auth.current_user_tenant_id()
returns uuid language sql stable security definer as $$
  select tenant_id from public.users where id = auth.uid()
$$;

create or replace function auth.current_user_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function auth.is_assigned_staff_of(p_member_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.staff_member_assignments
    where staff_id = auth.uid() and member_id = p_member_id
  )
$$;

-- ================================================================
-- users
-- ================================================================
alter table users enable row level security;

create policy users_self_select on users
  for select using (id = auth.uid());

create policy users_staff_tenant_select on users
  for select using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin', 'prefecture_staff')
    and tenant_id = auth.current_user_tenant_id()
  );

create policy users_super_admin_all on users
  for all using (auth.current_user_role() = 'super_admin');

create policy users_self_update on users
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.users where id = auth.uid())  -- role変更禁止
  );

-- ================================================================
-- tenants
-- ================================================================
alter table tenants enable row level security;

create policy tenants_read_own on tenants
  for select using (id = auth.current_user_tenant_id());

create policy tenants_read_parent on tenants
  for select using (
    id = (select parent_tenant_id from public.tenants where id = auth.current_user_tenant_id())
  );

create policy tenants_super_admin on tenants
  for all using (auth.current_user_role() = 'super_admin');

-- ================================================================
-- staff_member_assignments
-- ================================================================
alter table staff_member_assignments enable row level security;

create policy sma_read_involved on staff_member_assignments
  for select using (staff_id = auth.uid() or member_id = auth.uid());

create policy sma_admin_write on staff_member_assignments
  for all using (
    auth.current_user_role() in ('municipality_admin', 'super_admin')
  );

-- ================================================================
-- daily_logs
-- ================================================================
alter table daily_logs enable row level security;

create policy dl_member_own on daily_logs
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy dl_staff_read_assigned on daily_logs
  for select using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
    and auth.is_assigned_staff_of(user_id)
  );

create policy dl_admin_read_tenant on daily_logs
  for select using (
    auth.current_user_role() = 'municipality_admin'
    and tenant_id = auth.current_user_tenant_id()
  );

create policy dl_super_admin_all on daily_logs
  for all using (auth.current_user_role() = 'super_admin');

-- ================================================================
-- tags / daily_log_tags
-- ================================================================
alter table tags enable row level security;

create policy tags_read_global_or_tenant on tags
  for select using (
    is_global = true or tenant_id = auth.current_user_tenant_id()
  );

create policy tags_tenant_admin_write on tags
  for all using (
    auth.current_user_role() in ('municipality_admin', 'super_admin')
    and (tenant_id = auth.current_user_tenant_id() or tenant_id is null)
  );

alter table daily_log_tags enable row level security;

create policy dlt_follow_log on daily_log_tags
  for all using (
    exists (
      select 1 from public.daily_logs dl
      where dl.id = daily_log_tags.log_id
        and (
          dl.user_id = auth.uid()
          or (
            auth.current_user_role() in ('municipality_staff', 'municipality_admin')
            and (
              auth.is_assigned_staff_of(dl.user_id)
              or (auth.current_user_role() = 'municipality_admin'
                  and dl.tenant_id = auth.current_user_tenant_id())
            )
          )
        )
    )
  );

-- ================================================================
-- monthly_reports
-- ================================================================
alter table monthly_reports enable row level security;

create policy mr_member_own on monthly_reports
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy mr_staff_read_assigned on monthly_reports
  for select using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
    and auth.is_assigned_staff_of(user_id)
  );

create policy mr_staff_approve on monthly_reports
  for update using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
    and auth.is_assigned_staff_of(user_id)
  )
  with check (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
    and auth.is_assigned_staff_of(user_id)
  );

create policy mr_admin_read_tenant on monthly_reports
  for select using (
    auth.current_user_role() = 'municipality_admin'
    and tenant_id = auth.current_user_tenant_id()
  );

create policy mr_super_admin_all on monthly_reports
  for all using (auth.current_user_role() = 'super_admin');

-- ================================================================
-- announcements / targets / reads
-- ================================================================
alter table announcements enable row level security;

create policy ann_tenant_read on announcements
  for select using (tenant_id = auth.current_user_tenant_id());

create policy ann_staff_write on announcements
  for all using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
    and tenant_id = auth.current_user_tenant_id()
  );

alter table announcement_targets enable row level security;

create policy ann_targets_follow on announcement_targets
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.announcements a
      where a.id = announcement_targets.announcement_id
        and a.tenant_id = auth.current_user_tenant_id()
    )
  );

create policy ann_targets_staff_write on announcement_targets
  for all using (
    auth.current_user_role() in ('municipality_staff', 'municipality_admin')
  );

alter table announcement_reads enable row level security;

create policy ann_reads_self on announcement_reads
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ================================================================
-- chat_threads / messages
-- ================================================================
alter table chat_threads enable row level security;

create policy ct_participant_read on chat_threads
  for select using (
    participant_a = auth.uid() or participant_b = auth.uid()
  );

create policy ct_participant_write on chat_threads
  for insert with check (
    participant_a = auth.uid() or participant_b = auth.uid()
  );

alter table messages enable row level security;

create policy msg_participant_read on messages
  for select using (
    exists (
      select 1 from public.chat_threads ct
      where ct.id = messages.thread_id
        and (ct.participant_a = auth.uid() or ct.participant_b = auth.uid())
    )
  );

create policy msg_sender_insert on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chat_threads ct
      where ct.id = messages.thread_id
        and (ct.participant_a = auth.uid() or ct.participant_b = auth.uid())
    )
  );

create policy msg_recipient_mark_read on messages
  for update using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.chat_threads ct
      where ct.id = messages.thread_id
        and (ct.participant_a = auth.uid() or ct.participant_b = auth.uid())
    )
  );

-- ================================================================
-- audit_logs: super_admin のみ読み、insert はサーバー経由のみ
-- ================================================================
alter table audit_logs enable row level security;

create policy audit_super_admin_read on audit_logs
  for select using (auth.current_user_role() = 'super_admin');

create policy audit_self_read on audit_logs
  for select using (user_id = auth.uid());

-- insert は service_role キー経由のみ許可(クライアントからは書かない)
