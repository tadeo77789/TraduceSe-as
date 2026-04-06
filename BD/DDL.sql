CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    theme BOOLEAN,
    language VARCHAR(50),
    terms_accepted BOOLEAN,
    terms_accepted_at TIMESTAMP
);

CREATE TABLE user_role (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE user_auth (
    auth_id SERIAL PRIMARY KEY,
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    email VARCHAR(150),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE translation (
    translation_id SERIAL PRIMARY KEY,
    input_text VARCHAR(255),
    translated_text VARCHAR(255),
    translation_date TIMESTAMP,
    is_deleted BOOLEAN,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE alarm (
    alarm_id SERIAL PRIMARY KEY,
    time TIME,
    message VARCHAR(255),
    is_active BOOLEAN,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE usage_event (
    event_id SERIAL PRIMARY KEY,
    section VARCHAR(255),
    action VARCHAR(255),
    created_at TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE user_session (
    session_id SERIAL PRIMARY KEY,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE password_reset_token (
    token_id SERIAL PRIMARY KEY,
    token_hash VARCHAR(255),
    expires_at TIMESTAMP,
    used_at TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE multimedia_resource (
    resource_id SERIAL PRIMARY KEY,
    type VARCHAR(50),
    url VARCHAR(255),
    mime_type VARCHAR(50),
    display_order INT
);

CREATE TABLE sign_lexicon (
    lexicon_id SERIAL PRIMARY KEY,
    word VARCHAR(100),
    type VARCHAR(50),
    letter CHAR(1),
    language VARCHAR(10)
);