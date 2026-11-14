-- Test File: 09_triggers_reviews_and_metrics.sql
-- Description: Tests for review triggers (status completed requirement and party verification)

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
  v_u_third INT;
  v_biz INT;
  v_cr INT;
  v_loc INT;
  v_req INT;
  v_future_date DATE := CURRENT_DATE + INTERVAL '10 days';
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  INSERT INTO users (email, password_hash, role) VALUES ('biz_rev_party@test.com', 'h', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('cr_rev_party@test.com', 'h', 'creator') RETURNING user_id INTO v_u_cr;
  INSERT INTO users (email, password_hash, role) VALUES ('third_party@test.com', 'h', 'creator') RETURNING user_id INTO v_u_third;

  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_biz, v_loc, 'Rev Party Biz') RETURNING business_id INTO v_biz;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_cr, v_loc, 'Rev Party Creator') RETURNING creator_id INTO v_cr;

  -- Create pending request
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
  VALUES (v_biz, v_cr, 'paid', 1000, v_future_date) RETURNING request_id INTO v_req;

  -- 1. Negative: insert review on pending request
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 5, 'Early review');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: review on pending request', 'FAIL', 'Allowed review on pending request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: review on pending request', 'PASS', 'Blocked review on pending request: ' || SQLERRM);
  END;

  -- Advance to accepted
  PERFORM fn_respond_to_request(v_req, v_cr, 'accept');

  -- 2. Negative: insert review on accepted request
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 5, 'Review while in progress');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: review on accepted request', 'FAIL', 'Allowed review on accepted request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: review on accepted request', 'PASS', 'Blocked review on accepted request: ' || SQLERRM);
  END;

  -- Advance to completed
  PERFORM fn_complete_request(v_req, v_biz);

  -- 3. Negative: insert review with third-party reviewer
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_third, v_u_cr, 4, 'Intruder review');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: third-party reviewer rejected', 'FAIL', 'Allowed review from third party');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: third-party reviewer rejected', 'PASS', 'Blocked third-party reviewer: ' || SQLERRM);
  END;

  -- 4. Negative: insert review with third-party reviewee
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_third, 4, 'Reviewing someone else');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: third-party reviewee rejected', 'FAIL', 'Allowed review for third party reviewee');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: third-party reviewee rejected', 'PASS', 'Blocked third-party reviewee: ' || SQLERRM);
  END;

  -- 5. Positive: valid review by business and valid review by creator
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 5, 'Superb collaboration');

    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_cr, v_u_biz, 5, 'Prompt payment and great communication');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: valid mutual reviews', 'PASS', 'Both parties successfully reviewed each other');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_reviews_guard: valid mutual reviews', 'FAIL', SQLERRM);
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

