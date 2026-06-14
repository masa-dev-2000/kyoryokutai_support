-- ============================================================
-- 005 Workflow & Approval(docs/22 サブシステム E、ADR-012/015 多段階承認)
-- approval_routes は 001 で作成済(users.approval_route_id が参照するため)
-- ============================================================

create table approval_route_steps (
  id                   uuid primary key default gen_random_uuid(),
  route_id             uuid not null references approval_routes(id) on delete cascade,
  step_no              integer not null,
  approver_type        text not null check (approver_type in ('dept','host_org','admin')),
  approver_label       text not null,
  approver_id          uuid references users(id) on delete set null,    -- 具体ユーザー固定(任意)
  host_organization_id uuid references host_organizations(id) on delete set null,
  department           text,
  created_at           timestamptz not null default now(),
  unique (route_id, step_no)
);

create table approvals (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  route_id        uuid references approval_routes(id) on delete set null,
  kind            text not null check (kind in ('経費','月次報告','活動相談')),
  applicant_id    uuid references users(id) on delete set null,
  approver_id     uuid references users(id) on delete set null,   -- 現ステップの決裁者
  member_name     text not null,
  title           text not null,
  ai              text,
  citations       jsonb,
  detail          jsonb,
  route_name      text not null default '',
  steps           jsonb not null default '[]'::jsonb,             -- ApprovalStep[]
  current_step    integer not null default 0,
  total_steps     integer not null default 1,
  status          text not null default 'pending'
                    check (status in ('pending','approved','rejected')),
  target_table    text,
  target_id       uuid,
  comment         text,                                          -- 差戻し理由(差戻し時必須)
  approved_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index approvals_muni_status_idx   on approvals(municipality_id, status);
create index approvals_applicant_idx     on approvals(applicant_id, status);
create index approvals_target_idx        on approvals(target_table, target_id);
