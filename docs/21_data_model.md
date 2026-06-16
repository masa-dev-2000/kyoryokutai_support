# データモデル仕様書 v1.0

> 対象: `src/lib/db/schema.ts`(PoC SQLite)・`supabase/migrations/`(本番 Postgres)・`src/lib/api/mappers.ts`
> 最終更新: 2026-06-16

---

## 1. 全体概要

### エンティティ一覧

| # | テーブル名 | 概要 | サブシステム |
|---|---|---|---|
| 1 | `municipalities` | 自治体(テナント) | A: Identity |
| 2 | `host_organizations` | 受入団体(農業法人・観光協会等) | A: Identity |
| 3 | `users` | 隊員 / 役場職員 / 管理者 | A: Identity |
| 4 | `assignments` | 職員 ↔ 隊員 担当割当 | A: Identity |
| 5 | `activity_topics` | 活動内容テンプレ(隊員固有) | B: 活動記録 |
| 6 | `projects` | プロジェクト(計画→進行→完了。完了+公開=事例) | B: 活動記録 |
| 7 | `daily_logs` | 日報(1日のまとめ。ADR-021) | B: 活動記録 |
| 8 | `activity_logs` | 活動記録(日報の子) | B: 活動記録 |
| 9 | `monthly_reports` | 月次報告書(AI 生成) | C: 報告 |
| 10 | `expenses` | 経費申請(活動記録 or 日報に紐付け可) | D: 経費 |
| 11 | `approval_routes` | 承認ルート定義 | E: 承認フロー |
| 12 | `approval_route_steps` | 承認ルートのステップ | E: 承認フロー |
| 13 | `approvals` | 承認申請インスタンス | E: 承認フロー |
| 14 | `announcements` | お知らせ(役場→隊員) | F: コミュニケーション |
| 15 | `announcement_reads` | 既読トラッキング | F: コミュニケーション |
| 16 | `consultations` | AI 相談ログ | G: AI アシスト |
| 17 | `cases_public` | 全国事例(匿名化済み) | H: ナレッジ |
| 18 | `guidelines` | 自治体ガイドライン(経費判定 RAG 用) | H: ナレッジ |
| 19 | `audit_logs` | 監査ログ | I: 監査 |

### テキスト ER 図

```
municipalities
  ├── host_organizations (municipality_id)
  │     └── users (host_organization_id, オプション)
  ├── users (municipality_id)
  │     ├── approval_route_id → approval_routes
  │     ├── activity_topics (user_id)
  │     ├── projects (user_id)
  │     │     └── anonymized_case_id → cases_public
  │     ├── daily_logs (user_id)          ← ADR-021
  │     │     ├── activity_logs (daily_log_id, nullable)
  │     │     └── expenses (daily_log_id, nullable)
  │     ├── activity_logs (user_id)
  │     │     ├── project_id → projects
  │     │     └── expenses (source_activity_log_id, nullable)
  │     ├── expenses (user_id)
  │     │     └── parent_expense_id → expenses (自己参照)
  │     ├── monthly_reports (user_id)
  │     ├── assignments_as_staff (staff_id)
  │     └── assignments_as_member (member_id)
  ├── approval_routes (municipality_id)
  │     └── approval_route_steps (route_id)
  ├── approvals (municipality_id)
  ├── announcements (municipality_id)
  │     └── announcement_reads (announcement_id)
  └── consultations (municipality_id)

cases_public (全自治体共有)
guidelines (municipality_id)
audit_logs (municipality_id, actor_id)
```

---

## 2. 3層モデル(ADR-021 / Issue #32)

マイグレーション `20260616_011_daily_logs.sql` で導入。

```
daily_logs          ← 日報(1日1件、ユーザーごとに UNIQUE)
  │
  ├── activity_logs (daily_log_id, nullable)
  │     └── 1件の活動記録(時間・テーマ・本文)
  │           └── expenses (source_activity_log_id, nullable)
  │                 └── 活動に紐づく経費(交通費・材料費など)
  │
  └── expenses (daily_log_id, nullable)
        └── 活動に紐づかない経費(備品・通信費・謝金など)
```

### ポイント

