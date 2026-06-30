-- #66: 契約・課金管理。契約情報は municipalities の専用カラムに保存する
-- (settings JSON は別セッションが別目的で追加中のため衝突回避)。
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS contract_plan text;
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS contract_status text;
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS contract_start text;
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS contract_end text;
