// v5 データモデル(docs/22)の SQLite 実装。
// PoC ローカル用。Postgres/Supabase へ移す際は型と RLS を移植する。

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS municipalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  annual_budget INTEGER NOT NULL DEFAULT 2000000,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS host_organizations (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT,
  contact_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  host_organization_id TEXT,
  organization_type TEXT NOT NULL DEFAULT 'member',
  role TEXT NOT NULL,                 -- member | manager | admin
  name TEXT NOT NULL,
  email TEXT,
  role_label TEXT,                    -- 隊員: 役割(移住促進 等)
  title TEXT,                         -- 役場職員: 役職
  department TEXT,                    -- 役場職員: 所属課
  term TEXT,                          -- 隊員: 任期
  started_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  approval_route_id TEXT,
  disclose_name_in_cases INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);


-- ADR-021: 日報(1日のまとめ)。活動記録・経費の上位エンティティ。
CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  municipality_id TEXT NOT NULL,
  log_date TEXT NOT NULL,
  note TEXT,
  distance_km REAL,           -- 日報レベルの移動距離
  expense_amount INTEGER,     -- 日報レベルの経費合計キャッシュ
  feeling_score INTEGER,      -- 今日の手応え(1=😴〜4=🔥)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  municipality_id TEXT NOT NULL,
  project_id TEXT,
  daily_log_id TEXT,                       -- ADR-021: 所属する日報(nullable)
  activity_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  hours REAL NOT NULL DEFAULT 0,
  body TEXT NOT NULL DEFAULT '',
  log_date TEXT NOT NULL,
  log_time TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS monthly_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  municipality_id TEXT NOT NULL,
  year_month TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',   -- draft | submitted | approved | rejected
  status_label TEXT,
  summary TEXT,
  sections TEXT,                          -- JSON [{title,body}]
  plan_next TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  municipality_id TEXT NOT NULL,
  project_id TEXT,
  expense_kind TEXT NOT NULL DEFAULT 'single',  -- single | trip_parent | trip_receipt
  category TEXT NOT NULL DEFAULT '活動費',       -- ADR-021: 経費カテゴリ(活動費/備品/通信費 等)
  parent_expense_id TEXT,
  source_activity_log_id TEXT,                  -- ADR-021: 活動に紐づく経費(nullable)
  daily_log_id TEXT,                            -- ADR-021: 日報に紐づく経費(nullable)
  source_receipt_index INTEGER,
  title TEXT NOT NULL,
  amount_requested INTEGER NOT NULL DEFAULT 0,
  amount_settled INTEGER,
  purpose TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '申請中',
  period_start TEXT,
  period_end TEXT,
  payee TEXT,
  paid_date TEXT,
  has_receipt INTEGER NOT NULL DEFAULT 0,
  settle_note TEXT,
  ai_note TEXT,
  citations TEXT,                               -- JSON [{source,quote}]
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approval_routes (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,                  -- 経費 | 月次報告 | 活動相談
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approval_route_steps (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  step_no INTEGER NOT NULL,
  approver_type TEXT NOT NULL,         -- dept | host_org | admin
  approver_label TEXT NOT NULL,
  department TEXT,
  host_organization_id TEXT
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  kind TEXT NOT NULL,                  -- 経費 | 月次報告 | 活動相談
  applicant_id TEXT,
  member_name TEXT NOT NULL,
  title TEXT NOT NULL,
  ai TEXT,
  citations TEXT,                      -- JSON [{source,quote}]
  detail TEXT,                         -- JSON (kind 別)
  route_name TEXT NOT NULL DEFAULT '',
  steps TEXT NOT NULL DEFAULT '[]',    -- JSON ApprovalStep[]
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  target_table TEXT,
  target_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  host_organization_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  kind TEXT NOT NULL DEFAULT 'info',   -- info | rule | qa
  is_pinned INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_user_ids TEXT,                -- JSON string[]
  target_count INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  read_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE TABLE IF NOT EXISTS cases_public (
  id TEXT PRIMARY KEY,
  source_municipality_id TEXT,
  source_user_id TEXT,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  prefecture TEXT,
  year TEXT NOT NULL,
  author TEXT NOT NULL,
  disclose_author INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  kpi TEXT,
  effect TEXT,
  process TEXT,                        -- JSON [{phase,body}]
  learning TEXT,
  trend_count INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS guidelines (
  id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  source TEXT NOT NULL,
  section TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  municipality_id TEXT,
  context_kind TEXT NOT NULL,
  input_text TEXT,
  output_text TEXT,
  adopted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_logs_user_date ON activity_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_muni ON approvals(municipality_id, status);
CREATE INDEX IF NOT EXISTS idx_ann_muni ON announcements(municipality_id, sent_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_source
  ON expenses(source_activity_log_id, source_receipt_index)
  WHERE source_activity_log_id IS NOT NULL;
`;