- `daily_logs` は「その日の日報」として 1 日 1 行を保証(`UNIQUE(user_id, log_date)`)
- `activity_logs.daily_log_id` は nullable。日報を経由せず直接投入された活動記録も許容する
- `expenses` は 2 つの上位エンティティのいずれかに紐づける(どちらも NULL も可)
  - `source_activity_log_id`: 活動記録由来の経費
  - `daily_log_id`: 活動に紐づかない日報レベルの経費(備品・通信費等)
- 旅費は親子モデル(`expense_kind = 'trip_parent'` / `'trip_receipt'`)で管理。子の精算額合計を `update_parent_settled()` トリガーで親の `amount_settled` へ自動反映

---

## 3. 各エンティティ詳細

### 3.1 municipalities(自治体)

| カラム | 型(Postgres) | 型(SQLite) | 制約・デフォルト | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | gen_random_uuid() | テナント ID |
| `name` | text | TEXT | NOT NULL | 自治体名 |
| `prefecture` | text | TEXT | NOT NULL | 都道府県名 |
| `annual_budget` | integer | INTEGER | DEFAULT 2000000 | 年間活動費予算(円) |
| `settings` | jsonb | ─ | DEFAULT '{}' | (Postgres のみ)自治体固有設定 |
| `created_at` | timestamptz | TEXT | DEFAULT now() | 作成日時 |

---

### 3.2 host_organizations(受入団体)

| カラム | 型(Postgres) | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `name` | text | NOT NULL | 団体名 |
| `kind` | text | nullable | 団体種別(農業法人・観光協会等) |
| `contact_user_id` | uuid | FK → users (循環回避で後付け FK) | 窓口担当者 |
| `created_at` | timestamptz | | |

---

### 3.3 users(ユーザー)

| カラム | 型(Postgres) | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | 本番は auth.users.id と一致 | |
| `municipality_id` | uuid | FK → municipalities, RESTRICT | |
| `host_organization_id` | uuid | FK → host_organizations, SET NULL, nullable | 受入団体所属 |
| `organization_type` | text | CHECK('member','municipality','host_org') DEFAULT 'member' | 所属区分 |
| `role` | text | CHECK('member','manager','admin') NOT NULL | 隊員/役場職員/管理者 |
| `name` | text | NOT NULL | 氏名 |
| `email` | text | UNIQUE, nullable | メールアドレス |
| `role_label` | text | nullable | 隊員向け: 役割ラベル(例: 移住促進) |
| `title` | text | nullable | 役場職員向け: 役職 |
| `department` | text | nullable | 役場職員向け: 所属課 |
| `term` | text | nullable | 隊員: 任期表記 |
| `started_at` | date | nullable | 着任日 |
| `status` | text | CHECK('active','retired','suspended') DEFAULT 'active' | 在籍状態 |
| `approval_route_id` | uuid | FK → approval_routes, SET NULL, nullable | 承認ルート |
| `disclose_name_in_cases` | boolean | DEFAULT false | 事例公開時の氏名開示 |
| `bio` | text | nullable | 自己紹介 |
| `contact_form_enabled` | boolean | DEFAULT false | (Postgres のみ)問合せフォーム有効化 |
| `created_at` / `updated_at` | timestamptz | | `set_updated_at()` トリガーで自動更新 |

**インデックス**: `(municipality_id, role)` / `(municipality_id, status)` / `(host_organization_id)`

---

### 3.4 assignments(担当割当)

| カラム | 型(Postgres) | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `staff_id` | uuid | FK → users, CASCADE | 役場職員 |
| `member_id` | uuid | FK → users, CASCADE | 担当する隊員 |
| `created_at` | timestamptz | | |

**ユニーク制約**: `(staff_id, member_id)`

---

### 3.5 activity_topics(活動内容テンプレ)

| カラム | 型(Postgres) | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `user_id` | uuid | FK → users, CASCADE | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `name` | text | NOT NULL | テンプレ名 |
| `sort_order` | integer | DEFAULT 0 | 表示順 |
| `created_at` | timestamptz | | |

**ユニーク制約**: `(user_id, name)`

---

### 3.6 projects(プロジェクト)

> Postgres のみ(`supabase/migrations/20260805_002_activities.sql`)。SQLite スキーマには未定義。

