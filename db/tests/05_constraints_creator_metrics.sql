-- Test File: 05_constraints_creator_metrics.sql
-- Description: Tests for creator_metrics constraints and admin-verified trigger

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_u_admin INT;
  v_u_creator INT;
  v_cr INT;
  v_acc INT;
  v_loc INT;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  INSERT INTO users (email, password_hash, role) VALUES ('admin_verifier@test.com', 'h', 'admin') RETURNING user_id INTO v_u_admin;
  INSERT INTO users (email, password_hash, role) VALUES ('creator_metrics@test.com', 'h', 'creator') RETURNING user_id INTO v_u_creator;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_creator, v_loc, 'Metric Creator') RETURNING creator_id INTO v_cr;
  INSERT INTO social_accounts (creator_id, platform, handle) VALUES (v_cr, 'instagram', 'metrics_insta') RETURNING account_id INTO v_acc;

  -- 1. Negative: counts >= 0
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, data_source)
    VALUES (v_acc, -50, 'self_reported');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_counts', 'FAIL', 'Negative follower count was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_counts', 'PASS', 'Rejected negative follower count');
  END;

  -- 2. Negative: engagement_rate between 0 and 100
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, engagement_rate, data_source)
    VALUES (v_acc, 1000, 150.0, 'self_reported');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_rates (engagement_rate > 100)', 'FAIL', 'engagement_rate > 100 was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_rates (engagement_rate > 100)', 'PASS', 'Rejected engagement_rate > 100');
  END;

  -- 3. Negative: audience_goa_pct between 0 and 100
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, audience_goa_pct, data_source)
    VALUES (v_acc, 1000, -10.0, 'self_reported');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_rates (audience_goa_pct < 0)', 'FAIL', 'Negative audience_goa_pct was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_rates (audience_goa_pct < 0)', 'PASS', 'Rejected negative audience_goa_pct');
  END;

  -- 4. Negative: CHECK data_source = 'admin_verified' without verified_by
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, data_source, verified_by)
    VALUES (v_acc, 1000, 'admin_verified', NULL);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_verified_source (admin_verified with null verified_by)', 'FAIL', 'Allowed admin_verified without verified_by');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_verified_source (admin_verified with null verified_by)', 'PASS', 'Rejected admin_verified with null verified_by');
  END;

  -- 5. Negative: CHECK data_source = 'self_reported' with verified_by NOT NULL
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, data_source, verified_by)
    VALUES (v_acc, 1000, 'self_reported', v_u_admin);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_verified_source (self_reported with non-null verified_by)', 'FAIL', 'Allowed self_reported with verified_by');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creator_metrics_verified_source (self_reported with non-null verified_by)', 'PASS', 'Rejected self_reported with verified_by');
  END;

  -- 6. Negative: Trigger: creator_metrics.verified_by must reference a user with role admin
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, data_source, verified_by)
    VALUES (v_acc, 1000, 'admin_verified', v_u_creator); -- user has role creator, not admin

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_creator_metrics_admin_check', 'FAIL', 'Non-admin user accepted as verified_by');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_creator_metrics_admin_check', 'PASS', 'Rejected non-admin user as verified_by: ' || SQLERRM);
  END;

  -- Valid admin verified insertion for uniqueness test & FK restrict test
  INSERT INTO creator_metrics (account_id, follower_count, data_source, verified_by, recorded_at)
  VALUES (v_acc, 5000, 'admin_verified', v_u_admin, v_now);

  -- 7. Negative: UNIQUE(account_id, recorded_at)
  BEGIN
    INSERT INTO creator_metrics (account_id, follower_count, data_source, verified_by, recorded_at)
    VALUES (v_acc, 6000, 'admin_verified', v_u_admin, v_now);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creator_metrics_account_recorded', 'FAIL', 'Duplicate (account_id, recorded_at) was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creator_metrics_account_recorded', 'PASS', 'Rejected duplicate account snapshot timestamp');
  END;

  -- 8. Negative: verified_by FK ON DELETE RESTRICT
  BEGIN
    DELETE FROM users WHERE user_id = v_u_admin;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fk_creator_metrics_verified_by ON DELETE RESTRICT', 'FAIL', 'Verifier user was deleted despite RESTRICT');
  EXCEPTION WHEN foreign_key_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fk_creator_metrics_verified_by ON DELETE RESTRICT', 'PASS', 'Blocked deletion of verifier user via FK RESTRICT');
  END;

  -- Cleanup
  DELETE FROM creator_metrics WHERE account_id = v_acc;
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;
