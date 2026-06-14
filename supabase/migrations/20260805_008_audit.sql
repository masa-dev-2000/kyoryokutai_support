-- ============================================================
-- 008 Audit(docs/22 サブシステム I)+ updated_at 自動更新
-- ============================================================

create table audit_logs (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid references municipalities(id) on delete set null,
  actor_id        uuid references users(id) on delete set null,
  action          text not null,                -- approve | reject | settle | member.retire | publish_case | export ...
  target_table    text,
  target_id       uuid,
  diff            jsonb,
  ip_hash         text,
  user_agent      text,
  created_at      timestamptz not null default now()
);
create index audit_muni_created_idx on audit_logs(municipality_id, created_at desc);
create index audit_target_idx       on audit_logs(target_table, target_id);

-- updated_at 自動更新 -------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at           before update on users           for each row execute function set_updated_at();
create trigger projects_set_updated_at        before update on projects        for each row execute function set_updated_at();
create trigger activity_logs_set_updated_at   before update on activity_logs   for each row execute function set_updated_at();
create trigger monthly_reports_set_updated_at before update on monthly_reports for each row execute function set_updated_at();
create trigger expenses_set_updated_at        before update on expenses        for each row execute function set_updated_at();