| カラム | 型(Postgres) | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `user_id` | uuid | FK → users, CASCADE | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `name` | text | NOT NULL | プロジェクト名 |
| `goal` | text | nullable | 目標 |
| `background` | text | nullable | 背景・課題 |
| `plan` | text | nullable | 計画概要 |
| `kpi` | text | nullable | KPI |
| `period_start` / `period_end` | date | nullable | 実施期間 |
| `budget` | integer | nullable | 予算(円) |
| `risk` | text | nullable | リスク |
| `status` | text | CHECK('planning','active','completed') DEFAULT 'planning' | ライフサイクル状態 |
| `is_public` | boolean | DEFAULT false | 公開フラグ。`status=completed && is_public=true` で事例化 |
| `disclose_name_override` | boolean | nullable | NULL=users の設定に従う |
| `anonymized_case_id` | uuid | FK → cases_public (後付け), SET NULL | 事例化後の参照先 |
| `created_at` / `updated_at` | timestamptz | | |

---

### 3.7 daily_logs(日報)

> ADR-021 で追加(`20260616_011_daily_logs.sql`)。

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `user_id` | uuid | TEXT | FK → users, CASCADE | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `log_date` | date | TEXT | NOT NULL | 日報の対象日 |
| `note` | text | TEXT | nullable | 1日全体のメモ・振り返り |
| `created_at` / `updated_at` | timestamptz | TEXT | | |

**ユニーク制約**: `(user_id, log_date)` — 1人1日1件

---

### 3.8 activity_logs(活動記録)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `user_id` | uuid | TEXT | FK → users, CASCADE | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `project_id` | uuid | TEXT | FK → projects, SET NULL, nullable | 紐づくプロジェクト |
| `daily_log_id` | uuid | TEXT | FK → daily_logs, SET NULL, nullable | 所属日報(ADR-021) |
| `activity_type` | text | TEXT | NOT NULL | 活動種別 |
| `topic` | text | TEXT | NOT NULL | 活動テーマ |
| `hours` | numeric(4,1) | REAL | DEFAULT 0 | 活動時間(h) |
| `distance_km` | numeric(6,1) | REAL | nullable | 移動距離(km) |
| `body` | text | TEXT | DEFAULT '' | 活動内容本文 |
| `occurred_at`(Postgres) / `log_date`+`log_time`(SQLite) | timestamptz / TEXT | TEXT | NOT NULL | 活動日時 |
| `expense_amount` | integer | INTEGER | nullable | 表示用キャッシュ(正典は expenses) |
| `photo_paths` | text[] | ─ | DEFAULT '{}' | (Postgres のみ)写真パス |
| `created_at` / `updated_at` | timestamptz | TEXT | | |

**インデックス**: `(user_id, occurred_at DESC)` / `(municipality_id, occurred_at DESC)` / `(daily_log_id)`

---

### 3.9 monthly_reports(月次報告書)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `user_id` | uuid | TEXT | FK → users, CASCADE | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `year_month` | text | TEXT | NOT NULL, 形式: 'YYYY-MM' | 対象年月 |
| `status` | text | TEXT | CHECK('draft','submitted','approved','rejected') DEFAULT 'draft' | 状態 |
| `status_label` | text | TEXT | nullable | 表示用ラベル |
| `summary` | text | TEXT | nullable | 月次サマリ(AI 生成) |
| `sections` | jsonb / TEXT | TEXT | nullable | 章立て JSON `[{title, body}]` |
| `plan_next` | text | TEXT | nullable | 来月計画 |
| `activity_count` | integer | ─ | DEFAULT 0 | (Postgres のみ)活動記録件数 |
| `total_hours` | numeric(6,1) | ─ | DEFAULT 0 | (Postgres のみ)合計活動時間 |
| `total_expense` | integer | ─ | DEFAULT 0 | (Postgres のみ)合計経費 |
| `submitted_at` | timestamptz | ─ | nullable | (Postgres のみ)提出日時 |
| `ai_generated_at` | timestamptz | ─ | nullable | (Postgres のみ)AI 生成日時 |
| `created_at` / `updated_at` | timestamptz | TEXT | | |

**ユニーク制約**: `(user_id, year_month)`

---

