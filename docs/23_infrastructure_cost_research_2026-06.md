# インフラ・LLM・データ主権 調査記録(2026-06-13 〜 14)

> このドキュメントは、Year 3(500 名規模)を見据えたバックエンドインフラのコスト見積もり、LLM ベンダー網羅調査、および日本の自治体におけるデータ主権要件の実態調査のセッション記録。後続セッションで参照する一次資料として保持する。
> 詳細な数値・引用 URL は本文参照。

## 調査の発端(オーナーからの問い)

1. **「専任希望のユーザ利用で AI を使う場合、バックエンドインフラのランニングコスト1月分は何になるか」** ← 規模・AI 品質・リージョン・利用頻度をヒアリングした上で見積もりを取ってほしい
2. 続く問:**「バックエンドサーバ、ストレージ、LLM、ドメイン、フロントサーバなど、構成要素ごとに既存サービスや物品を網羅的に調査して」**
3. 続く問:**「自治体導入する際にデータ主権はどの程度考慮されるのか?」「LLM は Anthropic だけ?」**
4. 続く問:**「ガバメントクラウドとは?」**

## ヒアリング確定事項(2026-06-13)

| 項目 | 値 |
|---|---|
| 想定規模 | **Year 3 = 全国 500 名の協力隊員 + 役場職員 100 名 + 自治体 100 弱** |
| AI 品質方針 | **ハイブリッド**(月報・経費判定 = Claude Sonnet 4.6 級、相談・タイトル・RAG = Claude Haiku 4.5 級) |
| データ主権 | **国内リージョン必須**(自治体クラウドリスト掲載は将来検討) |
| 利用頻度 | **既定の 2 倍**(月報 3 回 / 相談 20 回 / 経費判定 10 回 / タイトル 10 回 / RAG 10 回 / 匿名化 0.2 件 / 名 / 月) |
| 想定トークン量 | **134.8M tokens / 月**(in 78% / out 22%) |
| 為替前提 | ¥150 / USD |

## 主要な発見

### 1. LLM ベンダー横断(11 系統調査)

| ルート | 月額(caching 30% 込) | データ主権 | 自治体提案 |
|---|---|---|---|
| Anthropic 直接 API | ¥57,000 | ❌ 米国経由 | △ |
| **AWS Bedrock Tokyo**(Claude Sonnet 4.6 + Haiku 4.5) | **¥57,000** | ✅ 東京/大阪完結(`jp.*` CRIS) | ◎ ISMAP |
| Azure OpenAI Japan East(GPT-4o + 4o-mini) | ¥35,000 | ✅ Regional Standard 必須 | ◎ ISMAP |
| GCP Vertex AI Tokyo(Gemini 2.5 Pro + Flash) | ¥27,000 | ✅(DRZ 契約は不可) | ○ |
| GCP Vertex AI Tokyo(Gemini Flash + Flash-Lite) | **¥12,000** | ✅ | ○ |
| AWS Bedrock(Nova Pro + Nova Lite Tokyo) | **¥10,000** | △ Tokyo 配信要確認 | ○ |
| **PFN PLaMo Prime(国産)** | **¥14,000** | ✅ 100% 国内 | ◎ 純国産 |

**重要事実:**
- GCP Vertex AI で **Claude は Tokyo 非対応**(us-east5 / europe-west1 / global のみ)
- AWS Bedrock の **Llama 4 / Llama 3.3 70B は Tokyo 未提供**(US East/West のみ)
- Anthropic 直接 API は **米国 DC 固定、東京リージョン無し**
- Azure OpenAI の Japan データ完結には **Regional Standard デプロイ必須**(Global Standard は不可)、ZDR は EA/MCA エンタープライズ契約限定
- **PFN PLaMo Prime は唯一の「公開価格 + 国産 + 競合ベンチマーク」**(¥60 in / ¥250 out per 1M tokens)
- NEC cotomi / NTT tsuzumi 2 / Fujitsu Takane / SoftBank Sarashina は価格非公開で SaaS 経済性に乗らず
- Together AI / Groq / OpenRouter / Fireworks は全て US 中心、自治体用途では事実上脱落

