# Phase 1 設計書(Year 1-2 MVP〜ヒアリング)

> ADR-018 / ADR-019 / docs/23 で確定した本番スタックを、実装・デプロイ・運用に落とすための設計書。
> 詳細な機能仕様は docs/20(要件定義)/ docs/21(技術設計)/ docs/22(データモデル)を参照、
> 本書は **Phase 1(Year 1-2)で本番運用するために必要な追加設計** に絞る。

## 0. ドキュメントの位置づけ

| ドキュメント | 役割 | 本書との関係 |
|---|---|---|
| docs/19_v5_adr.md | アーキテクチャ決定記録 | **ADR-018 / 019 を実装に落とす** のが本書 |
| docs/20_v5_requirements.md | 要件定義 | 機能要件は docs/20 を真とする |
| docs/21_v5_technical_design.md | 技術設計(ローカル開発含む) | API 仕様・UI 設計は docs/21、本書は本番固有の差分 |
| docs/22_v5_data_model.md | データモデル(SQLite 版) | 本書で Postgres 移植版・RLS 詳細を追記 |
| docs/23_infrastructure_cost_research_2026-06.md | コスト・データ主権・LGWAN 調査 | 根拠資料、本書は実装方針 |
| **docs/24(本書)** | **Phase 1 デプロイ・運用・説明責任設計** | — |

## 1. Phase 1 スコープ

| 項目 | 値 |
|---|---|
| 期間 | 2026-07 〜 2028-03(Year 1 + Year 2 前半) |
| 想定規模 | 1-5 自治体 / 5-30 名隊員 / 5-15 名役場職員 |
| ターゲット自治体 | **緩い〜標準自治体**(豊岡・神戸・西脇・新温泉等、αモデル維持の中小市町) |
| データ主権 | **国内 DC 完結**(Vercel hnd1 + Supabase Tokyo + Bedrock jp.* CRIS + AWS SES Tokyo) |
| LGWAN 対応 | **ゼロ**(隊員=スマホ、役場=インターネット系専用端末 or 私物端末) |
| ISMAP-LIU | **未取得**(Year 2 後半に検討) |
| 月額目標 | **¥30,000-50,000 / 月**(隊員 30 名規模、AI コスト圧縮込み) |
| 売上目標 | ARR 100-300 万円 / 有償契約 1-2 件 |

### 「やらないこと」(明示的にスコープ外)
- LGWAN-ASP 取得・OEM 提携(Year 3+)
- ISMAP-LIU 登録(Year 2 後半)
- 47 都道府県横展開(Year 3+)
- 議会 PDF 自動生成(Year 2 以降の機能拡張)
- 県横断ダッシュボード(Year 2 以降)

---

## 2. アーキテクチャ全体図

```
                  [ 隊員(スマホ)]    [ 役場担当(PC)]    [ 県庁(PC)]
                        │                  │                 │
                        └──────────────────┴─────────────────┘
                                  │
                          HTTPS / TLS 1.3
                                  ▼
                  ┌────────────────────────────────────────────┐
                  │  Cloudflare DNS + WAF(無料プラン)         │
                  │  ・kyoryokutai.example.jp → Vercel         │
                  │  ・DDoS 防御 / Bot 緩和                    │
                  └──────────────────┬─────────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────────┐
                  │  Vercel Pro (Tokyo hnd1 Edge)              │
                  │  ・Next.js 16 App Router + Turbopack       │
                  │  ・Functions: ap-northeast-1 (hnd1) 指定   │
                  │  ・vercel.json で "regions": ["hnd1"]      │
                  └─────────────┬───────────────┬──────────────┘
                                │               │
              ┌─────────────────┘               └────────────────────┐
              │                                                       │
   ┌──────────▼───────────┐   ┌──────────────────────────────┐  ┌────▼────────────────┐
   │ Supabase Pro (Tokyo) │   │ AWS Bedrock Tokyo            │  │ AWS SES Tokyo       │
   │ ap-northeast-1       │   │ ap-northeast-1               │  │ ap-northeast-1      │
   │ ・Postgres 15 + RLS  │   │ ・Sonnet 4.6 (native Tokyo)  │  │ ・通知メール        │
   │ ・Auth (Magic Link)  │   │ ・Haiku 4.5 (jp.* CRIS)      │  │ ・SPF/DKIM/DMARC    │
   │ ・Storage 100GB      │   │ ・Prompt Caching ON          │  │ ・SNS でバウンス処理 │
   │ ・PITR add-on 14日   │   │ ・データは jp 地理境界内完結  │  └─────────────────────┘
   └──────────────────────┘   └──────────────────────────────┘
              │
              ▼
   ┌──────────────────────┐   ┌──────────────────────────────┐
   │ Cloudflare R2        │   │ Sentry Developer             │
   │ (写真アーカイブ用)    │   │ (エラー、PII scrub 必須)     │
   │ ・egress 無料        │   │ + Cloudflare Web Analytics  │
   │ ・領収書バージョニング │   │   (cookieless RUM、無料)    │
   └──────────────────────┘   └──────────────────────────────┘
```

---

## 3. インフラ構成詳細

