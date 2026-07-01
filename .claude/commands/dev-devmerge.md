merge session: レビュー済み(review_accountがAPPROVED)のPRをdevelopへ統合する。ここで見るのは**統合リスクのみ**(要件/セキュリティ/品質はreview sessionの責務であり再チェックしない)。

引数なしの場合は対象PRを検出して処理する。PR番号指定の場合はそのPRのみ対象にする。

## プロジェクト設定の読み込み

プロジェクトの `CLAUDE.md` の「開発フロー設定」から `review_account` / `pr_account` を読む。

## Phase 1: 対象PRの検出

`reviewDecision` はブランチ保護なしで常に空になるため使わない。**必ず `latestReviews` を見る**:
```bash
gh pr view <N> --json latestReviews,mergeable,baseRefName \
  --jq '{
    approved: ([.latestReviews[] | select(.author.login=="<review_account>")] | last | .state == "APPROVED"),
    mergeable: .mergeable,
    base: .baseRefName
  }'
```
`approved==true` かつ `mergeable=="MERGEABLE"` かつ `base=="develop"` のPRのみを対象にする。

対象0件ならPhase 5(再スケジュール)へ。

## Phase 2: 統合リスクレビュー(このセッションの責務はここだけ)

以下のみ確認する(要件・セキュリティ・コード品質の再チェックはしない):
- **マイグレーション安全性**: `supabase/migrations/*.sql` の追加があるか、既存カラム破壊的変更でないか
- **他PRとのファイル競合**:
  ```bash
  gh pr list --state open --json number,files --jq '.[] | select(.number != <対象>) | "#\(.number): \(.files | map(.path) | join(", "))"'
  ```
- **スタック順序**: このPRが他の未マージPRをbaseにしていないか(していれば土台から順に処理)
- **develop既存テストがgreenか**: `npm test` が現時点で通っているか

## Phase 2.5: コンフリクト解消(mergeable=="CONFLICTING"の場合)

`git rebase` は使わない。**「パッチが develop に既に含まれている」と誤判定してコミット全体をスキップし、他の新規ファイル/変更ごと消失させることがある**(2026-07-01実例: 1行だけ衝突する既存ファイルとの add/add コンフリクトで、無関係な新規テスト2ファイル・192行が丸ごと消失しかけた)。

必ず **merge** で解消する:
```bash
git switch <対象ブランチ> -q
git merge origin/develop --no-edit
# コンフリクトが出たファイルのみ個別に解決(git checkout --ours/--theirs や手動編集)
git add <解決したファイル>
git commit --no-edit
git push origin <対象ブランチ>
```
解消後は必ず `gh pr view <N> --json mergeable` で `MERGEABLE` に戻ったことを確認してから Phase 3 へ進む。

もし誤って rebase してしまい差分が消えた場合は、**push前なら** `git branch -f <ブランチ名> origin/<ブランチ名>` でリモートの無傷な状態に復旧できる(`git reset --hard` は使わなくてよい)。

## Phase 3: develop統合

### 単独PR(base=develop)
```bash
gh pr merge <N> --merge --subject "Merge PR #<N>: <タイトル>"   # --admin は絶対に使わない
```

### スタックPR(chained base)
土台から順に、**retargetとmergeは必ず別コマンド**(`&&`で連結しない。連結するとclassifierに複合コマンドごとブロックされ、retargetが飛んでbase未変更のまま誤マージする事故が過去に発生している):
```bash
gh pr edit <N> --base develop      # ① 付け替え(単独コマンド)
# ② mergeable再確認
gh pr merge <N> --merge --subject "..."   # ③ マージ(別コマンド)
# 一段上のPRへ繰り返す
```

## Phase 4: マージ後の検証

```bash
git checkout develop && git pull origin develop
npm install
npm test
```
失敗したら**ここで停止し、本番反映(dev-mainmerge)には進まない**。失敗内容を報告する。

Cloudflare Workers Builds / Supabase Preview は慢性的に失敗するstray checkなので無視してよい。判定はVercelのdevelopプレビューのstatusのみで行う。

成功したら、続けて `/dev-e2e` を自動実行する(人間への確認不要)。

## Phase 5: 完了報告 & 再スケジュール

```
✅ develop統合完了
PR #<N>: <タイトル>
develop: <新HEAD>
npm test: PASS
→ /dev-e2e を実行します
```

引数でPR番号を指定した単発実行の場合はここで終了。引数なしのポーリング運用の場合、対象PRが無ければ `ScheduleWakeup`(目安1200〜1800秒、prompt: `/dev-devmerge`)で再スケジュールする。