### 3.10 expenses(経費)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `user_id` | uuid | TEXT | FK → users, CASCADE | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `project_id` | uuid | TEXT | FK → projects, SET NULL, nullable | 紐づくプロジェクト |
| `expense_kind` | text | TEXT | CHECK('single','trip_parent','trip_receipt') DEFAULT 'single' | 経費種別 |
| `parent_expense_id` | uuid | TEXT | FK → expenses(自己参照), CASCADE, nullable | 旅費の親 |
| `source_activity_log_id` | uuid | TEXT | FK → activity_logs, SET NULL, nullable | 活動由来の経費 |
| `source_receipt_index` | integer | INTEGER | nullable | 領収書インデックス(二重申請防止) |
| `daily_log_id` | uuid | TEXT | FK → daily_logs, SET NULL, nullable | 日報直接紐付け(ADR-021) |
| `category` | text | TEXT | NOT NULL DEFAULT '活動費' | 経費カテゴリ(ADR-021) |
| `title` | text | TEXT | NOT NULL | 経費タイトル |
| `amount_requested` | integer | INTEGER | DEFAULT 0 | 申請額(円) |
| `amount_settled` | integer | INTEGER | nullable | 精算額(円) |
| `purpose` | text | TEXT | DEFAULT '' | 使途 |
| `status` | text | TEXT | DEFAULT '申請中' | 状態文字列 |
| `period_start` / `period_end` | date | TEXT | nullable | 旅費の対象期間 |
| `payee` | text | TEXT | nullable | 支払先 |
| `paid_date` | date | TEXT | nullable | 支払日 |
| `receipt_path` | text | ─ | nullable | (Postgres のみ)領収書パス |
| `has_receipt` | boolean | INTEGER | DEFAULT false | 領収書有無 |
| `settle_note` | text | TEXT | nullable | 精算メモ |
| `ai_note` | text | TEXT | nullable | AI 判定コメント |
| `citations` | jsonb | TEXT | nullable | RAG 引用 `[{source, quote}]` |
| `created_at` / `updated_at` | timestamptz | TEXT | | |

**ユニーク制約**: `(source_activity_log_id, source_receipt_index)` WHERE source_activity_log_id IS NOT NULL — 二重申請防止

**トリガー**: `trg_update_parent_settled` — `trip_receipt` の INSERT/UPDATE 時に親(`trip_parent`)の `amount_settled` を子合計で自動更新

---

### 3.11 approval_routes(承認ルート定義)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `name` | text | NOT NULL | ルート名(例: シンプル/中/複雑) |
| `kind` | text | NOT NULL | 種別: 経費 / 月次報告 / 活動相談 |
| `is_default` | boolean | DEFAULT false | 既定ルート |
| `created_at` | timestamptz | | |

---

### 3.12 approval_route_steps(承認ルートのステップ)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `route_id` | uuid | FK → approval_routes, CASCADE | |
| `step_no` | integer | NOT NULL | ステップ順番(1 始まり) |
| `approver_type` | text | CHECK('dept','host_org','admin') | 承認者種別 |
| `approver_label` | text | NOT NULL | 表示ラベル(例: 担当課) |
| `approver_id` | uuid | FK → users, SET NULL, nullable | (Postgres のみ)特定ユーザー固定 |
| `host_organization_id` | uuid | FK → host_organizations, SET NULL, nullable | 受入団体ステップ用 |
| `department` | text | nullable | 担当課名 |

**ユニーク制約**: `(route_id, step_no)`

---

### 3.13 approvals(承認申請インスタンス)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `route_id` | uuid | ─ | FK → approval_routes, SET NULL, nullable | 使用ルート |
| `kind` | text | TEXT | CHECK('経費','月次報告','活動相談') | 申請種別 |
| `applicant_id` | uuid | TEXT | FK → users, SET NULL, nullable | 申請者 |
| `approver_id` | uuid | ─ | FK → users, SET NULL, nullable | (Postgres のみ)現ステップの決裁者 |
| `member_name` | text | TEXT | NOT NULL | 隊員氏名(スナップショット) |
| `title` | text | TEXT | NOT NULL | 申請タイトル |
| `ai` | text | TEXT | nullable | AI 判定コメント |
| `citations` | jsonb | TEXT | nullable | RAG 引用 |
| `detail` | jsonb | TEXT | nullable | 種別固有の詳細情報 |
| `route_name` | text | TEXT | DEFAULT '' | ルート名(スナップショット) |
| `steps` | jsonb | TEXT | DEFAULT '[]' | ApprovalStep[] のスナップショット |
| `current_step` | integer | INTEGER | DEFAULT 0 | 現在のステップ番号 |
| `total_steps` | integer | ─ | DEFAULT 1 | (Postgres のみ)総ステップ数 |
| `status` | text | TEXT | CHECK('pending','approved','rejected') DEFAULT 'pending' | 状態 |
| `target_table` | text | TEXT | nullable | 対象テーブル名(例: expenses) |
| `target_id` | uuid / TEXT | TEXT | nullable | 対象レコード ID |
| `comment` | text | ─ | nullable | (Postgres のみ)差戻し理由(差戻し時必須) |
| `approved_at` | timestamptz | ─ | nullable | (Postgres のみ)承認日時 |
| `created_at` | timestamptz | TEXT | | |