| レイヤ | サービス | プラン | リージョン | 月額 | SLA | 注意点 |
|---|---|---|---|---|---|---|
| DNS / CDN | Cloudflare | Free(+将来 Pro $25) | グローバル(JP Edge 含む) | ¥0 | 99.9%(Free) | データ経路に乗らない設計 |
| ホスト | Vercel | Pro $20/seat | hnd1 (Tokyo Edge) | ¥3,000 | 99.99%(Enterprise)、Pro は best-effort | `vercel.json` で region 固定 |
| DB | Supabase | Pro $25 + PITR add-on $100 | ap-northeast-1 | ¥18,750 | 99.9%(Enterprise) | 米国法人契約、ISMAP 未登録 |
| ストレージ | Supabase Storage | Pro 内 100GB | 同上 | (Supabase Pro 内) | 同上 | ホット用途(写真サムネ等) |
| ストレージ | Cloudflare R2 | 従量 | APAC jurisdiction | ¥683 | 99.9% | コールド用途(領収書、egress 無料) |
| AI | AWS Bedrock | 従量(prompt caching ON) | ap-northeast-1 + `jp.*` CRIS | ¥40,000-57,000 | 99.9% | Sonnet 4.6 は native、Haiku は CRIS |
| メール | AWS SES | 月 5 万通想定 | ap-northeast-1 | ¥750 | 99.9% | ISMAP 登録 |
| 認証 | Supabase Auth | Pro 込み(50k MAU 無料) | ap-northeast-1 | ¥0 | Supabase 同等 | SAML は将来 WorkOS |
| 認証 | Auth.js v5 LINE Provider | OSS | サーバ依存 | ¥0 | — | Supabase Auth と併用 |
| 監視 | Sentry | Developer 無料 5k events | US/EU | ¥0 | — | PII scrub 必須 |
| 監視 | Cloudflare Web Analytics | 無料 | グローバル | ¥0 | — | cookieless RUM |
| ドメイン | ムームー | .jp 取得 | 国内レジストラ | ¥279(年¥3,344) | — | お名前.com の調整費罠回避 |
| **合計** | | | | **約 ¥64,462 / 月**(隊員 30 名想定で AI 圧縮版) | | |

### Phase 1 における簡素化(Year 3 ¥81,279 → Phase 1 ¥30,000-50,000)
- **AI 利用量が少ない**(隊員 30 名 × 月 50 リクエスト ≒ 1,500 req/月)→ Bedrock コスト ¥10,000 程度
- **PITR add-on 不要**(Supabase Pro 7日バックアップで十分、ARR 1,000 万超で追加)
- **R2 容量小**(50GB 未満)→ ¥150 程度
- **Cloudflare Pro 不要**(Free で十分)

→ **Phase 1 初期(Year 1 前半)= 約 ¥15,000-20,000 / 月、後半 = ¥30,000-50,000 / 月**

---

## 4. データフロー設計

### 4.1 隊員(スマホ)の主要動線

```
[隊員スマホ]
   │
   │ 1. Magic Link 認証
   ▼
[Cloudflare] ─ TLS 1.3 ─▶ [Vercel Edge hnd1] ──▶ [Supabase Auth Tokyo]
                                                       │
                                                       └─ JWT 発行(7日有効)
   │
   │ 2. 活動報告作成
   ▼
[Vercel Server Action] ──▶ [Supabase Postgres Tokyo]
                                  │
                                  └─ activity_logs INSERT + audit_logs INSERT
   │
   │ 3. AI 相談(daily-write)
   ▼
[Vercel Route Handler /api/ai/consult] ──▶ [AWS Bedrock Tokyo]
                                                  │
                                                  └─ Sonnet/Haiku 推論(jp 地理境界内)
                                                     consultations INSERT(ログ保持)
```

**重要:** 隊員データは **すべて ap-northeast-1(Tokyo)で完結**。Cloudflare の Worker 等を経由しない(CDN はキャッシュ用途のみ)。

### 4.2 役場(PC)の主要動線

```
[役場PC]
   │
   │ 1. Magic Link 認証(同上)
   │ 2. 承認画面
   ▼
[Vercel Route Handler /api/approvals/[id]/decide]
   ├─▶ [Supabase Postgres] approvals UPDATE
   ├─▶ [AWS SES Tokyo] 通知メール(隊員へ承認 / 差戻し)
   └─▶ [audit_logs] 操作記録
```

### 4.3 写真・領収書アップロード

```
[隊員スマホ] ──▶ [Vercel] ──▶ [Supabase Storage Tokyo]
                                       │
                                       └─ Pro 100GB 内、ホット保管
                                       
[隊員月次まとめ] ──▶ [R2 アーカイブ Job] ─ 6ヶ月超のファイル移動 ─▶ [Cloudflare R2]
```

### 4.4 外部 SaaS とのデータ経路

| 経路 | 通る場所 | データ主権 |
|---|---|---|
| 隊員 → Vercel → Supabase | hnd1 → ap-northeast-1 | **国内完結** |
| Vercel → Bedrock | hnd1 → ap-northeast-1(native)/ jp CRIS(Haiku) | **国内完結** |
| Vercel → SES | hnd1 → ap-northeast-1 | **国内完結** |
| Vercel → Sentry | hnd1 → US/EU(エラーのみ、PII scrub 後) | **PII は越境しない** |
| Cloudflare(DNS/CDN/WAF) | グローバル Edge | **データ転送経路に乗らない**(リクエストヘッダ等のみ) |

