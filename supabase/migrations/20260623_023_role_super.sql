-- Issue #64: ロール体系を4階層に再編
-- super(開発者・サービス所有者) を追加。admin は自治体責任者に降格(概念整理のみ)。

-- 1) role CHECK 制約に 'super' を追加
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['member'::text, 'manager'::text, 'admin'::text, 'super'::text]));

-- 2) super は特定自治体に属さないため municipality_id を nullable に
ALTER TABLE public.users ALTER COLUMN municipality_id DROP NOT NULL;
