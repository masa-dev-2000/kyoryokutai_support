# v4 データモデル v1 ─ PoC 用 DB スキーマ設計

**確定日**: 2026-06-10
**根拠**: docs/15(v4 要件書)
**目的**: Supabase Postgres + pgvector 上で v4 PoC を動かすための最小スキーマを定義する。
**設計方針**: 「1 入力 → N 出力」を素直にテーブル化、RAG は pgvector で同居、RLS で権限分離。

---

## 🗺 エンティティ全体図(ER)

```
Organization ─┬─ Member ─── Record ─── Artifact ── (kind: 月報/議会/県/経費/etc)
              │             │
              │             └─ Question ── Advice (3 視点 + 引用)
              │
              ├─ Manager ── 担当関係(many-to-many)
              ├─ Rule(ガードレール)
              ├─ MentorProfile(AI 人格設定)
              └─ ExternalSource ─── Embedding(pgvector)
                                  ─ Record(匿名化)も Embedding に乗る

AuditLog: 操作履歴(KPI 計測の原データ)
```

---

## 📋 テーブル定義

### 1. organization ─ 自治体 / NPO / 企業

```sql
create table organization (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null check (type in ('municipality','npo','company','other')),
  prefecture      text,           -- 兵庫県 等
  settings        jsonb not null default '{}',  -- 自治体個別設定(ガードレール初期値、人格設定)
  created_at      timestamptz not null default now()
);
```

**Plan B 汎用化のフック**: `type` で業界を切り替え、`settings` で業界固有のルール集を差し込み。

---

### 2. member ─ 隊員 / 従業員

```sql
create table member (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  auth_user_id    uuid unique references auth.users(id),  -- Supabase Auth と紐付け
  name            text not null,
  role            text,                  -- 「移住促進担当」等
  term_start      date,
  term_end        date,
  profile         jsonb not null default '{}',  -- 興味分野・経歴(レコメンド用)
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index on member(org_id);
```

---

### 3. manager ─ 役場担当者 / 管理職

```sql
create table manager (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  auth_user_id    uuid unique references auth.users(id),
  name            text not null,
  role            text,                  -- 「企画課室長」等
  created_at      timestamptz not null default now()
);
create index on manager(org_id);

-- 担当関係(many-to-many)
create table manager_member (
  manager_id      uuid not null references manager(id),
  member_id       uuid not null references member(id),
  primary key (manager_id, member_id)
);
```

---

### 4. record ─ 1 入力(隊員のすべての行動記録)

```sql
create table record (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references member(id),
  kind            text not null check (kind in ('voice','text','photo','receipt')),
  raw_text        text,                  -- 音声→文字起こし or テキスト直入力 or OCR
  audio_url       text,                  -- Supabase Storage パス
  photo_urls      text[] not null default '{}',
  occurred_at     timestamptz not null,  -- 出来事の発生時刻(投稿時刻ではない)
  created_at      timestamptz not null default now(),
  -- AI 整形後の構造化情報(自動付与)
  ai_tags         text[] not null default '{}',
  ai_summary      text,
  ai_project_label text                  -- 自動で括られたプロジェクト名
);
create index on record(member_id, occurred_at desc);
create index on record using gin(ai_tags);
```

**設計判断**: `Project` テーブルは作らない。AI が `ai_project_label` で動的に括る(docs/15 の引き算原則)。

---

### 5. artifact ─ N 出力(AI が record から派生させる成果物)

```sql
create table artifact (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  member_id       uuid references member(id),  -- 隊員 1 人に紐付くもの(月報・経費等)
  source_record_ids uuid[] not null default '{}',
  kind            text not null check (kind in (
                    'daily_log',
                    'monthly_report',
                    'gikai_report',           -- 議会報告書
                    'pref_report',            -- 県報告書
                    'kuni_report',            -- 国(総務省)報告書
                    'expense_request',        -- 経費申請
                    'public_announcement',    -- 住民広報
                    'guardrail_check',        -- ガードレール判定材料
                    'announcement_readback'   -- お知らせ既読集計
                  )),
  body            text not null,
  body_format     text not null default 'markdown' check (body_format in ('markdown','docx','json')),
  audience        text not null check (audience in (
                    'self','manager','gikai','pref','kuni','public'
                  )),
  status          text not null default 'draft' check (status in (
                    'draft','pending_approval','approved','rejected','sent'
                  )),
  approver_id     uuid references manager(id),
  approved_at     timestamptz,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);
create index on artifact(org_id, kind, status);
create index on artifact(member_id, kind);
```

