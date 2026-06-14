# モック / デモ公開手順(Vercel Hobby)

> リポジトリを Private に切り替えた後も、モック画面 + フルスタックデモ(SQLite + Mock AI)を
> 誰でも触れるオンライン URL で公開するための手順書。
>
> Phase 1 着手(2026-07)で Vercel Pro($20/月)+ hnd1 Tokyo 固定にアップグレード、
> ADR-018 の本番スタックへ移行する。それまでは Hobby で「試作品共有」フェーズとして運用。

## 0. なぜ Vercel Hobby か(ADR-018 との関係)

| 観点 | 内容 |
|---|---|
| コスト | **¥0**(無料) |
| Private リポ対応 | ✅(GitHub App 経由でアクセス) |
| 商用利用 | ⚠️ 規約上は個人プロジェクト限定 = **Phase 1 着手前の試作品共有**として整理 |
| Phase 1 移行 | Hobby → Pro($20/月)へワンクリックアップグレード、ADR-018 のスタックへスムーズ移行 |
| 動作モード | サーバーモード(API Routes + SQLite が動く) |
| SQLite 永続化 | ❌ Vercel serverless は `/tmp` 揮発 → リクエスト毎に再シード(逆にデモには便利) |
| AI | `AI_PROVIDER=mock` でゼロコスト(ADR-016 のプロバイダ抽象) |

## 1. デプロイ前準備

### 1.1 リポジトリを Private に切り替え
1. GitHub リポジトリの Settings → General → Danger Zone → "Change visibility" → Private
2. 既存の GitHub Pages 公開を停止:Settings → Pages → Source = None
3. (本リポでは `.github/workflows/deploy.yml` は削除済み)

### 1.2 設定ファイル(本コミットで対応済み)
- `next.config.mjs`:`PAGES_BASE_PATH` 環境変数で basePath を制御(Vercel では未設定 = basePath なし)
- `vercel.json`:Function Region を `hnd1`(Tokyo)に固定、Function 最大実行時間 60 秒
- `.vercelignore`:`.data/` `out/` `.next/` `docs/` 等を除外

## 2. Vercel Hobby セットアップ手順

### 2.1 アカウント作成 + GitHub 連携
1. https://vercel.com で GitHub アカウントでサインアップ(Hobby プラン自動選択)
2. Vercel Dashboard → Add New → Project
3. GitHub Repository 一覧で本リポを選択
4. **Private リポの場合は GitHub App 権限を追加で付与**(画面の指示に従う)

### 2.2 プロジェクト設定
| 項目 | 値 |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `.`(デフォルト) |
| Build Command | `npm run build`(デフォルト、`BUILD_STATIC` は **設定しない**) |
| Output Directory | `.next`(デフォルト) |
| Install Command | `npm install`(デフォルト) |
| Node.js Version | **22.x**(node:sqlite 必須) |

### 2.3 環境変数(Vercel Project Settings → Environment Variables)
| キー | 値 | 環境 |
|---|---|---|
| `AI_PROVIDER` | `mock` | Production / Preview / Development |
| `DATABASE_PATH` | `/tmp/app.db` | 同上 |
| `NODE_ENV` | `production` | Production のみ(自動設定) |

> Phase 1 着手時に `AI_PROVIDER=bedrock` + AWS / Supabase 接続情報を追加して本番化。

### 2.4 デプロイ
1. Deploy ボタン押下
2. 約 2-3 分でビルド完了 → `https://<project-name>.vercel.app` で公開
3. デプロイ後の確認:
   - `https://<project-name>.vercel.app/v5` でハブ画面表示
   - `https://<project-name>.vercel.app/v5/member` で隊員アプリ
   - `https://<project-name>.vercel.app/v5/manager` で役場アプリ
   - `https://<project-name>.vercel.app/api/health/` で `{"db":"ok","ai":{"provider":"mock","ok":true}}` 確認

