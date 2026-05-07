ALTER TABLE usuarios ADD COLUMN refresh_token CHAR(60) NULL COMMENT 'Bcrypt Hashed Refresh Token' AFTER token_expires;
