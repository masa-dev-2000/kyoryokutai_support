-- #56 活動記録のデータ項目設計
-- 「今日の手応え」(絵文字スケール 1〜4)と「接触人数」を activity_logs に追加する。
-- どちらも任意項目(nullable)。手応えは評価ではなくコンディションの自己申告。

ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS feeling_score smallint
    CHECK (feeling_score IS NULL OR feeling_score BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS contact_count integer
    CHECK (contact_count IS NULL OR contact_count >= 0);

COMMENT ON COLUMN public.activity_logs.feeling_score IS '#56 今日の手応え 1=😴つかれた 2=🙂まあまあ 3=😊いい感じ 4=🔥充実';
COMMENT ON COLUMN public.activity_logs.contact_count IS '#56 この活動で接した人数(住民・関係者など、任意)';