### 2. ホスティング(11 サービス調査、Next.js 16 / Turbopack 対応状況含む)

| 候補 | 月額 | 国内 | 備考 |
|---|---|---|---|
| **Vercel Pro hnd1 Tokyo** | ¥3,000 | ◎ | Next.js 純正、最速立ち上げ |
| **Cloudflare Workers Paid + OpenNext** | ¥750 | ◎ NRT PoP | コスト最強、CPU 5 分制約 |
| AWS App Runner Tokyo | ¥3,500 | ◎ | ISMAP 完全対応 |
| AWS Lambda Tokyo | ~¥10 | ◎ | 圧倒的最安 |
| GCP Cloud Run asia-northeast1 | ¥0-1,000 | ◎ | 500 名は無料枠 |
| Azure App Service Japan East B1 | ¥2,000 | ◎ | コスパ良 |
| Fly.io NRT | ¥300 | ◎ | 国内格安 |
| さくらVPS / ConoHa | ¥995-1,738 | ◎ | 国産、セルフ運用 |
| Railway / Render | — | ❌ Singapore | データ主権で脱落 |

### 3. データベース(Postgres、Year 3 = 1.5GB、月 100k クエリ、PITR)

| 候補 | 月額 | 国内 | 注意 |
|---|---|---|---|
| **AWS RDS db.t4g.micro Tokyo** | ¥3,200 | ◎ | コスト・主権バランス◎ |
| **Azure Postgres B1ms Japan East** | ¥1,862 | ◎ | 最安 |
| Supabase Pro Tokyo | ¥3,750 + PITR ¥15,000 | ◎ | DX◎、米国法人契約 |
| GCP Cloud SQL db-g1-small Tokyo | ¥3,750 | ◎ | |
| さくら DB アプライアンス 10GB | ¥6,000-12,000 | ◎ | 国産、自治体◎ |
| Neon / PlanetScale Postgres | — | ❌ Tokyo 未対応 | 脱落 |
| Cloudflare D1 | ¥750 | ❌ リージョン不指定 | 脱落 |

### 4. オブジェクトストレージ(Year 3 = 250GB、月 PUT 10万 / GET 100万)

| 候補 | 月額 | 国内 | 備考 |
|---|---|---|---|
| **Cloudflare R2** | ¥683 | △ APAC(東京 PoP 不明示)| egress 無料、自治体審査でグレー |
| **Azure Blob Hot Japan East** | ¥690 | ◎ | 最安級 |
| GCS Standard Tokyo | ¥863 | ◎ | |
| AWS S3 Tokyo | ¥1,065 | ◎ | egress $0.114/GB |
| Wasabi Tokyo | ¥1,200 | ◎ | 1TB 最低課金、2026/7 値上げ |
| さくらオブジェクトストレージ | ¥1,238 | ◎ | 国産・自治体◎ |
| Backblaze B2 | — | ❌ 米/EU | 脱落 |

### 5. メール(月 5 万通)

| 候補 | 月額 | 国内 | 備考 |
|---|---|---|---|
| **AWS SES Tokyo** | **¥750** | ◎ | **圧倒的最安**、ISMAP |
| さくらクラウド SendGrid (KKE) | ¥3,000 | ❌ | 日本語サポート要なら |
| Resend Pro | ¥3,000 | △ 送信のみ、**ログは US** | **罠** |
| SendGrid Essentials | ¥2,993 | ❌ | KKE 経由で日本語OK |
| Mailgun / Postmark / Brevo | 高い | ❌ | 海外 |

### 6. 認証(500-10,000 MAU)

