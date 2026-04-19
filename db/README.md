# DB マイグレーション

## ファイル
- `migrations/0001_init.sql`: テーブル定義(10 テーブル + インデックス)
- `migrations/0002_rls.sql`: Row Level Security ポリシー
- `migrations/0003_seed.sql`: 開発用シード(兵庫県・代表市町・グローバルタグ)

## 適用方法(Supabase)

### 1. Supabase プロジェクト作成
- 東京リージョン(ap-northeast-1)で作成
- プロジェクト URL と anon key を `.env.local` に設定

### 2. マイグレーション適用
Supabase Dashboard → SQL Editor で順に実行:
1. `0001_init.sql`
2. `0002_rls.sql`
3. `0003_seed.sql`(開発環境のみ)

### 3. Auth 設定
- Authentication → Providers → Email(Magic Link)を有効化
- Site URL / Redirect URLs を設定

## ポリシー設計の要点
- 隊員は自分のデータのみ閲覧/編集可
- 役場スタッフは `staff_member_assignments` で紐付けられた隊員のみ閲覧可
- 役場管理者は自治体内のデータすべて閲覧可
- スーパー管理者は全データアクセス可(運用チーム)
- 監査ログは本人 or スーパー管理者のみ閲覧可、挿入はサービスロールキー経由のみ
