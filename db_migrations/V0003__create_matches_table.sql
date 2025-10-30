CREATE TABLE t_p97532815_telegram_mini_app_2.matches (
  id SERIAL PRIMARY KEY,
  league VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL,
  match_time VARCHAR(10) NOT NULL,
  match_date VARCHAR(20) NOT NULL,
  team1 VARCHAR(100) NOT NULL,
  team1_icon VARCHAR(10) NOT NULL,
  team2 VARCHAR(100) NOT NULL,
  team2_icon VARCHAR(10) NOT NULL,
  odds DECIMAL(10, 2) NOT NULL,
  price_coins INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  prediction_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);