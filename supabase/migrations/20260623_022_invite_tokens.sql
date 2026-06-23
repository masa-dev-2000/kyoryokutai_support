-- Issue #63: 招待フロー用トークンテーブル
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  token         text primary key,
  email         text,
  role          text not null default 'member',
  municipality_name text not null default '',
  created_by    uuid references public.users(id) on delete set null,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens ON public.invite_tokens(token, used_at);
