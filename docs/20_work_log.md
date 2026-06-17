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

---

## 2026-06-17

### 完了

#### Issue #42〜#49 一括実装(UI 改善バッチ)
- **#42** カレンダー今日強調: `"2026-06-11"` ハードコード → `todayKey()` で動的取得
- **#43** 活動記録フォーム改善: ヘッダーの記録ボタン廃止 → 入力欄下にスティッキー保存バー、保存後に日報シートへ戻る
- **#44** バーの縦黒線除去: 進捗バー2箇所の `border-r` を削除
- **#45** 経費バーをステータス別積算表示に刷新: 精算済(emerald) / 承認(sky) / 未精算(amber) / 申請中(slate) のセグメントバー
- **#46** 事例ダミーデータ3件追加: Supabase migration 017 で著者ユーザー3名 + cases_public 3件投入
- **#47前半** 活動内容インライン追加: `TopicEditSheet` 廃止 → `ChipPicker` コンポーネントで記録フォーム内から直接追加
- **#47後半** 事例 → 著者プロフィール遷移: `CaseDetailSheet` の著者名をタップで `CaseAuthorSheet` へ遷移、`/api/users/:id/profile` 新設
- **#48** 設定から「活動内容を編集」廃止
- **#49** タブをスティッキー固定: 設定画面以外でヘッダー+タブを `sticky top-0` に固定
- フッター完全削除

#### Supabase マイグレーション
- **015**: `users.auth_id uuid` カラム追加 + インデックス
- **016**: `activity_topics.kind text` カラム追加 + ユニーク制約を `(user_id, kind, name)` に変更
- **017**: 事例著者ユーザー3名 + cases_public 3件追加

#### 認証機能実装(#55)
- `src/middleware.ts`: 新設。`/v5/member|manager|admin` 保護、未ログインは `/v5/login?next=` にリダイレクト
- `src/app/v5/login/page.tsx`: Magic Link → メール+パスワード方式に変更
- `src/app/v5/signup/page.tsx`: 新設。名前・自治体・メール・パスワードで登録
- `src/app/api/auth/{callback,logout,me}/route.ts`: 認証フロー実装、me は新規ユーザー自動作成も対応
- `src/app/api/users/[userId]/profile/route.ts`: 著者プロフィール取得 API 新設
- デモバイパス: `?demo=true` で認証スキップ(全環境)、ログイン画面にリンク追加

#### モックデータ削除(作業中)
- `_app.tsx` の `seedLogs` / `seedReports` / `seedCases` / `seedTrend` / `initialExpenses` を全削除
- 初期値を空配列に変更 → Supabase からのみデータ取得
- Supabase への本番相当ダミーデータ投入は次のアクションへ

### 変更ファイル
- `src/app/v5/member/_app.tsx`: #42〜#49 + モックデータ削除
- `src/middleware.ts`: 認証保護 + デモバイパス
- `src/app/v5/login/page.tsx` / `signup/page.tsx`: 認証 UI
- `src/app/api/auth/*` / `src/app/api/users/[userId]/profile/route.ts`: 新規 API
- `src/lib/api/mappers.ts`: sourceUserId 追加
- `src/lib/db/repositories/{types,sqlite,supabase}.ts`: kind / getProfile 追加
- `supabase/migrations/20260817_015〜016.sql`: 新規

### 次のアクション
- Supabase に本番相当ダミーデータを SQL で投入(モックデータ削除の後始末)
- Issue #50: 経費バー 0件時も表示
- Issue #51: 経費追加ができない バグ修正
- Issue #53: PC 幅広時のヘッダー/FAB レイアウト修正
- Issue #54: お知らせ詳細画面が開けない バグ修正
- Supabase Auth > Email/Password プロバイダー有効化(ダッシュボード手動)
- ANTHROPIC_API_KEY を Vercel に設定

### 関連
- Issue #42〜#49(クローズ済)、#50〜#54(open)、#55(クローズ済)
