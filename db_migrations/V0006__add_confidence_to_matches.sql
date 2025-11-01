ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  ADD COLUMN confidence_percent INTEGER DEFAULT 75 CHECK (confidence_percent >= 0 AND confidence_percent <= 100);