# v4 RAG アーキ設計 v1 ─ メンター AI と複数視点のための知識基盤

**確定日**: 2026-06-10
**根拠**: docs/15(要件)+ docs/16(データモデル)
**目的**: PoC レベルで「Web 公開情報 + 並行蓄積」の RAG パイプラインを設計する。
**前提**: Supabase pgvector を使う(別ベクトル DB は立てない)。

---

## 🎯 RAG が支える機能

| 機能 ID | 機能名 | RAG の使われ方 |
|---|---|---|
| C-1 | AI メンター(常時相談)| 質問 → 類似事例 + 一般知識で回答 |
| C-2 | 過去隊員事例ベース回答 | 「移住促進担当の OG はどんな活動した?」→ 自治体公開記事を引用 |
| C-3 | 困ったときの一次対応 | 「悩んでいる」系発言 → 類似経験談を引用しつつ寄り添う |
| C-4 | 卒業後ビジョン形成 | 「卒業後どうなった?」→ ブログ/note の OB/OG キャリア事例 |
| C-5 | レコメンド | プロフィール + 活動履歴で類似活動・補助金事例を提示 |
| B-1 | 経費判断補助 | 過去の経費事例 + 規程 → 「これは過去 OK / NG だった」 |
| B-3 | 活動の事前相談 | 同種活動の事例 + 議会議事録の制約 → 3 視点 |
| B-4 | 役場批判含む助言(隊員側 UI のみ)| 地域目線/隊員目線で AI が "翻訳" |
| A-3〜5 | 月報/議会/県/国 報告書 | テンプレ + 自社 record + 似た自治体の過去報告書 |

→ **RAG は v4 全機能の縦糸**。これが弱いと全機能が "それっぽいだけ" に劣化する。

---

## 📚 ソース一覧と取り扱い

| カテゴリ | ソース | 取得方法 | 更新頻度 | 法的留意点 |
|---|---|---|---|---|
| 制度・規程 | JOIN お役立ちツール(Excel/PDF) | 手動ダウンロード → PDF パーサ | 半年 | 公開資料、引用可 |
| 統計 | 総務省「協力隊データ」 | API or 手動 CSV | 年次 | 政府データ、再利用可 |
| 活動事例 | 自治体公式サイト(隊員紹介ページ)| Web スクレイピング(robots.txt 尊重)| 月次 | パブリック、出典明記必須 |
| キャリア事例 | 個人ブログ・note(OB/OG)| RSS / 手動キュレーション | 月次 | 著作権配慮(全文転載しない、要約+URL)|
| 制約事例 | 自治体公開議会議事録 | スクレイピング | 半年 | パブリック、出典明記 |
| 内部 | 自社蓄積 record(匿名化済)| 自社 DB → 非同期パイプライン | リアルタイム | opt-in 必須 |

---

## 🏗 アーキテクチャ図

