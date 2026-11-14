-- Test File: 04_constraints_creator_categories_social.sql
-- Description: Tests for creator_categories and social_accounts constraints

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_u1 INT;
  v_u2 INT;
  v_c1 INT;
  v_c2 INT;
  v_loc INT;
  v_cat1 INT;
  v_cat2 INT;
BEGIN
  -- Setup test data
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  SELECT category_id INTO v_cat1 FROM categories ORDER BY category_id LIMIT 1;
  SELECT category_id INTO v_cat2 FROM categories ORDER BY category_id OFFSET 1 LIMIT 1;

  INSERT INTO users (email, password_hash, role) VALUES ('soc_u1@test.com', 'h', 'creator') RETURNING user_id INTO v_u1;
  INSERT INTO users (email, password_hash, role) VALUES ('soc_u2@test.com', 'h', 'creator') RETURNING user_id INTO v_u2;

  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u1, v_loc, 'Social Creator 1') RETURNING creator_id INTO v_c1;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u2, v_loc, 'Social Creator 2') RETURNING creator_id INTO v_c2;

  -- 1. creator_categories primary insertion
  INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES (v_c1, v_cat1, true);

  -- 2. Negative: creator_categories PK duplicate
  BEGIN
    INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES (v_c1, v_cat1, false);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('pk_creator_categories', 'FAIL', 'Duplicate (creator_id, category_id) allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('pk_creator_categories', 'PASS', 'Rejected duplicate primary key pair');
  END;

  -- 3. Negative: creator_categories partial unique index: at most one is_primary row per creator
  BEGIN
    INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES (v_c1, v_cat2, true);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creator_categories_primary (one is_primary per creator)', 'FAIL', 'Multiple is_primary=true allowed for same creator');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_creator_categories_primary (one is_primary per creator)', 'PASS', 'Enforced at most one is_primary row per creator');
  END;

  -- 4. Social accounts initial setup
  INSERT INTO social_accounts (creator_id, platform, handle) VALUES (v_c1, 'instagram', 'goacreator_official');

  -- 5. Negative: social_accounts UNIQUE(platform, handle) across creators
  BEGIN
    INSERT INTO social_accounts (creator_id, platform, handle) VALUES (v_c2, 'instagram', 'goacreator_official');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_social_accounts_platform_handle', 'FAIL', 'Duplicate (platform, handle) across creators was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_social_accounts_platform_handle', 'PASS', 'Rejected duplicate platform and handle');
  END;

  -- 6. Negative: social_accounts UNIQUE(creator_id, platform)
  BEGIN
    INSERT INTO social_accounts (creator_id, platform, handle) VALUES (v_c1, 'instagram', 'another_handle');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_social_accounts_creator_platform', 'FAIL', 'Duplicate platform for same creator was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_social_accounts_creator_platform', 'PASS', 'Rejected duplicate platform for same creator');
  END;

  -- 7. Negative: social_accounts.platform check constraint
  BEGIN
    INSERT INTO social_accounts (creator_id, platform, handle) VALUES (v_c1, 'tiktok', 'tiktok_handle');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_social_accounts_platform', 'FAIL', 'Invalid platform tiktok was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_social_accounts_platform', 'PASS', 'Rejected invalid social platform');
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