---

## 5. データモデル(Postgres 本番版)

docs/22 の SQLite スキーマを Postgres + RLS に移植。主要な差分のみ記載。

### 5.1 SQLite → Postgres 差分

| SQLite | Postgres | 差分 |
|---|---|---|
| `TEXT` | `text` | 同一 |
| `INTEGER` | `integer` / `bigint` | サイズ明示 |
| `REAL` | `numeric(p,s)` | 桁数明示 |
| `BLOB`(未使用) | `bytea` | — |
| `datetime('now')` | `now()` | 関数名変更 |
| `INTEGER NOT NULL DEFAULT 0` (boolean 用) | `boolean NOT NULL DEFAULT false` | 型変更 |
| なし | `gen_random_uuid()` | id 生成 |
| `PRAGMA foreign_keys = ON` | デフォルト ON | 不要 |
| 部分 UNIQUE INDEX | サポート(`WHERE` 句で記述) | 同等 |

### 5.2 Row Level Security ポリシー(主要 7 件、docs/22 §7 を本番化)

```sql
-- ヘルパー関数(Supabase Auth と統合)
CREATE FUNCTION current_municipality_id() RETURNS uuid AS $$
  SELECT municipality_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE FUNCTION current_user_role() RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT current_user_role() = 'admin';
$$ LANGUAGE sql STABLE;

CREATE FUNCTION is_manager_for(member_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM assignments
    WHERE staff_id = auth.uid() AND member_id = member_id
  );
$$ LANGUAGE sql STABLE;

-- 1. activity_logs: 隊員=自分のみ / 役場=管轄隊員 / 管理者=自治体全員
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_logs_select ON activity_logs FOR SELECT TO authenticated USING (
  municipality_id = current_municipality_id()
  AND (
    user_id = auth.uid()
    OR is_manager_for(user_id)
    OR is_admin()
  )
);
CREATE POLICY activity_logs_insert ON activity_logs FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND municipality_id = current_municipality_id()
);
CREATE POLICY activity_logs_update ON activity_logs FOR UPDATE TO authenticated USING (
  user_id = auth.uid()
);
-- 2. expenses / monthly_reports は同等パターン(略、docs/22 §7 参照)
-- 3. approvals: 起票者 / 決裁者 / 管理者
CREATE POLICY approvals_select ON approvals FOR SELECT TO authenticated USING (
  municipality_id = current_municipality_id()
  AND (applicant_id = auth.uid() OR approver_id = auth.uid() OR is_admin())
);
-- 4. cases_public: 全テナント参照可能(レビュー完了済のみ)
CREATE POLICY cases_public_select ON cases_public FOR SELECT TO authenticated USING (
  anonymized_by_review = true
);
-- 5. assignments: 自治体内のみ
CREATE POLICY assignments_select ON assignments FOR SELECT TO authenticated USING (
  municipality_id = current_municipality_id()
);
-- 6. announcements: 送信者 / 受信対象 / 管理者
CREATE POLICY announcements_select ON announcements FOR SELECT TO authenticated USING (
  municipality_id = current_municipality_id()
  AND (sender_id = auth.uid() OR auth.uid() = ANY(target_user_ids) OR is_admin())
);
-- 7. audit_logs: 本人 + 管理者のみ参照
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT TO authenticated USING (
  actor_id = auth.uid() OR is_admin()
);
```

### 5.3 マイグレーション戦略

```
supabase/migrations/
├── 20260701_001_identity.sql        # municipalities, host_organizations, users, assignments
├── 20260701_002_activities.sql      # activity_topics, activity_logs, projects
├── 20260701_003_reporting.sql       # monthly_reports
├── 20260701_004_expenses.sql        # expenses (二系統動線 + 親子)
├── 20260701_005_workflow.sql        # approval_routes, approval_route_steps, approvals
├── 20260701_006_communication.sql   # announcements, announcement_reads
├── 20260701_007_ai_knowledge.sql    # consultations, cases_public, guidelines
├── 20260701_008_audit.sql           # audit_logs + triggers
├── 20260701_009_rls.sql             # RLS ポリシー(上記 5.2)
└── 20260701_010_seed.sql            # 初期データ(自治体 1 件 + デフォルト経費種別等)
```

---

## 6. 認証設計

### 6.1 認証フロー(Magic Link)

```
1. ユーザーがメールアドレス入力
2. Supabase Auth が Magic Link を AWS SES Tokyo 経由で送信
3. ユーザーがリンクをタップ
4. Vercel のコールバック /auth/callback でセッション確立
5. middleware.ts で全リクエストに JWT を付与
```

### 6.2 ロールとアクセス制御