---

### 3.14 announcements(お知らせ)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE | |
| `host_organization_id` | uuid | TEXT | FK → host_organizations, SET NULL, nullable | 受入団体からの配信 |
| `sender_id` | uuid | TEXT | FK → users, SET NULL, nullable | 送信者 |
| `sender_name` | text | TEXT | nullable | 送信者名(スナップショット) |
| `kind` | text | TEXT | CHECK('info','rule','qa') DEFAULT 'info' | お知らせ種別 |
| `is_pinned` | boolean | INTEGER | DEFAULT false | ピン留め |
| `title` | text | TEXT | NOT NULL | タイトル |
| `body` | text | TEXT | NOT NULL | 本文 |
| `target_user_ids` | uuid[] / TEXT | TEXT | (SQLite では JSON 文字列) | 送信対象ユーザー ID 配列 |
| `target_count` | integer | INTEGER | DEFAULT 0 | 送信対象人数 |
| `sent_at` | timestamptz | TEXT | DEFAULT now() | 配信日時 |
| `created_at` | timestamptz | TEXT | | |

---

### 3.15 announcement_reads(既読トラッキング)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `announcement_id` | uuid | FK → announcements, CASCADE | |
| `user_id` | uuid | FK → users, CASCADE | |
| `read_at` | timestamptz | DEFAULT now() | |

**複合 PK**: `(announcement_id, user_id)`

---

### 3.16 cases_public(全国事例)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `source_project_id` | uuid | ─ | FK → projects, SET NULL, nullable | (Postgres のみ)元プロジェクト |
| `source_municipality_id` | uuid | TEXT | FK → municipalities, SET NULL, nullable | 元自治体 |
| `source_user_id` | uuid | TEXT | FK → users, SET NULL, nullable | opt-in 時のみ設定 |
| `municipality_name` | text | ─ | NOT NULL | (Postgres のみ)自治体名 |
| `prefecture` | text | TEXT | NOT NULL | 都道府県 |
| `disclose_author` | boolean | INTEGER | DEFAULT false | 著者開示フラグ |
| `author_label` | text | TEXT | NOT NULL | 役割ラベル(例: 空き家担当(1年目)) |
| `year` | text | TEXT | NOT NULL | 活動年 |
| `title` | text | TEXT | NOT NULL | 事例タイトル |
| `summary` | text | TEXT | NOT NULL | 概要 |
| `kpi` | text | TEXT | nullable | KPI |
| `effect` | text | TEXT | nullable | 効果 |
| `process` | jsonb / TEXT | TEXT | nullable | プロセス `[{phase, body}]` |
| `learning` | text | TEXT | nullable | 学び・気づき |
| `original_text` | text | ─ | nullable | (Postgres のみ)匿名化前原文(同自治体のみ参照可) |
| `anonymized_at` | timestamptz | ─ | nullable | (Postgres のみ)匿名化処理日時 |
| `anonymized_by_review` | boolean | ─ | DEFAULT false | (Postgres のみ)人間レビュー完了フラグ |
| `embedding` | vector(1536) | ─ | nullable | (Postgres/pgvector のみ)類似検索用ベクトル |
| `trend_count` | integer | INTEGER | nullable | トレンド集計カウント |
| `created_at` | timestamptz | TEXT | | |

**インデックス(Postgres)**: `(prefecture, municipality_name)` / HNSW `embedding vector_cosine_ops`(類似検索)

---

### 3.17 guidelines(自治体ガイドライン)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `municipality_id` | uuid | FK → municipalities, CASCADE | |
| `source` | text | NOT NULL | ガイドライン出典名 |
| `section` | text | NOT NULL | セクション名 |
| `body` | text | NOT NULL | ガイドライン本文 |
| `embedding` | vector(1536) | nullable | (Postgres のみ)RAG 用ベクトル |
| `created_at` | timestamptz | | |