**1 → N**:1 record から複数 artifact(日報・月報入力・タグ等)が派生する。`source_record_ids` で逆引き可能。

---

### 6. rule ─ ガードレール(自治体固有のルール)

```sql
create table rule (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  title           text not null,
  body            text not null,
  category        text not null check (category in (
                    'expense','activity','communication','privacy','other'
                  )),
  severity        text not null default 'warn' check (severity in ('info','warn','stop')),
  source_url      text,                  -- JOIN・自治体公式等のソース URL
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index on rule(org_id, category) where active;
```

---

### 7. question + advice ─ 隊員の問いと AI の 3 視点回答

```sql
create table question (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references member(id),
  body            text not null,                       -- 「○○やっていい?」「今月どう?」
  context_record_ids uuid[] not null default '{}',     -- 関連する記録
  created_at      timestamptz not null default now()
);

create table advice (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references question(id),
  perspective     text not null check (perspective in (
                    'municipality','community','member','mentor','small_start'
                  )),
  body            text not null,
  citations       jsonb not null default '[]',     -- [{source_id, excerpt, url}]
  -- B-4: 役場側 UI からは見えないものを区別
  visibility      text not null default 'all' check (visibility in (
                    'all',           -- 全員見える
                    'member_only'    -- 隊員のみ(役場批判系)
                  )),
  created_at      timestamptz not null default now()
);
create index on advice(question_id);
```

**3 視点 + 段階提案**:1 つの `question` に対し複数の `advice` 行(perspective 別)が並ぶ。

---

### 8. mentor_profile ─ AI メンター人格設定

```sql
create table mentor_profile (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  member_id       uuid references member(id),  -- null = org 共通、値あり = 隊員個別
  name            text not null default 'AI メンター',
  tone            text not null default 'polite' check (tone in (
                    'polite','friendly','elder_sibling','professional'
                  )),
  persona         text,                  -- 「明石市出身、移住促進歴 5 年の OB を模した」等
  system_prompt   text,                  -- カスタム system prompt(空なら自動生成)
  created_at      timestamptz not null default now()
);
create unique index on mentor_profile(org_id, coalesce(member_id::text, ''));
```

---

### 9. external_source + document ─ RAG のソース管理

```sql
create table external_source (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null check (kind in (
                    'join','soumusho','municipality_site','blog','note',
                    'gikai_minutes','internal'
                  )),
  url             text,
  title           text not null,
  fetched_at      timestamptz,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create table document (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references external_source(id),
  chunk_idx       int not null,
  body            text not null,
  metadata        jsonb not null default '{}',  -- {prefecture, anon_member_id, date}
  embedding       vector(1536),  -- pgvector(Claude embeddings or OpenAI ada)
  created_at      timestamptz not null default now()
);
create index on document using ivfflat(embedding vector_cosine_ops) with (lists = 100);
create index on document(source_id, chunk_idx);
```

**設計判断**: 自社蓄積データ(record)も**匿名化したコピーを `external_source(kind='internal')` → `document` に流す**。RAG クエリ時はすべて document 上で完結。

---

### 10. audit_log ─ KPI 計測の原データ

```sql
create table audit_log (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organization(id),
  actor_kind      text not null check (actor_kind in ('member','manager','ai','system')),
  actor_id        uuid,
  action          text not null,         -- 'record.create','artifact.approve','question.ask' 等
  target_kind     text,
  target_id       uuid,
  duration_ms     int,                   -- 操作時間(KPI 用)
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);
create index on audit_log(org_id, action, created_at desc);
```

**KPI 計測の出処**:
- D-1 役場介入時間 → `actor_kind='manager'` の `duration_ms` 合計
- D-2 隊員活動量 → `action='record.create'` の count
- AI 自動処理率 → `actor_kind='ai'` / 全 action

---

## 🔐 RLS(Row-Level Security)ポリシー