| 候補 | 500 MAU | 10,000 MAU | SAML | LINE | 国内 |
|---|---|---|---|---|---|
| Supabase Auth | **¥0**(Free 50k) | ¥0(Pro 100k 込) | Team ¥89,850 | カスタム | ◎ Tokyo |
| **Auth0 (Okta)** | ¥0(Free 25k) | ¥0 | Essentials ¥5,250 | カスタム | **◎ JP 公式 + ISMAP** |
| Clerk | ¥0 | ¥0 | Pro ¥3,750 込み | **公式対応** | ❌ US |
| WorkOS | ¥0(Free 1M) | ¥0 | **接続 1 個 ¥18,750** | カスタム | △ |
| Stytch | ¥0 | ¥0 | Free 5 接続込み | カスタム | △ |
| Firebase IP | ¥0 | ¥0 | $0.015/MAU 従量 | カスタム | △ |
| Auth.js v5 | ¥0 | ¥0 | 自前 | **公式 Provider** | DB 依存 |

### 7. 監視・エラートラッキング

| 候補 | 500 MAU | 10,000 MAU | 国内 |
|---|---|---|---|
| **Sentry Developer** | **¥0**(Free 5k) | ¥3,900 | ❌ US/EU |
| **New Relic Free** | **¥0**(100GB) | ¥0-1,500 | △ 2026/7 Tokyo 予定、JP 法人サポート |
| Cloudflare Web Analytics | **¥0** | **¥0** | ◎ Edge |
| Datadog AP1 Tokyo | ¥6,900 | ¥22,500+ | ◎ Tokyo |
| Better Stack | ¥8,100 | ¥22,350 | ❌ EU |
| Highlight.io | — | — | **2026/2 EOL**(LaunchDarkly 統合) |

### 8. ドメイン(.jp 5 年 TCO)

| レジストラ | 5 年 TCO | 注意 |
|---|---|---|
| **ムームードメイン** | **¥14,366** | 表示=請求、最安 |
| バリュードメイン | ¥14,531 + 調整費 20% | |
| お名前.com | 表示 ¥12,826 / **実質 ¥16,074**(調整費 26%)| **罠** |
| JPDirect | ¥38,500 | JPRS 直販、自治体向け、**.lg.jp 取扱**(自治体専用) |
| Cloudflare / Vercel | — | **.jp 非対応** |

### 9. 自前 GPU 構築(Year 3 ワークロード = 月 150M tok、ピーク 400 tok/sec)

| 構成 | CAPEX | 月 OPEX | 5 年 TCO |
|---|---|---|---|
| **RTX PRO 6000 Blackwell 96GB 1 基 + DC 1U** | ¥2,300,000 | ¥45,000 | **¥5,000,000** |
| 2x RTX 4090 自宅オフィス | ¥1,200,000 | ¥29,328 | ¥2,960,000(ピーク不安) |
| GMO H100 業務時間のみ従量 | ¥0 | ¥277,000 | ¥16,600,000 |
| さくら 高火力 PHY 8xH100 3 年契約 | ¥0 | ¥2,436,896 | ¥146,000,000(**オーバースペック**) |
| **PFN PLaMo Prime API** | ¥0 | **¥14,000** | **¥840,000** |

→ **「自前なら RTX PRO 6000 1 基」「マネージドなら PLaMo Prime API」が現実解**。8xH100 構成は明確にオーバースペック。

## Year 3 推奨スタック 4 構成

### スタック ① 最安(PoC〜Year 1)
| 項目 | 選定 | 月額 |
|---|---|---|
| ホスト | Cloudflare Workers Paid | ¥750 |
| DB | Supabase Free Tokyo | ¥0 |
| Storage | Cloudflare R2 50GB | ¥200 |
| AI | mock / Ollama 自前 | ¥0 |
| メール | AWS SES Tokyo | ¥750 |
| 認証 | Supabase Auth Free | ¥0 |
| 監視 | Sentry Developer + CF WA | ¥0 |
| ドメイン | ムームー .jp | ¥279 |
| **合計** | | **¥1,979 / 月** |

