# v5 技術設計書(1 週間 PoC 実装版)

`docs/20_v5_requirements.md` の要件を実装するための技術設計。
「1 週間で AI に書かせる」前提で、判断疲労を起こさないように選択肢は絞る。

## 1. アーキテクチャ全体図

```
                ┌─────────────────────────────────────────┐
                │  Browser (PWA-ready, mobile-first)       │
                │  ──────────────────────────────────────  │
                │  Next.js 15 App Router + Tailwind v4     │
                │  Sheet スタック + AppCtx                 │
                └────────────────┬────────────────────────┘
                                 │ HTTPS
                                 ▼
                ┌─────────────────────────────────────────┐
                │  Vercel (Edge / Node Runtime)            │
                │  ──────────────────────────────────────  │
                │  Next.js Route Handlers (/api/*)         │
                │  ・ AI proxy (Claude API)                │
                │  ・ メール送信                           │
                │  ・ AI 月報生成 / RAG                    │
                └────┬────────────────────────┬───────────┘
                     │                        │
                     ▼                        ▼
        ┌──────────────────────┐  ┌──────────────────────────┐
        │  Supabase            │  │  Anthropic Claude API    │
        │  ────────────────    │  │  ──────────────────────  │
        │  Postgres + RLS      │  │  Sonnet 4.6              │
        │  Auth (Magic Link)   │  │  ・ 月報生成              │
        │  Storage (写真等)    │  │  ・ 目的別相談            │
        │  Edge Functions      │  │  ・ 経費判定材料生成      │
        └──────────────────────┘  └──────────────────────────┘
```

## 2. 技術スタック(確定)

| レイヤ | 選定 | 理由 |
|---|---|---|
| フロント | Next.js 15 (App Router) | 既存 v5 試作の延長、SSR + Client Component の混在で軽快 |
| UI | Tailwind v4 | 試作と同じ。色は slate 基調 |
| アイコン | lucide-react | 試作と同じ |
| バックエンド | Next.js Route Handlers (`/app/api/*`) | 別サーバを立てない |
| DB | Supabase Postgres | Auth / Storage / Edge Functions も同居、運用工数最小 |
| 認証 | Supabase Magic Link | SSO は非採用(MVP 外) |
| AI | Anthropic Claude Sonnet 4.6 | 日本語要約の品質重視 |
| デプロイ | Vercel | Next.js との親和性、自動 Preview |
| メール | Resend(または Supabase 標準 SMTP) | Magic Link + 通知メール |

