INSERT INTO users (name, age, email, password, theme, language, terms_accepted, terms_accepted_at)
VALUES 
('Juan Perez', 20, 'juan@email.com', '1234', true, 'es', true, NOW()),
('Maria Lopez', 22, 'maria@email.com', 'abcd', false, 'en', true, NOW());

INSERT INTO role (name, description)
VALUES 
('admin', 'Administrator'),
('user', 'Regular user');

INSERT INTO user_role (user_id, role_id)
VALUES 
(1, 1),
(2, 2);

INSERT INTO user_auth (provider, provider_id, email, user_id)
VALUES 
('google', 'g123', 'juan@email.com', 1),
('facebook', 'f456', 'maria@email.com', 2);


INSERT INTO translation (input_text, translated_text, translation_date, is_deleted, user_id)
VALUES 
('hola', 'hello', NOW(), false, 1),
('gracias', 'thank you', NOW(), false, 2);

INSERT INTO usage_event (section, action, created_at, user_id)
VALUES 
('home', 'login', NOW(), 1),
('translator', 'translate', NOW(), 2);

INSERT INTO user_session (start_time, end_time, duration_seconds, user_id)
VALUES 
(NOW(), NOW(), 300, 1),
(NOW(), NOW(), 600, 2);

INSERT INTO password_reset_token (token_hash, expires_at, used_at, user_id)
VALUES 
('abc123', NOW() + INTERVAL '1 day', NULL, 1);

INSERT INTO multimedia_resource (type, url, mime_type, display_order)
VALUES 
('image', 'http://example.com/img.png', 'image/png', 1);

INSERT INTO sign_lexicon (word, type, letter, language)
VALUES 
('hola', 'saludo', 'H', 'es'),
('hello', 'greeting', 'H', 'en');


UPDATE users
SET name = 'Juan David Perez',
    terms_accepted_at = NOW()
WHERE user_id = 1;

UPDATE sign_lexicon
SET type = 'gratitude'
WHERE lexicon_id = 1;



DELETE FROM multimedia_resource
WHERE resource_id = 1;

DELETE FROM usage_event
WHERE user_id = 2;


SELECT * FROM translation
WHERE user_id = 1;

SELECT section, action, created_at
FROM usage_event
ORDER BY created_at DESC;

SELECT s.word, s.type, m.type AS resource_type, m.url
FROM sign_lexicon s
JOIN multimedia_resource m ON s.lexicon_id = m.resource_id