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

### 関連
- Issue #32(実装中 / open)、#31・#28・#29・#30(設計確定でクローズ済)
- #1〜#26 は「凍結」指示によりこのセッションでは対象外