Supabase 標準の `auth.uid()` を全テーブルに適用。

### member テーブル

```sql
alter table member enable row level security;

create policy "member can read own row"
  on member for select
  using (auth_user_id = auth.uid());

create policy "manager can read assigned members"
  on member for select
  using (
    exists (
      select 1 from manager m
      join manager_member mm on mm.manager_id = m.id
      where m.auth_user_id = auth.uid() and mm.member_id = member.id
    )
  );
```

### record テーブル(豊岡 kintone 弱点の逆張り)

```sql
alter table record enable row level security;

create policy "member sees own records only"
  on record for select
  using (
    exists (select 1 from member where member.id = record.member_id and member.auth_user_id = auth.uid())
  );

create policy "manager sees assigned members records"
  on record for select
  using (
    exists (
      select 1 from manager m
      join manager_member mm on mm.manager_id = m.id
      where m.auth_user_id = auth.uid() and mm.member_id = record.member_id
    )
  );
```

### advice テーブル(B-4 の核)

```sql
alter table advice enable row level security;

-- 隊員: 自分の質問への advice なら visibility 問わず見える
create policy "member sees own advice"
  on advice for select
  using (
    exists (
      select 1 from question q
      join member m on m.id = q.member_id
      where q.id = advice.question_id and m.auth_user_id = auth.uid()
    )
  );

-- 役場: 担当隊員の advice のうち visibility='all' のみ見える
create policy "manager sees only public advice of assigned members"
  on advice for select
  using (
    advice.visibility = 'all'
    and exists (
      select 1 from question q
      join member_member mm on mm.member_id = q.member_id
      join manager m on m.id = mm.manager_id
      where q.id = advice.question_id and m.auth_user_id = auth.uid()
    )
  );
```

→ **B-4「役場には嫌な助言」は visibility='member_only' で隊員側 UI のみ表示**(politically safe)。

---

## 🧪 サンプルクエリ

### 隊員の記録から月報を生成するワークフロー

```sql
-- 1. 当月の record を取得
select * from record
where member_id = $1
  and occurred_at between date_trunc('month', $2::date) and (date_trunc('month', $2::date) + interval '1 month' - interval '1 second')
order by occurred_at;

-- 2. AI に渡して artifact を作成
insert into artifact (org_id, member_id, source_record_ids, kind, body, audience, status)
values ($org_id, $member_id, $record_ids, 'monthly_report', $ai_generated_body, 'manager', 'pending_approval');

-- 3. 役場が承認
update artifact set status='approved', approver_id=$manager_id, approved_at=now() where id = $artifact_id;
```

### RAG 検索(類似事例)

```sql
select d.body, es.title, es.url, 1 - (d.embedding <=> $query_embedding) as similarity
from document d
join external_source es on es.id = d.source_id
order by d.embedding <=> $query_embedding
limit 5;
```

---

## ⚙️ Migration 方針

PoC では Supabase Migrations(`supabase/migrations/*.sql`)を使う。

```
supabase/migrations/
  20260701000000_init.sql            -- 基本テーブル
  20260701000100_rls_policies.sql    -- RLS
  20260701000200_seed_external.sql   -- JOIN・総務省データ初期投入
```

---

## 🚨 残論点

| # | 論点 | 仮の方針 |
|---|---|---|
| 1 | record の更新・削除を許すか | 更新は metadata のみ、本文は append-only(履歴性) |
| 2 | artifact の version 管理 | PoC では status のみ、本格運用で `version` column 追加 |
| 3 | 匿名化処理は同期/非同期? | 非同期(record 投稿後にバックグラウンドジョブで匿名化 → document 挿入) |
| 4 | embedding 次元(1536 固定?)| Claude embeddings の dim に合わせる、変更時は migration |
| 5 | mentor_profile の階層(org / member 個別) | unique 制約で「org-共通」と「member-個別」を表現、上書き優先 |
| 6 | audit_log の保持期間 | 1 年でアーカイブ、KPI 集計は月次 materialized view |

---

## 📐 関連ドキュメント

- `docs/15_v4_requirements.md` ─ 要件
- `docs/16_v4_data_model.md` ─ **本書**
- `docs/17_v4_rag_design.md` ─ RAG アーキ(次に作成)