| ロール | 識別 | アクセス範囲 |
|---|---|---|
| `member`(隊員) | `users.role = 'member'` | 自分の activity_logs / expenses / 自治体の announcements / 全国 cases_public |
| `manager`(役場担当) | `users.role = 'manager'` + `organization_type = 'municipality'` | 管轄隊員(assignments)+ 自治体内承認キュー |
| `manager`(受入団体) | `users.role = 'manager'` + `organization_type = 'host_org'` | 承認ルートに登場する自治体内承認のみ |
| `admin`(管理者) | `users.role = 'admin'` | 自治体内すべて(マイナンバー以外) |

### 6.3 LINE OAuth(Auth.js v5 補完)

Supabase Auth は LINE プロバイダ標準対応なし → Auth.js v5 の公式 LINE Provider で補完。

```typescript
// src/auth.ts(Auth.js v5)
import NextAuth from "next-auth";
import LINE from "next-auth/providers/line";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LINE({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // LINE 認証成功時、Supabase の users テーブルに upsert
      await upsertSupabaseUser(user);
      return true;
    },
  },
});
```

---

## 7. AI 統合(Bedrock Tokyo)

### 7.1 環境変数で切替(ADR-016)

```bash
# 本番
AI_PROVIDER=bedrock
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_SONNET_MODEL_ID=anthropic.claude-sonnet-4-6-v1:0
BEDROCK_HAIKU_MODEL_ID=jp.anthropic.claude-haiku-4-5-v1:0  # jp.* CRIS

# 開発
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### 7.2 src/lib/ai/bedrock.ts(新規実装)

```typescript
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import type { AIProvider, AIGenerateOptions } from "./types";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export class BedrockProvider implements AIProvider {
  readonly name = "bedrock";
  readonly model = process.env.BEDROCK_SONNET_MODEL_ID!;

  async generate(opts: AIGenerateOptions): Promise<string> {
    // タスクごとに Sonnet / Haiku を振り分け
    const modelId = ["consult-daily-write", "consult-report-plan", "consult-expense-purpose",
                     "consult-case-find", "expense-title"].includes(opts.task ?? "")
      ? process.env.BEDROCK_HAIKU_MODEL_ID!  // 軽量
      : process.env.BEDROCK_SONNET_MODEL_ID!; // 重量

    const system = opts.messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const messages = opts.messages.filter(m => m.role !== "system").map(m => ({
      role: m.role as "user" | "assistant",
      content: [{ text: m.content }],
    }));

    const command = new ConverseCommand({
      modelId,
      system: system ? [{ text: system }] : undefined,
      messages,
      inferenceConfig: {
        maxTokens: opts.maxTokens ?? 2048,
        temperature: opts.temperature ?? 0.4,
      },
      // Prompt Caching を有効化(システムプロンプトをキャッシュ)
      additionalModelRequestFields: {
        promptCachingConfig: { type: "default" },
      },
    });

    const res = await client.send(command);
    const text = res.output?.message?.content?.[0]?.text ?? "";
    if (!text) throw new Error("Bedrock: 空の応答");
    return text;
  }

  async health() {
    try {
      // 軽い疎通確認(Bedrock list は権限要なのでスキップ、生成 1 回で代替)
      await this.generate({ task: "generic", messages: [{ role: "user", content: "ping" }], maxTokens: 5 });
      return { ok: true, detail: `Bedrock Tokyo OK / Sonnet=${process.env.BEDROCK_SONNET_MODEL_ID}` };
    } catch (e) {
      return { ok: false, detail: `Bedrock 失敗: ${(e as Error).message}` };
    }
  }
}
```

### 7.3 src/lib/ai/index.ts へ追加

```typescript
case "bedrock":
  return new BedrockProvider();
```

### 7.4 IAM ポリシー(最小権限)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": [
        "arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-sonnet-4-6-v1:0",
        "arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-haiku-4-5-v1:0",
        "arn:aws:bedrock:ap-northeast-1:*:inference-profile/jp.anthropic.claude-haiku-4-5-v1:0"
      ]
    }
  ]
}
```

### 7.5 コスト最適化(Phase 1)

| 機能 | Phase 1 月コスト | 最適化 |
|---|---|---|
| AI 相談 | ¥3,000 | Haiku + Prompt Caching |
| 月報生成 | ¥4,000 | Sonnet、Batch API は Phase 2 |
| 経費判定 | ¥1,500 | Sonnet |
| タイトル生成 | ¥200 | Haiku |
| 事例 RAG | ¥1,300 | Haiku + embedding cache |
| **合計** | **¥10,000 / 月** | 隊員 30 名想定 |

---

## 8. 環境変数一覧(`.env.production` テンプレート)

