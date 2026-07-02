本番環境（main）へのマージ＆デプロイを行う。

⚠️ このコマンドは本番環境に影響します。各フェーズを省略せず必ず実行してください。

引数なしの場合はdevelop→mainへの反映対象を確認する。

## プロジェクト設定の読み込み（最初に実行）

プロジェクトの `CLAUDE.md` の「開発フロー設定」セクションから以下を読む:
- `prod_branch`（本番ブランチ）: デフォルト `main`
- `prod_deploy_commands`（必須・複数行）: 本番デプロイのコマンド列
- `prod_url`（任意）: 完了報告に表示する本番URL
- Supabase本番project id（マイグレーション適用先）

`prod_deploy_commands` が未定義の場合はユーザーに確認してから進む。

## Phase 1: 対象の確認

developがmainより先行しているか確認する:
```bash
git fetch origin main develop
git log origin/main..origin/develop --oneline
```
反映対象のコミットが無ければ終了。

## Phase 2: コンフリクトのドライラン（必須）

```bash
git checkout -b _mainmerge_dryrun origin/main
git merge origin/develop --no-commit --no-ff 2>&1
git status --short
git merge --abort 2>/dev/null || true
git checkout main && git branch -D _mainmerge_dryrun
```
コンフリクト検出時は即停止して解消手順を案内する。

## Phase 3: 本番前レビュー（統合リスク＋本番固有観点）

```bash
git diff origin/main..origin/develop
```

#### 🔒 本番固有のセキュリティ
- 環境変数・秘密鍵のハードコードがないか
- `ENVIRONMENT === 'development'` 限定処理が本番で動かないか

#### 🗄️ DB・マイグレーション
新規マイグレーションの有無を確認する:
```bash
git diff --name-only origin/main..origin/develop -- 'supabase/migrations/*.sql'
```

#### 🔄 後方互換性
- APIレスポンス形式変更で既存クライアントが壊れないか
- Cookie・ローカルストレージのキー名変更で既存セッションが壊れないか

#### ✅ dev確認記録
```bash
gh pr view <develop統合時のPR番号> --json comments,reviews \
  --jq '[.comments[].body, .reviews[].body] | join("\n")'
```
`/dev-e2e` のPASS記録があることを確認する。無ければ警告する。

## Phase 4: 二重承認（必須）

```
本番環境（<prod_url または プロジェクト名>）にデプロイします。
新規マイグレーション: <あり/なし>
よろしいですか？ (yes と入力して確認)
```
「yes」以外ではマージしない。

## Phase 5: マージ＆本番デプロイ（承認後）

### 5-1. develop→main PR作成・マージ

```bash
gh pr create --base main --head develop --title "本番反映: <概要>" --body "<develop→mainの反映内容>"
gh pr merge <PR番号> --merge --subject "本番反映: <概要>"   # --admin は絶対に使わない
```

### 5-2. マイグレーション適用（該当する場合のみ、デプロイ前に実行）

新規マイグレーションがあれば、**Vercelはmigrationsを自動適用しないため**、デプロイとセットで本番Supabaseへ適用する:
1. MCP `apply_migration` で本番Supabase project(CLAUDE.md記載のproject id)へ適用
2. MCP `execute_sql` で適用結果を検証(対象テーブル/カラムの存在確認)

`db_migration_command` が別途設定されていればそれも参考にする。

### 5-3. 本番デプロイ

`prod_deploy_commands` に記載された手順をそのまま順番に実行する。

### 5-4. デプロイ確認

```bash
gh api repos/:owner/:repo/commits/main/status --jq '.statuses[] | select(.context=="Vercel") | .state'
```
`success` を確認する。Cloudflare Workers Builds / Supabase Preview の慢性失敗は無視してよい。

## Phase 6: Issueクローズ（必須）

```bash
gh pr view <develop→mainのPR番号> --json closingIssuesReferences \
  --jq '.closingIssuesReferences[].number'
gh issue close <issue-number> --comment "本番デプロイ完了（PR #<number>）"
```
**Issueのクローズはこのタイミングでのみ行う。**

## Phase 7: 完了報告

```
🚀 本番デプロイ完了
本番URL: <prod_url>
マイグレーション適用: <実行した場合のみ>
Closed: #<issue番号>

動作確認をお願いします。
```
