-- ============================================================
-- 006 Communication(docs/22 サブシステム F、ADR-013 お知らせ/ルール/Q&A)
-- ============================================================

create table announcements (
  id                   uuid primary key default gen_random_uuid(),
  municipality_id      uuid not null references municipalities(id) on delete cascade,
  host_organization_id uuid references host_organizations(id) on delete set null,
  sender_id            uuid references users(id) on delete set null,
  sender_name          text,
  kind                 text not null default 'info' check (kind in ('info','rule','qa')),
  is_pinned            boolean not null default false,
  title                text not null,
  body                 text not null,
  target_user_ids      uuid[] not null default '{}',
  target_count         integer not null default 0,
  sent_at              timestamptz not null default now(),
  created_at           timestamptz not null default now()
);
create index announcements_muni_kind_idx on announcements(municipality_id, kind, is_pinned);
create index announcements_muni_sent_idx on announcements(municipality_id, sent_at desc);

create table announcement_reads (
  announcement_id uuid not null references announcements(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (announcement_id, user_id)
);
