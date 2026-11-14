-- Test File: 03_constraints_businesses_creators.sql
-- Description: Tests for businesses and creators constraints

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_u_biz INT;
  v_u_cr INT;
  v_loc_id INT;
  v_loc_dummy INT;
  v_biz_id INT;
  v_cr_id INT;
BEGIN
  -- Setup test users and dummy location
  INSERT INTO users (email, password_hash, role) VALUES ('biz_owner@test.com', 'hash', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('creator_user@test.com', 'hash', 'creator') RETURNING user_id INTO v_u_cr;
  SELECT location_id INTO v_loc_id FROM locations LIMIT 1;
  INSERT INTO locations (area_name, taluka, district) VALUES ('DeleteMeLoc', 'Pernem', 'North Goa') RETURNING location_id INTO v_loc_dummy;

  -- Insert valid business and creator
  INSERT INTO businesses (user_id, location_id, business_name)
  VALUES (v_u_biz, v_loc_dummy, 'Test Cafe') RETURNING business_id INTO v_biz_id;

  INSERT INTO creators (user_id, location_id, full_name, min_paid_rate)
  VALUES (v_u_cr, v_loc_dummy, 'Test Creator', 1500) RETURNING creator_id INTO v_cr_id;

  -- 1. Negative: businesses.user_id UNIQUE
  BEGIN
    INSERT INTO businesses (user_id, location_id, business_name)
    VALUES (v_u_biz, v_loc_id, 'Duplicate Business For User');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_businesses_user_id', 'FAIL', 'Duplicate business for same user was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_businesses_user_id', 'PASS', 'Rejected duplicate business for same user');
  END;

  -- 2. Negative: creators.user_id UNIQUE
  BEGIN
    INSERT INTO creators (user_id, location_id, full_name)
    VALUES (v_u_cr, v_loc_id, 'Duplicate Creator Profile');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creators_user_id', 'FAIL', 'Duplicate creator for same user was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creators_user_id', 'PASS', 'Rejected duplicate creator for same user');
  END;

  -- 3. Negative: businesses.location_id FK ON DELETE RESTRICT
  BEGIN
    DELETE FROM locations WHERE location_id = v_loc_dummy;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fk_businesses_location ON DELETE RESTRICT', 'FAIL', 'Referenced location was deleted despite RESTRICT');
  EXCEPTION WHEN foreign_key_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fk_businesses_location ON DELETE RESTRICT', 'PASS', 'Deletion blocked by FK RESTRICT');
  END;

  -- 4. Negative: creators.min_paid_rate >= 0
  BEGIN
    UPDATE creators SET min_paid_rate = -100 WHERE creator_id = v_cr_id;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creators_min_paid_rate', 'FAIL', 'Negative min_paid_rate was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_creators_min_paid_rate', 'PASS', 'Rejected negative min_paid_rate');
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
  DELETE FROM locations WHERE location_id = v_loc_dummy;
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

