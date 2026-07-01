dev環境に対してE2Eテストを実行する。スモークテスト（基本動作確認）を必ず先に実行し、続いて対象PRに紐づくissueの仕様をもとにClaude自身がシナリオを生成してブラウザを操作しながら検証する。

引数: PR番号（省略時は直近の dev-devmerge で対象となったPR）

## プロジェクト設定の読み込み（最初に実行）

プロジェクトの `CLAUDE.md` の「開発フロー設定」セクションから以下を読む:
- `dev_url`（必須）: テスト対象のdev環境URL
- `e2e_accounts`（任意）: E2Eテスト用アカウントの**id/メールアドレスのみ**（パスワードはCLAUDE.mdに保持しない）
- `smoke_test_steps`（任意）: プロジェクト独自のスモークテスト手順。未設定なら下記の汎用手順を使う

`dev_url` が未定義の場合は実行せずユーザーに確認する。

## Phase 1: テストシナリオ生成

### 1-1. PR情報とissue仕様を取得
```bash
gh pr view <number> --json title,body,headRefName,closingIssuesReferences
```
関連issue番号を抽出し、それぞれの確定仕様を取得:
```bash
gh issue view <N> --json title,body -q '"#\(.number): \(.title)\n\(.body)"'
```

### 1-2. テストシナリオを自動生成

issue仕様をもとに、ブラウザ操作ステップを生成する:

```
📋 テストシナリオ（PR #<番号>: <タイトル>）

【スモークテスト】（毎回必須）
1. dev_url にアクセスできるか
2. ログイン後、トップページまたは主要画面が表示されるか
3. ログアウトできるか

【issue固有テスト】
issue #<N>「<タイトル>」に対して:
1. <ブラウザ操作ステップ>
期待結果: <何が起きるべきか>
```

## Phase 2: ログイン（human一時停止ポイント）

**Claude自身はパスワードを保持・入力しない。** スモークテスト開始前に一旦停止し、以下を人間に依頼する:

```
🔐 ログインが必要です。
dev_url: <dev_url>
テストアカウント: <e2e_accounts の id/メールアドレスのみ>

ブラウザでログインしてください。完了したら教えてください。
```

人間からログイン完了の報告を受けてから、Phase 3 以降の自動ブラウザ操作を再開する。

## Phase 3: スモークテスト実行

ログイン状態を引き継いだブラウザで、Phase 1のスモーク手順を順に確認する。FAILがあれば即座にPhase 5（失敗処理）へ。

## Phase 4: issue固有テスト実行

Phase 1で生成した各シナリオを順番にブラウザ操作で実行する。

```
✅ PASS: <テスト名> - <確認できた内容>
❌ FAIL: <テスト名> - <期待: ...> <実際: ...>
⚠️ SKIP: <テスト名> - <スキップ理由>
```

## Phase 5: 結果処理

### 全PASS の場合

```bash
gh pr comment <number> --body "## ✅ E2Eテスト PASS

**実行日時**: $(date '+%Y-%m-%d %H:%M')
**環境**: dev (<dev_url>)

### スモークテスト
<各スモーク項目の結果>

### issue固有テスト
<各テスト結果>

🤖 /dev-e2e による自動テスト"
```

```
✅ E2Eテスト全PASS
PR #<N> は /dev-mainmerge で本番にリリースできます。
```

### FAILがある場合

```bash
gh pr comment <number> --body "## ❌ E2Eテスト FAIL
<FAIL項目一覧を含む上記と同形式>"
gh pr reopen <number> --comment "E2Eテストで失敗が検出されたため再オープンしました。coding loopでの修正が必要です。"
```

```
❌ E2Eテスト FAIL
PR #<N> を再オープンしました。coding loopへ差し戻します。
失敗箇所: <FAIL項目一覧>
```

## テスト完了サマリー

```
📊 E2Eテスト結果サマリー
PR #<N>: <タイトル>
スモークテスト: ✅ PASS (N/N)
issue固有テスト: ✅ PASS (N/N) または ❌ FAIL (M/N)
総合結果: PASS / FAIL
```
