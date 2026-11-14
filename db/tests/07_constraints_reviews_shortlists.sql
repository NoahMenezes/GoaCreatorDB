-- Test File: 07_constraints_reviews_shortlists.sql
-- Description: Tests for reviews and shortlists constraints

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
  v_biz INT;
  v_cr INT;
  v_loc INT;
  v_req INT;
  v_future_date DATE := CURRENT_DATE + INTERVAL '10 days';
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  INSERT INTO users (email, password_hash, role) VALUES ('biz_rev@test.com', 'h', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('cr_rev@test.com', 'h', 'creator') RETURNING user_id INTO v_u_cr;
  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_biz, v_loc, 'Rev Biz') RETURNING business_id INTO v_biz;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_cr, v_loc, 'Rev Creator') RETURNING creator_id INTO v_cr;

  -- Create and advance request to completed so review table tests can proceed
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
  VALUES (v_biz, v_cr, 'paid', 2000, v_future_date) RETURNING request_id INTO v_req;

  PERFORM fn_respond_to_request(v_req, v_cr, 'accept');
  PERFORM fn_complete_request(v_req, v_biz);

  -- 1. Negative: ck_reviews_rating (rating < 1)
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 0, 'Terrible');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_rating (rating < 1)', 'FAIL', 'Rating 0 was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_rating (rating < 1)', 'PASS', 'Rejected rating below 1');
  END;

  -- 2. Negative: ck_reviews_rating (rating > 5)
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 6, 'Over the moon');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_rating (rating > 5)', 'FAIL', 'Rating 6 was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_rating (rating > 5)', 'PASS', 'Rejected rating above 5');
  END;

  -- 3. Negative: ck_reviews_different_parties (reviewer_id = reviewee_id)
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_biz, 5, 'Self review');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_different_parties', 'FAIL', 'Self review was allowed');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_reviews_different_parties', 'PASS', 'Rejected self review (reviewer_id = reviewee_id): ' || SQLERRM);
  END;

  -- Insert valid review from business to creator
  INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (v_req, v_u_biz, v_u_cr, 5, 'Great work');

  -- 4. Negative: uq_reviews_request_reviewer (duplicate review by same reviewer)
  BEGIN
    INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (v_req, v_u_biz, v_u_cr, 4, 'Second review attempt');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_reviews_request_reviewer', 'FAIL', 'Duplicate review by same reviewer was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_reviews_request_reviewer', 'PASS', 'Rejected duplicate review for same request by same reviewer');
  END;

  -- 5. Shortlists composite PK tests
  INSERT INTO shortlists (business_id, creator_id, note)
  VALUES (v_biz, v_cr, 'Consider for campaign');

  -- 6. Negative: pk_shortlists duplicate
  BEGIN
    INSERT INTO shortlists (business_id, creator_id, note)
    VALUES (v_biz, v_cr, 'Duplicate shortlist');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('pk_shortlists (composite PK)', 'FAIL', 'Duplicate shortlist entry allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('pk_shortlists (composite PK)', 'PASS', 'Rejected duplicate shortlist primary key');
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;
