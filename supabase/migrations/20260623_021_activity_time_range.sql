-- Issue #59: 活動記録の時間入力を「何時〜何時」形式に変更
-- start_time / end_time（HH:MM）を追加。hours は両者から自動計算して保存（後方互換のため残す）
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS start_time text;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS end_time text;
