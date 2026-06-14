# Phase 1 タスク策定(Year 1-2 MVP〜ヒアリング)

> docs/24(Phase 1 設計書)を実行可能なタスクに分解。
> 8 マイルストーン × 42 タスク。各タスクに ID / 優先度 / 見積もり / 依存 / 完了条件 を付記。
> 進捗追跡用のチェックリストとしてそのまま使える形式。

## 進捗(2026-06-14 更新)

外部アカウント(AWS / Supabase / Vercel / ドメイン)を必要としない **コード・SQL タスクを先行実装**。

### ✅ 完了(コードで verify 済 / tsc + next build standalone 成功)
- **T-15/16/17 認証抽象**(`src/lib/auth/`、none / supabase、AuthProvider インタフェース)
- **T-24 ストレージ抽象**(`src/lib/storage/`、local / s3 / r2 / supabase、S3 互換)
- **T-25 メール抽象**(`src/lib/email/`、console / smtp、nodemailer 経由)
- **T-26/27 Bedrock AI プロバイダ**(`src/lib/ai/bedrock.ts`、Sonnet/Haiku ルーティング、factory に追加)
- **T-28 health 全プロバイダ対応**(`/api/health` で ai/auth/storage/email を疎通表示)
- **T-22 RLS を current_setting ベースで記述**(`supabase/migrations/...009_rls.sql`)
- **T-29 + T-34〜T-43 Postgres マイグレーション 10 ファイル**(`supabase/migrations/`)
- **T-30/31 Dockerfile + output:standalone**(`Dockerfile` / `.dockerignore` / next.config)
- **T-32 CONTRIBUTING.md**(載せ替え 10 か条 + 使わない Supabase 機能を明文化)
- **T-44 マイグレーション Runbook**(`supabase/README.md`、RLS の SET LOCAL 使い方含む)

