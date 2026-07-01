-- #110: expenses の領収書キー列名をコード(receipt_key)に統一する。
-- 経緯: 本番 Postgres は 004_expenses で receipt_path を作成したが、
-- repo / sqlite / mapper / DTO はすべて receipt_key を読み書きしており、
-- 本番では receipt_key 列が無く経費作成(insert)が列不一致で失敗していた。
-- 既存の receipt_path をリネームして統一する(冪等)。
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'receipt_path'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'receipt_key'
  ) THEN
    ALTER TABLE public.expenses RENAME COLUMN receipt_path TO receipt_key;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'receipt_key'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN receipt_key text;
  END IF;
END $$;