---

### 3.18 consultations(AI 相談ログ)

| カラム | 型(Postgres) | 型(SQLite) | 制約 | 説明 |
|---|---|---|---|---|
| `id` | uuid PK | TEXT PK | | |
| `user_id` | uuid | TEXT | FK → users, SET NULL, nullable | |
| `municipality_id` | uuid | TEXT | FK → municipalities, CASCADE, nullable | |
| `context_kind` | text | TEXT | NOT NULL | コンテキスト種別(daily-write / report-plan / expense-purpose / case-find) |
| `context_payload` | jsonb | ─ | nullable | (Postgres のみ)追加コンテキスト |
| `input_text` | text | TEXT | nullable | ユーザー入力 |
| `output_text` | text | TEXT | nullable | AI 応答 |
| `adopted` | boolean | INTEGER | DEFAULT false | ユーザーが採用したか |
| `tokens_used` | integer | ─ | nullable | (Postgres のみ)使用トークン数 |
| `created_at` | timestamptz | TEXT | | |

---

### 3.19 audit_logs(監査ログ)

> Postgres(`supabase/migrations/20260805_008_audit.sql`)のみ。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid PK | | |
| `municipality_id` | uuid | FK → municipalities, SET NULL, nullable | |
| `actor_id` | uuid | FK → users, SET NULL, nullable | 操作者 |
| `action` | text | NOT NULL | 操作種別(approve / reject / settle / member.retire / publish_case / export 等) |
| `target_table` | text | nullable | 対象テーブル |
| `target_id` | uuid | nullable | 対象レコード ID |
| `diff` | jsonb | nullable | 変更前後の差分 |
| `ip_hash` | text | nullable | IP アドレスのハッシュ |
| `user_agent` | text | nullable | ブラウザ情報 |
| `created_at` | timestamptz | | |

---

## 4. サブシステム別

### 4.1 隊員管理(users / municipalities / host_organizations / assignments)

**使うテーブル**

- `municipalities` — テナントの起点。`annual_budget` で予算管理
- `host_organizations` — 隊員の受入先団体
- `users` — 隊員(`role='member'`)・役場職員(`role='manager'`)・管理者(`role='admin'`)
- `assignments` — どの職員がどの隊員を担当するかの M:N マッピング

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 隊員一覧取得 | `users WHERE role='member' AND status='active'` |
| 隊員登録 | `users` INSERT |
| 隊員退任 | `users.status = 'retired'` UPDATE |
| 職員担当付け替え | `assignments` DELETE + INSERT (replace パターン) |
| 受入団体管理 | `host_organizations` CRUD |

---

### 4.2 活動記録(daily_logs / activity_logs / activity_topics / projects)

**使うテーブル**

- `daily_logs` — 日報のヘッダー(1日1件)
- `activity_logs` — 個別の活動記録(日報の子。nullable で日報なしも可)
- `activity_topics` — 隊員固有の活動テンプレ(入力補完用)
- `projects` — 長期プロジェクト(活動記録が紐づく)

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 日報作成 | `daily_logs` INSERT |
| 活動記録投入 | `activity_logs` INSERT (daily_log_id を設定) |
| 月別活動一覧取得 | `activity_logs WHERE user_id AND log_date LIKE 'YYYY-MM-%'` |
| AI 月報生成用データ取得 | `activity_logs` → `LogForAI` 型(Repos.activityLogs.listForAI) |
| プロジェクト進捗確認 | `projects WHERE status IN ('planning','active')` |

---

### 4.3 経費申請(expenses)

**使うテーブル**

- `expenses` — 経費申請の主テーブル
- `daily_logs` — 日報経由の経費紐付け(nullable)
- `activity_logs` — 活動由来の経費紐付け(nullable)
- `guidelines` — AI 判定の RAG ソース
- `approvals` — 経費申請の承認フロー

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 直接申請 | `expenses` INSERT (source_activity_log_id=NULL, daily_log_id=NULL) |
| 活動由来申請(ADR-014 動線①) | `expenses` INSERT (source_activity_log_id 指定、二重申請防止 UNIQUE 制約) |
| 旅費(親子)作成 | `expenses(trip_parent)` + `expenses(trip_receipt)[]` INSERT |
| 精算額自動更新 | トリガー `trg_update_parent_settled` で親の `amount_settled` 更新 |
| AI 判定添付 | `ai_note` / `citations` UPDATE |
| ステータス更新 | `expenses.status` UPDATE(申請中→承認→精算済) |

