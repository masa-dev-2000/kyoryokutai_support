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
