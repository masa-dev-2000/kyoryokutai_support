-- ================================================================
-- 地域おこし協力隊サポートシステム
-- 初期マイグレーション: テーブル定義
-- 根拠: docs/08_technical_design.md §3
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ================================================================
-- tenants: 自治体・県
-- ================================================================
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('municipality', 'prefecture')),
  parent_tenant_id uuid references tenants(id) on delete set null,
  region text,
  created_at timestamptz not null default now()
);

create index tenants_parent_idx on tenants(parent_tenant_id);

-- ================================================================
-- users: Supabase Auth と同一 ID
-- ================================================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  tenant_id uuid not null references tenants(id) on delete restrict,
  role text not null check (role in (
    'member', 'municipality_staff', 'municipality_admin',
    'prefecture_staff', 'super_admin'
  )),
  assigned_at date,
  term_end_at date,
  anonymize_opt_in boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'retired', 'suspended')),
  created_at timestamptz not null default now()
);

create index users_tenant_idx on users(tenant_id);
create index users_role_idx on users(role);

-- ================================================================
-- staff_member_assignments: 役場担当 ⇔ 隊員
-- ================================================================
create table staff_member_assignments (
  staff_id uuid not null references users(id) on delete cascade,
  member_id uuid not null references users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (staff_id, member_id)
);

create index sma_member_idx on staff_member_assignments(member_id);

-- ================================================================
-- daily_logs: 日報
-- ================================================================
create table daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete restrict,
  log_date date not null,
  body_md text not null default '',
  voice_url text,
  image_urls text[] not null default '{}',
  status text not null default 'saved' check (status in ('draft', 'saved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_logs_user_date_idx on daily_logs(user_id, log_date desc);
create index daily_logs_tenant_idx on daily_logs(tenant_id);
create index daily_logs_body_trgm_idx on daily_logs using gin (body_md gin_trgm_ops);

-- ================================================================
-- tags: 活動タグ
-- ================================================================
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'activity'
    check (category in ('policy', 'activity', 'custom')),
  is_global boolean not null default false,
  tenant_id uuid references tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table daily_log_tags (
  log_id uuid not null references daily_logs(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (log_id, tag_id)
);

create index dlt_tag_idx on daily_log_tags(tag_id);

-- ================================================================
-- monthly_reports: 月次報告
-- ================================================================
create table monthly_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete restrict,
  year_month text not null,  -- 'YYYY-MM'
  draft_md text,
  edited_md text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'rejected')),
  ai_generated_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references users(id) on delete set null,
  reviewer_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year_month)
);

create index mr_user_ym_idx on monthly_reports(user_id, year_month desc);
create index mr_tenant_status_idx on monthly_reports(tenant_id, status);

-- ================================================================
-- announcements: お知らせ
-- ================================================================
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  author_id uuid not null references users(id) on delete restrict,
  title text not null,
  body_md text not null,
  target_scope text not null default 'all' check (target_scope in ('all', 'selected')),
  created_at timestamptz not null default now()
);

create index ann_tenant_idx on announcements(tenant_id, created_at desc);

create table announcement_targets (
  announcement_id uuid not null references announcements(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (announcement_id, user_id)
);

create table announcement_reads (
  announcement_id uuid not null references announcements(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

-- ================================================================
-- chat: 1対1スレッドとメッセージ
-- ================================================================
create table chat_threads (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  participant_a uuid not null references users(id) on delete cascade,
  participant_b uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (participant_a, participant_b),
  check (participant_a < participant_b)  -- 一意性のため正規化
);

create index ct_participants_idx on chat_threads(participant_a, participant_b);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_id uuid not null references users(id) on delete restrict,
  body text not null default '',
  image_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_thread_created_idx on messages(thread_id, created_at desc);

-- ================================================================
-- audit_logs: 監査ログ
-- ================================================================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  role text,
  action text not null,
  resource_type text,
  resource_id uuid,
  ip_hash text,
  user_agent text,
  result text not null check (result in ('success', 'denied', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_tenant_created_idx on audit_logs(tenant_id, created_at desc);
create index audit_user_created_idx on audit_logs(user_id, created_at desc);
create index audit_action_idx on audit_logs(action);

-- ================================================================
-- trigger: updated_at の自動更新
-- ================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_logs_set_updated_at
  before update on daily_logs
  for each row execute function set_updated_at();

create trigger monthly_reports_set_updated_at
  before update on monthly_reports
  for each row execute function set_updated_at();
