-- ============================================================
-- 007 AI Assist & Knowledge(docs/22 サブシステム G / H)
-- ============================================================

create extension if not exists vector;   -- pgvector(Supabase 標準で利用可)

-- AI 相談ログ -----------------------------------------------------
create table consultations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete set null,
  municipality_id uuid references municipalities(id) on delete cascade,
  context_kind    text not null,                -- daily-write | report-plan | expense-purpose | case-find
  context_payload jsonb,
  input_text      text,
  output_text     text,
  adopted         boolean not null default false,
  tokens_used     integer,
  created_at      timestamptz not null default now()
);
create index consultations_user_idx on consultations(user_id, created_at desc);

-- 全国事例(ADR-011 匿名化方針)------------------------------------
create table cases_public (
  id                    uuid primary key default gen_random_uuid(),
  source_project_id     uuid references projects(id) on delete set null,
  source_municipality_id uuid references municipalities(id) on delete set null,
  source_user_id        uuid references users(id) on delete set null,  -- opt-in 時のみ
  municipality_name     text not null,
  prefecture            text not null,
  disclose_author       boolean not null default false,
  author_label          text not null,
  year                  text not null,
  title                 text not null,
  summary               text not null,
  kpi                   text,
  effect                text,
  process               jsonb,                  -- [{phase, body}]
  learning              text,
  original_text         text,                   -- 匿名化前(同自治体のみ参照可)
  anonymized_at         timestamptz,
  anonymized_by_review  boolean not null default false,
  embedding             vector(1536),
  trend_count           integer,
  created_at            timestamptz not null default now()
);
create index cases_public_pref_idx on cases_public(prefecture, municipality_name);
-- 類似検索(HNSW)。pgvector 0.5+ 必須。
create index cases_public_embed_idx on cases_public using hnsw (embedding vector_cosine_ops);

-- projects.anonymized_case_id の FK を後付け(循環回避)
alter table projects
  add constraint projects_anonymized_case_fk
  foreign key (anonymized_case_id) references cases_public(id) on delete set null;

-- 自治体ガイドライン(経費判定 RAG の元データ)---------------------
create table guidelines (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  source          text not null,
  section         text not null,
  body            text not null,
  embedding       vector(1536),
  created_at      timestamptz not null default now()
);
create index guidelines_muni_idx on guidelines(municipality_id);