### スタック ② バランス(Year 2-3、500 名)★ 推奨
| 項目 | 選定 | 月額 |
|---|---|---|
| ホスト | Vercel Pro Tokyo hnd1 | ¥3,000 |
| DB | Supabase Pro Tokyo + PITR | ¥18,750 |
| Storage | Supabase + R2 hybrid | ¥1,500 |
| AI | **Bedrock Tokyo Claude Hybrid** | ¥57,000 |
| メール | AWS SES Tokyo | ¥750 |
| 認証 | Supabase Auth + WorkOS SSO 1 | ¥18,750 |
| 監視 | Sentry Team + CF WA | ¥3,900 |
| ドメイン | ムームー | ¥279 |
| **合計** | | **¥103,929 / 月**(1 名 ¥208、ARR 比 4%) |

### スタック ③ ISMAP 完全対応(Year 2 県共同調達)
| 項目 | 選定 | 月額 |
|---|---|---|
| ホスト | AWS App Runner Tokyo | ¥3,500 |
| DB | AWS RDS db.t4g.small Tokyo | ¥5,700 |
| Storage | AWS S3 Tokyo + CloudFront | ¥3,000 |
| AI | Bedrock Tokyo Claude Hybrid | ¥57,000 |
| メール | AWS SES Tokyo | ¥750 |
| 認証 | Auth0 JP Essentials + WorkOS SSO | ¥24,000 |
| 監視 | Datadog AP1 Tokyo 最小 | ¥15,000 |
| AWS Business Support | | ¥15,000 |
| ドメイン | ムームー | ¥279 |
| **合計** | | **¥124,229 / 月** |

### スタック ④ 究極の主権 + 低コスト(国産 + PLaMo)
| 項目 | 選定 | 月額 |
|---|---|---|
| ホスト | さくらクラウド | ¥3,520 |
| DB | さくら DB アプライアンス 10GB | ¥12,000 |
| Storage | さくらオブジェクトストレージ | ¥1,238 |
| AI | **PFN PLaMo Prime API** | ¥14,000 |
| メール | さくら SendGrid (KKE) | ¥3,000 |
| 認証 | Auth0 JP Essentials | ¥5,250 |
| 監視 | New Relic Free + CF WA | ¥0 |
| ドメイン | ムームー | ¥279 |
| **合計** | | **¥39,287 / 月**(主権+コスト両立、PLaMo 品質要検証) |

## データ主権の実態(2026-06-14 調査結果)

### 1 行結論
**「法的義務ではない、現場は『説明できれば良い』寄り、ただしチェックシート対応の体力は必要」**

### 規制の 3 階層

| 階層 | 強制力 | データ主権の扱い |
|---|---|---|
| 法律(改正個情法 越境移転規制) | 法的義務 | 米国は十分性認定なし。ただし AWS 東京等は「越境移転に該当しない」扱いが定着 |
| 総務省ガイドライン(令和6年10月) | 技術的助言(地方自治法245条の4)→ 義務ではない | 「ISMAP 参照が望ましい」止まり |
| 自治体個別の調達仕様書 | その自治体のみ有効 | **最も実務影響大**、自治体ごとに濃淡桁違い |

### 自治体 3 タイプ(グラデーション)

- **A. 緩い自治体**(豊岡・神戸・西脇等):セルフサーブ→事後決裁 OK、Anthropic 直接でも opt-out 契約で通る
- **B. 標準自治体**(兵庫県内ほとんど):チェックシート 70-100 項目、AWS 東京 + Bedrock で 99% 通る
- **C. ガチガチ自治体**(県庁本体・中核市):ISMAP 登録要、ISMAP-LIU 1,000-2,000 万円投資が必要

### 海外 SaaS の自治体導入実例

