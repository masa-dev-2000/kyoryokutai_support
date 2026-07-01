# super画面 UI/UXレビュー記録

## 実施日

2026-07-01

## 対象

- `/super`
- `src/app/super/_app.tsx`
- `GET /api/super/overview`

## 修正済み

- `GET /api/super/overview` を他のsuper APIと同じ `requireSuper()` に統一し、`AUTH_PROVIDER=none` のローカルsuper確認でSupabase環境変数を要求しないようにした。
- 自治体追加/編集の年間活動費枠バリデーションを統一し、空入力が0扱いになる挙動を防いだ。
- `role=super` 付与、非active状態への変更、既存ユーザーのadmin昇格に確認ダイアログを追加した。
- アカウント管理表と概要表に横スクロールの余地を持たせ、列が詰まりすぎないようにした。
- モーダル/詳細パネルの閉じるボタン、アカウント管理表のselect/削除操作に `aria-label` を追加した。
- モーダル内エラー文の色を `text-red-700` に統一した。

## 検証

- `http://localhost:3001/super/` が200で開けることを確認。
- `http://localhost:3001/api/super/overview/` が200を返すことを確認。
- `npm run test -- src/app/api/super/overview/__tests__/authz.test.ts src/lib/db/__tests__/super.test.ts`
- `npm run typecheck`
- `npm run lint` (0 errors / 21 warnings)

## 制約

- このセッションでは in-app Browser が `Browser is not available: iab` で接続できなかったため、スクリーンショットベースの実操作レビューは未実施。
- Cloudflare Workers Buildの既存失敗は本レビュー対象外。

## 別タスク候補

- in-app BrowserまたはPlaywrightで1280px/1440px/1920pxのスクリーンショット確認を実施する。
