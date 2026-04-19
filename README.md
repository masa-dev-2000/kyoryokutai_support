# 地域おこし協力隊サポートシステム

兵庫県内の非豊岡市町村向け・協力隊特化の垂直 SaaS。

- 戦略: `CLAUDE.md`
- ヒアリング結果: `docs/03_hearing_result.md`
- 市場・競合調査: `docs/05_competitor_market_research.md`
- 機能要件: `docs/06_requirements.md`
- 非機能要件: `docs/07_non_functional.md`
- 技術設計: `docs/08_technical_design.md`
- ヒアリング用モック: `mock/index.html`

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local を編集
npm run dev
```

## スクリプト

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック |

## DB マイグレーション

`db/migrations/` の SQL を Supabase SQL Editor で順次実行。詳細は `db/README.md`。

## 開発進捗

- [x] Week 1: プロジェクト初期化 + 初期マイグレーション
- [ ] Week 2: 認証・ユーザー・テナント + RLS 動作確認
- [ ] Week 3: 日報入力 + 一覧 + タグ
- [ ] Week 4: 月次報告 AI 生成 + 承認
- [ ] Week 5: お知らせ + チャット + PWA
- [ ] Week 6: 役場ダッシュボード + 監査ログ
- [ ] Week 7: オフライン + エクスポート
- [ ] Week 8: α ヒアリング + 修正