| # | 自治体 | SaaS | 保管 | 整理ロジック |
|---|---|---|---|---|
| 1 | **横須賀市**(2023-04 全国初) | ChatGPT(OpenAI API 直接) | 米国 | 「学習されない API」+「個人情報入力禁止」ルール |
| 2 | 生駒市 | LGWAN 対応 ChatGPT | 国内 | 横須賀の逆 |
| 3 | **三重県庁**(2023-05 自治体初) | Slack | 国内 DC・米国本社 | ISMAP 登録 |
| 4 | 浜松市・北海道森町 | Slack | 同上 | |
| 5 | 多数(宇都宮等) | Microsoft 365 | Azure Japan East | ISMAP + α' モデル |
| 6 | 多数(豊岡等) | kintone | 国内 DC | サイボウズ国産 |
| 7 | 多数 | Salesforce | 国内 2 DC(東京2011・神戸2017) | 神戸 DC 化後拡大 |

### 協力隊サポート SaaS の特殊事情

**有利な要素:**
- **基幹 17 業務外** → ガバメントクラウド制約なし
- **マイナンバー扱わず** → 特定個人情報対象外
- **要配慮個人情報を扱わず** → 通常の個人情報のみ
- **随契範囲(200 万円/年)** → 簡易調達

**唯一の最大リスク:**
- 業務日誌の自由記述欄に**住民個人名が混入**→ 第三者の個人情報になる

**設計で吸収:**
1. 構造化フィールド(訪問先=住所コード、相手=役割名)を必須化
2. 自由記述に「住民個人特定情報は記載しないでください」UI ガイド
3. AI 側で氏名検出 → 警告(Claude で自動チェック可)
4. ADR-011 の関係者匿名化を全データ層に拡張

## ガバメントクラウドとの関係

| 概念 | 役割 | 協力隊 SaaS への影響 |
|---|---|---|
| **ガバメントクラウド** | デジタル庁運営、基幹 17 業務向け集約クラウド | **対象外**(17 業務でない) |
| **ISMAP** | 政府調達向けクラウド評価制度 | 自治体は推奨止まり |
| **自治体クラウド** | 複数自治体共同調達(古い概念) | 任意 |

→ 協力隊 SaaS はガバメントクラウドのベンダー縛り・認定要件を**満たす必要なし**。

**ガバメントクラウド認定ベンダー(2026年6月):**
- AWS / Google Cloud / Azure / Oracle Cloud / **さくらのクラウド**(2026-03-27 全要件クリア、初の国産認定)

## 戦略 v3.2 への含意

1. **MVP〜Year 1**:緩い自治体 + 隊員セルフサーブ → スタック ①(月 ¥2,000)
2. **Year 2 県共同調達**:標準自治体ターゲット → スタック ②(月 ¥104,000)or ③(月 ¥124,000)
3. **Year 3+ 全国展開**:選択的に ガチガチ自治体 → ISMAP-LIU 投資判断

### 重要な実務原則
1. **Anthropic 直接 API(米国)は本番では避ける** → 開発時のみ、本番は Bedrock Tokyo 経由(これだけで「国内 DC」と説明可能)
2. **個人情報入力を UI で抑制**(構造化 + 警告 UI)→ チェックシート審査が桁違いに楽
3. **想定問答集を最初から準備**:「米国 SaaS 安全か?」「越境移転該当しないか?」←横須賀・三重・kintone 前例で答える
4. **AWS 移植可能な設計を厳守**(`output: 'standalone'`、Dockerfile、Postgres 標準 SQL)→ Year 2 で ③ へスムーズ移行

## 調査エージェント実行記録

並列で 10 件のリサーチエージェントを起動・回収。所要時間 約 90 分(2026-06-13 23:00 〜 翌日 01:30 UTC)。

