-- Test File: 12_functions_trust_score.sql
-- Description: Tests for fn_trust_score rule-based calculation

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
  v_cid INT;
  v_loc INT;
  v_cat INT;
  v_acc INT;
  v_score1 INT;
  v_score2 INT;
  v_score3 INT;
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  SELECT category_id INTO v_cat FROM categories LIMIT 1;

  -- 1. Incomplete creator profile
  INSERT INTO users (email, password_hash, role) VALUES ('score_tester@test.com', 'h', 'creator') RETURNING user_id INTO v_uid;
  INSERT INTO creators (user_id, location_id, full_name, bio) VALUES (v_uid, v_loc, 'Al', '') RETURNING creator_id INTO v_cid;

  v_score1 := fn_trust_score(v_uid);

  IF v_score1 >= 0 AND v_score1 <= 100 THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: basic range check', 'PASS', 'Trust score computed in range: ' || v_score1);
  ELSE
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: basic range check', 'FAIL', 'Score out of bounds: ' || v_score1);
  END IF;

  -- 2. Enhance profile completeness and add category
  UPDATE creators
  SET full_name = 'Alex Goa Explorer',
      bio = 'Passionate travel creator exploring Goan beaches, food and lifestyle experiences.'
  WHERE creator_id = v_cid;

  INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES (v_cid, v_cat, true);

  v_score2 := fn_trust_score(v_uid);

  IF v_score2 > v_score1 THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: completeness increases score', 'PASS', 'Score increased from ' || v_score1 || ' to ' || v_score2);
  ELSE
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: completeness increases score', 'FAIL', 'Score did not increase');
  END IF;

  -- 3. Add social account, plausible metrics, and verification
  INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
  VALUES (v_cid, 'instagram', 'alex_in_goa', 'https://instagram.com/alex_in_goa')
  RETURNING account_id INTO v_acc;

  INSERT INTO creator_metrics (account_id, follower_count, avg_likes, avg_views, engagement_rate, data_source)
  VALUES (v_acc, 8000, 450, 2000, 5.5, 'self_reported');

  UPDATE users SET is_verified = true WHERE user_id = v_uid;

  v_score3 := fn_trust_score(v_uid);

  IF v_score3 > v_score2 AND v_score3 <= 100 THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: social & metrics increase score', 'PASS', 'Score reached ' || v_score3 || '/100');
  ELSE
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_trust_score: social & metrics increase score', 'FAIL', 'Score expected to be higher: ' || v_score3);
  END IF;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

