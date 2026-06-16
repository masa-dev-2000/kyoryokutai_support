-- ============================================================
-- 011 3層モデルへの移行(ADR-021 / Issue #32)
--   daily_logs(日報) → activity_logs(活動記録) → expenses(経費)
--   経費を活動記録から独立させ、活動に紐づかない経費(備品・通信費等)を
--   第一級エンティティとして扱えるようにする。
-- ============================================================

-- 1. 日報(1日のまとめ)テーブルを新規作成
create table if not exists daily_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  municipality_id uuid not null references municipalities(id) on delete cascade,
  log_date        date not null,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, log_date)
);
create index if not exists daily_logs_user_date_idx on daily_logs(user_id, log_date desc);

-- 2. activity_logs に所属日報(nullable)を追加
alter table activity_logs
  add column if not exists daily_log_id uuid references daily_logs(id) on delete set null;
create index if not exists activity_logs_daily_idx on activity_logs(daily_log_id);

-- 3. expenses を活動記録から独立
--    - category: 経費カテゴリ(活動費/旅費/備品/消耗品/通信費/謝金/その他)
--    - daily_log_id: 日報に直接紐づく経費(nullable)
--    - source_activity_log_id は既存どおり nullable のまま(活動紐付けも任意)
alter table expenses
  add column if not exists category text not null default '活動費';
alter table expenses
  add column if not exists daily_log_id uuid references daily_logs(id) on delete set null;
create index if not exists expenses_daily_idx on expenses(daily_log_id);