---

### 4.4 月次報告(monthly_reports)

**使うテーブル**

- `monthly_reports` — 月次報告書
- `activity_logs` — 月次集計のソースデータ

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 月報一覧取得 | `monthly_reports WHERE user_id ORDER BY year_month DESC` |
| AI 生成 | `activity_logs`(listForAI) → Claude API → `monthly_reports.summary` / `sections` UPDATE |
| 提出 | `monthly_reports.status = 'submitted'` UPDATE |
| 承認済に更新 | `repos.monthlyReports.markApproved(id)` |
| 活動編集時の差し戻し | `revertToSubmitted(userId, ym)` — 承認済みを 'submitted' に戻す |

---

### 4.5 承認フロー(approvals / approval_routes / approval_route_steps)

**使うテーブル**

- `approval_routes` — 「シンプル/中/複雑」等のルート定義
- `approval_route_steps` — 各ルートのステップ(担当課→受入団体→管理者 等)
- `approvals` — 申請ごとのインスタンス(ルートと steps をスナップショットで保持)

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 承認申請起票 | `approvals` INSERT (steps を JSON スナップショットとして格納) |
| 承認待ち一覧 | `approvals WHERE municipality_id AND status='pending'` |
| 承認・差戻し | `approvals.current_step` / `status` UPDATE |
| 対象レコード反映 | `target_table` + `target_id` で expenses / monthly_reports を UPDATE |
| ルート設定 | `approval_routes` + `approval_route_steps` CRUD |

---

### 4.6 お知らせ(announcements / announcement_reads)

**使うテーブル**

- `announcements` — お知らせ本体(info / rule / qa の 3 種)
- `announcement_reads` — 既読ログ(既読率計算に使用)

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| お知らせ一覧取得 | `announcements` + LEFT JOIN `announcement_reads`(既読数集計) |
| 配信 | `announcements` INSERT (target_user_ids に対象隊員 ID を格納) |
| 既読マーク | `announcement_reads` INSERT |
| 種別フィルタ | `announcements WHERE kind IN ('info','rule','qa')` |

---

### 4.7 事例(cases_public / projects)

**使うテーブル**

- `cases_public` — 匿名化済み全国事例
- `projects` — 元プロジェクト(`is_public=true && status='completed'` で事例化)
- `guidelines` — 自治体ガイドライン(RAG 用)

**主な操作**

| 操作 | 関与テーブル |
|---|---|
| 事例一覧取得 | `cases_public WHERE anonymized_by_review=true` |
| トレンド集計 | `cases_public.trend_count` 集計 |
| 類似検索 | `cases_public` HNSW インデックス `embedding <=>` cosine 距離検索 |
| プロジェクト事例化 | `projects.anonymized_case_id` に `cases_public.id` を設定 |

---

## 5. API ↔ DB マッピング

`src/lib/api/mappers.ts` で定義された変換関数の一覧。
DB は snake_case、フロント DTO は camelCase。

### 5.1 mapLog — activity_logs → ActivityLogDTO

| DB カラム(snake_case) | DTO フィールド(camelCase) | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `activity_type` | `type` | フィールド名変換 |
| `topic` | `topic` | そのまま |
| `hours` | `hours` | そのまま |
| `distance_km` | `distanceKm` | `null → undefined` |
| `body` | `body` | そのまま |
| `log_date` | `date` | フィールド名変換 |
| `log_time` | `time` | フィールド名変換 |
| `expense_amount` | `expense` | `null → undefined` |

---

### 5.2 mapReport — monthly_reports → ReportDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `year_month` | `yearMonth` | `'YYYY-MM'` → `'YYYY 年 M 月'` (表示用) |
| `year_month` | `ym` | そのまま(機械処理用) |
| `status` | `status` | そのまま |
| `status_label` | `statusLabel` | `null → ""` |

---

