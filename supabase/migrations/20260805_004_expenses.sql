-- ============================================================
-- 004 Expense(docs/22 サブシステム D、ADR-014 二系統動線+親子)
-- ============================================================

create table expenses (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references users(id) on delete cascade,
  municipality_id        uuid not null references municipalities(id) on delete cascade,
  project_id             uuid references projects(id) on delete set null,
  expense_kind           text not null default 'single'
                           check (expense_kind in ('single','trip_parent','trip_receipt')),
  parent_expense_id      uuid references expenses(id) on delete cascade,
  source_activity_log_id uuid references activity_logs(id) on delete set null,
  source_receipt_index   integer,
  title                  text not null,
  amount_requested       integer not null default 0,
  amount_settled         integer,
  purpose                text not null default '',
  status                 text not null default '申請中',
  period_start           date,
  period_end             date,
  payee                  text,
  paid_date              date,
  receipt_path           text,
  has_receipt            boolean not null default false,
  settle_note            text,
  ai_note                text,
  citations              jsonb,                 -- [{source, quote}]
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index expenses_user_status_idx   on expenses(user_id, status);
create index expenses_muni_status_idx   on expenses(municipality_id, status);
create index expenses_parent_idx        on expenses(parent_expense_id);

-- 二重申請防止(ADR-014):同一日報の同一インデックスは 1 件のみ
create unique index expenses_source_uidx
  on expenses(source_activity_log_id, source_receipt_index)
  where source_activity_log_id is not null;

-- 親(trip_parent)の amount_settled を子合計で自動更新(docs/21 §6.10)
create or replace function update_parent_settled() returns trigger
language plpgsql as $$
begin
  if new.expense_kind = 'trip_receipt' and new.parent_expense_id is not null then
    update expenses set amount_settled = (
      select coalesce(sum(amount_settled), 0)
      from expenses
      where parent_expense_id = new.parent_expense_id
        and status in ('精算済','承認')
    ) where id = new.parent_expense_id;
  end if;
  return new;
end;
$$;

create trigger trg_update_parent_settled
  after insert or update on expenses
  for each row execute function update_parent_settled();
