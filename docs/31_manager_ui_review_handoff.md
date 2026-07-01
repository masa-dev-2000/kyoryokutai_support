# manager 画面 UI/UX レビュー 引継ぎ(2026-07-01)

## 目的・経緯
「manager-authz」worktree(役場側 3 画面: 承認/月報/お知らせ)を対象に、コードベースと画面表示の整合性
レビューを実施した。3 タブ構成自体は `CLAUDE.md` / `docs/11_feature_inventory.md`(v3)の仕様と一致して
いることを確認したが、API 連携・データ整合の面で複数の不整合が見つかった。

manager 側の編集許可域(`src/app/manager/`, `api/monthly-reports`, `api/approvals`, `api/approval-routes`,
`api/announcements`)に収まらない項目が大半のため、コード修正は行わず本ドキュメントとして引き継ぐ。

対象範囲外の内訳: member/共有スコープの API(`api/ai/`, `api/activity-logs/`, `api/budgets/`, `api/members/`)
および共有 repository(`listForAI`)。

## 発見事項

### A. 承認ステップの担当者(approverType)がサーバ側で検証されていない
**→ Issue [#138](https://github.com/masa-dev-2000/kyoryokutai_support/issues/138) として登録済み。**

`ViewerRoleSwitch`(`src/app/manager/_app.tsx`)はクライアント側の表示フィルタに過ぎず、
`api/approvals/[id]/decide` は `role∈{manager,admin}` しか検証しない。どの manager アカウントでも
任意の承認ステップ(別部署の dept ステップ等)を決裁できてしまう。根本解決には承認担当者(assignee)/
決裁者(decidedBy)を表す共有スキーマ拡張が必要(既存の将来設計と同一課題)。

### B. `/api/ai/monthly-report` が manager 指定の対象隊員を無視する
役場側の月報詳細画面(`MemberMonthSheet`)は `{ userId, ym }` を渡して特定隊員の月報 AI 生成を要求するが、
`route.ts` の `Body` 型に `userId` が無く、常に `sess.userId`(呼び出し者=manager 自身)のログを使う。

```ts
// src/app/api/ai/monthly-report/route.ts
type Body = { ym?: string };
const userId = sess.userId; // manager 自身の userId になってしまう
```

**影響**: manager が担当隊員向けに月報生成を要求すると、manager 自身の活動ログ(通常 0 件)で 404 になるか、
誤った隊員の月報として生成されるおそれがある。

**対応案**: `Body.userId` を追加し、`manager`/`admin` は指定 `userId` を許可する(`monthly-reports` GET の
`?userId=` 分岐と同じパターン)。

### C. `/api/activity-logs/monthly` に認証チェックが一切ない
```ts
// src/app/api/activity-logs/monthly/route.ts
export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  // requireAppUser() 相当の呼び出しが無い
  ...
}
```
未認証で任意 `userId` の活動記録(自由記述の `body` を含む)を取得できる。`approvals`/`monthly-reports`/
`announcements`/`approval-routes` を対象にした認可強化(PR #77/#79, コミット `d92410d`)から漏れている。

**対応案**: 他ルートと同様に `requireAppUser()` を追加し、他人の `userId` を見るには `manager`/`admin` を要求する。

### D. `/api/budgets` GET の特権判定に `manager` が含まれない
```ts
// src/app/api/budgets/route.ts
const isPrivileged = sess.role === "admin" || sess.role === "super";
if (userId !== sess.userId && !isPrivileged) return bad("他の隊員の予算枠は閲覧できません", 403);
```
役場側の承認画面(`ExpenseBudgetImpact`、経費承認の AI 判定材料として予算影響を表示する箇所)は manager が
他隊員の予算枠を問い合わせるために呼ぶが、`.catch(() => {})` で握りつぶされ **manager には常にパネル非表示**
になる(エラーが見えないため気付きにくい)。

**対応案**: `isPrivileged` の判定に `manager` を追加。

### E. `/api/members` GET に認証チェックがない
```ts
// src/app/api/members/route.ts
export async function GET() {
  return ok(await getRepos().members.list());
}
```
役場のロスター一覧が未認証で取得できる。他の GET と同様に `requireAppUser()` の追加が望ましい(重要度は低め)。

### F. 「経費使用」表示が実データに未接続で常に ¥0 になる
`MemberMonthSheet` / `ReportDaySheet` の経費表示はモック時代の `expense_amount` フィールドを参照するが、
`activity_logs` テーブルにはそもそも該当カラムが存在せず、`listForAI`(sqlite/supabase 双方)は
`expense_amount: null` 固定または未取得。実データに接続すると常に「¥0 使用」と表示される、モック時代の
遺物 UI。

**対応案**: `expenses` テーブルとの JOIN で実額を出すか、UI 自体を削除する(要判断)。

## 優先度の目安
1. B・C・D は実害のある機能不全/認可バグ。優先対応を推奨。
2. A は既存の将来設計(assignee/decidedBy)で解消予定。
3. E・F は低優先(軽微な情報開示・死んだ UI)。

## 対応時の留意点
- B・C・D・E は `src/app/api/ai/`, `api/activity-logs/`, `api/budgets/`, `api/members/` 配下で、
  いずれも member/共有スコープ。対応時は該当スコープの worktree ルールに従うこと。
- F は `src/app/manager/_app.tsx`(表示側)と共有 `repositories/*` の `listForAI`(データ側)の両方に
  またがる。
