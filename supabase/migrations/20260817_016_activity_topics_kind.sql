-- #48: 活動の種類(type)もユーザーごとにカスタム追加できるよう kind を追加
ALTER TABLE public.activity_topics ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'topic';

ALTER TABLE public.activity_topics DROP CONSTRAINT IF EXISTS activity_topics_user_id_name_key;
DROP INDEX IF EXISTS activity_topics_user_id_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS activity_topics_user_kind_name_key
  ON public.activity_topics (user_id, kind, name);
