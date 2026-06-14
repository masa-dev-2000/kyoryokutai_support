-- ============================================================
-- 002 Activity Recording(docs/22 サブシステム B)
-- ============================================================

-- 活動内容テンプレ(隊員固有)------------------------------------
create table activity_topics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name            text not null,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (user_id, name)
);

-- プロジェクト(計画→進行→完了。完了+公開で事例化)----------------
create table projects (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references users(id) on delete cascade,
  municipality_id        uuid not null references municipalities(id) on delete cascade,
  name                   text not null,
  goal                   text,
  background             text,
  plan                   text,
  kpi                    text,
  period_start           date,
  period_end             date,
  budget                 integer,
  risk                   text,
  status                 text not null default 'planning'
                           check (status in ('planning','active','completed')),
  is_public              boolean not null default false,
  disclose_name_override boolean,               -- NULL = users.disclose_name_in_cases に従う
  anonymized_case_id     uuid,                  -- cases_public(id)。007 作成後に FK 追加
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index projects_user_idx on projects(user_id, status);

-- 活動ログ(occurred_at が正典。日付/時刻は repository で導出)-------
create table activity_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  municipality_id uuid not null references municipalities(id) on delete cascade,
  project_id      uuid references projects(id) on delete set null,
  activity_type   text not null,
  topic           text not null,
  hours           numeric(4,1) not null default 0,
  distance_km     numeric(6,1),                 -- 車での移動距離(ADR / MUST)
  body            text not null default '',
  occurred_at     timestamptz not null,
  expense_amount  integer,                      -- 表示用キャッシュ(正典は expenses.amount_settled)
  photo_paths     text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index activity_logs_user_date_idx on activity_logs(user_id, occurred_at desc);
create index activity_logs_muni_date_idx on activity_logs(municipality_id, occurred_at desc);
