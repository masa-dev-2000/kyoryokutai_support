-- 費目別予算枠(隊員 × 年度 × 費目)。活動費 200 万を費目別に配分し、費目間流用の早期検知に使う。
CREATE TABLE IF NOT EXISTS public.budget_allocations (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  fiscal_year     text not null,
  category        text not null,
  amount_limit    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, fiscal_year, category)
);

CREATE INDEX IF NOT EXISTS idx_budget_alloc_user ON public.budget_allocations(user_id, fiscal_year);

-- RLS(009 と同じ app_* ヘルパーを使用)
alter table public.budget_allocations enable row level security;

-- 参照:隊員=自分の枠 / 役場=管轄隊員 / 管理者=自治体内
create policy budget_allocations_select on public.budget_allocations for select using (
  municipality_id = app_current_municipality_id()
  and (user_id = app_current_user_id() or app_is_manager_for(user_id) or app_is_admin())
);

-- 変更:管理者のみ(自治体内)
create policy budget_allocations_write on public.budget_allocations for all using (
  app_is_admin() and municipality_id = app_current_municipality_id()
) with check (
  app_is_admin() and municipality_id = app_current_municipality_id()
);
