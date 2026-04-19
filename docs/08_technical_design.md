# 技術設計書 v1(実装前レビュー用)

**対象**: MVP(Year 1 前半)
**策定日**: 2026-04-19
**関連**: docs/06_requirements.md、docs/07_non_functional.md、CLAUDE.md v3.2
**注意**: 本書は設計レビュー用。コード実装はこの文書の承認後に着手する。

---

## 🎯 設計判断の基本方針

1. **小さく始める**: MVP はマネージド SaaS に寄せて運用負荷最小化
2. **標準を採用する**: 独自フレームワークを作らず、Next.js + Supabase のデファクトに乗る
3. **あとで差し替え可能にする**: AI/DB/認証はインタフェースで抽象化
4. **権限は DB 層で守る**: Postgres RLS を真実の源、アプリは 2 重チェック

---

## 1. 技術スタック(最終決定)

### 1.1 フロントエンド
| レイヤ | 採用 | 理由 |
|---|---|---|
| フレームワーク | **Next.js 15(App Router)** | Vercel 即デプロイ、Server Components で初期表示高速、PWA 対応容易 |
| UI | **Tailwind CSS + shadcn/ui** | 開発速度、モック→本番の流用性、アクセシビリティ |
| 状態管理 | **TanStack Query + Zustand** | API キャッシュ + 軽量ローカル状態 |
| フォーム | **React Hook Form + Zod** | スキーマ駆動、バリデーション一元化 |
| PWA | **next-pwa(Workbox)** | オフライン下書き保存、プッシュ通知 |
| マークダウン | **tiptap / remark** | 音声入力+編集、レンダリング |

### 1.2 バックエンド
| レイヤ | 採用 | 理由 |
|---|---|---|
| API | **Next.js Route Handlers** | 最小構成、Vercel Serverless 自動スケール |
| DB | **Supabase Postgres**(東京) | RLS が強い、認証付属、マネージド |
| 認証 | **Supabase Auth**(Magic Link) | 実装コストゼロ、MFA 拡張可 |
| ストレージ | **Supabase Storage** | 画像・音声、RLS と同期 |
| Realtime | **Supabase Realtime** | チャット・お知らせ配信の WebSocket |
| キュー(必要時) | **Upstash QStash** | 月次レポート生成・通知の非同期処理 |

### 1.3 AI・外部サービス
| 用途 | 採用 | 備考 |
|---|---|---|
| LLM(要約・整形) | **Anthropic Claude Sonnet 4.6** | 日本語品質、長文処理 |
| 文字起こし | **OpenAI Whisper API**(MVP後半) | 日本語精度、コスト |
| プッシュ通知 | **Web Push(VAPID)** | PWA 標準、iOS 16.4+ 対応 |
| メール | **Resend** | Magic Link + 通知メール |
| 監視 | **Sentry + Vercel Analytics** | エラー・パフォーマンス |

### 1.4 却下した選択肢(理由付き)
- **独自バックエンド(Rails/Go)**: 運用工数増、MVPに不要
- **Firebase**: RLSの表現力が不足、リージョン選定の柔軟性低
- **NextAuth**: Supabase Auth で十分、二重化しない
- **Prisma**: Supabase SDK + 型生成で十分

---

## 2. システム構成

### 2.1 構成図(論理)
```
┌─────────────────────────────────────────────────┐
│                   Client                        │
│  ┌──────────────┐      ┌──────────────────┐    │
│  │ PWA (隊員)    │      │ Web App (役場)    │    │
│  │ iPhone/Android│      │ PC Browser        │    │
│  └───────┬──────┘      └──────────┬───────┘    │
└──────────┼───────────────────────┼──────────────┘
           │                       │
           └───────┬───────────────┘
                   │ HTTPS / WSS
        ┌──────────▼──────────────┐
        │   Next.js (Vercel)      │
        │  - Server Components    │
        │  - Route Handlers (API) │
        └──────┬───────────┬──────┘
               │           │
   ┌───────────▼──┐    ┌───▼──────────────┐
   │   Supabase   │    │  Anthropic API   │
   │ ┌──────────┐ │    │  (Claude Sonnet) │
   │ │ Postgres │ │    └──────────────────┘
   │ │  + RLS   │ │
   │ └──────────┘ │    ┌──────────────────┐
   │ ┌──────────┐ │    │  Resend (Mail)   │
   │ │  Auth    │ │    └──────────────────┘
   │ └──────────┘ │
   │ ┌──────────┐ │    ┌──────────────────┐
   │ │ Storage  │ │    │  Upstash QStash  │
   │ └──────────┘ │    │  (Async Jobs)    │
   │ ┌──────────┐ │    └──────────────────┘
   │ │ Realtime │ │
   │ └──────────┘ │
   └──────────────┘
```

