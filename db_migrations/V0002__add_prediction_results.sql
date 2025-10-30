ALTER TABLE t_p97532815_telegram_mini_app_2.predictions
ADD COLUMN result VARCHAR(100),
ADD COLUMN win_amount DECIMAL(10, 2),
ADD COLUMN match_data JSONB;