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

---

## 2026-06-18

### 完了

#### Issue #50/#51/#53/#54 バグ修正
- **#50** 経費バーを 0 件時も常時表示(空状態「申請 0件 ・ ¥0」を追加)
- **#51** 経費追加バグ修正:`approvals.enqueue`(supabase)に `total_steps` 欠落 → NOT NULL 違反。`total_steps: a.steps.length` を追加
- **#53** PC 幅広時のレイアウト:ヘッダーを `max-w-2xl` に内包、FAB を `right: max(1.5rem, calc(50vw - 21rem + 1.5rem))` でコンテンツ右端に追従
- **#54** お知らせ詳細が開けない → `AnnounceDetailSheet` を新設、`AnnounceTab` に `pushSheet` 動線

#### Issue #52 活動種別の削除・リネーム → 設計で解消
- とがった多役 agent 討論(実装者/経営者/苛烈な批判者/批判の批判者、孫氏/曹操/老子/諸葛亮)を実施
- 結論:`ChipPicker` を「チップ + 追加ボタン」から**自由入力 + 過去候補サジェスト方式**に刷新
  - 種別マスタを正規化せず文字列で持つため、削除・リネーム問題が構造的に発生しない
  - `activity_topics` は「過去に使った候補のキャッシュ」として存続、表記ゆれはサジェストで緩和

#### Issue #56 活動記録のデータ項目設計 → 隊員側を実装
- agent 討論(孫氏/曹操/老子/諸葛亮)で「取るべきデータ」を決定 → 諸葛亮案(構造 + 手応え)を採用
- **今日の手応え `feeling_score`(1〜4)**:絵文字スケール 😴🙂😊🔥。
  - 「評価」ではなく「コンディション」のエネルギー軸ラベル(つかれた/まあまあ/いい感じ/充実)で偽りを起きにくく
  - 役場へは個別値ではなく推移のみ共有する想定(UI 文言に明記)
  - issue 草案の `satisfaction_score` → 決定を反映し `feeling_score` に改名
- **接触人数 `contact_count`(任意)**:「住民◯人に対応」を予算・議会向けの言葉として残す
- 成果一言は既存の `body`(メモ + AI ブラッシュアップ素材)で兼ねる方針
- 配線:schema / mappers / repositories(types・sqlite・supabase)/ API(POST・PATCH)/ 作成シート・詳細シート・日別一覧の絵文字表示
- 検証:
  - Supabase 本番に migration 018 適用 → DB レベルで feeling/contact 保存・CHECK(1〜4)を確認
  - SQLite で API 全往復(POST 201 → GET 反映 → PATCH 更新 → 省略時も 201)を実機確認
  - `tsc --noEmit` クリーン

