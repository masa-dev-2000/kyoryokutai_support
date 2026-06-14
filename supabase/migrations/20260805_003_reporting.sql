-- ============================================================
-- 003 Reporting(docs/22 サブシステム C)
-- ============================================================

create table monthly_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  municipality_id uuid not null references municipalities(id) on delete cascade,
  year_month      text not null,                -- 'YYYY-MM'
  status          text not null default 'draft'
                    check (status in ('draft','submitted','approved','rejected')),
  status_label    text,
  summary         text,
  sections        jsonb,                        -- [{title, body}]
  plan_next       text,
  activity_count  integer not null default 0,
  total_hours     numeric(6,1) not null default 0,
  total_expense   integer not null default 0,
  submitted_at    timestamptz,
  ai_generated_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, year_month)
);
create index monthly_reports_muni_status_idx on monthly_reports(municipality_id, status);