```
┌────────────────────────────────────────────────────────────────┐
│ Ingestion(取り込みパイプライン)                                │
│                                                                 │
│  ① 手動アップロード(JOIN PDF, 議会議事録)                       │
│  ② スクレイパー(自治体公式 / ブログ)── cron                    │
│  ③ 内部 record 匿名化(opt-in) ── DB trigger or pg_cron        │
│                  │                                              │
│                  ▼                                              │
│            前処理(chunk + クリーニング)                         │
│                  │                                              │
│                  ▼                                              │
│            Embedding 生成(Claude or OpenAI ada-002)             │
│                  │                                              │
│                  ▼                                              │
│            Supabase pgvector に保存(document table)            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Retrieval(検索)                                                │
│                                                                 │
│  クエリ                                                          │
│    │                                                             │
│    ├─ Query embedding(同じ embed モデル)                       │
│    ├─ メタデータフィルタ(prefecture, kind, date)                │
│    ├─ pgvector で cosine 類似検索(top-k = 10)                  │
│    └─ 再ランキング(Claude Haiku で関連度スコア)                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Generation(生成)                                                │
│                                                                 │
│  Retrieved chunks + System prompt + ユーザー質問                 │
│    │                                                             │
│    ├─ 視点別生成(municipality / community / member / mentor)   │
│    │    並列 4 並行 or 構造化出力 1 回                            │
│    └─ Claude Sonnet 4.6 で回答 + 引用(citations)生成            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Persistence(保存)                                              │
│                                                                 │
│  question + advice 行を DB に書き込み                            │
│  citations(引用元)を jsonb で保持                              │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 技術選定

| レイヤ | 選定 | 理由 |
|---|---|---|
| Embedding モデル | **OpenAI text-embedding-3-small**(1536 次元)| 日本語品質と Cost のバランス。Claude も embedding を出すが安定性重視で当面 OpenAI |
| ベクトル DB | **Supabase pgvector**(別 DB なし)| PoC 簡素化、運用一本化、RLS と同居 |
| 類似検索 | cosine distance + ivfflat index | PoC 規模(~10 万 chunk)で十分 |
| LLM(生成)| **Claude Sonnet 4.6** | 日本語品質、引用付き生成が得意 |
| LLM(再ランキング)| **Claude Haiku 4.5** | 安価高速、re-rank はトークン少 |
| スクレイパー | Next.js Route Handler + Cheerio | サーバレス、簡素化 |
| PDF パーサ | `pdf-parse`(npm)| JOIN PDF 処理に十分 |
| Cron | Supabase pg_cron or Vercel Cron | 日次/週次更新 |
| 匿名化 | Claude にプロンプトで「個人名 → 役割」変換させる | 簡素、PoC 妥当 |

---

## ✂️ チャンク戦略

### サイズ
- **チャンク = 400〜600 トークン**(日本語で約 600〜900 文字)
- **オーバーラップ = 80 トークン**

### 分割単位
| ソース kind | 分割方針 |
|---|---|
| JOIN PDF | 見出し階層 + サブ見出し(章・節)|
| 議会議事録 | 発言単位(議員 1 発言 = 1 chunk)|
| 自治体公式 隊員紹介 | 1 記事 = 1 chunk(短いため分割しない)|
| ブログ/note | 段落 4-5 個ごと |
| record(内部)| 1 record = 1 chunk(短いので分割なし)|

### メタデータ(検索時のフィルタ用)

```json
{
  "prefecture": "兵庫県",
  "municipality": "新温泉町",
  "year": 2025,
  "topic_tags": ["移住促進","空き家"],
  "anon_member_role": "移住促進担当",
  "source_kind": "municipality_site"
}
```

---

## 🔍 Retrieval 戦略

### クエリ前処理
1. 質問を Claude Haiku で **検索クエリ化**(余分な敬語等を削る)
2. 同時にトピック分類(`expense | activity | career | guardrail | other`)
3. クエリ embedding 生成

### 検索ロジック
```ts
async function retrieve(query: string, opts: {
  member: Member;
  topK?: number;
  filterKinds?: string[];   // ['municipality_site','blog'] 等
}) {
  const qEmbed = await embed(query);
  const candidates = await supabase.rpc('match_documents', {
    query_embedding: qEmbed,
    match_count: opts.topK ?? 10,
    filter_kinds: opts.filterKinds,
    filter_prefecture: opts.member.org.prefecture,  // 同じ県を優先
  });
  // 再ランキング(Claude Haiku で関連度 0-1 スコア)
  return await rerank(candidates, query);
}
```

### 検索の幅(段階的)
1. **Tier 1**: 同自治体(完全マッチ)— あれば最強
2. **Tier 2**: 同県・同職種 — 文脈近い
3. **Tier 3**: 全国・同職種 — 事例数勝負
4. **Tier 4**: 全国・全職種 — 最後の手段

データ少ない PoC 初期は Tier 3-4 中心、蓄積に伴い Tier 1-2 重視に。

---

## 🧠 Generation 戦略(複数視点プロンプト)

### システムプロンプト(共通)

```
あなたは協力隊員のメンター AI です。
- 隊員の質問に対し、複数の視点で材料を提供します。
- 判定はしません(やる / やらないを決めるのは人間)。
- 引用元は必ず明記してください。
- 一般論しか言えない場合は「データ不足です」と正直に伝えてください。
```

### 視点別プロンプト(B-3 の核)

```
質問: {user_question}

以下の 4 視点それぞれで「材料」を提供してください。

[1. 役場の目線(municipality)]
役場がこれに対して気にしそうなポイントを 2-3 個。

[2. 地域の目線(community)]
地域住民・関係者の視点での意味と懸念を 2-3 個。

[3. 隊員の目線(member)]
あなた自身がやるならどう進めると良いかの段階提案を 2-3 個。

[4. スモールスタート案(small_start)]
最初の 1 週間で試せる最小行動を 1-2 個。

