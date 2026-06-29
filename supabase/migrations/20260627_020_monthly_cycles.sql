-- ADR-024: 任期ビジョン + 月次サイクル(隊員側、独立フィーチャー)
-- 活動報告/月次報告書とは疎結合。FK で固く結ばず、比較は別フィーチャーが両者を読む。

create table if not exists visions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists monthly_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  municipality_id uuid not null,
  year_month text not null,
  monthly_goal text,
  action_plan jsonb not null default '[]'::jsonb,   -- [{week,title,actions[],expectedOutcome,checkPoint}]
  intake jsonb,                                      -- {theme,level,daysPerWeek,specialPlans}
  reflection text,
  status text not null default 'planning',           -- planning | active | done
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year_month)
);

create index if not exists idx_monthly_cycles_user on monthly_cycles (user_id, year_month desc);