### 2.5 デプロイブランチの制限
`vercel.json` の `git.deploymentEnabled` で `claude/regional-support-system-strategy-NN5BU` のみ自動デプロイされる設定済み。他ブランチを公開したい場合は同じく追加。

## 3. プレビュー URL の活用(ヒアリング時に便利)

- **本番デプロイ**:`main` ブランチ(or 指定ブランチ)→ `https://<project>.vercel.app`
- **PR ごとに Preview URL 自動生成**:`https://<project>-git-<branch>-<team>.vercel.app`
- ヒアリング中に「この変更を見てください」と Preview URL を共有可能

## 4. 独自ドメイン設定(任意)

将来 `mock.kyoryokutai.example.jp` 等で公開したい場合:

1. ムームードメインで取得済の `.jp` を Cloudflare DNS で管理(ADR-018 と同構成)
2. Cloudflare で `mock` サブドメインの CNAME を `cname.vercel-dns.com` に設定
3. Vercel Dashboard → Settings → Domains → Add `mock.kyoryokutai.example.jp`
4. SSL は Cloudflare Universal SSL + Vercel 自動発行で両対応

## 5. ヒアリング時の運用 Tips

### 5.1 デモ用の固定 URL
ヒアリング相手に共有する URL は **本番ブランチの安定版** を使う。Preview URL は Pull Request 単位で変わるので、デモ用には不向き。

### 5.2 揮発 DB の活用
SQLite は `/tmp` で揮発するので、リクエスト毎に初期データに戻る = **「常に同じ状態から触れる」** という特性。これは営業デモには逆に便利。

### 5.3 「これは試作品です」明示
Vercel デフォルトドメイン(`*.vercel.app`)は試作品感が出やすい。本番ドメイン取得は Phase 1 着手後で良い。

### 5.4 PoC 自治体への共有方法
- メールでログイン URL + テスト用 Magic Link 不要の説明を送る
- (Phase 1 着手後は実 Auth を入れる)

## 6. Phase 1 着手時の移行(2026-07)

| 項目 | 現状(Hobby) | Phase 1(Pro) |
|---|---|---|
| プラン | Hobby ¥0 | Pro $20/seat = ¥3,000 |
| 商用利用 | グレー(個人扱い) | ✅ 規約適合 |
| Function Region | `hnd1` 指定済 | 継続 |
| DB | SQLite 揮発 | Supabase Pro Tokyo に切替 |
| AI | mock | Bedrock Tokyo に切替 |
| 認証 | なし(モック) | Supabase Auth + Magic Link |
| メール | なし | AWS SES Tokyo |
| ドメイン | `*.vercel.app` | `kyoryokutai.example.jp`(ムームー .jp) |
| Custom Domain | 任意 | 必須 |

**移行手順:**
1. Vercel Pro にアップグレード
2. Environment Variables を `.env.production`(docs/24 §8)に置換
3. Custom Domain 追加 + Cloudflare DNS 設定
4. デプロイ → ADR-018 のスタックが稼働開始

## 7. 既存 GitHub Pages 公開の停止確認

- [x] `.github/workflows/deploy.yml` 削除(本コミット)
- [ ] GitHub Settings → Pages → Source = None に設定(手動)
- [ ] 既存の `https://masa-dev-2000.github.io/kyoryokutai_support/` への参照を README 等から削除

## 8. トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| ビルド失敗:`node:sqlite` not found | Node.js Version が 22 未満 | Vercel Project Settings → Node.js Version = 22.x |
| `/api/health` で 500 | 環境変数未設定 | `AI_PROVIDER=mock` を追加 |
| ページが 404 | `BUILD_STATIC` を間違えて設定 | Vercel env から `BUILD_STATIC` を削除 |
| basePath で URL が `/kyoryokutai_support/` 付き | `PAGES_BASE_PATH` が残っている | Vercel env から削除 |
| SQLite データが消える | Serverless の揮発仕様(正常) | 仕様。永続化は Phase 1 で Supabase に切替 |

---

**作成日:** 2026-06-14
**関連:** ADR-016 / ADR-017 / ADR-018 / docs/24