```bash
# === ホスト ===
NEXT_PUBLIC_APP_URL=https://kyoryokutai.example.jp

# === AI(ADR-016 / ADR-018) ===
AI_PROVIDER=bedrock
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=<Bedrock + SES の IAM ユーザー>
AWS_SECRET_ACCESS_KEY=<同上>
BEDROCK_SONNET_MODEL_ID=anthropic.claude-sonnet-4-6-v1:0
BEDROCK_HAIKU_MODEL_ID=jp.anthropic.claude-haiku-4-5-v1:0

# === DB / Auth(Supabase) ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Dashboard で発行>
SUPABASE_SERVICE_ROLE_KEY=<サーバ専用、漏洩厳禁>
SUPABASE_PROJECT_REF=xxxxx
SUPABASE_REGION=ap-northeast-1

# === Storage(Cloudflare R2) ===
R2_ACCOUNT_ID=<Cloudflare アカウント ID>
R2_ACCESS_KEY_ID=<R2 トークン>
R2_SECRET_ACCESS_KEY=<同上>
R2_BUCKET=kyoryokutai-receipts

# === メール(AWS SES) ===
SES_FROM_EMAIL=noreply@kyoryokutai.example.jp
SES_REPLY_TO=support@kyoryokutai.example.jp
# AWS 認証情報は上記 IAM ユーザーで共有

# === LINE OAuth(任意) ===
LINE_CLIENT_ID=<LINE Developers で発行>
LINE_CLIENT_SECRET=<同上>

# === 監視 ===
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@sentry.io/xxxx
SENTRY_ENVIRONMENT=production
SENTRY_PII_SCRUB=true  # 必須(個人情報送信防止)
```

---

## 9. デプロイメント手順

### 9.1 ドメイン取得(ムームー)
1. ムームードメインで `kyoryokutai.example.jp` を取得(年 ¥3,344)
2. ネームサーバを **Cloudflare** に変更(Cloudflare 側で DNS 管理)

### 9.2 Cloudflare セットアップ
1. Cloudflare 無料プランでサイト追加
2. ネームサーバを発行された 2 個に切替(ムームー側で設定)
3. Always Use HTTPS、HSTS、Bot Fight Mode を有効化
4. WAF カスタムルール:`/api/*` への異常レート制限(後述)

### 9.3 Supabase プロジェクト作成
1. https://supabase.com で新規プロジェクト
2. **Region: Northeast Asia (Tokyo)** を選択(重要)
3. プラン: Pro($25/月)に upgrade
4. Settings → Database → Connection Pooling 有効化
5. Settings → API で URL と anon/service_role キーを取得
6. Settings → Auth → SMTP を **AWS SES Tokyo** に切替(後述)
7. `supabase db push` でマイグレーション適用(010 ファイル)

### 9.4 AWS アカウントセットアップ
1. AWS アカウント作成(請求情報・MFA 有効化)
2. Region を **ap-northeast-1** に固定
3. IAM ユーザー作成:
   - `kyoryokutai-bedrock-ses`(プログラムアクセスのみ)
   - ポリシー: 上記 §7.4 + SES `ses:SendEmail` / `ses:SendRawEmail`
4. **Bedrock コンソール**で Sonnet 4.6 / Haiku 4.5(jp.* CRIS)へのモデルアクセスを申請
   - 通常 1-2 営業日で承認
5. **SES コンソール**:
   - 送信ドメイン認証(DKIM):`kyoryokutai.example.jp` の TXT/CNAME を Cloudflare DNS に追加
   - サンドボックス解除申請(Production access、初日に申請)
   - Configuration Set 作成 → SNS でバウンス/苦情を Supabase Webhook に転送

### 9.5 Cloudflare R2 セットアップ
1. R2 でバケット `kyoryokutai-receipts` 作成
2. API Token 発行(Object Read & Write、上記バケットのみ)
3. CORS 設定(Vercel ドメインからのみ許可)
4. ライフサイクル:6 ヶ月後に Infrequent Access tier へ移行

### 9.6 Vercel デプロイ
1. GitHub リポジトリと Vercel を連携
2. Pro プラン($20/seat)に upgrade
3. Environment Variables に §8 の値を投入(Production 環境)
4. **Settings → Functions → Function Region** を **Tokyo (hnd1)** に固定
5. `vercel.json`:
   ```json
   {
     "regions": ["hnd1"],
     "functions": { "src/app/api/**/route.ts": { "maxDuration": 60 } }
   }
   ```
6. Domains に `kyoryokutai.example.jp` を追加 → Cloudflare で CNAME 設定
7. 初回デプロイ → ヘルスチェック `/api/health` で疎通確認

### 9.7 Sentry セットアップ
1. Sentry Developer プラン(無料)で新規プロジェクト
2. `@sentry/nextjs` インストール、`sentry.client.config.ts` で **`beforeSend` フックを実装**(PII Scrub 必須):
   ```typescript
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     beforeSend(event) {
       // メールアドレス・氏名・住所等を除去
       if (event.user) {
         delete event.user.email;
         delete event.user.ip_address;
       }
       // request body から個人情報パターンを除去
       if (event.request?.data && typeof event.request.data === "string") {
         event.request.data = event.request.data
           .replace(/"email":\s*"[^"]+"/g, '"email":"[REDACTED]"')
           .replace(/"name":\s*"[^"]+"/g, '"name":"[REDACTED]"');
       }
       return event;
     },
   });
   ```

### 9.8 初期データ投入
1. 自治体 1 件(`municipalities` テーブル)
2. 管理者 1 名(`users` テーブル、role=admin、メール送信)
3. デフォルト経費種別 / 活動内容テンプレ
4. 全国事例 10-30 件(キュレーション、`cases_public` テーブル)
5. 自治体ガイドライン(`guidelines` テーブル、活動費ガイドライン v2.1 を投入)

---

## 10. セキュリティ設計

### 10.1 通信・保管時暗号化

