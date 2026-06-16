# 作業ログ

実装作業の完了記録。設計判断は `docs/19_v5_adr.md`(ADR)、詳細は commit / Issue を参照。

---

## 2026-06-16

### 完了
- **Issue #32 着手 — ADR-020 / ADR-021 を v5 試作とバックエンドに実装**
- ADR-020: 隊員側を「月報・経費・事例」の3タブに統合し日報タブを廃止
  - `DailyTab` / `DailyCreateSheet` 削除、デフォルトを月報タブに
  - 月報タブをカレンダー起点に刷新(`MonthOverview` 共有コンポーネント新設)
  - カレンダー日付タップ → 記録あり: 日別一覧 / なし: 活動作成シート
  - `ActivityCreateSheet` に `date` prop、`ReportDaySheet` に「この日の活動を追加」、FAB はセカンダリ動線化
- ADR-021: 経費を活動記録から独立させ「日報・活動記録・経費」の3層モデルへ
  - `daily_logs` テーブル新規、`activity_logs.daily_log_id`、`expenses.category` / `daily_log_id` 追加
  - mappers / repositories / API に `category` 配線、経費申請シートにカテゴリセレクタ
- 検証: `next build` 成功 / SQLite スキーマ実機適用テスト OK
- `/issues`・`/deepen`・`/record` スキル + 同名スラッシュコマンドを新設
- 設計議論深掘り用 `design-decision` スキルを `/issues`・`/deepen`・`/record` の3分割に再編

### 変更ファイル
- `src/app/v5/member/_app.tsx`: タブ再構成・MonthOverview・経費カテゴリ
- `src/lib/db/schema.ts`: 3層モデル(daily_logs / daily_log_id / category)
- `src/lib/api/mappers.ts` / `src/lib/db/repositories/{types,sqlite}.ts` / `src/app/api/expenses/route.ts`: category 配線
- `supabase/migrations/20260616_011_daily_logs.sql`: Postgres 側パリティ
- `docs/19_v5_adr.md`: ADR-020 / ADR-021
- `.claude/skills/{issues,deepen,record,design-decision}/SKILL.md` / `.claude/commands/{issues,deepen,record}.md`

### 次のアクション
- `dailyLogs.upsert` Repository + `POST /api/daily-logs`
- 活動作成時に当該日付の `daily_logs` ヘッダーを自動 upsert し `daily_log_id` を結線
- 経費の `daily_log_id` 紐付け動線(日報から経費を起票)
- Supabase 本番 DB への切替時の実マイグレーション適用
- Issue #35(ReportDaySheet レイアウト): max-w-2xl wrapper + SheetHeader 対応

### 関連
- Issue #32(実装中 / open)、#31・#28・#29・#30(設計確定でクローズ済)
- Issue #33・#34・#36・#37 クローズ済
- #1〜#26 は「凍結」指示によりこのセッションでは対象外

---

## 2026-06-16(続)

### 完了
- **Issue #33〜#37 対応 — /deepen ヒアリング結果を実装(ADR-022)**
- タブ構成を [活動記録][経費][お知らせ][事例] の4タブに変更(#34・#37)
  - 「月報」ラベル → 「活動記録」にリネーム
  - お知らせタブ(`AnnounceTab`)を新設、未読数バッジをタブに表示
  - ヘッダーのベルボタンを廃止
- カレンダー上部サマリー3セル(件数・時間・経費)を削除(#33)
- 月報ドキュメント生成セクションを隊員 UI から削除 → 役場側へ移設予定(#36)
- Issue #33・#34・#36・#37 GitHub でクローズ

### 変更ファイル
- `src/app/v5/member/_app.tsx`: 4タブ化・サマリー削除・ベル廃止・AnnounceTab 新設

### 次のアクション
- Issue #35: ReportDaySheet レイアウト修正(max-w-2xl + SheetHeader)
- 役場側に月報ドキュメント生成 UI を追加(Year 1 スコープ)
- `dailyLogs.upsert` Repository + `POST /api/daily-logs`

### 関連
- Issue #35(open)、#33・#34・#36・#37(クローズ済)

---

## 2026-06-16(続2)

### 完了
- **Supabase 接続 + デモシードデータ整備**
  - `supabase/migrations/014_demo_activity_logs.sql` 相当を直接 Supabase に適用
    - `daily_logs` 2件(6/10・6/12)、`activity_logs` 3件(調査・ミーティング・イベント準備)、`expenses` 1件(現地調査交通費 ¥2,400)
  - Supabase でのテーブルスキーマ確認: `expenses.amount` → `amount_requested`、`municipality_id NOT NULL` に対応
- **全 API ルートの Demo ID 統一**
  - `"m1"` / `"muni_shinonsen"` のハードコードを全廃
  - `process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-..."` / `NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-..."` に置換(11ファイル)
- **動作確認(Vercel)**
  - `/api/health` → `db.users=3`(Supabase ✅)
  - `/api/announcements` → 2件取得 ✅
  - `/api/cases` → 3件取得 ✅
  - `/api/expenses` → 1件取得 ✅
  - `/api/activity-logs` → Supabase DB に3件確認 ✅

### 変更ファイル
- `src/app/api/activity-logs/route.ts`: MUNI / DEFAULT_USER を env var 化
- `src/app/api/activity-logs/[id]/route.ts`: userId fallback を env var 化
- `src/app/api/expenses/route.ts`: MUNI / userId fallback を env var 化
- `src/app/api/announcements/route.ts`: MUNI を env var 化
- `src/app/api/approvals/route.ts`: MUNI を env var 化
- `src/app/api/daily-logs/route.ts`: userId fallback を env var 化
- `src/app/api/monthly-reports/route.ts`: userId fallback を env var 化
- `src/app/api/topics/route.ts`: userId fallback を env var 化
- `src/app/api/ai/monthly-report/route.ts`: userId fallback を env var 化
- `src/app/api/ai/consult/route.ts`: userId fallback を env var 化
- `src/app/api/ai/expense-check/route.ts`: municipalityId fallback を env var 化

### 次のアクション
- ANTHROPIC_API_KEY を Vercel に設定 → AI 機能(月報生成・経費チェック・AI 壁打ち)を有効化
- `/v5/member` の UI 実機確認(活動記録タブにデータが表示されるか)
- Issue #35: ReportDaySheet レイアウト修正
- 役場側月報ドキュメント生成 UI(ADR-022 / Year 1)

### 関連
- Issue #35(open)
