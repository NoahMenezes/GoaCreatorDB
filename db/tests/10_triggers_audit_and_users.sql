-- Test File: 10_triggers_audit_and_users.sql
-- Description: Tests for audit_log trigger on audited tables and actor user setting

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_actor_id INT;
  v_test_uid INT;
  v_log_insert audit_log;
  v_log_update audit_log;
BEGIN
  -- Create an actor user
  INSERT INTO users (email, password_hash, role) VALUES ('actor_admin@test.com', 'h', 'admin') RETURNING user_id INTO v_actor_id;

  -- Set app.user_id session setting
  PERFORM set_config('app.user_id', v_actor_id::TEXT, true);

  -- 1. Insert a user and verify audit_log
  INSERT INTO users (email, password_hash, role) VALUES ('audited_target@test.com', 'h', 'creator') RETURNING user_id INTO v_test_uid;

  SELECT * INTO v_log_insert
  FROM audit_log
  WHERE table_name = 'users' AND record_id = v_test_uid AND action = 'INSERT';

  IF v_log_insert.log_id IS NOT NULL AND v_log_insert.changed_by = v_actor_id AND v_log_insert.new_data->>'email' = 'audited_target@test.com' THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_audit_trigger: INSERT logging with actor', 'PASS', 'Captured INSERT in audit_log with correct changed_by and jsonb');
  ELSE
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_audit_trigger: INSERT logging with actor', 'FAIL', 'Failed to log INSERT correctly in audit_log');
  END IF;

  -- 2. Update user and verify audit_log captures OLD and NEW
  UPDATE users SET is_verified = true WHERE user_id = v_test_uid;

  SELECT * INTO v_log_update
  FROM audit_log
  WHERE table_name = 'users' AND record_id = v_test_uid AND action = 'UPDATE';

  IF v_log_update.log_id IS NOT NULL AND (v_log_update.old_data->>'is_verified')::boolean = false AND (v_log_update.new_data->>'is_verified')::boolean = true THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_audit_trigger: UPDATE logging old_data and new_data', 'PASS', 'Captured UPDATE with both old_data and new_data');
  ELSE
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_audit_trigger: UPDATE logging old_data and new_data', 'FAIL', 'Failed to log UPDATE correctly');
  END IF;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