| レイヤ | 暗号化 |
|---|---|
| ブラウザ ⇔ Cloudflare | TLS 1.3(Cloudflare Universal SSL) |
| Cloudflare ⇔ Vercel | TLS 1.3(Full strict) |
| Vercel ⇔ Supabase | TLS 1.3(Supabase 標準) |
| Vercel ⇔ Bedrock / SES | TLS 1.3(AWS SDK 標準) |
| Supabase Postgres 保管 | AES-256(Supabase Pro 標準) |
| R2 オブジェクト保管 | AES-256(R2 標準) |
| Bedrock 推論時 | データは保存されない(Anthropic 契約) |

### 10.2 個人情報入力 UI 抑制(ADR-011 と整合)

| 入力箇所 | 制御 |
|---|---|
| 活動報告の自由記述 | プレースホルダーで「住民個人を特定する情報は記載しないでください」表示 |
| 同上 | 保存時に AI で氏名検出 → 警告ダイアログ |
| プロジェクト関係者欄 | 構造化フィールド(役割名・住所コード)を必須化、自由記述は補助のみ |
| 経費の用途 | 「氏名・住所等の個人情報を含めないでください」インラインヒント |
| 月報生成プロンプト | システムプロンプトで「住民個人を特定する情報は含めない」を明示 |

### 10.3 監査ログ

`audit_logs` テーブルに以下を記録(docs/22 §6.18 + 本書での運用詳細):

| 操作 | 記録内容 |
|---|---|
| ログイン / ログアウト | actor_id, action='login'/'logout', ip_hash, user_agent |
| 承認 / 差戻し | actor_id, action='approve'/'reject', target_table, target_id, diff |
| 経費精算 | actor_id, action='settle', target_id, diff(金額・領収書) |
| 退任 / 削除 | actor_id, action='retire', target_id, diff |
| 事例公開 | actor_id, action='publish_case', target_id, diff |
| データエクスポート | actor_id, action='export', target_table, filter |

**保持期間: 5 年**(自治体規定に準拠)。

### 10.4 PII Scrub(Sentry 送信前)

- メールアドレス・氏名・住所・電話番号・マイナンバー(12 桁数字)パターンを送信前に除去
- スタックトレース内の変数値もマスク
- URL クエリパラメータの `?email=` `?name=` 等を除去

### 10.5 アクセス制御(WAF / レート制限)

| エンドポイント | レート制限 | 備考 |
|---|---|---|
| `/api/ai/*` | 隊員 1 名 / 分 / 5 リクエスト | AI コスト爆発防止 |
| `/api/expenses` POST | 隊員 1 名 / 分 / 10 リクエスト | 経費 spam 防止 |
| `/auth/*` | IP / 分 / 10 リクエスト | brute force 防止 |
| その他 API | IP / 分 / 60 リクエスト | 一般的な保護 |

Cloudflare の WAF カスタムルールで実装(無料プランで対応可)。

---

## 11. 説明責任 ─ 想定問答 + 添付資料

ADR-018 の 7 問答を実運用版に拡張。

### 11.1 想定問答集(本番運用版)

| # | 質問 | 回答骨子 | 補強資料 |
|---|---|---|---|
| Q1 | データは国内に保管されるか? | はい。全データが ap-northeast-1(Tokyo)で完結。Bedrock は jp.* CRIS で日本国内のみ。Cloudflare はキャッシュのみで本体データを保管しない | データフロー図(§4) |
| Q2 | 米国 SaaS のリスクは? | Anthropic と直接契約なし、AWS 日本法人(AWS Japan)経由。AWS は ISMAP 登録・ガバクラ認定。CLOUD Act は AWS 公式声明で「日本データへの第三国アクセスは契約上拒否」 | AWS 利用契約書、AWS ISMAP 登録証 |
| Q3 | 個人情報は安全か? | 3 重防御:UI 抑制(§10.2)、Row Level Security(§5.2)、TLS 1.3 + AES-256(§10.1) | RLS ポリシー一覧 |
| Q4 | インシデント時の対応は? | Sentry 検知、24h 以内に自治体担当課に通知、SLA Supabase 99.9% / Vercel 99.99% / AWS 99.95% | インシデント対応 Runbook(§14) |
| Q5 | AI 学習に使われないか? | AWS Bedrock 契約で明示的に非使用(Bedrock User Guide §「Data privacy」)。Supabase / Vercel も同様。横須賀市 ChatGPT(2023)と同整理 | Bedrock User Guide 抜粋、横須賀市報道 |
| Q6 | ISMAP 登録は? | AWS / SES / Bedrock は登録、Supabase / Vercel は未登録だが ISMAP 管理基準準拠のチェックシート対応。Year 2 後半に ISMAP-LIU 取得検討(ARR 3,000 万到達時) | チェックシート 70-100 項目記入版 |
| Q7 | 越境移転規制(改正個情法)に該当しないか? | 物理 DC が日本国内のため、個人情報保護委員会 Q&A の解釈で「越境移転に該当しない」整理が定着 | 個人情報保護委員会 Q&A 抜粋 |
| Q8 | LGWAN 接続は? | Phase 1 では未対応(ADR-019)。役場担当課はインターネット系専用端末 or 私物端末で利用。Year 3+ で moconavi / 両備 OEM 経由を検討 | ADR-019、令和 6 年 10 月ガイドライン抜粋 |
| Q9 | データ削除手順は? | 退任時:30 日保持後マスク(本人申請でエクスポート可)。契約解除:90 日以内に全削除、削除証明発行 | データ削除手順書 |
| Q10 | バックアップは? | Supabase PITR 14 日(Pro + add-on)、R2 オブジェクトバージョニング 30 日、月次フルダンプを別リージョン S3 に保存(Year 2 から) | バックアップ・リストア手順書 |

