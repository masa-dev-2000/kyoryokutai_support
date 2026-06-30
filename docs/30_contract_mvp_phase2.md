# ADR-30: 契約・課金管理機能は Phase 2 に延期(UI 撤去)

**Status**: Decided (2026-07-01)
**Related Issues**: #72(契約取得エラー)/ #73(仕様見直し・MVP から除外)/ #68(4機能実装)

## Context

PR #68 で運営者(super)ダッシュボードに4機能を実装した:

1. ✅ 自治体ドリルダウン詳細
2. ✅ アカウント/ロール管理
3. ⚠️ **契約・課金管理** ← 本 ADR の対象
4. ✅ 横断 KPI/分析

本番で「契約」ボタンを押すと **「契約情報の取得に失敗しました」**(#72)になる。
原因は契約用 `contract_*` カラムの本番スキーマ未適用 + 課金フロー(請求書・決済)が
そもそも未実装で、「記録だけの半完成機能」が露出している状態だった。

## Decision

**契約・課金管理 UI を MVP から撤去し、Phase 2(Year 2 以降)に延期する。**

### 実装内容(UI 撤去)

`src/app/super/_app.tsx` から以下を削除:

- 自治体テーブル各行の「契約」ボタン
- 契約モーダル(`ContractModal` コンポーネント)とその呼び出し・state
- 契約専用の型/ラベル import(`ContractDTO` / `PLAN_LABEL` / `STATUS_LABEL` / `FileText`)
- 見出し「契約自治体」→「自治体」、空表示文言も同様に変更

### 温存するもの(Phase 2 で再利用)

- API ルート `src/app/api/super/municipalities/[id]/contract/route.ts`(GET/PATCH)
- Repository メソッド(`getContract` / `updateContract`)と `ContractDTO` 型
- migration の `contract_*` カラム定義

→ サーバ側は無害(誰も叩かない)なので残置。Phase 2 は UI を復活させるだけ。

## Rationale

1. **#72 の即時解消**: ボタンが無ければエラーも出ない。本番 UX を直ちに改善。
2. **MVP スコープの明確化**: 契約・課金は「自社の台帳」であり、隊員・自治体ユーザー
   への直接価値が薄い。課金体系は Year 2 の県共同調達確定後に最適化する(#73)。
3. **複雑性の削減**: 残り3機能(ドリルダウン/アカウント/KPI)で運営側は十分機能する。

## Alternatives Considered

| 案 | 評価 |
|---|---|
| そのまま残す(ボタン+エラー表示) | ❌ UX 最悪、バグレポート増 |
| コメントアウトで温存 | ⚠️ 未使用 import/コンポーネントが lint を汚す |
| **UI 撤去 + API/Repos 温存(採用)** | ✅ build クリーン、Phase 2 は git 履歴から復活容易 |

## Phase 2 復活手順

1. 本 PR を `git revert` するか、`git show <this-commit>:src/app/super/_app.tsx` で
   契約 UI 差分を参照して `_app.tsx` に再導入。
2. 本番に `contract_*` カラムの migration を適用。
3. 請求書発行・決済 API を新規実装(本 MVP では未着手)。
4. テスト・デプロイ。

API ルートと Repository は無変更で使い回せる。
