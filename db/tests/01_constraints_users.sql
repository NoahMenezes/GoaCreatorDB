-- Test File: 01_constraints_users.sql
-- Description: Tests for users table constraints and set_updated_at trigger

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_uid INT;
  v_old_updated TIMESTAMPTZ;
  v_new_updated TIMESTAMPTZ;
BEGIN
  -- 1. Positive: valid user insert
  BEGIN
    INSERT INTO users (email, password_hash, role)
    VALUES ('valid_user@test.com', 'hashed_pw', 'creator')
    RETURNING user_id, updated_at INTO v_uid, v_old_updated;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('users: valid insert', 'PASS', 'Inserted user successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('users: valid insert', 'FAIL', SQLERRM);
  END;

  -- 2. Negative: users.email citext UNIQUE (exact & case-insensitive)
  BEGIN
    INSERT INTO users (email, password_hash, role)
    VALUES ('VALID_USER@test.com', 'hashed_pw2', 'business');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_users_email (citext unique)', 'FAIL', 'Duplicate case-insensitive email was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_users_email (citext unique)', 'PASS', 'Rejected duplicate email (case-insensitive)');
  END;

  -- 3. Negative: users.role check constraint
  BEGIN
    INSERT INTO users (email, password_hash, role)
    VALUES ('invalid_role@test.com', 'hashed_pw', 'superadmin');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_users_role', 'FAIL', 'Invalid role superadmin was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_users_role', 'PASS', 'Rejected invalid role');
  END;

  -- 4. Positive: users.is_verified defaults to false
  BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE user_id = v_uid AND is_verified = false) THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('users.is_verified default false', 'PASS', 'Verified default false');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('users.is_verified default false', 'FAIL', 'is_verified did not default to false');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('users.is_verified default false', 'FAIL', SQLERRM);
  END;

  -- 5. Trigger: set_updated_at updates updated_at on UPDATE
  BEGIN
    PERFORM pg_sleep(0.01);
    UPDATE users SET role = 'business' WHERE user_id = v_uid RETURNING updated_at INTO v_new_updated;
    IF v_new_updated > v_old_updated THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('trg_users_set_updated_at', 'PASS', 'updated_at advanced automatically on update');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('trg_users_set_updated_at', 'FAIL', 'updated_at was not updated by trigger');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_users_set_updated_at', 'FAIL', SQLERRM);
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

