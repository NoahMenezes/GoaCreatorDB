-- Test File: 08_triggers_collab_requests.sql
-- Description: Tests for collaboration_requests trigger rules (deadline, status machine, immutability)

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
  v_past_date DATE := CURRENT_DATE - INTERVAL '1 day';
  v_today_date DATE := CURRENT_DATE;
  v_resp_at TIMESTAMPTZ;
BEGIN
  SELECT location_id INTO v_loc FROM locations LIMIT 1;
  INSERT INTO users (email, password_hash, role) VALUES ('trg_biz@test.com', 'h', 'business') RETURNING user_id INTO v_u_biz;
  INSERT INTO users (email, password_hash, role) VALUES ('trg_cr@test.com', 'h', 'creator') RETURNING user_id INTO v_u_cr;
  INSERT INTO businesses (user_id, location_id, business_name) VALUES (v_u_biz, v_loc, 'Trigger Biz') RETURNING business_id INTO v_biz;
  INSERT INTO creators (user_id, location_id, full_name) VALUES (v_u_cr, v_loc, 'Trigger Creator') RETURNING creator_id INTO v_cr;

  -- 1. Negative: insert with past deadline
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'paid', 1000, v_past_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: past deadline', 'FAIL', 'Past deadline was allowed on insert');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: past deadline', 'PASS', 'Rejected past deadline on insert: ' || SQLERRM);
  END;

  -- 2. Negative: insert with today deadline (must be strictly in the future)
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline)
    VALUES (v_biz, v_cr, 'paid', 1000, v_today_date);

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: today deadline', 'FAIL', 'Today deadline was allowed on insert');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: today deadline', 'PASS', 'Rejected today deadline (future required): ' || SQLERRM);
  END;

  -- 3. Negative: insert with non-pending status
  BEGIN
    INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deadline, status)
    VALUES (v_biz, v_cr, 'paid', 1000, v_future_date, 'accepted');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: initial non-pending status', 'FAIL', 'Initial non-pending status allowed on insert');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: initial non-pending status', 'PASS', 'Rejected non-pending status on insert: ' || SQLERRM);
  END;

  -- Create valid pending request for transitions
  INSERT INTO collaboration_requests (business_id, creator_id, collab_type, offered_amount, deliverables, deadline)
  VALUES (v_biz, v_cr, 'paid', 3000, '1 Instagram Reel', v_future_date)
  RETURNING request_id INTO v_req;

  -- 4. Negative: invalid transition from pending to completed (skipping accepted)
  BEGIN
    UPDATE collaboration_requests SET status = 'completed' WHERE request_id = v_req;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: pending -> completed invalid transition', 'FAIL', 'Allowed pending to transition directly to completed');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: pending -> completed invalid transition', 'PASS', 'Rejected illegal direct pending -> completed transition');
  END;

  -- 5. Positive: pending -> accepted auto-sets responded_at
  BEGIN
    UPDATE collaboration_requests SET status = 'accepted' WHERE request_id = v_req RETURNING responded_at INTO v_resp_at;
    IF v_resp_at IS NOT NULL THEN
      INSERT INTO test_results (test_name, status, message)
      VALUES ('trg_collab_request_guard: auto responded_at', 'PASS', 'responded_at was populated automatically');
    ELSE
      INSERT INTO test_results (test_name, status, message)
      VALUES ('trg_collab_request_guard: auto responded_at', 'FAIL', 'responded_at remained null on accepted transition');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: auto responded_at', 'FAIL', SQLERRM);
  END;

  -- 6. Negative: invalid transition from accepted to rejected
  BEGIN
    UPDATE collaboration_requests SET status = 'rejected' WHERE request_id = v_req;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: accepted -> rejected invalid transition', 'FAIL', 'Allowed accepted to transition to rejected');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: accepted -> rejected invalid transition', 'PASS', 'Rejected accepted -> rejected transition');
  END;

  -- 7. Negative: Terms immutability after leaving pending (update offered_amount)
  BEGIN
    UPDATE collaboration_requests SET offered_amount = 9999 WHERE request_id = v_req;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terms immutability (offered_amount)', 'FAIL', 'Changed offered_amount on accepted request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terms immutability (offered_amount)', 'PASS', 'Blocked modifying offered_amount on accepted request');
  END;

  -- 8. Negative: Terms immutability after leaving pending (update deliverables)
  BEGIN
    UPDATE collaboration_requests SET deliverables = '2 Instagram Reels + 3 Stories' WHERE request_id = v_req;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terms immutability (deliverables)', 'FAIL', 'Changed deliverables on accepted request');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terms immutability (deliverables)', 'PASS', 'Blocked modifying deliverables on accepted request');
  END;

  -- 9. Complete request
  UPDATE collaboration_requests SET status = 'completed' WHERE request_id = v_req;

  -- 10. Negative: transition from terminal status completed to cancelled
  BEGIN
    UPDATE collaboration_requests SET status = 'cancelled' WHERE request_id = v_req;

    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terminal status transition', 'FAIL', 'Allowed transition from terminal status completed');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('trg_collab_request_guard: terminal status transition', 'PASS', 'Blocked transition from completed status');
  END;

  -- Cleanup
  DELETE FROM users WHERE email LIKE '%@test.com';
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

