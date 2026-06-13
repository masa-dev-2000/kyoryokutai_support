# 地域おこし協力隊サポートシステム

兵庫県内の非豊岡市町村向け・協力隊特化の垂直 SaaS。

- 戦略: `CLAUDE.md`
- ヒアリング結果: `docs/03_hearing_result.md`
- 市場・競合調査: `docs/05_competitor_market_research.md`
- 機能要件: `docs/06_requirements.md`
- 非機能要件: `docs/07_non_functional.md`
- 技術設計: `docs/08_technical_design.md`
- ヒアリング用モック: `mock/index.html`

## v5 フルスタック(ローカルで動く)

v5(`/v5`)は **Next サーバ + SQLite + 差し替え可能 AI** で動くフルスタック実装です(ADR-016 / ADR-017)。

```bash
npm install
cp .env.example .env.local   # 既定は AI_PROVIDER=ollama
npm run dev                  # http://localhost:3000/v5
```

- DB は初回アクセス時に `.data/app.db`(SQLite / Node 22 内蔵)へ自動で作成・シードされます。外部サービス不要。
- 画面: `/v5/member`(隊員)/ `/v5/manager`(役場・多段階承認)/ `/v5/admin`(管理者)
- 動作確認: `curl http://localhost:3000/api/health/`

### AI プロバイダの切替(`.env.local` の `AI_PROVIDER`)

| 値 | 用途 | 必要なもの |
|---|---|---|
| `ollama`(既定) | ローカル LLM | `ollama serve` 起動 + `ollama pull llama3.2`(モデルは `OLLAMA_MODEL` で変更可) |
| `anthropic` | 本番品質 | `ANTHROPIC_API_KEY` |
| `mock` | オフライン/CI | なし(決定論的なダミー応答) |

> Ollama を入れられない環境では `AI_PROVIDER=mock` にすれば全機能が動きます。
> Ollama 導入後は `AI_PROVIDER=ollama` に戻すだけで実モデルに切り替わります。

### 主な API(`/api/*`)

`health` / `activity-logs` / `expenses` + `expenses/[id]` / `monthly-reports` / `approvals` + `approvals/[id]/decide`(多段階承認)/ `announcements` / `members` + `members/[id]` / `staff` + `staff/[id]` / `assignments` / `host-organizations` + `host-organizations/[id]` / `approval-routes` + `approval-routes/[id]` / `cases` / `topics` / `ai/{consult,monthly-report,expense-title,expense-check}`

## スクリプト

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動(フルスタック) |
| `npm run build` | 本番ビルド(サーバモード) |
| `npm run start` | 本番サーバー起動 |
| `npm run build:static` | 静的エクスポート(API なし。GitHub Pages 用・現在は非対応) |
| `npm run db:reset` | ローカル SQLite を削除(次回起動で再シード) |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック |

## 本番移行(Year 1)

- DB: SQLite → Supabase(Postgres + RLS)。DB アクセス層(`src/lib/db`)と API 契約はそのまま流用。
- AI: `AI_PROVIDER=anthropic`。
- 旧 `db/migrations/` の Supabase 用 SQL は `db/README.md` 参照(旧データモデル)。

## 開発進捗

- [x] Week 1: プロジェクト初期化 + 初期マイグレーション
- [ ] Week 2: 認証・ユーザー・テナント + RLS 動作確認
- [ ] Week 3: 日報入力 + 一覧 + タグ
- [ ] Week 4: 月次報告 AI 生成 + 承認
- [ ] Week 5: お知らせ + チャット + PWA
- [ ] Week 6: 役場ダッシュボード + 監査ログ
- [ ] Week 7: オフライン + エクスポート
- [ ] Week 8: α ヒアリング + 修正