### 2.2 デプロイ環境
| 環境 | 用途 | URL 想定 |
|---|---|---|
| `dev` | ローカル開発 | `localhost:3000` |
| `preview` | PR プレビュー | `preview-<sha>.vercel.app` |
| `staging` | ヒアリング用 | `staging.example.jp` |
| `production` | 本番 | `app.example.jp` |

---

## 3. データモデル(ER 概略)

### 3.1 主要テーブル

```sql
-- 自治体・県(テナント単位)
tenants (
  id uuid PK,
  name text,            -- "丹波篠山市"
  type text,            -- 'municipality' | 'prefecture'
  parent_tenant_id uuid FK,  -- 市町村→県
  region text,          -- '兵庫県中部' (匿名化用)
  created_at timestamp
)

-- ユーザー
users (
  id uuid PK,           -- Supabase Auth と同一
  email text UNIQUE,
  full_name text,
  tenant_id uuid FK,
  role text,            -- 'member' | 'municipality_staff' | 'prefecture_staff' | 'super_admin'
  assigned_at date,     -- 隊員の着任日
  term_end_at date,     -- 任期満了予定
  anonymize_opt_in bool DEFAULT false,  -- Year 2 用
  status text,          -- 'active' | 'retired' | 'suspended'
  created_at timestamp
)

-- 役場担当と隊員の紐付け(多対多)
staff_member_assignments (
  staff_id uuid FK → users,
  member_id uuid FK → users,
  assigned_at timestamp,
  PRIMARY KEY (staff_id, member_id)
)

-- 日報
daily_logs (
  id uuid PK,
  user_id uuid FK → users,
  tenant_id uuid FK,
  log_date date,
  body_md text,
  voice_url text,       -- Supabase Storage
  image_urls text[],
  status text,          -- 'draft' | 'saved'
  created_at timestamp,
  updated_at timestamp
)

-- タグ
tags (
  id uuid PK,
  name text,            -- "移住促進"
  category text,        -- "policy" | "activity" | "custom"
  is_global bool,       -- グローバル定義 or テナント独自
  tenant_id uuid FK NULL
)

daily_log_tags (
  log_id uuid FK → daily_logs,
  tag_id uuid FK → tags,
  PRIMARY KEY (log_id, tag_id)
)

-- 月次報告
monthly_reports (
  id uuid PK,
  user_id uuid FK → users,
  tenant_id uuid FK,
  year_month text,      -- '2026-04'
  draft_md text,        -- AI 生成ドラフト
  edited_md text,       -- 隊員の編集後
  status text,          -- 'draft' | 'submitted' | 'approved' | 'rejected'
  ai_generated_at timestamp,
  submitted_at timestamp,
  approved_at timestamp,
  approved_by uuid FK → users,
  reviewer_comment text,
  created_at timestamp
)

-- お知らせ
announcements (
  id uuid PK,
  tenant_id uuid FK,
  author_id uuid FK → users,
  title text,
  body_md text,
  target_scope text,    -- 'all' | 'selected'
  created_at timestamp
)

announcement_targets (
  announcement_id uuid FK,
  user_id uuid FK,
  PRIMARY KEY (announcement_id, user_id)
)

announcement_reads (
  announcement_id uuid FK,
  user_id uuid FK,
  read_at timestamp,
  PRIMARY KEY (announcement_id, user_id)
)

-- チャット(1対1)
chat_threads (
  id uuid PK,
  tenant_id uuid FK,
  participant_a uuid FK → users,  -- member
  participant_b uuid FK → users,  -- staff
  created_at timestamp,
  UNIQUE (participant_a, participant_b)
)

messages (
  id uuid PK,
  thread_id uuid FK,
  sender_id uuid FK → users,
  body text,
  image_url text NULL,
  read_at timestamp NULL,
  created_at timestamp
)

-- 監査ログ
audit_logs (
  id uuid PK,
  user_id uuid FK,
  tenant_id uuid FK,
  role text,
  action text,          -- 'view_daily_log' etc.
  resource_type text,
  resource_id uuid,
  ip_hash text,
  user_agent text,
  result text,          -- 'success' | 'denied' | 'error'
  metadata jsonb,
  created_at timestamp
)
```

