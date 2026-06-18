-- daily_logs に移動距離・経費合計・手応えを追加
-- activity_logs からこれらのフィールドを削除（日報レベルの情報として統合）

ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS distance_km numeric,
  ADD COLUMN IF NOT EXISTS expense_amount integer,
  ADD COLUMN IF NOT EXISTS feeling_score smallint
    CHECK (feeling_score IS NULL OR feeling_score BETWEEN 1 AND 4);

COMMENT ON COLUMN public.daily_logs.distance_km IS '日報レベルの移動距離(km)';
COMMENT ON COLUMN public.daily_logs.expense_amount IS '日報レベルの経費合計キャッシュ';
COMMENT ON COLUMN public.daily_logs.feeling_score IS '今日の手応え 1=😴つかれた 2=🙂まあまあ 3=😊いい感じ 4=🔥充実';

ALTER TABLE public.activity_logs
  DROP COLUMN IF EXISTS distance_km,
  DROP COLUMN IF EXISTS expense_amount,
  DROP COLUMN IF EXISTS feeling_score,
  DROP COLUMN IF EXISTS contact_count;