### 5.3 mapExpense — expenses → ExpenseDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `title` | `title` | そのまま |
| `amount_requested` | `amount` | フィールド名変換 |
| `purpose` | `purpose` | そのまま |
| `status` | `status` | そのまま |
| `category` | `category` | `null → "活動費"` (ADR-021) |
| `ai_note` | `aiNote` | `null → ""` |
| `citations`(JSON) | `citation` | JSON パース後 `[0]` (最初の引用のみ)。`null → {source:"", quote:""}` |
| `created_at` | `createdAt` | 先頭 10 文字(日付部分のみ) |
| `has_receipt` | `hasReceipt` | integer/boolean → boolean |
| `expense_kind` | `expenseKind` | そのまま |
| `parent_expense_id` | `parentExpenseId` | `null → undefined` |

---

### 5.4 mapCase — cases_public → CaseDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `title` | `title` | そのまま |
| `area` | `area` | そのまま (SQLite では area カラム) |
| `year` | `year` | そのまま |
| `author` | `author` | そのまま (SQLite では author カラム) |
| `summary` | `summary` | そのまま |
| `kpi` | `kpi` | `null → ""` |
| `effect` | `effect` | `null → ""` |
| `process`(JSON) | `process` | JSON パース。失敗時 `[]` |
| `learning` | `learning` | `null → ""` |

---

### 5.5 mapApproval — approvals → ApprovalDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `kind` | `kind` | `"経費" | "月次報告" | "活動相談"` リテラル型 |
| `member_name` | `member` | フィールド名変換 |
| `title` | `title` | そのまま |
| `ai` | `ai` | `null → ""` |
| `citations`(JSON) | `citations` | JSON パース。失敗時 `[]` |
| `detail`(JSON) | `detail` | JSON パース。失敗時 `{}` |
| `route_name` | `routeName` | そのまま |
| `steps`(JSON) | `steps` | JSON パース。失敗時 `[]` |
| `current_step` | `currentStep` | そのまま |

---

### 5.6 mapNotice — announcements → NoticeDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `title` | `title` | そのまま |
| `body` | `body` | そのまま |
| `sent_at` | `date` | 5 文字目以降(例: `'06-15 12:00'`、年を省略した月日表示) |
| `kind` | `kind` | そのまま |
| `is_pinned` | `isPinned` | integer/boolean → boolean |
| `sender_name` | `sender` | `null → ""` |
| `target_count` | `targets` | そのまま |
| `read_count`(集計値) | `read` | `null → 0` |

---

### 5.7 mapMember — users(member) → MemberDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `name` | `name` | そのまま |
| `role_label` | `role` | `null → ""` (`role` カラムではなく `role_label`) |
| `started_at` | `startedAt` | `null → "未設定"` |
| `term` | `term` | `null → "1 年目"` |

---

### 5.8 mapStaff — users(manager) → StaffDTO

| DB カラム | DTO フィールド | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `name` | `name` | そのまま |
| `title` | `title` | `null → "職員"` |
| `department` | `dept` | `null → ""` |
| `email` | `email` | `null → ""` |

---

## 付録: RLS ポリシー概要

`supabase/migrations/20260805_009_rls.sql` で定義。`current_setting('app.current_user_id')` を起点とし、Supabase Auth に依存しない設計(別の Auth プロバイダへの移行を容易にする)。

| テーブル | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `activity_logs` | 本人 or 担当職員 or 管理者(同自治体内) | 本人のみ |
| `expenses` | 本人 or 担当職員 or 管理者(同自治体内) | 本人 or 管理者 |
| `monthly_reports` | 本人 or 担当職員 or 管理者(同自治体内) | 本人 or 管理者 |
| `approvals` | 申請者 or 決裁者 or 管理者(同自治体内) | 決裁者 or 管理者 |
| `assignments` | 同自治体内のみ | ─ |
| `announcements` | 送信者 or 受信対象 or 管理者(同自治体内) | ─ |
| `audit_logs` | 本人 + 管理者 | ─ |
| `cases_public` | レビュー完了済=全テナント / 下書き=原著者 or 同自治体 | ─ |

**ヘルパー関数**

- `app_current_user_id()` — セッション変数 `app.current_user_id` から uuid を返す
- `app_current_municipality_id()` — users テーブルから現在ユーザーの自治体 ID を引く
- `app_current_role()` — 現在ユーザーの role を返す
- `app_is_admin()` — 管理者かどうか
- `app_is_manager_for(target_member)` — assignments テーブルで担当関係を確認
