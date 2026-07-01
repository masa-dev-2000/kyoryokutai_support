# 地域おこし協力隊サポートシステム

## プロジェクト概要
地域おこし協力隊員の「活動記録 → 自治体報告」を AI で自動化し、
副産物として全国のナレッジを蓄積するシステム。
**提案先: 兵庫県庁**

---

## 思考フレーム: 3つの帽子で考える

このプロジェクトでは、議論・設計・実装を以下の3視点で必ず整理する。

### 🎩 McKinsey コンサル視点 — 戦略
- 課題構造の整理(誰の・何の痛みを解くか)
- 打ち手のオプション比較表(A/B/C/D で並べて選ぶ)
- 成功指標と撤退条件
- ステークホルダー分析(特に兵庫県庁・市町村・隊員・卒業生)

### 🎩 Google PM 視点 — プロダクト設計
- ターゲットペルソナ(最初の10人)
- Jobs-to-be-Done
- MVP スコープと非スコープの明示
- 北極星指標 / ガードレール指標
- ユーザーストーリー → 画面遷移

### 🎩 BMI エンジニア視点 — 実装
- 技術選定の根拠
- データモデル
- 最小実装の粒度
- 運用・セキュリティ・コスト

**回答時は必ずこの3視点のうち該当するものを明示する。**
戦略議論なら McKinsey、機能設計なら PM、コード書くなら Engineer。
複数にまたがる時は見出しを分けて書く。

---

## 戦略方針(確定版 v3.2 - Partner Review 後)

### ポジショニング(1行で)
**「大手SIが構造的に入れない経済性の谷間で、AIとセルフサーブで勝つ、協力隊特化の垂直SaaS」**

### 野心レベル
**Option B: 小規模起業(年商1〜3億を3年で目指す)**
- VC fundable スタートアップではない(市場 TAM 5-10億のため絶対に乗らない)
- 個人の社会事業でもない(ちゃんと儲ける)
- 3〜5年後のEXIT候補: サイボウズ / 中堅自治体ベンダーへの事業売却

### なぜ勝てるのか(Unfair Advantage)

**① 大手SIが構造的に参入不可能(5年の窓)**
- 大手SI最小案件規模: 数千万〜億円 vs 協力隊SaaS単価: 自治体あたり年20〜100万円
- 経済性が2桁乖離 = 入れば赤字確定
- 大手は標準化17業務(2025末期限)とガバクラ移行でリソース完全埋まり

**② サイボウズも公式パッケージ化していない(2-3年の窓)**
- ガブキン(自治体kintoneコミュニティ650団体)の公式テンプレに協力隊はゼロ
- 豊岡事例ですらサイボウズ公式 cases/ に掲載なし = 営業優先度が低い
- 「自治体が作る」哲学 = 公式化には年単位かかる

**③ 唯一の現実的脅威は水平SaaS参入(2年の先行期間)**
- 日報SaaS(gamba!等)/フィールドSaaS(Leafwork等)の「協力隊プラン」投入リスク
- 参入コスト低い → スピードで先行する必要

### 真のTAMとキャッシュポイント

**TAM 試算**
- 全国: 7,910人 × 活動費枠200万円/人 = 公的支出ベース年380億円
- SaaS 取得可能額: 全国 年5〜10億円、兵庫県 年300〜500万円、47県全取得で年5億円が上限
- 兵庫県内 非豊岡: 現役70〜80人 / 17市町

**キャッシュポイント(A + D ハイブリッド)**
| フェーズ | モデル | 金額感 |
|---|---|---|
| Year 1 | 補助金ベース(デジ田/創生交付金)での PoC | 300-500万 |
| Year 2 | 兵庫県共同調達(県+市町按分、熊本AI議事録モデル) | 800-1,500万 |
| Year 3 | 他県横展開(鳥取・島根・長野) | 3,000-5,000万 |

**令和7年4月の少額随契基準引上げ(委託200万円まで)は追い風** → 年200万円未満の単価設計なら随契で即調達可能。

