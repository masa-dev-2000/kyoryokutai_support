# 開発ガイド(載せ替えで後悔しないための規約)

> Phase 2(Year 2)で Supabase + Vercel → AWS(RDS + Cognito + App Runner)へ
> 計画的に載せ替える前提(ADR-018 / docs/24 §15)。
> その移行コストを最小化するため、Phase 1 のコードは以下の規約を **必ず守る**。

## 抽象化レイヤ(これ経由でしか外部サービスを触らない)

| 領域 | 抽象 | 実装 | 環境変数 |
|---|---|---|---|
| AI | `src/lib/ai` | ollama / bedrock / anthropic / mock | `AI_PROVIDER` |
| 認証 | `src/lib/auth` | none / supabase /(将来 cognito) | `AUTH_PROVIDER` |
| ストレージ | `src/lib/storage` | local / s3 / r2 / supabase | `STORAGE_PROVIDER` |
| メール | `src/lib/email` | console / smtp | `EMAIL_PROVIDER` |
| DB | `src/lib/db/repositories` | sqlite /(将来 supabase / rds) | `DB_PROVIDER` |

**API Route / Server Action からは、上記ファクトリ関数(`getXxxProvider()`)/ Repository
経由でのみ外部サービスを呼ぶ。** SDK を直接 import しない。

## 載せ替え 10 か条(docs/24 §15.6)

1. ✅ `AuthProvider` インタフェース経由で認証(SDK 直叩き禁止)
2. ⏳ Repository パターンで DB アクセス(`createClient(supabase)` を Route で直接呼ばない)
3. ✅ RLS は `current_setting('app.current_user_id')` ベース(`auth.uid()` 直接参照を避ける)
4. ✅ ストレージは S3 互換 API(`src/lib/storage`)
5. ✅ メールは `src/lib/email`(nodemailer SMTP)
6. ✅ **Supabase 固有機能を使わない**(下記)
7. ✅ Postgres 標準 SQL のみ(`supabase/migrations/`、拡張は `pgcrypto` / `vector` のみ)
8. ✅ `output: "standalone"` + Dockerfile を維持
9. ✅ DNS は Cloudflare、移行前は TTL 60 秒
10. ✅ env 変数は Vercel / AWS Secrets Manager 両対応のフォーマット

## 使ってはいけない Supabase 固有機能(#6)

以下を使うと Phase 2 の載せ替えで大幅な書き直しが発生するため **禁止**:

- ❌ Supabase Edge Functions(代わりに Next Route Handler)
- ❌ Supabase Realtime / `supabase.channel()`(代わりにポーリング or 将来 SSE)
- ❌ Supabase Database Webhooks(代わりに Route Handler 内で処理)
- ❌ `pg_net` / `pg_cron` 等の Supabase 拡張(代わりにアプリ層 or Vercel Cron)
- ❌ Supabase Auth の RLS 専用関数 `auth.uid()` の **直接参照**(`current_setting` 経由にする)

Supabase の Postgres / Auth(Magic Link)/ Storage(S3 互換)は **抽象レイヤ経由でなら使ってよい**。

## ローカル開発

```bash
npm install
cp .env.example .env.local   # AI_PROVIDER=mock で外部依存ゼロ
npm run dev
```

既定の開発スタック(外部依存なし):
- AI = `mock` / Auth = `none` / Storage = `local` / Email = `console` / DB = SQLite(`node:sqlite`)

## 本番スタック(Phase 1、ADR-018)

```bash
AI_PROVIDER=bedrock
AUTH_PROVIDER=supabase
STORAGE_PROVIDER=r2
EMAIL_PROVIDER=smtp
# DB は Supabase Postgres(supabase/migrations を適用)
```

## チェック

```bash
npm run typecheck   # tsc --noEmit
npm run build       # standalone ビルド
```

PR を出す前に上記 2 つが通ることを確認。