### 3.2 主要インデックス
- `daily_logs(user_id, log_date DESC)`
- `monthly_reports(user_id, year_month DESC)`
- `messages(thread_id, created_at DESC)`
- `audit_logs(tenant_id, created_at DESC)`
- GIN インデックス on `daily_logs.body_md`(pg_trgm)で全文検索

---

## 4. Row Level Security(RLS)方針

### 4.1 共通ヘルパ関数

```sql
-- 現在ユーザーのテナント取得
create function auth.tenant_id() returns uuid
  language sql stable as $$
    select tenant_id from users where id = auth.uid()
  $$;

-- 現在ユーザーのロール
create function auth.role_of() returns text ...;

-- 担当関係チェック
create function auth.is_assigned_staff_of(member uuid) returns bool ...;
```

### 4.2 代表的ポリシー例

```sql
-- daily_logs: 本人読み書き、担当staffは読み取りのみ、super_adminは全て
alter table daily_logs enable row level security;

create policy "member_own" on daily_logs
  for all using (user_id = auth.uid());

create policy "staff_read_assigned" on daily_logs
  for select using (
    auth.role_of() in ('municipality_staff','municipality_admin')
    and auth.is_assigned_staff_of(user_id)
  );

create policy "admin_read_tenant" on daily_logs
  for select using (
    auth.role_of() = 'municipality_admin'
    and tenant_id = auth.tenant_id()
  );

create policy "super_admin_all" on daily_logs
  for all using (auth.role_of() = 'super_admin');
```

### 4.3 アプリ層 2 重チェック
- サーバー側 Route Handler で再度 role / tenant を検証
- 権限外アクセス試行は全て監査ログへ(denied として記録)

---

## 5. API 設計(主要エンドポイント)

### 5.1 命名規則
- REST 風、Next.js Route Handlers
- バージョン prefix なし(MVP、破壊的変更時は v2 分岐)

### 5.2 エンドポイント一覧(抜粋)

| Method | Path | 概要 |
|---|---|---|
| POST | `/api/auth/magic-link` | ログインリンク送信(Supabase) |
| GET | `/api/me` | 自分のプロフィール |
| GET | `/api/daily-logs` | 日報一覧(自分 or 担当隊員) |
| POST | `/api/daily-logs` | 日報作成 |
| PATCH | `/api/daily-logs/:id` | 日報編集 |
| DELETE | `/api/daily-logs/:id` | 日報削除 |
| POST | `/api/daily-logs/:id/voice` | 音声添付アップロード |
| POST | `/api/daily-logs/:id/tags/suggest` | AI タグ提案 |
| GET | `/api/monthly-reports?ym=YYYY-MM` | 月次レポート取得 |
| POST | `/api/monthly-reports/:ym/generate` | AI 生成(非同期) |
| PATCH | `/api/monthly-reports/:id` | ドラフト編集 |
| POST | `/api/monthly-reports/:id/submit` | 提出(隊員→役場) |
| POST | `/api/monthly-reports/:id/approve` | 承認(役場) |
| POST | `/api/monthly-reports/:id/reject` | 差戻し |
| GET | `/api/monthly-reports/:id/export?fmt=pdf` | エクスポート |
| GET | `/api/announcements` | お知らせ一覧 |
| POST | `/api/announcements` | 配信(役場) |
| POST | `/api/announcements/:id/read` | 既読 |
| GET | `/api/chat/threads` | スレッド一覧 |
| GET | `/api/chat/threads/:id/messages` | メッセージ |
| POST | `/api/chat/threads/:id/messages` | 送信 |
| GET | `/api/dashboard/members` | 役場向け隊員一覧 |
| GET | `/api/audit-logs` | 監査ログ(super_admin) |

### 5.3 エラー形式
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "この日報にアクセスする権限がありません",
    "request_id": "uuid"
  }
}
```

### 5.4 レート制限
- Route Handler middleware で IP+ユーザー単位
- ログイン: 5 回 / 5 分
- AI 生成系: 10 回 / 時
- 一般 API: 100 回 / 分

---

## 6. AI 統合設計

### 6.1 月次報告生成プロンプト(概略)

```
[System]
あなたは地域おこし協力隊の月次活動報告を作成するアシスタントです。
提供される日報を元に、以下の5章立てで日本語の活動報告ドラフトを生成してください。

