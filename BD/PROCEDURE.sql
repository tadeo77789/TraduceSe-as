CREATE OR REPLACE PROCEDURE create_user_with_role(
    p_name VARCHAR,
    p_age INT,
    p_email VARCHAR,
    p_password VARCHAR,
    p_role_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id INT;
BEGIN
    -- Insertar usuario
    INSERT INTO users (name, age, email, password, theme, language, terms_accepted, terms_accepted_at)
    VALUES (p_name, p_age, p_email, p_password, true, 'en', true, NOW())
    RETURNING user_id INTO new_user_id;

    -- Asignar rol
    INSERT INTO user_role (user_id, role_id)
    VALUES (new_user_id, p_role_id);
END;
$$;


CALL create_user_with_role('Carlos', 25, 'carlos@email.com', '1234', 1);