### 11.2 添付資料セット(調達時に提出)

| # | 資料 | 形式 | 作成タイミング | 更新頻度 |
|---|---|---|---|---|
| 1 | データフロー図 | PDF(本書 §2 / §4 を図化) | デプロイ前 | アーキ変更時 |
| 2 | セキュリティチェックシート(70-100 項目記入版) | Excel(自治体テンプレ準拠) | 最初の自治体提案時 | 自治体ごとに微調整 |
| 3 | 個人情報の取扱いに関する規程 | PDF | デプロイ前 | 年次見直し |
| 4 | インシデント対応手順書 | PDF | デプロイ前 | 年次見直し |
| 5 | 想定問答集 | PDF(§11.1 を組織別に詳細化) | 最初の自治体提案時 | 質問が増えたら更新 |
| 6 | データ削除手順書 | PDF | デプロイ前 | 年次見直し |
| 7 | バックアップ・リストア手順書 | PDF(§13) | デプロイ前 | 年次見直し |
| 8 | 先行自治体事例集 | PDF(横須賀・三重・浜松・kintone 採用一覧) | 最初の自治体提案時 | 半年に 1 回更新 |

---

## 12. 監視・運用

### 12.1 監視レイヤ

| レイヤ | ツール | 通知先 |
|---|---|---|
| エラー(Backend) | Sentry Developer | Slack / Discord(運営チーム) |
| パフォーマンス | Cloudflare Web Analytics | 週次レビュー |
| 稼働状況 | Cloudflare Health Check + UptimeRobot 無料 | メール |
| DB | Supabase Dashboard(CPU / Storage / Connection) | 週次レビュー |
| AI コスト | AWS Cost Explorer + 月次予算アラート | メール(¥30,000 超で発火) |
| AI 利用量 | `consultations` テーブル週次集計 | 週次レビュー |

### 12.2 アラート設計

| 種類 | 閾値 | アクション |
|---|---|---|
| Sentry エラー | 5 分間に 10 件以上 | 即時 Slack 通知、トリアージ開始 |
| API レスポンス | p95 > 3 秒 | 週次レビュー、原因特定 |
| Supabase DB CPU | 80% を 5 分継続 | プラン見直し検討 |
| AWS Bedrock コスト | 月 ¥30,000 超 | メール通知、利用量分析 |
| AWS SES バウンス率 | 5% 超 | 即時通知、送信停止検討 |
| 認証失敗 | 同 IP / 5 分 / 20 件 | Cloudflare WAF で自動ブロック |

---

## 13. バックアップ・リストア

### 13.1 バックアップポリシー

| 対象 | 方式 | 頻度 | 保持期間 | 復元単位 |
|---|---|---|---|---|
| Supabase Postgres | PITR(Pro + add-on) | 継続的 | 14 日 | 任意時刻 |
| Supabase Postgres | 日次自動バックアップ | 日次 | 7 日 | 日付指定 |
| Supabase Storage | バージョニング | 都度 | 30 日 | バージョン指定 |
| Cloudflare R2 | バージョニング | 都度 | 30 日 | バージョン指定 |
| 月次フルダンプ(Year 2 から) | `pg_dump` → R2 別バケット | 月次 | 1 年 | バックアップ全体 |

### 13.2 リストア手順(概要)

1. **データ破損検知**: 監査ログ確認 → 影響範囲特定
2. **PITR で時刻指定復元**(Supabase Dashboard → Database → Backups)
3. **新規プロジェクトに復元 → 検証 → 切替**(zero downtime には数時間必要)
4. **影響を受けた自治体に 24h 以内通知**

詳細はリストア手順書(添付資料 7)に記載。

---

## 14. インシデント対応 Runbook

### 14.1 重大度区分

| Severity | 定義 | 例 | 初動 SLA |
|---|---|---|---|
| **P0 (Critical)** | 全サービス停止 / データ漏洩 | DB 全停止、Bedrock 認証情報漏洩 | 1 時間以内に検知・通知 |
| **P1 (High)** | 主要機能停止 | 承認画面のみ停止、特定自治体のみ影響 | 4 時間以内 |
| **P2 (Medium)** | 一部機能不全 | AI 相談のみ失敗、エラー率上昇 | 24 時間以内 |
| **P3 (Low)** | 軽微 | UI 表示崩れ、稀なエラー | 週次対応 |

### 14.2 対応フロー(P0/P1)

