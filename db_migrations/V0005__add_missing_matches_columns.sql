ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  RENAME COLUMN time TO match_time;

ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  RENAME COLUMN date TO match_date;

ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  RENAME COLUMN price TO price_coins;

ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  ADD COLUMN prediction_text VARCHAR(255) DEFAULT '';

ALTER TABLE t_p97532815_telegram_mini_app_2.matches 
  ADD COLUMN is_active BOOLEAN DEFAULT true;

INSERT INTO t_p97532815_telegram_mini_app_2.matches 
(league, country, match_time, match_date, team1, team1_icon, team2, team2_icon, odds, price_coins, prediction_text, status) 
VALUES 
('Premier League', 'Англія', '19:00', '02.11.2025', 'Manchester United', '🔴', 'Liverpool', '🔵', 1.7, 5, 'Победа 1', 'upcoming');