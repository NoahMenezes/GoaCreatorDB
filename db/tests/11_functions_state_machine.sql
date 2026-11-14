-- Test File: 11_functions_state_machine.sql
-- Description: Tests for state machine stored functions and actor authorization rules (D14)

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
  v_u_other_cr INT;
  v_u_other_biz INT;
  v_biz INT;
  v_cr INT;
  v_other_cr INT;
  v_other_biz INT;
  v_loc INT;
  v_req1 INT;
  v_req2 INT;
  v_req3 INT;
  v_future DATE := CURRENT_DATE + INTERVAL '12 days';
  v_res collaboration_requests;
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;

  INSERT INTO users (email, password_hash, role) VALUES ('sm_biz@test.com', 'h', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('sm_cr@test.com', 'h', 'creator') RETURNING user_id INTO v_u_cr;
  INSERT INTO users (email, password_hash, role) VALUES ('sm_other_cr@test.com', 'h', 'creator') RETURNING user_id INTO v_u_other_cr;
  INSERT INTO users (email, password_hash, role) VALUES ('sm_other_biz@test.com', 'h', 'business') RETURNING user_id INTO v_u_other_biz;

  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_biz, v_loc, 'SM Biz') RETURNING business_id INTO v_biz;
  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_other_biz, v_loc, 'SM Other Biz') RETURNING business_id INTO v_other_biz;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_cr, v_loc, 'SM Creator') RETURNING creator_id INTO v_cr;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_other_cr, v_loc, 'SM Other Creator') RETURNING creator_id INTO v_other_cr;

  -- 1. Create request 1
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
  VALUES (v_biz, v_cr, 'paid', 2500, v_future) RETURNING request_id INTO v_req1;

  -- Negative: fn_respond_to_request called by wrong creator
  BEGIN
    PERFORM fn_respond_to_request(v_req1, v_other_cr, 'accept');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_respond_to_request: wrong creator rejected', 'FAIL', 'Wrong creator was allowed to accept request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_respond_to_request: wrong creator rejected', 'PASS', 'Unauthorized creator blocked: ' || SQLERRM);
  END;

  -- Negative: fn_respond_to_request called with invalid action
  BEGIN
    PERFORM fn_respond_to_request(v_req1, v_cr, 'negotiate');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_respond_to_request: invalid action rejected', 'FAIL', 'Invalid action was allowed');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_respond_to_request: invalid action rejected', 'PASS', 'Rejected invalid action negotiate');
  END;

  -- Positive: fn_respond_to_request creator accepts
  BEGIN
    v_res := fn_respond_to_request(v_req1, v_cr, 'accept');
    IF v_res.status = 'accepted' AND v_res.responded_at IS NOT NULL THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_respond_to_request: valid accept', 'PASS', 'Accepted successfully with responded_at');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_respond_to_request: valid accept', 'FAIL', 'Status or responded_at not set properly');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_respond_to_request: valid accept', 'FAIL', SQLERRM);
  END;

  -- Negative: fn_complete_request called by wrong business
  BEGIN
    PERFORM fn_complete_request(v_req1, v_other_biz);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_complete_request: wrong business rejected', 'FAIL', 'Wrong business completed request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_complete_request: wrong business rejected', 'PASS', 'Unauthorized business blocked: ' || SQLERRM);
  END;

  -- Positive: fn_complete_request called by right business
  BEGIN
    v_res := fn_complete_request(v_req1, v_biz);
    IF v_res.status = 'completed' THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_complete_request: valid complete', 'PASS', 'Completed successfully');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_complete_request: valid complete', 'FAIL', 'Status not set to completed');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_complete_request: valid complete', 'FAIL', SQLERRM);
  END;

  -- 2. Create request 2 for cancellation tests
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
  VALUES (v_biz, v_cr, 'paid', 3500, v_future) RETURNING request_id INTO v_req2;

  -- Negative: fn_cancel_request called by third party user
  BEGIN
    PERFORM fn_cancel_request(v_req2, v_u_other_cr);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: third party rejected', 'FAIL', 'Third party cancelled request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: third party rejected', 'PASS', 'Non-party cancellation blocked: ' || SQLERRM);
  END;

  -- Negative: D14 rule - Creator cannot cancel pending request (creator must reject)
  BEGIN
    PERFORM fn_cancel_request(v_req2, v_u_cr);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: creator cannot cancel pending', 'FAIL', 'Creator cancelled pending request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: creator cannot cancel pending', 'PASS', 'Creator blocked from cancelling pending request (must reject): ' || SQLERRM);
  END;

  -- Positive: D14 rule - Business CAN cancel pending request (withdraw)
  BEGIN
    v_res := fn_cancel_request(v_req2, v_u_biz);
    IF v_res.status = 'cancelled' THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_cancel_request: business withdraws pending', 'PASS', 'Business successfully cancelled/withdrew pending request');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_cancel_request: business withdraws pending', 'FAIL', 'Status not cancelled');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: business withdraws pending', 'FAIL', SQLERRM);
  END;

  -- 3. Create request 3: accept it, then creator cancels accepted request
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
  VALUES (v_biz, v_cr, 'paid', 4000, v_future) RETURNING request_id INTO v_req3;

  PERFORM fn_respond_to_request(v_req3, v_cr, 'accept');

  -- Positive: D14 rule - Creator CAN cancel accepted request
  BEGIN
    v_res := fn_cancel_request(v_req3, v_u_cr);
    IF v_res.status = 'cancelled' THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_cancel_request: creator cancels accepted', 'PASS', 'Creator successfully cancelled accepted request');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('fn_cancel_request: creator cancels accepted', 'FAIL', 'Status not cancelled');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('fn_cancel_request: creator cancels accepted', 'FAIL', SQLERRM);
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

