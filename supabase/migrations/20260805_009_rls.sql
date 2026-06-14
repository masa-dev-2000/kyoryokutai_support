-- ============================================================
-- 009 RLS(載せ替え 10 か条 #3)
-- auth.uid() に依存せず current_setting('app.current_user_id') を使う。
-- アプリ層(Repository)は接続後に必ず次を発行する:
--   SET LOCAL app.current_user_id = '<uuid>';
-- これにより Supabase Auth / Cognito どちらでも同じ RLS が動く。
-- ============================================================

-- ヘルパー関数 --------------------------------------------------
create or replace function app_current_user_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

create or replace function app_current_municipality_id() returns uuid
language sql stable as $$
  select municipality_id from users where id = app_current_user_id();
$$;

create or replace function app_current_role() returns text
language sql stable as $$
  select role from users where id = app_current_user_id();
$$;

create or replace function app_is_admin() returns boolean
language sql stable as $$
  select coalesce(app_current_role() = 'admin', false);
$$;

create or replace function app_is_manager_for(target_member uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from assignments
    where staff_id = app_current_user_id() and member_id = target_member
  );
$$;

-- RLS 有効化 ----------------------------------------------------
alter table activity_logs   enable row level security;
alter table expenses        enable row level security;
alter table monthly_reports enable row level security;
alter table approvals       enable row level security;
alter table assignments     enable row level security;
alter table announcements   enable row level security;
alter table audit_logs      enable row level security;
alter table cases_public    enable row level security;

-- 1. activity_logs:隊員=自分 / 役場=管轄 / 管理者=自治体全員
create policy activity_logs_select on activity_logs for select using (
  municipality_id = app_current_municipality_id()
  and (user_id = app_current_user_id() or app_is_manager_for(user_id) or app_is_admin())
);
create policy activity_logs_write on activity_logs for all using (
  user_id = app_current_user_id()
) with check (
  user_id = app_current_user_id() and municipality_id = app_current_municipality_id()
);

-- 2. expenses:同上(本人 / 管轄 / 管理者)
create policy expenses_select on expenses for select using (
  municipality_id = app_current_municipality_id()
  and (user_id = app_current_user_id() or app_is_manager_for(user_id) or app_is_admin())
);
create policy expenses_write on expenses for all using (
  user_id = app_current_user_id() or app_is_admin()
) with check (
  municipality_id = app_current_municipality_id()
);

-- 3. monthly_reports:同上
create policy monthly_reports_select on monthly_reports for select using (
  municipality_id = app_current_municipality_id()
  and (user_id = app_current_user_id() or app_is_manager_for(user_id) or app_is_admin())
);
create policy monthly_reports_write on monthly_reports for all using (
  user_id = app_current_user_id() or app_is_admin()
) with check (
  municipality_id = app_current_municipality_id()
);

-- 4. approvals:起票者 / 決裁者 / 管理者
create policy approvals_select on approvals for select using (
  municipality_id = app_current_municipality_id()
  and (applicant_id = app_current_user_id() or approver_id = app_current_user_id() or app_is_admin())
);
create policy approvals_write on approvals for all using (
  municipality_id = app_current_municipality_id()
  and (approver_id = app_current_user_id() or app_is_admin())
);

-- 5. assignments:自治体内のみ
create policy assignments_select on assignments for select using (
  municipality_id = app_current_municipality_id()
);

-- 6. announcements:送信者 / 受信対象 / 管理者
create policy announcements_select on announcements for select using (
  municipality_id = app_current_municipality_id()
  and (sender_id = app_current_user_id()
       or app_current_user_id() = any(target_user_ids)
       or app_is_admin())
);

-- 7. audit_logs:本人 + 管理者
create policy audit_logs_select on audit_logs for select using (
  actor_id = app_current_user_id() or app_is_admin()
);

-- 8. cases_public:レビュー完了済は全テナント参照可。下書きは原著/同自治体のみ。
create policy cases_public_select on cases_public for select using (
  anonymized_by_review = true
  or source_user_id = app_current_user_id()
  or source_municipality_id = app_current_municipality_id()
);
