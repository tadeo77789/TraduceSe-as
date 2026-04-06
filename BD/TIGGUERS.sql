CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.terms_accepted_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

CREATE OR REPLACE FUNCTION validate_user_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.age < 18 THEN
        RAISE EXCEPTION 'User must be at least 18 years old';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_age
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION validate_user_age();


INSERT INTO users (name, age, email, password)
VALUES ('Test', 15, 'test@test.com', '123');

INSERT INTO users (name, age, email, password)
VALUES ('Nuevo', 20, 'nuevo@test.com', '123');

SELECT * FROM usage_event;
