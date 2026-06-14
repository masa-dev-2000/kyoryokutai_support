# Supabase マイグレーション(Phase 1 本番 Postgres)

> ローカル開発は `node:sqlite`(`src/lib/db`)で動く。本番(Phase 1、ADR-018)は
> Supabase Postgres を使い、本ディレクトリのマイグレーションを適用する。

## ファイル(docs/24 §5.3 / docs/25 M3)

| ファイル | 内容 |
|---|---|
| `20260805_001_identity.sql` | municipalities / host_organizations / approval_routes / users / assignments |
| `20260805_002_activities.sql` | activity_topics / projects / activity_logs |
| `20260805_003_reporting.sql` | monthly_reports |
| `20260805_004_expenses.sql` | expenses(二系統動線 + 親子 + 集計トリガー、ADR-014) |
| `20260805_005_workflow.sql` | approval_route_steps / approvals(多段階承認、ADR-012/015) |
| `20260805_006_communication.sql` | announcements / announcement_reads(ADR-013) |
| `20260805_007_ai_knowledge.sql` | consultations / cases_public / guidelines(pgvector) |
| `20260805_008_audit.sql` | audit_logs + updated_at トリガー |
| `20260805_009_rls.sql` | RLS(`current_setting('app.current_user_id')` ベース、載せ替え #3) |
| `20260805_010_seed.sql` | マスタ/参照データ(自治体・受入団体・承認ルート・ガイドライン・全国事例) |

## 適用方法

### Supabase CLI
```bash
supabase link --project-ref <PROJECT_REF>
supabase db push        # migrations を順に適用
```

### または SQL Editor
Dashboard → SQL Editor で `001` → `010` の順に実行。

## RLS の使い方(重要)

RLS は `auth.uid()` ではなく `current_setting('app.current_user_id')` を参照する
(Supabase Auth / Cognito 両対応のため、載せ替え 10 か条 #3)。

アプリ層(Repository / Server Action)は、DB 接続後に必ず以下を発行する:
```sql
SET LOCAL app.current_user_id = '<認証済みユーザーの uuid>';
```

PostgREST(supabase-js の `.from()`)経由では GUC を設定できないため、
**本番では直接 Postgres 接続(`pg` / postgres.js)+ Repository 経由** を使う。
これにより Phase 2 で RDS へ載せ替えても RLS をそのまま流用できる。

## ユーザーの作成

`users` テーブルの行は Supabase Auth サインアップ(Magic Link)と連動して作成する。
`users.id` は `auth.users.id`(uuid)と一致させる。seed には含めない。

## pgvector

`007` で `create extension vector` と HNSW インデックスを作成。
Supabase は pgvector を標準サポート。Embedding は Year 1 後半に投入(現状 NULL 可)。

## dev(SQLite)との対応

`src/lib/db/schema.ts`(SQLite)は本マイグレーションの簡易版。
本番移行時は Repository の supabase 実装(`DB_PROVIDER=supabase`)に切り替える。
スキーマ差分は docs/24 §5.1 を参照。
