-- ============================================================
-- 001 Identity & Tenant(docs/22 サブシステム A)
-- 本番 Postgres スキーマ。RLS は 009 で current_setting ベースで付与。
-- ============================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- 自治体 ----------------------------------------------------------
create table municipalities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  prefecture    text not null,
  annual_budget integer not null default 2000000,
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- 受入団体(ADR-012)---------------------------------------------
create table host_organizations (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name            text not null,
  kind            text,
  contact_user_id uuid,                         -- users(id) を後で参照(循環回避のため FK は付けない)
  created_at      timestamptz not null default now()
);
create index host_orgs_muni_idx on host_organizations(municipality_id);

-- 承認ルート定義(005 で steps を追加。users.approval_route_id が参照するため先に作る)
create table approval_routes (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name            text not null,
  kind            text not null,                -- 経費 | 月次報告 | 活動相談
  is_default      boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ユーザー(隊員 / 役場職員 / 受入団体職員 / 管理者)----------------
create table users (
  id                     uuid primary key default gen_random_uuid(),  -- 本番は auth.users.id と一致させる
  municipality_id        uuid not null references municipalities(id) on delete restrict,
  host_organization_id   uuid references host_organizations(id) on delete set null,
  organization_type      text not null default 'member'
                           check (organization_type in ('member','municipality','host_org')),
  role                   text not null check (role in ('member','manager','admin')),
  name                   text not null,
  email                  text unique,
  role_label             text,
  title                  text,
  department             text,
  term                   text,
  started_at             date,
  status                 text not null default 'active' check (status in ('active','retired','suspended')),
  approval_route_id      uuid references approval_routes(id) on delete set null,
  disclose_name_in_cases boolean not null default false,
  bio                    text,
  contact_form_enabled   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index users_muni_role_idx   on users(municipality_id, role);
create index users_muni_status_idx on users(municipality_id, status);
create index users_host_org_idx    on users(host_organization_id);

alter table host_organizations
  add constraint host_orgs_contact_fk
  foreign key (contact_user_id) references users(id) on delete set null;

-- 担当割当(職員 × 隊員)------------------------------------------
create table assignments (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  staff_id        uuid not null references users(id) on delete cascade,
  member_id       uuid not null references users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (staff_id, member_id)
);
create index assignments_member_idx on assignments(member_id);
