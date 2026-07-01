review session: openかつ未レビューのPRを定期ポーリングで検出し、`review_account` 名義で自律的に一次〜二次レビュー(Approve/Request changes)を実行する。人間へのOK/NG確認は行わない(review_accountはAI駆動の"人格"として運用している実態を踏襲)。

引数: PR番号(指定時はそのPRのみ即時レビューし、ポーリングには入らない)。引数なしの場合はポーリングループとして動作する。

## プロジェクト設定の読み込み

プロジェクトの `CLAUDE.md` の「開発フロー設定」セクションから `review_account` / `pr_account` を読む。

## Phase 1: 対象PRの収集

```bash
gh pr list --state open --json number,title,headRefName,reviews --jq '
  sort_by(.number) | .[] | select(
    ([.reviews[] | select(.author.login=="'"$(cat CLAUDE.md | grep -oP "review_account.:.\K[^\`]+")"'")] | length) == 0
  )
'
```
(review_accountによるレビューが一度も無いPRを対象にする。`reviewDecision`はブランチ保護なしで常に空になるため使わない。)

対象が0件なら Phase 4(再スケジュール)へ進む。

## Phase 2: レビュー内容の分析(1PRごと)

```bash
gh pr view <number> --json title,body,files,additions,deletions
gh pr diff <number>
```
関連issue番号をPR本文から抽出し、`gh issue view <N>` で「確定仕様」との要件適合を確認する。

以下のチェックリストを適用する:

#### 🎯 要件適合
- issueの確定仕様をすべて実装しているか / closes #N の参照があるか

#### 🔒 セキュリティ
- XSS(ユーザー入力を直接DOM挿入)がないか
- SQLインジェクション(文字列結合クエリ)がないか
- 秘密鍵・envのハードコードがないか
- 新規APIに認証・認可チェックがあるか

#### ⚡ パフォーマンス
- useEffectの無限ループの可能性がないか
- N+1クエリ(ループ内DBアクセス)がないか

#### 🧹 コード品質
- console.log / TODO / FIXME が残っていないか
- TypeScript の any 型の不必要な使用がないか
- 未使用import・変数がないか

#### 💥 破壊的変更・副作用
- 共有ファイル(`repositories/*`, `schema.ts`, `auth.ts`, `mappers.ts`, `migrations/`)変更の影響範囲
- 3層repository(types/supabase/sqlite)が揃って更新されているか

## Phase 3: 判定と実行

`gh auth switch --user <review_account>` に切り替えてから実行し、**実行後は必ず `gh auth switch --user <pr_account>` に戻す**。

### 問題なし
```bash
gh pr review <number> --approve --body "## ✅ dev-review 自動レビュー OK
チェックリスト(要件適合/セキュリティ/パフォーマンス/コード品質/破壊的変更)を確認し、問題ありませんでした。
🤖 /dev-review による自動確認"
```

### 問題あり
まずこのPRの既存CHANGES_REQUESTED件数を確認する:
```bash
gh pr view <number> --json reviews --jq '[.reviews[] | select(.state=="CHANGES_REQUESTED")] | length'
```

```bash
gh pr review <number> --request-changes --body "## ❌ dev-review 自動レビュー NG

**修正指示:**
<具体的な修正内容>

🤖 /dev-review による自動確認"
```

**これが2回目のCHANGES_REQUESTEDになる場合**、上記に加えて:
```bash
gh issue edit <紐づくissue番号> --add-label "status:blocked"
gh pr comment <number> --body "⚠️ このPRへのChanges Requestedが2回連続になりました。自動reworkは行わず、human判断にエスカレーションします。"
```
(coding-loop-dev側もこの件数を見てreworkを見送るガードを持っているため、二重に修正が走ることはない)

## Phase 4: 完了報告 & 再スケジュール

```
📊 dev-review 完了
✅ Approve: #<N>(M件)
❌ Request changes: #<N>(M件)
⚠️ 2回連続エスカレーション: #<N>(あれば)
```

引数でPR番号を指定した単発実行の場合はここで終了する。

引数なしのポーリングループの場合は、`ScheduleWakeup` で次回実行をスケジュールする(目安1200〜1800秒、`prompt` に `/dev-review` を渡す)。オープンPRが無く、かつ誰も作業中でない場合は再スケジュールせず終了してよい。