## 3. ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── monthly-report/route.ts   # 月報自動生成
│   │   │   ├── consult/route.ts          # 目的別 AI 相談
│   │   │   └── expense-check/route.ts    # 経費判定材料
│   │   └── notifications/route.ts        # メール送信
│   ├── v5/
│   │   ├── page.tsx                      # ハブ画面
│   │   ├── member/                       # 隊員モード
│   │   ├── manager/                      # 役場モード
│   │   └── admin/                        # 管理者モード
│   └── (auth)/
│       └── login/                        # Magic Link 入口
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # ブラウザ用
│   │   ├── server.ts                     # Server Action 用
│   │   └── middleware.ts                 # セッション更新
│   ├── claude/
│   │   ├── client.ts                     # Claude API SDK
│   │   ├── prompts/                      # 用途別プロンプト
│   │   └── rag.ts                        # 事例検索 + Embedding
│   └── auth/
│       ├── role.ts                       # ロール判定
│       └── tenant.ts                     # municipality_id 取得
└── middleware.ts                         # Supabase セッション middleware
```

## 4. 認証・認可

### 4.1 認証フロー(Magic Link)
1. ユーザーがメールアドレス入力 → Magic Link 送信
2. メール内リンクをタップ → セッション確立
3. `auth.users` テーブルから `municipality_id` と `role` を取得
4. `/v5` ハブにリダイレクト

### 4.2 ロール(3 種)
- `member`(隊員)
- `manager`(役場担当)
- `admin`(管理者)

ロールはユーザーレコードに紐づき、ハブ画面でロールに応じたエントリのみ表示する。

### 4.3 マルチテナント(自治体テナント)
- 全テーブルに `municipality_id` を持たせる
- RLS で `auth.uid() の municipality_id` と一致する行のみ参照可能
- 全国事例テーブルだけ `is_public = true` で他テナントから参照可能

### 4.4 RLS ポリシー(例)

```sql
-- activity_log: 自分の自治体の自分のログのみ
CREATE POLICY "activity_log_select" ON activity_log
FOR SELECT TO authenticated
USING (
  municipality_id = (SELECT municipality_id FROM users WHERE id = auth.uid())
  AND (
    -- 隊員は自分のログのみ
    user_id = auth.uid()
    -- 役場は管轄隊員のログを閲覧可能
    OR EXISTS (
      SELECT 1 FROM assignments
      WHERE staff_id = auth.uid() AND member_id = activity_log.user_id
    )
    -- 管理者は自治体内すべて閲覧可能
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
);
```

## 5. AI 統合

### 5.1 月報自動生成

**エンドポイント:** `POST /api/ai/monthly-report`

**入力:**
```typescript
{
  userId: string;
  yearMonth: string; // "2026-05"
}
```

**処理:**
1. `activity_log` から該当月のログを取得
2. `topics` で隊員のテーマを取得
3. システムプロンプト + 活動ログ JSON を Claude に投げる
4. 5 章構成のマークダウンを生成
5. `monthly_report` テーブルに `status='draft'` で保存

**システムプロンプト要約:**
- 「あなたは地域おこし協力隊の活動を月報にまとめる支援 AI です」
- 「事実は活動ログから抜粋し、創作しない」
- 「5 章構成:活動サマリ / 個別活動の詳細 / 成果物 / 来月計画 / 所感・課題」
- 「800-1200 字、敬語、自治体への提出文書として通用する文体」

### 5.2 目的別 AI 相談

**エンドポイント:** `POST /api/ai/consult`

**入力:**
```typescript
{
  context: "daily-write" | "report-plan" | "expense-purpose" | "case-find";
  payload: { current?: string; title?: string; amount?: string };
}
```

**処理:**
- `context` ごとに `system_prompt` を切替
- 履歴は持たない(単発の壁打ち)
- レスポンスは Markdown

**プロンプト戦略:**
```
daily-write     → 5W1H に沿った文章整理
report-plan     → 継続 / 新規 / 振り返り の 3 分類で計画立案支援
expense-purpose → 目的 / 必要性 / 効果 / 前例 の構造で用途整理
case-find       → 質問内容に近い全国事例を検索結果として提示(RAG)
```

### 5.3 経費判定材料 + RAG

**エンドポイント:** `POST /api/ai/expense-check`

**入力:**
```typescript
{
  title: string;
  amount: number;
  purpose: string;
}
```

**処理:**
1. `purpose` を Embedding(`text-embedding-3-small` 等)
2. Supabase の `pgvector` で `cases` テーブルから類似 3 件取得
3. `guidelines`(自治体ガイドライン)から関連条文を全文検索で取得
4. Claude に「判定材料テキスト」+ 引用を生成させる
5. レスポンス:
   ```typescript
   {
     ai_note: string;
     citations: { source: string; quote: string }[];
   }
   ```

### 5.4 全国事例の匿名化フロー(ADR-011 準拠)

**方針**(ADR-011 参照):
- 隊員本人:opt-in で実名公開(初期 OFF)
- 自治体名:常に公開
- 関係者(個人・民間企業):自動匿名化
- 公的団体(自治会・観光協会・学校等):実名で残す

**処理ステップ:**

1. プロジェクト完了 + `is_public = true`(隊員のオプトイン)
2. Edge Function `anonymize_case` が起動(同期 or キューイング):
   - **隊員名:** `users.disclose_name_in_cases` に従って判定
     - `true` の場合:`author_label = name`
     - `false` の場合:`author_label = role_label`(例:「移住促進担当」)
     - プロジェクト単位で `disclose_name_override` があれば優先
   - **自治体名:** `municipalities.name` をそのまま出力
   - **関係者匿名化:** Claude にプロンプト送信、戻り値を `cases_public.summary` 等に投入
     ```
     [プロンプト要約]
     以下の事例本文から、(a) 個人名 と (b) 民間企業名 を匿名化してください。
     公的団体名(自治会、観光協会、商工会、学校、行政機関)はそのまま残してください。
     置換ルール:
       - 個人名 → 「A さん」「住民の方」「協力者」等
       - 民間企業名 → 「地元の小売店」「町内の建設会社」等、業種と規模を保持
     ```
3. `cases_public` に **下書き状態**(`anonymized_by_review = false`)で挿入
4. 原著隊員に「公開前確認をお願いします」通知(メール + アプリ内)
5. 隊員がアプリ内で内容を確認、必要に応じて手動修正
6. 隊員が「公開する」ボタン → `anonymized_by_review = true` で他テナントに公開
7. Embedding を計算(text-embedding-3-small)

**LLM 精度の保険:**
- Claude による匿名化は完璧ではない前提
- 必ず隊員レビューを挟む(`anonymized_by_review` フラグ)
- レビュー画面で原文 / 匿名化版を並列表示、差分を強調
- 修正点があれば再生成 or 直接編集して保存

## 6. フロントエンド

### 6.1 状態管理
- **AppCtx**(React Context)で各画面のデータ + Sheet スタックを管理
- グローバル状態:`currentUser` / `role` / `municipalityId`
- 画面別状態:`AppCtx`(member / manager / admin で別実装)
- Sheet:`sheets: Sheet[]` のスタック構造

### 6.2 ルーティング
```
/                       トップ(v1〜v5 セレクタ)
/login                  Magic Link 入口
/v5                     ハブ(隊員 / 役場 / 管理者 セレクタ)
/v5/member              隊員 4 タブ
/v5/manager             役場 3 タブ
/v5/admin               管理者 3 タブ
```

### 6.3 SSR vs CSR
- 認証チェックは middleware(SSR)
- データ取得は Server Component(初回ロード)
- 編集系は Client Component + Server Actions

### 6.4 Sheet スタック実装(ADR-008)
```typescript
type Sheet = { kind: ... };
const [sheets, setSheets] = useState<Sheet[]>([]);
// push / pop / closeAll
```

## 7. バックエンド API

### 7.1 Route Handlers
```
/api/ai/monthly-report       POST  月報生成
/api/ai/consult              POST  目的別相談
/api/ai/expense-check        POST  経費判定材料
/api/notifications/send      POST  メール送信
/api/cases/anonymize         POST  事例匿名化(隊員 opt-in 起動 / Cron 起動)
/api/cases/publish           POST  匿名化レビュー後の公開(隊員操作)
```

**※ Year 2 で追加予定:**
```
/api/contact/send            POST  事例 → 隊員 連絡フォーム(ADR-011)
```

### 7.2 Server Actions
- フォーム送信は Server Actions で(activity_log の挿入など)
- Supabase クライアントをサーバ側で呼ぶ → RLS が効く

### 7.3 認可
- 全 API で `getSession()` でユーザーを取得
- ロール / `municipality_id` を確認
- RLS で DB 側でも防御

## 8. ストレージ

### 8.1 Supabase Storage バケット
- `receipts/` — 領収書(精算時アップロード)
- `photos/` — 活動報告の写真(MVP では UI のみ、保存は Year 2)
- `reports/` — 月報 PDF エクスポート

### 8.2 アクセス制御
- バケットごとに RLS ポリシー
- `receipts/{municipality_id}/{user_id}/...` の階層
- 隊員は自分のファイルのみ、役場は管轄隊員のファイル参照可能

## 9. 通知

### 9.1 トリガー
- 承認 → 隊員へメール
- 差戻し → 隊員へメール(コメント本文を含む)
- お知らせ送信 → 対象隊員全員へメール
- 月報下書き生成完了 → 隊員へメール(Year 1 後半)

### 9.2 実装
- Supabase の DB トリガー(承認時) → Edge Function → Resend で送信
- Magic Link メールも Resend 経由

### 9.3 PWA Push(Year 2)
- Service Worker 登録 + Subscription を `users.push_subscription` に保存
- Web Push 通知

## 10. AI コスト管理

### 10.1 想定使用量(PoC、隊員 5 名、月)

| 機能 | 単位 | 回数 / 月 | tokens / 回 | 月 tokens |
|---|---|---|---|---|
| 月報生成 | 隊員 | 5 × 1 = 5 | 30,000 (in 25k + out 5k) | 150,000 |
| AI 相談 | 隊員 | 5 × 10 = 50 | 4,000 | 200,000 |
| 経費判定 | 申請 | 5 × 5 = 25 | 6,000 | 150,000 |
| 事例 RAG | 検索 | 5 × 5 = 25 | 3,000 | 75,000 |
| 事例匿名化 | プロジェクト | 5 × 1 = 5 | 8,000 | 40,000 |
| **合計** | | | | **約 615,000 tokens / 月** |

Claude Sonnet 4.6 の料金で月 $5-7 程度。1 自治体年間 200 万円契約なら誤差。

### 10.2 ガードレール
- 1 隊員 1 日あたりの相談回数上限:20 回(モック)
- 月報生成は月 1 回 + 再生成 2 回まで
- 超過時は「明日再試行してください」表示

## 11. 監査ログ

### 11.1 対象操作
- 承認 / 差戻し
- 経費の作成 / 精算
- 隊員の追加 / 退任
- 担当割当の変更

### 11.2 形式
```typescript
{
  actor_id: uuid;
  action: string;
  target_table: string;
  target_id: uuid;
  diff: jsonb;
  created_at: timestamptz;
}
```

### 11.3 保持期間
- 監査ログ:5 年(自治体規定に準拠)

## 12. デプロイ

### 12.1 Vercel
- main ブランチ → Production
- claude/* ブランチ → Preview Deploy(自動)
- 環境変数:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`(Server Actions のみ)
  - `ANTHROPIC_API_KEY`
  - `RESEND_API_KEY`

### 12.2 Supabase
- Project: 1 つ(マルチテナントは RLS で実現)
- Region: ap-northeast-1 (Tokyo)
- バックアップ:Supabase 標準(日次)

### 12.3 ドメイン
- PoC:`kyoryokutai-support.vercel.app`(暫定)
- 本番:カスタムドメイン(契約後)

## 13. 監視・ログ

- Vercel Analytics(リクエストログ)
- Supabase Dashboard(SQL ログ)
- Sentry(Year 2、エラートラッキング)
- Claude API 使用量は Anthropic Console で確認

## 14. テスト戦略

### 14.1 1 週間 PoC では
- 手動テスト + Playwright スモーク(主要動線 5 本)
- 単体テストは原則書かない(時間が無い)

### 14.2 Year 1 で追加
- API ユニットテスト(Route Handlers)
- E2E カバレッジ拡張

## 15. セキュリティ(再掲)

| 観点 | 対策 |
|---|---|
| 通信 | TLS 1.3(Vercel) |
| 認証 | Supabase Magic Link |
| 認可 | RLS + ロールチェック |
| データ保護 | 自治体テナント分離、RLS |
| 個人情報 | 監査ログ、匿名化フロー |
| インジェクション | Supabase SDK のパラメータ化クエリ |
| XSS | React のエスケープ + ユーザー入力の Markdown は安全レンダラ |
| CSRF | Server Actions の自動防御 |
| 機密管理 | Vercel 環境変数 |

## 16. 1 週間 PoC で「やらない」

- マイクロサービス化
- 独自バックエンドサーバ(Express 等)
- Storybook、デザインシステム
- 単体テスト網羅
- CI/CD 多段(Preview Deploy で十分)
- Sentry / DataDog
- カスタムドメイン
- 多言語対応
- 監視ダッシュボード作成
