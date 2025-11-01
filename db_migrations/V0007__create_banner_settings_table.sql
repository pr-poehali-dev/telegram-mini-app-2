CREATE TABLE t_p97532815_telegram_mini_app_2.banner_settings (
    id SERIAL PRIMARY KEY,
    banner_url VARCHAR(500) DEFAULT 'https://example.com',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p97532815_telegram_mini_app_2.banner_settings (banner_url, is_active) 
VALUES ('https://example.com', true);