## 出力構造
1. 活動サマリ(200字以内)
2. 個別活動の詳細(カテゴリ別)
3. 成果物(リスト形式)
4. 来月計画
5. 所感・課題

## 制約
- 日報に書かれていない事実を創作しない
- 固有名詞は日報からそのまま引用
- 丁寧だが冗長でない文体
- 自治体提出を想定した客観的表現

[User]
対象隊員: {{name}}
自治体: {{municipality}}
対象期間: {{year_month}}

以下の日報 {{n}} 件を元に月次報告を作成してください:
---
{{daily_logs_as_markdown}}
---
```

### 6.2 タグ自動提案プロンプト(軽量)
- 入力: 日報本文 + 既存タグマスター
- 出力: タグ候補 TOP5(JSON)
- Sonnet 4.6 で実行、`max_tokens=200`

### 6.3 フォールバック
- Anthropic API 失敗時は「手動で書く」モードを提示
- リトライは 2 回(指数バックオフ)
- 生成失敗はエラーログ + ユーザーへ明示通知

### 6.4 プライバシー
- Anthropic API の `anthropic-beta: prompt-caching` 有効
- Data retention は 0 日(学習利用なし・履歴残さない設定)
- 匿名化処理(F18)は別経路、MVPでは未実装

---

## 7. PWA 設計

### 7.1 必須機能
- **ホーム画面追加**(manifest.json)
- **オフライン下書き**: IndexedDB に保存 → オンライン時に同期
- **プッシュ通知**: お知らせ・チャット未読
- **バックグラウンド同期**: 送信待ち日報をキューに置く

### 7.2 オフライン動作
| 動作 | オフライン時 |
|---|---|
| 日報入力 | IndexedDB に下書き保存 |
| 日報閲覧 | 直近 30 日キャッシュから表示 |
| 月次報告生成 | オンライン必須(エラー提示) |
| チャット送信 | キューに追加 → 接続時に送信 |
| お知らせ表示 | キャッシュから表示 |

### 7.3 通知
- iOS 16.4+ / Android Chrome で PWA 通知対応
- 非対応端末はメールにフォールバック

---

## 8. ファイル・メディア扱い

### 8.1 画像(日報写真・チャット画像)
- クライアント側で 1600px にリサイズ+WebP 変換
- Supabase Storage `images/{tenant_id}/{user_id}/{yyyymm}/{uuid}.webp`
- 署名付き URL(有効期限 1 時間)

### 8.2 音声メモ
- webm(opus codec)で録音、最大 3 分
- `audio/{tenant_id}/{user_id}/{yyyymm}/{uuid}.webm`
- 文字起こし後 30 日で自動削除(cron job)

### 8.3 署名付き URL とアクセス制御
- 画像・音声は Supabase Storage の RLS ポリシーで本人+担当のみ

---

## 9. 非同期処理

### 9.1 Upstash QStash のジョブ定義
| ジョブ | トリガー | 処理内容 |
|---|---|---|
| `generate-monthly-report` | ユーザー要求 | 日報集約 → Claude 呼出 → DB 保存 |
| `transcribe-voice` | 音声アップロード | Whisper API 呼出 → daily_logs.body_md に追記 |
| `cleanup-voice-files` | 日次 cron | 30 日経過した音声削除 |
| `push-announcement` | お知らせ配信 | 対象者に Web Push 送信 |
| `daily-digest` | 夕方 cron | 未入力隊員にリマインダー(opt-in) |

### 9.2 冪等性
- 全ジョブに `idempotency_key` を付与
- 重複実行を DB の UNIQUE 制約で防止

---

## 10. 可観測性(監視・ログ・メトリクス)

### 10.1 ログレベル
- `debug` / `info` / `warn` / `error`
- 個人情報はログに出さない(メール・氏名は ID のみ)

### 10.2 監視対象
| 指標 | ツール | 閾値 |
|---|---|---|
| エラー率 | Sentry | > 1% で Slack |
| API 応答時間 | Vercel Analytics | P95 > 3s |
| DB 接続 | Supabase dashboard | error rate |
| AI API コスト | 自作 ($/day) | 日 $10 超で通知 |
| アクティブユーザー | Product analytics | 週次 |

### 10.3 アラート経路
- 重要度高: Slack 即時
- 重要度中: 翌日サマリメール
- 重要度低: ダッシュボード閲覧

---

## 11. リリース戦略・CI/CD

### 11.1 ブランチ戦略
- `main`: production
- `develop`: staging(自動デプロイ)
- feature branch → PR → review → merge

### 11.2 CI(GitHub Actions)
- lint(ESLint)/ 型チェック(TS)/ テスト(Vitest)/ Build
- マイグレーション dry-run

### 11.3 リリースチェックリスト
- [ ] マイグレーション適用(ダウンタイムなし)
- [ ] RLS ポリシーの回帰確認
- [ ] 監査ログに新規イベントを追加したか
- [ ] Sentry にリリースタグ送信
- [ ] ロールバック手順が書かれているか

---

## 12. コスト精緻化(月額・本番想定)

### 12.1 MVP(Year 1 前半・1自治体・10人)
| 項目 | 月額 USD |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Resend | $20 |
| Upstash QStash | $10 |
| Sentry | $26 |
| Anthropic(月次報告+タグ) | $15(10人想定) |
| ドメイン・雑費 | $5 |
| **合計** | **≒ $120 / 月** |

### 12.2 Year 2(1県・100人規模)
| 項目 | 月額 USD |
|---|---|
| Vercel Pro+ | $40 |
| Supabase Team | $599(ロール・バックアップ強化) |
| Resend | $35 |
| QStash | $30 |
| Sentry | $80 |
| Anthropic | $150(100人) |
| **合計** | **≒ $900 / 月(年額 ≒ 160万円)** |

年商目標との整合性: Year 2 ARR 1,500万 vs インフラ160万 = GP 90% 以上で健全

---

## 13. リスク・未解決技術課題

### 13.1 技術リスク
| リスク | 影響 | 対応 |
|---|---|---|
| Supabase 東京リージョンの制約(Pro プラン必須など) | 中 | 確認済み、プラン選定で対応 |
| iOS PWA プッシュ通知の安定性 | 中 | 当初はメールフォールバック併用 |
| Claude API の無停止性 | 高 | OpenAI API をセカンダリに待機(将来) |
| Whisper 音声文字起こしの日本語精度 | 中 | 現地方言対応は要検証 |
| LGWAN 接続要求された場合 | 高 | ゲートウェイ経由の別建て構成が必要 |

### 13.2 未解決の設計論点
- [ ] 月次報告生成を同期 vs 非同期(現案: 非同期+Realtime 通知)
- [ ] チャットの既読仕様(メッセージ単位 or スレッド単位)
- [ ] お知らせの「全員送信」で個別 opt-out を許すか
- [ ] 複数自治体兼務隊員のデータモデル(MVP は単一所属前提)
- [ ] 退任時のデータ取り回し(ダウンロード + 削除同意フロー)

---

## 14. 実装に入る前の最終チェックリスト

このドキュメント承認後、以下を確認してから着手:

- [ ] docs/06(機能要件)との不整合がないか
- [ ] docs/07(非機能要件)と整合的か(RBAC・匿名化・監査)
- [ ] 戦略 v3.2(CLAUDE.md)の MVP スコープ通りか
- [ ] リスク 13.1 の「中」以上は対応策が明示されているか
- [ ] 採用ライブラリは全て無償 or 低コストか
- [ ] セキュリティ設計のピアレビュー(可能なら)

---

## 15. 次のアクション(実装フェーズ)

承認されたら、以下の順で着手する:

1. **Week 1**: Next.js プロジェクト初期化 + Supabase 接続 + マイグレーション
2. **Week 2**: 認証・ユーザー・テナント + RLS ポリシー
3. **Week 3**: 日報入力 + 一覧 + タグ
4. **Week 4**: 月次報告 AI 生成 + 編集 + 提出
5. **Week 5**: お知らせ + チャット + PWA 通知
6. **Week 6**: 役場ダッシュボード + 承認フロー + 監査ログ
7. **Week 7**: PWA オフライン + エクスポート
8. **Week 8**: α ヒアリング + バグ修正

**合計 8 週間でM2(MVP実装完了)、M3(α試験)へ**