| エージェント | 内容 | サブエージェント |
|---|---|---|
| LLM プロバイダ料金 | Anthropic / Bedrock / Azure / Vertex / 国産 / Together / Groq / OpenRouter / Fireworks | 5 件展開 |
| ホスティング料金 | Vercel / CF Workers / Netlify / Railway / Render / Fly.io / AWS / GCP / Azure / 国産 VPS | 単一実行 |
| DB・ストレージ料金 | Supabase / Neon / Turso / RDS / Aurora / Azure / CloudSQL / さくら / R2 / S3 / Wasabi 等 | 単一実行 |
| ドメイン・メール・認証・監視 | .jp / Resend / SES / Auth / Sentry 等 | 4 件展開(ドメイン / メール / 認証 / 監視) |
| データ主権・国内リージョン横断確認 | ISMAP / 各 SaaS の Tokyo 対応 | 単一実行(自発的ボーナス) |
| 自前 GPU 構築 | RTX 4090/5090/PRO 6000/A100/H100/H200/MI300X/Mac Studio | 単一実行 |
| 自治体データ主権の実態 | 総務省ガイドライン / ISMAP / 三層分離 / α' / 横須賀事例等 | 単一実行 |

**ソース(主要):**
- anthropic.com/pricing, aws.amazon.com/bedrock/pricing, azure.microsoft.com/pricing/details/cognitive-services/openai-service, cloud.google.com/vertex-ai/generative-ai/pricing, plamo.preferredai.jp/api
- vercel.com/pricing, developers.cloudflare.com/workers/platform/pricing, fly.io/docs/about/pricing
- supabase.com/pricing, aws.amazon.com/rds/postgresql/pricing
- aws.amazon.com/ses/pricing
- supabase.com/pricing, auth0.com/pricing, workos.com/pricing
- sentry.io/pricing, newrelic.com/pricing, datadoghq.com/pricing
- muumuu-domain.com/domain/price, jpdirect.jp/domain/fee
- 価格.com, videocardz.com, watch.impress.co.jp, xtech.nikkei.com, spheron.network
- **総務省**「地方公共団体における情報セキュリティポリシーに関するガイドライン」(令和6年10月)
- **デジタル庁** ガバメントクラウド・公共SaaS 関連資料
- **個人情報保護委員会** 越境移転 / 外的環境の把握ガイドライン
- 横須賀市・三重県庁・宇都宮市 等の自治体プレスリリース・採用事例
- ISMAP / ISMAP-LIU 公式ポータル

## 注意・調査の限界

1. すべての公式価格ページが WebFetch で 403 を返したため、価格数値は **WebSearch スニペット + 2026 年公開のレビュー記事のクロスチェック** で確定。**本番調達前に各社公式ページで再確認必須**
2. 為替変動(±10-20%)で月額試算ぶれる可能性。実発注前に Pricing Calculator で再確認
3. Azure Japan East の **GPT-4.1 / GPT-5 配信状況**、AWS Bedrock の **Nova シリーズ Tokyo 配信状況** は要二次確認
4. 兵庫県内市町村(豊岡・新温泉町等)の **個別情報セキュリティポリシー** は公式サイトでの直接照会が必要(本調査未実施)
5. PLaMo Prime の **品質ベンチマーク**(月報生成・経費判定の精度)は PoC 検証必須

## 後続セッションでの参照ポイント

- **本番デプロイ準備時**:スタック ②(MVP)または ③(調達)で技術選定
- **県庁ヒアリング・提案時**:データ主権の整理ロジック(横須賀・三重・kintone 前例)を引用
- **AI 切替時**:`AI_PROVIDER` 環境変数で Anthropic / Bedrock / PLaMo / Azure を差し替え可能(ADR-016)
- **Year 2 県共同調達対応時**:スタック ③ への移行手順(AWS App Runner + RDS + Bedrock + WorkOS SSO)
- **コスト圧縮検討時**:Gemini Flash-Lite / Bedrock Nova Lite / PLaMo Prime を再評価(¥10,000-14,000 / 月)

---

**作成日:** 2026-06-14
**セッション期間:** 2026-06-13 〜 2026-06-14
**関連 ADR:** ADR-011(関係者匿名化)、ADR-016(AI プロバイダ抽象)、ADR-017(ローカル PoC は Next + SQLite)
**関連ドキュメント:** docs/19_v5_adr.md, docs/20_v5_requirements.md, docs/21_v5_technical_design.md
