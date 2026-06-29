# セキュア開発環境

このプロジェクトでは、パスワード、API key、service role key、SMTP パスワードをリポジトリに置かない。
秘密情報は 1Password に集約し、実行時に `op run` で環境変数として注入する。

## 方針

- コミットしてよいのは `.env.example` と `.env.1password.example` だけ。
- `.env.1password.local` / `.env.1password.dev` / `.env.1password.prod` は作業者ローカル専用。
- `.env.local` は原則使わない。使う場合も一時ファイルとして扱い、実値をレビューに出さない。
- 最初の実装中は外部依存を絞る。基本は SQLite / mock AI / local storage / console email。
- 実接続は段階的に増やす。最初は Supabase だけを dev 環境で接続する。

## 初期セットアップ

1. 1Password CLI をインストールする。

Windows では winget が使える場合、以下で導入できる。

```powershell
winget install AgileBits.1Password.CLI
```

2. `op --version` で CLI が使えることを確認する。
3. `npm run op:doctor` で、このリポジトリの CLI 前提条件を確認する。
4. `op signin` または 1Password Desktop App 連携でサインインする。
5. 1Password に vault `kyoryokutai_support` を作る。
6. item を環境別に作る。
   - `local-env`
   - `dev-env`
   - `prod-env`
7. `.env.1password.example` をコピーして、必要な環境ファイルを作る。

```bash
cp .env.1password.example .env.1password.local
cp .env.1password.example .env.1password.dev
```

Windows PowerShell では以下でもよい。

```powershell
Copy-Item .env.1password.example .env.1password.local
Copy-Item .env.1password.example .env.1password.dev
```

## 実行コマンド

CLI 前提チェック:

```bash
npm run op:doctor
```

ローカル mock 環境:

```bash
npm run dev:op
```

Supabase dev 環境:

```bash
npm run dev:op:dev
```

型チェック:

```bash
npm run typecheck:op
```

ビルド:

```bash
npm run build:op
```

## 環境の分け方

### local

外部サービスなしで実装を進める環境。

```env
DB_PROVIDER=sqlite
AUTH_PROVIDER=none
AI_PROVIDER=mock
STORAGE_PROVIDER=local
EMAIL_PROVIDER=console
```

### dev

Supabase の DB/Auth だけ実接続する環境。

```env
DB_PROVIDER=supabase
AUTH_PROVIDER=supabase
AI_PROVIDER=mock
STORAGE_PROVIDER=local
EMAIL_PROVIDER=console
```

### prod

本番想定の接続先。ローカル実装中は原則使わない。

```env
DB_PROVIDER=supabase
AUTH_PROVIDER=supabase
AI_PROVIDER=bedrock
STORAGE_PROVIDER=r2
EMAIL_PROVIDER=smtp
```

## 1Password の secret reference 例

```env
NEXT_PUBLIC_SUPABASE_URL=op://kyoryokutai_support/dev-env/NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=op://kyoryokutai_support/dev-env/NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=op://kyoryokutai_support/dev-env/SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY=op://kyoryokutai_support/dev-env/ANTHROPIC_API_KEY
OPENAI_API_KEY=op://kyoryokutai_support/dev-env/OPENAI_API_KEY
SMTP_PASS=op://kyoryokutai_support/prod-env/SMTP_PASS
```

`NEXT_PUBLIC_*` はブラウザへ公開される値なので、secret ではないものだけを入れる。
`SUPABASE_SERVICE_ROLE_KEY`、`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`、`AWS_SECRET_ACCESS_KEY`、`SMTP_PASS` は必ずサーバ側だけで使う。

## AI プロバイダ(ADR-016)

`AI_PROVIDER`(平文・非 secret)で実装を選び、対応するトークンだけ 1Password に入れる。

| AI_PROVIDER | 必要トークン(1Password) | 任意設定(平文) |
|---|---|---|
| `anthropic` | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL`(既定 claude-sonnet-4-6) |
| `openai` | `OPENAI_API_KEY` | `OPENAI_MODEL`(既定 gpt-4o)/ `OPENAI_BASE_URL`(既定 OpenAI。OpenRouter 等に変更可) |
| `bedrock` | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | `AWS_REGION` / `BEDROCK_*_MODEL_ID` |
| `ollama` | 不要(ローカル LLM) | `OLLAMA_BASE_URL` / `OLLAMA_MODEL` |
| `mock` | 不要 | ─ |

`openai` は OpenAI Chat Completions 互換 API すべてに対応するため、`OPENAI_BASE_URL` を変えれば OpenRouter / Groq / Together / ローカル等のモデルをトークン1個で使い回せる。

### 機能(task)ごとのモデル設定

モデルは「全体」または「機能ごと」に指定できる(`src/lib/ai/model-config.ts`)。優先順位は **機能別 > 全体 > 既定**。既定はテスト用に安いモデル(OpenAI: `gpt-4o-mini`)。

- 全体: `OPENAI_MODEL=gpt-5`(プロバイダの全機能を切替)
- 機能別: `OPENAI_MODEL_<TASK>=...`(task のハイフンを `_` に)

| 機能(画面) | task | 機能別 env(OpenAI) |
|---|---|---|
| 任期ビジョン壁打ち | vision-coach | `OPENAI_MODEL_VISION_COACH` |
| 月次プラン生成 | cycle-plan-gen | `OPENAI_MODEL_CYCLE_PLAN_GEN` |
| プラン壁打ち調整 | cycle-adjust-suggest | `OPENAI_MODEL_CYCLE_ADJUST_SUGGEST` |
| 相談:活動メモ整理 | consult-daily-write | `OPENAI_MODEL_CONSULT_DAILY_WRITE` |
| 相談:来月計画 | consult-report-plan | `OPENAI_MODEL_CONSULT_REPORT_PLAN` |
| 相談:経費用途 | consult-expense-purpose | `OPENAI_MODEL_CONSULT_EXPENSE_PURPOSE` |
| 相談:事例検索 | consult-case-find | `OPENAI_MODEL_CONSULT_CASE_FIND` |
| メモ清書 | polish-memo | `OPENAI_MODEL_POLISH_MEMO` |
| 経費 判定材料 | expense-check | `OPENAI_MODEL_EXPENSE_CHECK` |
| 経費 タイトル生成 | expense-title | `OPENAI_MODEL_EXPENSE_TITLE` |
| 月次報告書生成(未配線) | monthly-report | `OPENAI_MODEL_MONTHLY_REPORT` |

同じ仕組みは Anthropic にも適用(`ANTHROPIC_MODEL` / `ANTHROPIC_MODEL_<TASK>`)。

## 事前チェック

実装開始前に確認する。

```bash
npm run op:doctor
npm run typecheck:op
```

秘密情報が混入していないか確認する。

```bash
git status --short
rg -n -P "^(?!#).*?(SUPABASE_SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY|SMTP_PASS|ANTHROPIC_API_KEY)=(?!$|op://|<|your-|.*\.\.\.).+" .
```

上記の検索で、実値が tracked file に出る場合はコミットしない。
`npm run op:doctor` は秘密情報を取得しない。CLI の有無、env ファイルの有無、既知の実値パターンだけをローカルで確認する。