### 勝ち筋(機能軸)
1. **音声ファースト日報 + AI 質問補完**(MVP コア記録方式・新)
2. **隊員⇔役場の双方向コミュニケーション**(お知らせ + 役場フィードバック必須化、チャットは外す)
3. **厳格な権限分離**(隊員は自分の情報のみ)← 豊岡 kintone 弱点の逆張り
4. **月次報告 AI 生成**(Claude でフォーマット差異吸収・オプトイン)
5. **AI 壁打ち 4 モード**(戦略レビュー / 提案準備 / キャリア / 悩み)
6. **担当課ハブ + 活動費透明化**(行政サポート不足の解消)
7. **県横断ダッシュボード**(県庁スポンサー価値)
8. **匿名化した全国事例検索**(MUST、N≥10 自治体で意味を持つ)

### 🔥 オーナー確定 MUST 機能(2026-04-22 / 2026-04-23)
プロジェクトオーナーの明示判断により、**以下は MVP 確定の MUST 機能**:
- **全国事例検索DB**(Issue #6): キュレーション型・成功事例集
- **全国リアルタイム活動フィード**(Issue #18): 「日本中の協力隊が今何をしているか」可視化(実装は Year 2)
- **音声ファースト日報 + AI 質問補完**: 「話すだけで完成度の高い記録」を技術で実現

両機能は kintone では構造的に実現不可能で、**戦略 v3.2 の Moat そのもの**。
ヒアリング N=3 で共通支持が確認済。実装は匿名化 + opt-in を前提とする。

### MVP 9 機能 → **3 + 3 構造**に整理(2026-04-30 v2 / **2026-06-11 v3 役場側シンプル化**)

**隊員側 3 機能**(行動軸):
1. **プロジェクト**(計画 + 進捗管理 / ライフサイクル: 計画→進行→完了)
2. **日々の動き**(行動記録 + 夜の振り返り + 申請)
3. **学ぶ・相談する**(事例検索 + AI 壁打ち)

**役場側 3 機能**(v3 / 2026-06-11 シンプル化確定 ─ v5 試作後):
1. **承認**(経費・月次・活動相談を 1 タブ統合 / AI 判定材料付き / **差戻し時のみコメント必須**)
2. **月報**(担当隊員グリッド・状態一覧 / 月指定検索)
3. **お知らせ**(textarea + 一斉送信デフォルト / 既読率)

> 設定(管轄隊員チェックリスト等)はフッタリンクに隠す。

**v3 で MVP 外に降格**(Year 2 以降に再評価):
- 議会報告 PDF 自動生成 ─ 県庁提案の最大価値だが、画面複雑化を避け Year 2 へ
- 全国事例閲覧(役場側 UI) ─ 全国事例は隊員側に集中
- KPI / 進捗ダッシュボード ─ 月報グリッドで代替
- 全国・近隣自治体ベンチマーク
- 県横断ダッシュボード ─ 県庁モードとして別レイヤーで Year 2
- 承認時の常時コメント必須 ─ 差戻し時のみに緩和

**通知**は機能と並列ではなく**横断レイヤー**(右上常駐 等)。

詳細は `docs/11_feature_inventory.md` v3 を参照。

### 構造化データの核心

```
Project (status: planning | active | completed, isPublic)
  → status=completed && isPublic=true で「事例」化
  → 別エンティティ不要、ワンクリックで事例公開
```

エンティティ: Project / Action / Review / ApplicationRequest / GeneratedArtifact / Announcement

### MVP 1 行説明(更新)
> **計画 / 動き / 学び ── 隊員はこの 3 つだけ。AI が日報・月報・事例・進捗・成果まで全部組み立てる、協力隊特化の SaaS。**

### Partner レビューで修正済の 3 つの罠
1. 「計画立案」と「プロジェクト設定」の重複 → **統合**
2. 「タスク管理」概念の肥大化 → **「日々の動き」**に再命名
3. 「AI 相談」を独立機能にする矛盾 → AI は**全機能の裏側**、明示機能は「学ぶ・相談する」

### 明確に "やらない"(却下事項)
- **チャット(F05)**: Issue #1。電話・LINE 運用尊重
- **GPS 自動記録 / 移動判定**: プライバシー政治リスク + iOS 制約 + スコープ爆発、Year 3+
- **法的相談窓口**: 本業外、外部リンク集まで
- **SSO**: 自治体別対応コスト膨大

### MVP 外に降格(v3 / 2026-06-11)
役場側の「シンプル 3 タブを真とする」判断で MVP からは外す。価値は認めるので Year 2 で再評価。
- 議会報告書 PDF 自動生成(役場側)
- 全国事例閲覧 UI(役場側)
- KPI / 進捗ダッシュボード(役場側)
- 全国・近隣自治体ベンチマーク
- 県横断ダッシュボード(県庁モード)
- 承認時の常時コメント必須化

### Go-to-Market 戦略: ボトムアップ + 県庁スポンサー

**営業コスト構造的ゼロ化**(大手が真似できない経路):
1. 隊員個人が無料で使い始められるセルフサーブ設計
2. 隊員からの口コミで自治体担当課へ伝播
3. 自治体が「公式化」するタイミングで有償契約化
4. 並行して県庁と関係構築 → 県共同調達へ

### ターゲット(最初の10人)
- 兵庫県内、着任1年目、1人配置の隊員
- 月次報告書に2〜3時間かかっている層

### UX 前提
- **隊員側**: スマートフォン前提(現場からその場で入力)
- **管理者側(自治体・県庁)**: PC 前提(ダッシュボード閲覧・エクスポート)

### 月次報告書のフォーマット
- 兵庫県の既存テンプレは未入手 → **一般形式**でまず作る
- 章立て例: 活動サマリ / 個別活動の詳細 / 成果物 / 来月計画 / 所感・課題

### MVP スコープ(Year 1 前半で実装)
1. 隊員: 日報入力(スマホ、Markdown / 音声メモ / 写真添付)
2. 隊員: 月次報告 AI 生成(Claude API)
3. 隊員: 役場からのお知らせ受信 + 簡易チャット
4. 役場: 担当隊員の日報閲覧 / お知らせ配信 / 月次報告承認
5. 基盤: 権限分離(自分/担当/市町村内) + データ匿名化フラグ

### 非スコープ(やらない)
- 横断ナレッジ検索(N < 10 では価値ゼロ、Year 2 以降)
- 自治体管理画面の高度機能(v2 で検討)
- SSO 認証連携

### 指標(KPI)
- **北極星指標**: 週あたり日報投稿数 / 人
- **ガードレール**: 報告書作成時間の削減率(自己申告)
- **Year 1 目標**: MAU 30、有償契約 1、ARR 100万
- **Year 2 目標**: MAU 150、ARR 1,500万
- **Year 3 目標**: ARR 3,000-5,000万

### 撤退条件
- 6ヶ月で有償契約ゼロ → 戦略見直し
- 12ヶ月で MAU 10 人未達 → プロダクト自体の見直し

### 競合監視 watchlist(月次で確認)
- [ ] サイボウズ「まるごとDXボックス」に協力隊テンプレ追加
- [ ] 豊岡事例が cybozu.co.jp/cases/ に掲載(公式営業アセット化サイン)
- [ ] 総務省「協力隊報告様式標準化ガイドライン」公表
- [ ] 日報/フィールドSaaS(gamba!/Teamspirit/Leafwork 等)の自治体プラン発表

---

## 技術スタック(初期案)

| レイヤ | 選定 | 理由 |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind | Vercel 即デプロイ、県庁提案時にURL共有が楽 |
| Backend | Next.js Route Handlers | 最小構成 |
| DB | Supabase (Postgres) | Auth もついてくる |
| AI | Claude API (Sonnet 4.6) | 日本語要約の品質重視 |
| Auth | Supabase Magic Link | 初期は軽く |

### データモデル(初期)
- `User` (id, name, municipality, assigned_at)
- `DailyLog` (id, user_id, date, body_md, voice_url)
- `MonthlyReport` (id, user_id, year_month, draft_md, status)
- `Tag` (id, name, category)
- `DailyLogTag` (log_id, tag_id)

---

## 兵庫県庁提案の観点(忘れない)

- **県の価値**: 県内全隊員の活動が横断的に見える化される
- **市町村の価値**: 報告書提出が早く・質が揃う
- **隊員の価値**: 作業時間が減り、孤立感が減る(他地域の似た活動が見える)
- **提案資料は MVP 完成後に作る**(動くものを見せる方が早い)

---

## 開発ルール

- ブランチ: `claude/regional-support-system-strategy-NN5BU`
- コミットは小さく、日本語で OK
- 新機能提案時は必ず「3つの帽子」で整理してから着手

## 開発フロー設定

このプロジェクトでは `kio-*`(グローバル `~/.claude/commands/`)ではなく、プロジェクトローカルの **`/dev-*` コマンド群**(`.claude/commands/dev-*.md`)を使う。

```
design session(design-decision/recordスキル、変更なし)
→ issue session(issues/deepenスキル、変更なし)→ role:{super|admin|manager|member} + status:ready ラベル付与
→ coding loop(.claude/hooks/dispatcher-stop.sh 起点、plan→human承認→check→action、.claude/agents/coding-loop-dev.md)
→ review session(/dev-review、review_accountでポーリング自律実行)
→ merge session(/dev-devmerge → /dev-e2e → /dev-mainmerge)
```

- `review_account`: `m-takehara555`（PR Approve / Request changes 実行用）
- `pr_account`: `masa-dev-2000`（実装PR作成側、デフォルトのactiveアカウント）
- エスカレーション基準: 同一PRへの Changes Requested が**2回連続**で `status:blocked` ラベル付与+human判断へ委ねる(指摘内容の同一性判定はしない、回数ベース)

### ロール別許可編集域

| role | 担当ディレクトリ |
|---|---|
| member | `src/app/member/`, `src/app/api/{daily-logs,expenses,activity-logs,monthly-cycles,cases}` |
| admin | `src/app/admin/`, `src/app/api/{members,staff,host-organizations,budgets,assignments}` |
| super | `src/app/super/`, `src/app/api/super` |
| manager | `src/app/manager/`, `src/app/api/{monthly-reports,approvals,approval-routes,announcements}` |
| 共有(原則触らない・追加のみ) | `src/lib/db/repositories/*`, `schema.ts`, `auth.ts`, `mappers.ts`, `migrations/`, `src/app/api/{auth,users,topics,visions,files,health}`, `src/app/{login,signup}` |

### dev-review / dev-devmerge / dev-e2e / dev-mainmerge が参照する値

- `dev_url`: `https://kyoryokutai-support-git-develop-masatyundev-5218s-projects.vercel.app`(developブランチ固定のVercelプレビューエイリアス。push毎に変わらない。パターンは`<project>-git-<branch>-masatyundev-5218s-projects.vercel.app`。PR #163のVercelコメントで`git-feat-<hash>`形式のブランチエイリアスの実在を確認済み)
- `e2e_accounts`: **未設定**（E2Eテスト用アカウントの id/メールアドレスのみ記載可。**パスワードはここに書かない**、`/dev-e2e` は人間にログインだけ依頼する）
- `prod_branch`: `main`
- `prod_deploy_commands`: **未設定**（本番デプロイコマンド列。`/dev-mainmerge` 実行前にユーザーへ確認すること）
- `prod_url`: **未設定**
- 本番Supabase project id: `flntuqjllqsvhnwqsmxp`（`/dev-mainmerge` のマイグレーション適用先）
- `db_migration_command`: 未設定なら MCP `apply_migration`→`execute_sql` を使う（`/dev-mainmerge` Phase 5-2参照）
