-- Test File: 06_constraints_collab_requests.sql
-- Description: Tests for collaboration_requests table constraints

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
  v_future_date DATE := CURRENT_DATE + INTERVAL '14 days';
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  INSERT INTO users (email, password_hash, role) VALUES ('biz_req@test.com', 'h', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('cr_req@test.com', 'h', 'creator') RETURNING user_id INTO v_u_cr;
  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_biz, v_loc, 'Req Biz') RETURNING business_id INTO v_biz;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_cr, v_loc, 'Req Creator') RETURNING creator_id INTO v_cr;

  -- 1. Negative: ck_requests_amount (paid requires offered_amount > 0)
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'paid', 0, v_future_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_amount (paid with 0 amount)', 'FAIL', 'Paid request with 0 amount was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_amount (paid with 0 amount)', 'PASS', 'Rejected paid request with 0 amount');
  END;

  -- 2. Negative: ck_requests_amount (hybrid requires offered_amount > 0)
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'hybrid', 0, v_future_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_amount (hybrid with 0 amount)', 'FAIL', 'Hybrid request with 0 amount was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_amount (hybrid with 0 amount)', 'PASS', 'Rejected hybrid request with 0 amount');
  END;

  -- 3. Positive: barter allows offered_amount = 0
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'barter', 0, v_future_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('collab_requests: barter with 0 amount', 'PASS', 'Allowed barter request with 0 amount');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('collab_requests: barter with 0 amount', 'FAIL', SQLERRM);
  END;

  -- 4. Negative: partial unique index (only one pending request per business_id, creator_id)
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'paid', 5000, v_future_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_requests_pending_pair', 'FAIL', 'Second pending request was allowed for same pair');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_requests_pending_pair', 'PASS', 'Rejected second pending request between same business and creator');
  END;

  -- 5. Negative: invalid collab_type
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'free_promotion', 0, v_future_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_collab_type', 'FAIL', 'Invalid collab_type was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_requests_collab_type', 'PASS', 'Rejected invalid collab_type');
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

