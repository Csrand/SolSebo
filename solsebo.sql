CREATE TABLE usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash CHAR(60) NOT NULL COMMENT 'Bcrypt Hash length',
    status_validacao BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'False=PENDING, True=ACTIVE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    recovery_token CHAR(60) NULL COMMENT 'Bcrypt Hashed Token',
    token_expires DATETIME NULL COMMENT 'Data/Hora de expiração do token',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