```
[Sentry / Cloudflare アラート]
   │
   ▼
[運営チーム検知 → トリアージ(15分以内)]
   │
   ├─ 影響範囲特定(どの自治体・どの隊員・どの機能)
   ├─ 暫定対応(該当機能の停止 / フェイルオーバー)
   ▼
[該当自治体担当課に第一報(P0=1h以内、P1=4h以内)]
   ├─ メール + 電話
   ├─ 影響内容 / 復旧見込み / 暫定対応
   ▼
[原因調査 → 恒久対応]
   │
   ▼
[復旧確認 → 自治体に完了報告 + 報告書(72h以内)]
   ├─ 原因 / 対応内容 / 再発防止策
```

### 14.3 連絡網テンプレ

- 運営チーム内: Slack `#incidents` チャンネル + 当番電話
- 自治体担当課: 各自治体のセキュリティ事故報告窓口(契約時に登録)
- ベンダー: Supabase support / AWS Support / Vercel support(英語可)

---

## 15. Phase 1 → Phase 2 移行準備

### 15.1 AWS 移植可能性チェックリスト(設計時から厳守)

| 項目 | チェック内容 | 現状 |
|---|---|---|
| Next.js | `output: 'standalone'` + Dockerfile | ✅ ADR-017 で確保済 |
| DB | Postgres 標準 SQL のみ使用(Supabase 固有関数を最小化) | △ RLS は `auth.uid()` に依存(Cognito 移行時に書換) |
| ストレージ | S3 互換 API のみ使用(R2 / Supabase Storage / S3 で共通) | ✅ aws-sdk で抽象化 |
| AI | プロバイダ抽象(ADR-016) | ✅ env 1 行で切替可 |
| メール | `nodemailer` 経由(SES / SMTP 共通インタフェース) | ✅ |
| 認証 | Supabase Auth → Cognito 移行時の差分メモを事前作成 | ⏳ Phase 1 末に作成 |

### 15.2 Phase 2 移行のトリガー条件

以下の **2 つ以上**を満たしたら Phase 2 移行検討:
1. ARR 1,500 万円突破
2. 県との共同調達が具体化(RFI / RFP 受領)
3. 標準自治体から「ISMAP 登録 SaaS のみ」を要件として提示される

---

## 16. PoC 開始チェックリスト(クローズドβ)

兵庫県内 1 市町でクローズドβを開始する前の確認項目:

### 16.1 技術面
- [ ] ドメイン取得(ムームー .jp)+ Cloudflare DNS 設定
- [ ] Supabase Pro Tokyo プロジェクト作成、マイグレーション 010 適用
- [ ] AWS アカウント開設、Bedrock モデルアクセス承認、SES Production access 承認
- [ ] R2 バケット作成、CORS 設定
- [ ] Vercel Pro デプロイ、Function Region = hnd1 固定
- [ ] Sentry プロジェクト + PII Scrub フック実装
- [ ] 全 env 変数を Vercel に投入
- [ ] `/api/health` で全プロバイダ疎通確認

### 16.2 セキュリティ面
- [ ] TLS 1.3 / HSTS / Bot Fight Mode 有効化
- [ ] WAF レート制限ルール 4 件設定
- [ ] RLS ポリシー 7 件適用、Supabase Dashboard で動作確認
- [ ] PII Scrub の動作テスト(意図的にエラー発火 → Sentry でマスク確認)

### 16.3 説明責任面
- [ ] 添付資料 8 種類のドラフト作成
- [ ] 想定問答集(§11.1)を担当者と読み合わせ
- [ ] 自治体の情報セキュリティ担当者と事前協議

### 16.4 運用面
- [ ] 監視アラート 6 種類の設定 + テスト発火
- [ ] バックアップ動作確認(PITR テスト復元)
- [ ] インシデント対応 Runbook を運営チーム内で訓練
- [ ] 月次予算アラート設定(¥30,000)

### 16.5 業務面
- [ ] 利用規約・プライバシーポリシー策定
- [ ] 個人情報の取扱いに関する規程(自治体への提示版)
- [ ] 契約書ひな型(自治体公式契約 + 隊員セルフサーブの 2 種)
- [ ] 初期自治体への提案資料(横須賀・三重事例引用版)

---

## 17. 想定スケジュール(Phase 1)

| 月 | マイルストーン |
|---|---|
| 2026-07 | ドメイン / Supabase / AWS / Vercel 環境構築、env 投入 |
| 2026-08 | RLS / PII Scrub / Cloudflare WAF 実装、Sentry 統合 |
| 2026-09 | 添付資料 8 種ドラフト、想定問答集レビュー、自治体 1 件と協議開始 |
| 2026-10 | クローズドβ開始(兵庫県内 1 市町、隊員 5 名) |
| 2026-12 | フィードバック反映、機能調整、有償契約 1 件目締結 |
| 2027-Q1 | 数自治体に拡大、隊員 30 名規模、AI コスト計測 |
| 2027-Q3 | ISMAP-LIU 取得検討開始(ARR 2,000 万到達なら)、Phase 2 設計着手 |

---

**作成日:** 2026-06-14
**関連 ADR:** ADR-011 / ADR-016 / ADR-017 / ADR-018 / ADR-019
**関連ドキュメント:** docs/19 / docs/20 / docs/21 / docs/22 / docs/23
