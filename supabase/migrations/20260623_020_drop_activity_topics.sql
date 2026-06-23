-- Issue #52: タグ管理テーブルを廃止し、activity_logs から DISTINCT で候補を取得する方式に変更
DROP TABLE IF EXISTS public.activity_topics;