### 変更ファイル
- `src/app/v5/member/_app.tsx`: ChipPicker 刷新(#52)、FeelingPicker・接触人数・手応え表示(#56)
- `src/lib/db/schema.ts` / `src/lib/api/mappers.ts` / `src/lib/db/repositories/{types,sqlite,supabase}.ts`: feeling_score / contact_count 配線
- `src/app/api/activity-logs/route.ts` / `[id]/route.ts`: 新フィールドの受け渡し
- `supabase/migrations/20260618_018_activity_feeling.sql`: feeling_score / contact_count + CHECK

### 次のアクション
- Issue #56:役場側に「手応え」推移グラフ(Year 1)、#57 段階的ボタン選択の設計
- Issue #50/#51/#53/#54 を GitHub でクローズ
- ローカル `.env.local` の Supabase サービスロールキーが失効 → 本番(Vercel)の値で更新が必要

### 関連
- Issue #52(自由入力方式で解消)、#56(隊員側 実装 / open)、#50・#51・#53・#54(実装済・クローズ待ち)

---

## 2026-06-18

### 完了
- daily_logs を日報の親エンティティとし、distance_km / expense_amount / feeling_score を activity_logs から移管(ADR-023)
- contact_count を完全削除
- 活動登録 UI を「1日1フォームに複数活動カード」スタイルに刷新
- `POST /api/daily-logs` で日報＋複数活動の一括登録を実装
- GitHub issue #57(文字サイズ設定/老眼対応)を登録

### 変更ファイル
- `src/lib/db/schema.ts`: daily_logs に distance_km/expense_amount/feeling_score 追加、activity_logs からこれらと contact_count を削除
- `src/lib/api/mappers.ts`: `mapDailyLog` 関数を追加・export、`mapLog` を簡略化
- `src/lib/db/repositories/types.ts`: DailyLogDTO 型、dailyLogs.listByUser・upsert シグネチャ更新
- `src/lib/db/repositories/sqlite.ts` / `supabase.ts`: 上記モデル変更に追従
- `src/app/api/daily-logs/route.ts`: GET/POST エンドポイント新設
- `src/app/api/activity-logs/route.ts` / `[id]/route.ts`: 不要フィールド除去
- `src/app/v5/member/_app.tsx`: ActivityCreateSheet(マルチ活動モード)、DailyLogEntry 型追加
- `supabase/migrations/20260619_019_daily_log_fields.sql`: 本番 DB に適用済

### 次のアクション
- Issue #57(文字サイズ/老眼対応)の実装
- Vercel デプロイ後の動作確認

## 2026-06-27

### 完了
- 1Password CLI を Windows に導入し、`npm run op:doctor` / `npm run typecheck:op` / `npm run build:op` を通した
- `op run` 用の実行ラッパーを追加し、Windows の PATH 反映前でも 1Password CLI を使えるようにした
- 月次サイクルの実装方針を ADR-024 として記録し、隊員側の実装スライスを確定した

### 変更ファイル
- `.env.example` / `.env.1password.example` / `.gitignore` / `package.json` / `package-lock.json`
- `docs/27_secure_environment.md`
- `scripts/check-1password-cli.mjs` / `scripts/op-run.mjs`
- `docs/19_v5_adr.md`: ADR-024 追記

### 次のアクション
- 月次サイクル専用テーブル(`monthly_cycles`)の schema / repository / API を追加
- 隊員側 UI に月次目標・週次アクションプラン・振り返りパネルを追加
- 日報保存後の AI 調整提案をつなぐ

---

## 2026-06-28

### 完了
- **月次サイクル(ADR-024)Phase A を実装 — 任期ビジョン + 目標 + 週次アクションプランを独立フィーチャーとして単体完結**
- 設計方針を「疎結合パイプライン」に確定(オーナー判断):機能ごとに独立・データモデルは別々に保持、連結は埋め込みでなく「読んで比較・生成」。ADR-024 の「日報保存後フック」は廃止し、活動報告は無改修・完全独立に。
- 目標設定は「適度な選択式ヒアリング(方向→レベル→使える時間)→ AIドラフト → 壁打ちで詰める」。確定後の調整は手編集(週カード)＋壁打ち併用。入力画面はスクロールなし1画面・モバイル前提。
- 既存 `member/_app.tsx`・既存4タブには一切触れず、別ルート `/member/monthly-cycle` で実装。

### 変更ファイル
- `src/lib/db/schema.ts`: `visions` / `monthly_cycles` テーブル + INDEX
- `supabase/migrations/20260627_020_monthly_cycles.sql`: Postgres 側(action_plan / intake は jsonb)
- `src/lib/api/mappers.ts`: `mapVision` / `mapMonthlyCycle`(+ `WeekPlan` / `CycleIntake` 型)
- `src/lib/db/repositories/{types,sqlite,supabase}.ts`: `visions` / `monthlyCycles`(get/list/upsert)を3層配線
- `src/lib/ai/{types,bedrock,mock}.ts`: task `vision-coach` / `cycle-plan-gen` / `cycle-adjust-suggest` 追加(mock 応答も実装、cycle-plan-gen は Sonnet・他は Haiku ルーティング)
- `src/app/api/visions/route.ts` / `monthly-cycles/route.ts`: GET/POST(upsert)
- `src/app/api/ai/{vision-coach,cycle-plan-gen,cycle-adjust-suggest}/route.ts`: AI 3 ルート(JSON 出力)
- `src/app/member/monthly-cycle/{page,_app}.tsx`: 自己完結クライアントアプリ(ビジョン壁打ち→3問ヒアリング→ドラフト→壁打ち→確定ホーム→週調整シート)

### 検証
- `npm run typecheck` クリーン / `next build` 成功(新5 API + `/member/monthly-cycle` 生成確認)
- SQLite スキーマ in-memory 適用で両テーブル作成・`UNIQUE(user_id,year_month)` / `UNIQUE(user_id)` を確認
- ランタイム curl 往復はネットワーク不許可で未実施

### 次のアクション(Phase B / 別スライス)
- `member/_app.tsx` に「月次」タブを統合
- 達成状況(②活動報告と③の比較)フィーチャー
- 月次報告書の自動生成(乖離→`monthly_reports`)/ 役場の議会説明資料
- Supabase 切替時に migration 020 を手動適用

### 関連
- ADR-024(月次サイクル)、設計方針メモは AI メモリ参照

---

## 2026-06-28(続)

### 完了
- **デモユーザーを廃止し「実ユーザーのみ」動作に変更(認証本番化の第一歩)**
- 問題の特定: 全データAPIが `requireSession()` で認証確認はするが、データは**セッション本人ではなく `DEFAULT_USER`(デモのメンバーID)に紐づけ**ていた。`getAppUserId()` は定義のみで未使用。`?demo=true` バイパスも存在。→ ログインしても全員が同一デモユーザーとして動く状態だった。
- 対応:
  - `lib/auth/server.ts` に `getAppUser(authId)` 追加(id + role を1クエリ)。
  - `lib/api/auth.ts` に `requireAppUser()` 追加(セッション→本人解決。未認証401 / 未登録403。**クライアント送信の userId は信用せず常にこの値を使用=なりすまし防止**)。
  - 全ユーザースコープのAPI(activity-logs / activity-logs[id] / expenses / expenses[id] / monthly-reports / daily-logs / topics / monthly-cycles / visions / ai:consult / ai:monthly-report / ai:cycle-plan-gen / announcements[id]/read)を `requireAppUser` + `sess.userId` に統一。GETルートも認証必須化。`DEFAULT_USER` / `NEXT_PUBLIC_DEMO_MEMBER_ID` フォールバックを全廃。
  - `middleware.ts` の `?demo=true` バイパス削除。
  - `member/_app.tsx`: `DEMO_MEMBER_ID` 既定を撤去、`/api/auth/me` 未認証時は `/login` へリダイレクト、データ取得は本人解決後のみ。
  - `login/page.tsx`: 「デモを試す」リンク削除。
- 据え置き: `MUNI`(対象自治体)は単一テナント定数として継続(デモUSERとは別概念)。`lib/auth/none.ts` の固定ユーザーは `/api/health` 専用で経路ガードには無関係のため温存。
- **重要な帰結**: 本変更後、アプリは**実 Supabase セッション + `users` 登録済み**でないと全データが 401/403。動作には (1) Supabase 認証復旧(キー/Email-Password)(2) super 行作成 + auth ユーザー作成 が前提。

### 検証
- `npm run typecheck` クリーン / `npm run build` 成功(全API再生成)。
- ランタイム検証は Supabase 認証復旧後に実施(未了)。`DB_PROVIDER=supabase` 前提(本人解決は Supabase 経由のため)。

### 次のアクション
- (オーナー)Supabase: サービスロールキー更新 / Email-Password 有効化 / super(masa)の auth ユーザー作成
- super の `public.users` 行作成 SQL を適用 → 初回ログインで auth_id 自動リンク(#64)
- ログインして実ユーザーで一巡検証(月次サイクル含む)

---

## 2026-06-28(続2 / 別セッション: 活動シート UI ブラッシュアップ)

> 注:本セッションは上記「月次サイクル」「デモユーザー廃止」とは**別の作業ストリーム**。隊員側の既存「活動」タブの UI 改善に専念。

### 完了
- **4 ロール(隊員/役場/管理者/運営者)の実装機能を棚卸し**(実コード=画面ベース)。ブラッシュアップは「機能ごと」に進める方針で合意
- **活動作成シートを再設計(ADR-025)**
  - 入力欄ベタ置き → 「日報ホーム(要約カード一覧)+ 活動入力は全画面モーダル」へ
  - `ActivityFieldset`(共有フォーム)/ `ActivityEditor`(全画面オーバーレイ)/ `emptyActivity` を新設、単一活動編集も共通化
  - 新規追加時は直前活動の終了時刻を開始の既定にして連続入力を軽減
  - 「今日のまとめ」コンパクト化(移動距離1行・余白圧縮)
  - 手応え `FeelingPicker` はラベル維持 + タッチ 52px(一度絵文字のみに圧縮 → 実機レビューで差し戻し)
  - 未保存で閉じる際の確認ダイアログ(データ損失防止)
- **`seed.ts` のバグ修正**:廃止済み列 `activity_logs.expense_amount`(ADR-023 で daily_logs へ移管)を INSERT しており、ローカル SQLite が初回 seed で全 API 500 クラッシュ → activity_logs への挿入を削除
- **実機検証**(Claude in Chrome / localhost mock + SQLite):活動シートの新フロー・要約カード・時刻引き継ぎ・新「今日のまとめ」をスクショ確認
- **Vercel デプロイ確認**:最新 main(`0b68f31`)の Production は `state: success`。ただし URL は Vercel Authentication(デプロイ保護)付きで未ログインでは閲覧不可。本セッションの改修は**未コミット・未デプロイ**

### 変更ファイル(本セッション分)
- `src/app/member/_app.tsx`: 活動シート再設計・まとめコンパクト化・FeelingPicker・閉じる確認
- `src/lib/db/seed.ts`: activity_logs の expense_amount 挿入を削除(ADR-023 整合)

### ⚠️ 引き継ぎ注意(重要)
- ローカル確認のため `src/middleware.ts` に一時的に認証スキップ TEMP を入れていたが、中断時に **`git checkout` でコミット済み HEAD に復元して撤去済み**。
  - ただし HEAD の middleware は **`?demo=true` バイパスが残る版**。**並行ストリームの「`?demo=true` バイパス削除(デモユーザー廃止)」が未コミットだった場合、この checkout で巻き戻った可能性**がある。middleware は「実ユーザーのみ」方針側で再確認・再適用すること。
- `src/app/api/auth/me/route.ts` は並行ストリームが `AUTH_PROVIDER=none` 対応版に更新済(本セッションでは触っていない)。
- ローカル mock 起動は `AUTH_PROVIDER=none DB_PROVIDER=sqlite AI_PROVIDER=mock` + ダミー `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` で実施。middleware/`auth/me` が Supabase 直結で AuthProvider 抽象を経由していない構造的穴があり、`npm run dev:op`(local mock)が素直に動かない。

### 次のアクション(本セッション系)
- 活動シート改修を typecheck(無関係な `api/ai/vision-coach/route.ts` の既存エラー以外クリーン)→ ブランチ運用でコミット → PR
- middleware の認証を AuthProvider 抽象経由にし、`AUTH_PROVIDER=none` でローカル動作するよう統一(載せ替え 10 か条の徹底)

### 関連
- ADR-025(活動シート再設計)、ADR-023(expense_amount 移管)、ADR-016/018(AuthProvider 抽象)

---

## 2026-07-01

### 完了
- **Issue #119「アカウントタブ廃止→自治体ドリルダウン統合」+ #113「自治体作成→admin導線」を実装、PR #100 として develop へマージ**
- 実装コミット(ブランチ `feat/super-delete-ui`、`c162c53`→`3c7ff78`):
  - `c162c53` アカウント管理にユーザー削除UI追加
  - `ee0cf6e` 自治体の編集・削除UI追加
  - `6c11875` アカウント管理を自治体詳細に統合し、作成→招待を連結(#119/#113)
  - `366736b` レビュー指摘の確定バグを修正(下記参照)
  - `7dd4eb8` 自治体詳細にアカウント管理表(`MuniAccounts`)を追加し #119 回帰を解消
  - `3c7ff78` 招待モーダルに「既存ユーザーを昇格」モードを追加し #113 差し戻しに対応
- **オーナーレビューで CHANGES_REQUESTED を1回受けた**(2026-07-01T00:06:48Z、m-takehara555): 「#113 の②既存ユーザーをadmin昇格がUI上に導線が無い」との指摘。`InviteModal` を「新規招待/既存ユーザーを昇格」の2モードに変更(`3c7ff78`)して解消 → `APPROVED`(02:24:57Z)→ マージ(`ede290b`, 02:44:51Z)
- **確定バグ4件を修正**(`366736b`、事前の独立コードレビューで CONFIRMED):
  1. `ok(null, 204)` がサーバで throw し削除系APIが必ず500(Next.js の204はnullボディ不可のため)。`ok({ok:true})` の200へ統一。DELETE/更新系ルートで今後も同じ罠を踏まないよう注意。
  2. 自治体編集で年間予算の空入力が `Number(budget)||0` により意図せず0に上書き
  3. 自治体削除の在籍ユーザー判定が `role=super` を除外しており、super所属自治体が削除できてしまう
  4. Supabase repository の update/delete がエラーを握り潰し、失敗時も成功扱いになっていた

### 変更ファイル
- `src/app/super/_app.tsx`: 自治体編集・削除UI、`MuniAccounts`(自治体詳細内アカウント管理表)、`InviteModal`(新規招待/既存ユーザー昇格2モード)、`MuniModal`(作成→招待連結)
- `src/app/api/super/municipalities/[id]/route.ts`: PATCH/DELETE 追加(在籍ユーザー409ガード含む)
- `src/app/api/super/users/[id]/route.ts`: DELETE の204バグ修正
- `src/lib/db/repositories/{types,sqlite,supabase}.ts`: `updateMunicipality`/`deleteMunicipality` 追加、supabase側エラーハンドリング修正
- `src/lib/db/__tests__/super.test.ts`: 上記に対応するユニットテスト追加(計22件 pass)
- `docs/30_contract_mvp_phase2.md`: 契約UI撤去のADR(先行PR #92 分、参考)

### ⚠️ 引き継ぎ注意
- **ブランチ `feat/super-delete-ui` は使い切り(マージ済み)**。この続きの作業(下記アクション含む)は `origin/develop` から新しいワークツリー/ブランチを作ること(標準ルール①)。
- **Issue #119 は実装完了しているが GitHub 上は未クローズ**。`7dd4eb8`(`MuniAccounts` 追加)で解決している旨をオーナーに確認の上クローズ判断すること(本セッションでは判断保留)。
- **CI「Workers Builds: kyoryokutai-support」(Cloudflare)は本PR固有の問題ではない**。#120〜#128 など直近の全PRで同様にFAILUREしており、プロジェクト共通のCI基盤事象。実デプロイ経路のVercel Previewは成功している。対応の緊急度は低いが、放置し続けるとCI全体の信号が形骸化するため、どこかで別途原因調査が必要。
- 契約・課金管理UIはMVPスコープ外としてPhase2へ延期済み(`docs/30_contract_mvp_phase2.md`、先行PR #92)。super画面に契約関連の導線は現状無い。

### 次のアクション
- **super画面のUI/UX レビュー(設計済み・未実施)**: 新しいブランチで以下を実施
  - 対象: 概要一覧/自治体追加/自治体編集/自治体詳細ドリルダウン/自治体削除/管理者招待(新規・昇格)/`MuniAccounts`のrole・status・所属変更/ユーザー削除/自己変更ブロック/分析タブ/空状態全般/1280〜1920pxでの崩れ、計17項目
  - 評価観点: 一貫性・情報階層・状態表現(エラー/空/ローディング)・操作の分かりやすさ・確認ダイアログの妥当性・PC前提のレイアウト・アクセシビリティ基礎・マイクロコピー、の8軸
  - 検証方法: Claude-in-Chrome で `npm run dev:op`(`DEV_USER_ROLE=super` を環境変数で付与、`AUTH_PROVIDER=none` によりログイン操作不要)を実際に操作しスクリーンショットで確認。**新しいワークツリーには `.env.1password.local` が無いので、実行前にメインツリーからコピーする必要あり**
  - 既に判明している着眼点: エラーテキストの色トークンが `red-700`/`rose-500`/`red-600` で混在、削除には確認ダイアログがあるのに role を `super` へ変更する操作には確認が無い(誤操作リスク)、`MuniModal`(作成時)と `MuniEditModal`(編集時)で予算バリデーションの強さが違う、アイコンのみボタンに `aria-label` が無い箇所がある
  - 所見は「軽微(その場でJSX/文言修正)」と「重大(別issueに切り出し)」に分類して対応
- **Issue #119 のクローズ判断**(オーナー確認後)
- Cloudflare Workers Build 失敗の原因調査(緊急度低、別スレッドで可)

### 関連
- Issue #113(クローズ済 2026-06-30)、#119(open、実装済みだが未クローズ)
- PR #100(マージ済み、`ede290b`)、先行 PR #92(契約UI撤去)
- 204/nullボディの罠は今後 super 以外のロールでも踏みうる一般的な注意点(Next.js `NextResponse.json(null, {status:204})` は例外を投げる)

---

## 2026-07-01(続 / super画面 UI/UXレビュー + E2E)

### 完了
- **PR #152: super画面 UI/UXレビュー修正と Playwright E2E を追加**(ブランチ `codex/super-uiux-review-20260701`)
- 旧 `feat/super-delete-ui` は PR #100 でマージ済みのため再利用せず、`origin/develop` から新ワークツリー `.claude/worktrees/super-uiux-review` を切って作業。
- `4ed17e0 chore: restore lint on Next 16`
  - Next 16 で `next lint` が無くなっていたため、ESLint 9 用 `eslint.config.mjs` を追加し、`npm run lint` を `eslint .` に戻した。
- `2b8bf57 fix: improve super UI review flow`
  - `GET /api/super/overview` を他の super API と同じ `requireSuper()` に統一し、`AUTH_PROVIDER=none` のローカル super 検証で Supabase 環境変数を要求しないようにした。
  - 自治体追加/編集の年間活動費枠バリデーションを `parseBudgetInput` に統一し、空入力や負数が 0 上書きにならないようにした。
  - `role=super` 付与、非 active 状態への変更、既存ユーザー admin 昇格に確認ダイアログを追加。
  - 概要表/アカウント管理表に横スクロール余地を追加し、閉じるボタン/select/削除ボタンに `aria-label` を追加。
  - モーダル内エラー文の色を `text-red-700` に統一。
- `181e353 test: add super dashboard e2e coverage`
  - `@playwright/test` と `npm run e2e` を追加。
  - `playwright.config.ts` で `AUTH_PROVIDER=none` / `DEV_USER_ROLE=super` / SQLite の一意 DB / mock provider を指定し、ログイン不要で super 画面を検証できるようにした。
  - `e2e/super.spec.ts` で概要/分析、自治体作成→管理者設定、自治体詳細/アカウント管理、危険操作 confirm、所属ユーザーあり自治体の削除ブロックを検証。

### 変更ファイル
- `eslint.config.mjs`, `package.json`, `package-lock.json`, `.gitignore`
- `playwright.config.ts`, `e2e/super.spec.ts`
- `src/app/super/_app.tsx`
- `src/app/api/super/overview/route.ts`, `src/app/api/super/overview/__tests__/authz.test.ts`
- `docs/31_super_uiux_review.md`

### 検証
- `npm run e2e`: 4 tests passed
- `npm run lint`: 0 errors / 21 warnings(既存 warning)
- `npm run typecheck`: passed
- `npm run test -- src/app/api/super/overview/__tests__/authz.test.ts src/lib/db/__tests__/super.test.ts`: 2 files / 11 tests passed
- `git diff --check`: passed
- PR #152 checks: Vercel pass / Vercel Preview Comments pass / Supabase Preview skipped

### ⚠️ 引き継ぎ注意
- E2E は**ローカル実行用**で、CI にはまだ組み込んでいない。重さとブラウザ依存を見て、CI 組み込みは別判断にする。
- `npm run e2e` は Next dev server を起動する。既に同一 worktree で Next dev が動いていると Next 側の dev server ロックに当たるため、残プロセスがある場合は停止してから実行する。
- Playwright の既定ポートは `3210`。競合時は `E2E_PORT` で変更可能。
- in-app Browser は本セッションでも利用不可(`Browser is not available: iab`)。Preview `/super/` は super セッションが無く app レベルの権限エラーになるため、実操作確認はローカル E2E を正とした。
- lint warning 21 件は既存の未使用 import 等で、本 PR の追加差分に起因しない。

### 次のアクション
- PR #152 のレビュー/マージ判断。
- Issue #119 は実装済みだが未クローズのまま。PR #100/#152 の内容を踏まえてオーナー判断でクローズ。
- E2E を CI に入れるかは別途判断。入れる場合は実行時間、ブラウザキャッシュ、Vercel/Actions の責務分担を決める。
- Cloudflare Workers Build 失敗は本 PR 固有ではないため、別スレッドで原因調査。

### 関連
- PR #152: `[codex] super画面UI/UXレビューとローカル検証修正`
- ADR-026(super画面 Playwright E2E)
- `docs/31_super_uiux_review.md`