### ⏳ 次にやる(コードで進められる)
- **T-19/20/21 Repository パターン**(DB アクセス抽象化、10 か条 #2)── 23 ルートの段階的移行
  - 現状: API Route は `@/lib/db` の all/get/run を直接利用(SQLite)
  - 目標: `src/lib/db/repositories/` 経由にして DB_PROVIDER で sqlite / supabase 切替

### ⛔ 外部アカウント待ち(コードでは進められない)
- T-01〜T-14(ドメイン / Cloudflare / AWS / Supabase / Vercel の実アカウント)
- T-45〜T-79(本番デプロイ・自治体折衝)を要する系
- ※ 抽象レイヤは実装済みなので、アカウント取得後は env 投入だけで本番化できる

## 凡例

| 記号 | 意味 |
|---|---|
| **優先度** | P0 = ブロッカー、P1 = 重要、P2 = nice-to-have |
| **見積** | h = 時間、d = 人日(8h)、w = 週(5d) |
| **依存** | 先に完了すべき先行タスクの ID |
| **DoD** | Definition of Done(完了条件) |

## マイルストーン全体像

| M | 期間 | 内容 | 終了判定 |
|---|---|---|---|
| **M1** | 2026-07-01 〜 07-14(2 週) | インフラ基盤構築 | `/api/health` で全プロバイダ疎通 |
| **M2** | 2026-07-15 〜 08-04(3 週) | 抽象化レイヤ実装(載せ替え 10 か条) | Supabase / AWS 両対応の AuthProvider + Repository + Bedrock 動作 |
| **M3** | 2026-08-05 〜 08-18(2 週) | データモデル + マイグレーション | 本番 DB にスキーマ + シード投入完了 |
| **M4** | 2026-08-19 〜 09-01(2 週) | セキュリティ実装 | PII Scrub + WAF + 監査ログ稼働 |
| **M5** | 2026-09-02 〜 09-15(2 週) | 監視・運用整備 | アラート 6 種 + バックアップ復元テスト合格 |
| **M6** | 2026-08-19 〜 09-22(M4-5 と並行) | 説明責任資料作成(8 種) | 全資料ドラフト完成 + 内部レビュー合格 |
| **M7** | 2026-09-16 〜 09-30(2 週) | PoC 開始準備 | 自治体 1 件と契約締結、提案資料完成 |
| **M8** | 2026-10-01 〜 12-31(3 ヶ月) | クローズドβ実施 + 有償契約 1 件目 | 隊員 5 名が週 3 件以上活動報告、有償契約 1 件 |

---

## M1. インフラ基盤構築(2026-07-01 〜 07-14)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-01** | ムームードメインで `kyoryokutai.example.jp` 取得 | P0 | 1h | — | WHOIS で確認 + ネームサーバ Cloudflare に変更完了 |
| **T-02** | Cloudflare 無料アカウント作成 + ドメイン追加 | P0 | 2h | T-01 | DNS が Cloudflare 経由で解決、Always Use HTTPS + HSTS + Bot Fight Mode 有効化 |
| **T-03** | AWS アカウント開設 + MFA + 請求アラート設定 | P0 | 2h | — | コンソールログイン可、Region = ap-northeast-1 固定 |
| **T-04** | AWS Bedrock モデルアクセス申請(Sonnet 4.6 + Haiku 4.5 jp.* CRIS) | P0 | 0.5h + 1-2 営業日 | T-03 | コンソールで「Access granted」表示 |
| **T-05** | AWS SES Production access 申請 | P0 | 0.5h + 1-3 営業日 | T-03 | サンドボックス解除完了 |
| **T-06** | AWS IAM ユーザー `kyoryokutai-bedrock-ses` 作成 | P0 | 1h | T-04, T-05 | プログラムアクセスキー発行、最小権限ポリシー適用(docs/24 §7.4) |
| **T-07** | Supabase 新規プロジェクト作成(Region = ap-northeast-1) | P0 | 0.5h | — | URL + anon/service_role キー取得、Pro $25/月にアップグレード |
| **T-08** | Supabase の SMTP を AWS SES に切替 | P0 | 1h | T-06, T-07 | Magic Link テストメールが SES 経由で届く |
| **T-09** | Cloudflare R2 バケット `kyoryokutai-receipts` 作成 + API Token 発行 + CORS 設定 | P0 | 1h | T-02 | テストファイル PUT/GET 成功 |
| **T-10** | Vercel Pro アカウント + GitHub リポジトリ連携 + `hnd1` Function Region 固定 | P0 | 2h | — | デプロイ成功、Region が `hnd1` であることを Dashboard で確認 |
| **T-11** | Vercel に Custom Domain `kyoryokutai.example.jp` 追加 + Cloudflare CNAME 設定 | P0 | 1h | T-02, T-10 | https://kyoryokutai.example.jp で Vercel デフォルトページが表示 |
| **T-12** | Sentry Developer プロジェクト作成 + DSN 取得 | P1 | 0.5h | — | DSN を `.env` に投入 |
| **T-13** | `.env.production` テンプレ作成 + Vercel Environment Variables に投入 | P0 | 1h | T-06〜T-12 | `vercel env pull` で全変数が取得可、漏洩なし(Service Role Key 等は server-only) |
| **T-14** | `/api/health` エンドポイント実装(全プロバイダ疎通確認) | P0 | 2h | T-13 | curl で `{"db":"ok","ai":"ok","ses":"ok","r2":"ok"}` が返る |

**M1 合計:** 約 14h(2 人日) + AWS 承認待ち最大 3 日

---

## M2. 抽象化レイヤ実装 ─ 載せ替え 10 か条(2026-07-15 〜 08-04)

ADR-018 / docs/24 §15.6 の 10 か条を **コードで担保** する。Phase 2 移行コストを最小化する根幹。

### M2-A. 認証層抽象化

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-15** | `src/lib/auth/types.ts` に `AuthProvider` インタフェース定義 | P0 | 2h | — | `sendMagicLink` / `verifySession` / `getCurrentUser` / `signOut` の 4 メソッド宣言 |
| **T-16** | `src/lib/auth/supabase.ts` 実装 | P0 | 4h | T-15, T-07 | Supabase Auth クライアントを内部で使い、AuthProvider 契約を満たす |
| **T-17** | `src/lib/auth/index.ts` ファクトリ(`getAuthProvider()`)実装 | P0 | 1h | T-16 | `AUTH_PROVIDER=supabase` で SupabaseAuthProvider が返る |
| **T-18** | `src/middleware.ts` で AuthProvider 経由のセッション検証に書き換え | P0 | 3h | T-17 | 既存 Supabase Client 直接呼び出しを撤去、middleware からは AuthProvider のみ参照 |

### M2-B. DB アクセス層抽象化(Repository パターン)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-19** | `src/lib/db/repositories/types.ts` に各エンティティの Repository インタフェース定義 | P0 | 4h | — | 9 エンティティ(activity_logs / expenses / monthly_reports / approvals / 等)の CRUD 契約 |
| **T-20** | `src/lib/db/repositories/supabase/*.ts` 実装 | P0 | 2d | T-19, T-07 | 各 Repository を Supabase Client で実装、API Route から直接 Supabase Client を呼ばない |
| **T-21** | 既存 API Route(`src/app/api/*`)を Repository 経由に書き換え | P0 | 2d | T-20 | grep で `createClient(supabase)` の直接呼び出しがゼロ |

### M2-C. RLS を current_setting ベースで記述

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-22** | RLS ポリシー 7 件を `current_setting('app.current_user_id')` ベースに書き直し | P0 | 1d | — | `auth.uid()` 直接参照ゼロ(`current_user_role()` 等のヘルパー関数経由は OK) |
| **T-23** | Supabase 接続時に `SET LOCAL app.current_user_id` を発行するミドルウェア | P0 | 4h | T-22 | 全 DB クエリ前にユーザー ID が session variable にセットされる |

### M2-D. Storage / メール / AI 抽象化

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-24** | `src/lib/storage/index.ts` に S3 互換抽象(`@aws-sdk/client-s3` 経由)実装 | P0 | 4h | T-09 | `STORAGE_PROVIDER=r2` で R2、`s3` で AWS S3、`supabase` で Supabase Storage がすべて同コードで動く |
| **T-25** | `src/lib/email/index.ts` に nodemailer 経由のメール送信抽象 | P0 | 3h | T-05 | SMTP 接続情報を env から取得、AWS SES SMTP で Magic Link 以外の通知メール送信成功 |
| **T-26** | `src/lib/ai/bedrock.ts` 実装(docs/24 §7.2 のコードベース) | P0 | 4h | T-04, T-06 | `AI_PROVIDER=bedrock` で Sonnet/Haiku のタスク別ルーティング + Prompt Caching ON |
| **T-27** | `src/lib/ai/index.ts` ファクトリに `bedrock` ケース追加 | P0 | 0.5h | T-26 | `getAIProvider()` が `bedrock` を選択可 |
| **T-28** | `/api/health` に AuthProvider / Storage / Email / AI の疎通チェック追加 | P1 | 2h | T-17, T-24, T-25, T-27 | 全レイヤの ok/ng が JSON で返る |

### M2-E. Postgres 標準 SQL + Dockerfile

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-29** | SQLite → Postgres スキーマ移行(docs/22 を Postgres 方言に書き換え) | P0 | 1d | — | Supabase SQL Editor で全テーブル CREATE 成功、`pgcrypto`/`uuid-ossp` 拡張のみ使用 |
| **T-30** | `Dockerfile` 作成(`next build` + `output: 'standalone'`) | P0 | 3h | — | `docker run -p 3000:3000 kyoryokutai` でローカル起動成功 |
| **T-31** | `next.config.mjs` に `output: 'standalone'` 追加(既存設定維持) | P0 | 0.5h | T-30 | `.next/standalone` が生成される |

### M2-F. Supabase 固有機能を使わない方針の明文化 + Lint

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-32** | `CONTRIBUTING.md` に「使わない機能リスト」明記(Edge Functions / Realtime / DB Webhooks) | P1 | 1h | — | ドキュメント追加 |
| **T-33** | ESLint custom rule で `supabase.functions` / `supabase.channel` / `supabase.realtime` 呼び出しを禁止 | P2 | 3h | T-32 | 違反コードでビルド失敗 |

**M2 合計:** 約 12 人日(2 人で 6 営業日 = 1.5 週間)

---

## M3. データモデル + マイグレーション(2026-08-05 〜 08-18)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-34** | `supabase/migrations/20260805_001_identity.sql` 作成(municipalities / host_organizations / users / assignments) | P0 | 4h | T-29 | `supabase db push` で適用成功 |
| **T-35** | `20260805_002_activities.sql`(activity_topics / activity_logs / projects) | P0 | 3h | T-34 | 同上 |
| **T-36** | `20260805_003_reporting.sql`(monthly_reports) | P0 | 2h | T-35 | 同上 |
| **T-37** | `20260805_004_expenses.sql`(expenses 二系統動線 + 親子) | P0 | 4h | T-36 | 同上 |
| **T-38** | `20260805_005_workflow.sql`(approval_routes / approval_route_steps / approvals) | P0 | 4h | T-34 | 同上 |
| **T-39** | `20260805_006_communication.sql`(announcements / announcement_reads) | P0 | 2h | T-34 | 同上 |
| **T-40** | `20260805_007_ai_knowledge.sql`(consultations / cases_public / guidelines) | P0 | 3h | T-34 | 同上 |
| **T-41** | `20260805_008_audit.sql`(audit_logs + 更新トリガー) | P0 | 3h | T-34 | 同上 |
| **T-42** | `20260805_009_rls.sql`(RLS ポリシー 7 件、T-22 完了版) | P0 | 4h | T-34〜T-41, T-22 | RLS が有効、テストクエリで隊員間データが分離されることを確認 |
| **T-43** | `20260805_010_seed.sql`(自治体 1 件 + 管理者 + デフォルト経費種別 + 全国事例 10-30 件 + ガイドライン) | P0 | 1d | T-34〜T-42 | seed 後にダッシュボードで全テーブルに行が入っている |
| **T-44** | マイグレーション適用の Runbook 化(staging → production の手順書) | P1 | 2h | T-34〜T-43 | docs/24 §13 にリンク追加 |

**M3 合計:** 約 4 人日

---

## M4. セキュリティ実装(2026-08-19 〜 09-01)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-45** | Sentry `beforeSend` で PII Scrub 実装(docs/24 §9.7) | P0 | 4h | T-12 | 意図的にエラー発火 → Sentry ダッシュボードで個人情報が `[REDACTED]` |
| **T-46** | 活動報告自由記述に「住民個人特定情報は記載しないでください」UI ヒント表示 | P0 | 2h | — | 該当画面でプレースホルダー表示 |
| **T-47** | 活動報告保存時に AI で氏名検出 → 警告ダイアログ | P1 | 1d | T-26, T-46 | テスト文「田中太郎さんと面談」で警告が出る |
| **T-48** | プロジェクト関係者欄を構造化フィールド(役割名・住所コード)に変更 | P0 | 1d | — | 自由記述の比重を下げ、構造化必須化 |
| **T-49** | 経費の用途欄に「氏名・住所等の個人情報を含めないでください」インラインヒント | P0 | 1h | — | 該当画面で表示 |
| **T-50** | 月報生成プロンプトに「住民個人を特定する情報は含めない」を明示 | P0 | 1h | T-26 | プロンプト変更後、テスト出力で住民個人情報が含まれないことを確認 |
| **T-51** | Cloudflare WAF レート制限 4 ルール設定(docs/24 §10.5) | P0 | 2h | T-02 | 異常リクエストが 429 で弾かれる |
| **T-52** | 監査ログ書き込みトリガー実装(承認・差戻し・経費精算・退任・削除・公開・エクスポート) | P0 | 1d | T-41 | 各操作後 `audit_logs` に 1 行追加されることを確認 |
| **T-53** | Storage バケットの CORS / Public Access を厳格化(R2 + Supabase Storage) | P0 | 2h | T-09, T-24 | 認可なしで GET 不可、PUT は SignedURL 経由のみ |
| **T-54** | 保管時暗号化の確認(Supabase = 標準、R2 = 標準、Bedrock = 保存しない) | P1 | 2h | — | docs/24 §10.1 を実装と整合させ、添付資料 1 に反映 |

**M4 合計:** 約 5 人日

---

## M5. 監視・運用整備(2026-09-02 〜 09-15)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-55** | Cloudflare Web Analytics 有効化 + ダッシュボード共有 | P1 | 1h | T-02 | URL 共有可、訪問者データが Cloudflare に表示 |
| **T-56** | UptimeRobot 無料アカウントで `/api/health` を 5 分間隔監視 | P1 | 1h | T-14 | ダウン時にメール通知される |
| **T-57** | アラート 6 種設定(docs/24 §12.2、Sentry / API レスポンス / DB CPU / Bedrock コスト / SES バウンス / 認証失敗) | P0 | 1d | T-12, T-45, T-51 | 各アラートのテスト発火に成功 |
| **T-58** | AWS Cost Explorer 月次予算 ¥30,000 設定 + メールアラート | P0 | 1h | T-03 | 80% 超で通知 |
| **T-59** | Slack / Discord に `#incidents` チャンネル作成 + Sentry / UptimeRobot Webhook 連携 | P1 | 2h | T-45, T-56 | テストアラート受信成功 |
| **T-60** | Supabase PITR の動作確認(staging で 1 時間前に restore テスト) | P0 | 3h | T-07, T-43 | 過去時点の DB スナップショットから読み取り可能 |
| **T-61** | R2 オブジェクトバージョニング有効化 + 削除復元テスト | P1 | 1h | T-09 | 削除したファイルを過去バージョンから復元成功 |
| **T-62** | インシデント対応 Runbook 訓練(運営チーム内ロールプレイ、docs/24 §14) | P0 | 4h | T-59 | P0/P1/P2 シナリオ各 1 件を演習、議事録を残す |

**M5 合計:** 約 3 人日

---

## M6. 説明責任資料作成(2026-08-19 〜 09-22、M4-5 と並行)

docs/24 §11.2 の添付資料 8 種類を作成。各資料は **PDF 化して兵庫県内自治体に提示できる完成度**を目指す。

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-63** | データフロー図(PDF)─ docs/24 §2 / §4 を draw.io で図化 | P0 | 4h | M2 完了 | A4 1-2 枚、隊員/役場/外部 SaaS の経路が一目で分かる |
| **T-64** | セキュリティチェックシート(Excel 記入版)─ ISMAP 管理基準 70-100 項目テンプレに記入 | P0 | 2d | M4 完了 | 全項目に「該当/非該当/補足」を記入、内部レビュー合格 |
| **T-65** | 個人情報の取扱いに関する規程(PDF) | P0 | 1d | T-63, T-64 | 取扱目的・保管期間・第三者提供の有無・削除フローを明記 |
| **T-66** | インシデント対応手順書(PDF)─ docs/24 §14 ベース | P0 | 4h | T-62 | P0-P3 区分、通知先、ロールプレイ結果を反映 |
| **T-67** | 想定問答集(PDF)─ docs/24 §11.1 を自治体担当課向けに詳細化 | P0 | 1d | T-63, T-64, T-66 | 10 問答 + 補強資料 URL 付き |
| **T-68** | データ削除手順書(PDF) | P0 | 4h | M4 完了 | 退任・契約解除時のデータ削除フロー + 削除証明書テンプレ |
| **T-69** | バックアップ・リストア手順書(PDF)─ docs/24 §13 ベース | P0 | 4h | T-60 | 隊員 / 役場 / 管理者向けの復元依頼フロー |
| **T-70** | 先行自治体事例集(PDF)─ 横須賀 / 三重 / 浜松 / kintone 採用一覧 | P1 | 4h | — | 半年に 1 回更新する運用方針を含む |

**M6 合計:** 約 7 人日(M4-5 と並行可)

---

## M7. PoC 開始準備(2026-09-16 〜 09-30)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-71** | 利用規約 + プライバシーポリシー策定(自治体 + 隊員向け 2 種) | P0 | 1d | T-65 | 法務レビュー(可能なら弁護士)合格、サイトに掲載 |
| **T-72** | 契約書ひな型作成(自治体公式契約 + 隊員セルフサーブ利用同意) | P0 | 1d | T-71 | 内部レビュー合格、Word/PDF 両形式 |
| **T-73** | 自治体提案資料(横須賀・三重事例引用版)作成 | P0 | 2d | M6 完了 | 30-40 ページ程度、デモ動画 3 分付き |
| **T-74** | 兵庫県内 1 市町(豊岡 / 神戸 / 西脇 / 新温泉 / その他)と協議開始 | P0 | 2d(調整含む) | T-73 | 担当課との初回面談実施、フィードバック取得 |
| **T-75** | 自治体担当者と情報セキュリティ担当者の同席ミーティング | P0 | 1d | T-74 | チェックシート(T-64)レビュー、追加質問 5-10 件への回答準備 |
| **T-76** | 自治体 1 件と PoC 実施合意(無償または少額契約) | P0 | 1d | T-75 | 覚書 or 利用同意書 締結 |
| **T-77** | 本番デプロイ → ヘルスチェック → クローズドβ準備完了通知 | P0 | 1d | M1-M5 完了, T-76 | `/api/health` 全 ok、ステージング → 本番 promote 成功 |
| **T-78** | 隊員 5 名にアカウント発行 + Magic Link 招待メール送信 | P0 | 1h | T-77 | 全員初回ログイン成功 |
| **T-79** | キックオフ MTG(隊員 5 名 + 役場担当課 1 名 + 運営チーム) | P0 | 2h | T-78 | 操作レクチャー、Q&A、フィードバック窓口共有 |

**M7 合計:** 約 8 人日

---

## M8. クローズドβ実施 + 有償契約獲得(2026-10-01 〜 12-31)

| ID | タスク | 優先度 | 見積 | 依存 | DoD |
|---|---|---|---|---|---|
| **T-80** | 週次 / 隔週で隊員フィードバック収集(アンケート + 1on1) | P0 | 継続 / 1 ヶ月 | T-79 | 4 週分のフィードバックドキュメント |
| **T-81** | バグ修正・UI 改善・AI プロンプト調整(継続的) | P0 | 継続 | T-80 | Sentry エラー率を週次で 10% 以上削減 |
| **T-82** | AI コスト計測 + 利用量分析(`consultations` テーブル週次集計) | P1 | 0.5h/週 | T-58 | 月次レポート、想定の ±20% に収まっているか |
| **T-83** | 月報生成の編集率測定(AI 案がそのまま通る割合) | P0 | 1h/月 | T-80 | 80% 以下を維持(=AI が使い物になる証拠) |
| **T-84** | 役場担当課に月報レビュー時間ヒアリング | P0 | 1h/月 | T-79 | 30 分以内に完了することを確認(KPI) |
| **T-85** | クローズドβ 2 ヶ月時点のレビュー MTG(隊員・役場・運営) | P0 | 2h | T-80〜T-84 | NPS / 継続意向 / 改善点を集約 |
| **T-86** | 有償契約への昇格交渉(契約書 T-72 ベース) | P0 | 1d 〜 数週間 | T-85 | 年 20-50 万円規模の契約締結 |
| **T-87** | 横展開準備(2 自治体目候補リスト 5-10 件) | P1 | 1d | T-85 | リスト作成、3 件以上にアプローチ開始 |
| **T-88** | Phase 2 移行のトリガー条件モニタリング(ARR / RFP 受領状況) | P1 | 0.5h/月 | T-86 | docs/24 §15.5 の 4 条件のうち何件満たしているか月次確認 |

**M8 合計:** 期間 3 ヶ月(継続作業)

---

## クリティカルパス

```
T-01 → T-02 → T-11 ─┐
T-03 → T-04 → T-06 ─┼─→ T-13 → T-14 ─→ M2(抽象化レイヤ)─→ M3(マイグレ)
T-07 → T-08 ─────────┘                ↓
                                       M4(セキュリティ)
                                       ↓
                                       M6(添付資料)
                                       ↓
                                       T-73 → T-74 → T-76 → T-77 → T-79
                                                                    ↓
                                                                  M8(PoC)
```

**最遅完了経路:** T-01 → ... → T-79(13 週、約 3 ヶ月)
**並行化可能タスク:** M6 は M4-5 と並行、T-70 / T-87 は早期着手可

---

## 工数サマリ

| マイルストーン | 人日(2 人体制想定) | 期間 |
|---|---|---|
| M1 インフラ基盤 | 2 | 2 週 |
| M2 抽象化レイヤ | 12 | 3 週 |
| M3 データモデル | 4 | 2 週 |
| M4 セキュリティ | 5 | 2 週 |
| M5 監視・運用 | 3 | 2 週 |
| M6 説明責任資料 | 7(M4-5 並行) | 5 週 |
| M7 PoC 開始準備 | 8 | 2 週 |
| **M1-M7 合計** | **41 人日** | **13 週(約 3 ヶ月)** |
| M8 PoC 実施 | 継続 | 3 ヶ月 |

**2 人フルタイム前提なら 2026-07 着手 → 2026-09 末 PoC 開始、2027-01 までに有償契約 1 件目** が現実的なライン。

---

## 優先度マトリクス(2026-07-01 着手判断)

### P0(着手しないと PoC が始まらない)
T-01〜T-14(インフラ)、T-15〜T-31(抽象化)、T-34〜T-43(マイグレ)、T-45〜T-53(セキュリティ)、T-57, T-60, T-62(運用必須)、T-63〜T-69(資料必須)、T-71〜T-79(PoC 準備)

### P1(あると質が上がる)
T-12, T-28, T-32, T-44, T-47, T-54, T-55, T-56, T-59, T-61, T-70, T-87, T-88

### P2(後回し可)
T-33(ESLint custom rule)

---

## リスクと対策

| リスク | 影響 | 対策 |
|---|---|---|
| AWS Bedrock モデル承認が 3 日以上かかる | T-14 遅延 → 全体 1 週遅れ | T-04 を最優先で 2026-07-01 当日に申請 |
| Supabase Auth → Cognito 抽象化が複雑化 | M2 が予定 3 週 → 5 週 | T-15〜T-18 のレビューを早期に実施、必要なら外部レビュアー |
| 自治体側情報セキュリティ担当者から想定外の質問 | T-75 で詰まる | 想定問答(T-67)を 10 問 → 20 問に拡張、横須賀・三重事例の追加調査 |
| PII Scrub の漏れ | 個人情報漏洩リスク | T-45 の動作確認を複数人で実施、第三者レビュー |
| 隊員のリテラシー差で UX 改善要望が膨大 | M8 で対応負荷増大 | T-80 で「直すもの / 直さないもの」を明示、優先度判断 |

---

## 次のアクション(明日からやること)

1. **T-01**(ムームー .jp 取得)─ 30 分で着手可
2. **T-03 + T-04 + T-05**(AWS アカウント + Bedrock + SES 申請)─ 承認待ち時間が長いので最優先
3. **T-07**(Supabase プロジェクト作成)─ Region = Tokyo 確実に
4. **T-10**(Vercel プロジェクト + Pro 契約)
5. **これらが終わったら M2 抽象化レイヤに進む**(Phase 2 載せ替えコストはここで決まる)

---

**作成日:** 2026-06-14
**関連:** ADR-018 / ADR-019 / docs/24 §15-17