各視点ごとに、引用した検索結果の chunk_id を [citation: xxx] 形式で明記してください。
```

### Visibility 制御(B-4 の核)
- 視点 1(municipality)の中に「これは役場が嫌がるかも」を含めるケース → `visibility = 'member_only'`
- 隊員側 UI には全視点表示、役場側 UI には visibility='all' のみ表示(docs/16 の RLS で強制)

### 出力フォーマット
```json
{
  "advices": [
    { "perspective": "municipality", "body": "...", "citations": [...], "visibility": "all" },
    { "perspective": "community",    "body": "...", "citations": [...], "visibility": "all" },
    { "perspective": "member",       "body": "...", "citations": [...], "visibility": "all" },
    { "perspective": "small_start",  "body": "...", "citations": [...], "visibility": "all" }
  ]
}
```

Claude の structured output(tool use)で堅く取る。

---

## 📥 Ingestion 詳細

### 初期投入(PoC 開始時)

```bash
# 1. JOIN PDF を docs/seed/join/ に配置 → アップロードスクリプト
npm run rag:ingest:join

# 2. 総務省データ CSV 取り込み
npm run rag:ingest:soumusho

# 3. 兵庫県内自治体 公式サイトの隊員紹介ページをスクレイプ
npm run rag:ingest:municipality -- --prefecture=兵庫県
```

### 継続更新

```sql
-- pg_cron で月次実行
select cron.schedule(
  'rag-refresh-municipality',
  '0 3 1 * *',  -- 毎月 1 日 03:00
  $$select net.http_post(url := 'https://app.example.com/api/rag/refresh-municipality') $$
);
```

### 内部 record の匿名化 → RAG 投入

```sql
-- record 投稿時のトリガで匿名化キューに積む(opt-in member のみ)
create trigger after_record_insert
after insert on record
for each row execute function enqueue_anonymize();

-- バックグラウンドジョブが Claude で匿名化 → document に挿入
```

---

## 📊 評価・改善

### PoC 段階の評価指標

| 指標 | 目標(PoC)|
|---|---|
| Top-5 関連率(人手評価)| 60% 以上 |
| 引用ありの回答率 | 80% 以上 |
| 隊員満足度(★1-5)| 平均 3.5 以上 |
| 「データなし」と正直に答えた率 | 検証時に確認(虚偽率 5% 以下)|

### 改善ループ
1. 隊員が「役に立った」「微妙」をクリック → feedback テーブルに蓄積
2. 月次で feedback × retrieved chunks を分析
3. 関連性が低かった chunk のメタデータ補正 or 削除
4. 高評価 chunk は埋め込みを再生成 or 強調

---

## 🔐 セキュリティ・倫理

### データの取り扱い
- スクレイピングは **robots.txt 遵守 + User-Agent 明示**
- 著作権配慮: 引用は最小限の抜粋 + 出典 URL を必ず添付
- 個人名は **AI で匿名化してから埋め込み**

### 偽情報リスク
- 「データなしの場合は答えない」を system prompt で強制
- 引用なしの回答は UI で「※ 一般知識による回答(出典なし)」と明示
- 法律・税務・医療の質問は「専門家へ」と動線を出す

### Opt-in / Opt-out
- 隊員は自分の record を RAG に提供するか選べる(デフォルト opt-out)
- 役場は自治体 settings で全体 opt-in を上書き可能(ただし隊員個別の opt-out を尊重)

---

## 🗺 段階導入

| Phase | RAG ソース | 主な利用機能 |
|---|---|---|
| **Phase 1**(PoC 着手)| JOIN + 総務省 + 兵庫県内自治体公式 | C-1, C-2, B-1(経費) |
| **Phase 1.5** | + ブログ/note + 議会議事録 | C-4(卒業後)+ B-3(活動相談) |
| **Phase 2**(新温泉町 PoC)| + 内部 record(匿名化)| C-1〜5 全体 |
| **Phase 3** | + 横展開自治体データ | 全機能 |

---

## 🚨 残論点

| # | 論点 | 仮の方針 |
|---|---|---|
| 1 | Claude embeddings 安定後に切替するか | Phase 2 で再評価、PoC は OpenAI |
| 2 | re-rank に専用モデル(cohere-rerank 等)使うか | PoC は Haiku で十分、品質悪ければ専用検討 |
| 3 | スクレイピング頻度 と robots 違反リスク | 月次 + キャッシュ、違反検知時は即停止 |
| 4 | 議会議事録のサイズが大きい(数 MB)| 視点別フィルタ + 要約済 chunk で対応 |
| 5 | 匿名化の品質保証 | Claude 出力を別 Claude で「個人名残ってない?」チェック(2 段階)|
| 6 | citation の UI 表示 | クリックでソース全文を別画面で表示 |

---

## 📐 関連ドキュメント

- `docs/15_v4_requirements.md` ─ 要件
- `docs/16_v4_data_model.md` ─ データモデル
- `docs/17_v4_rag_design.md` ─ **本書**
- `src/app/v4/*` ─ ラボ実装(次に着手)
