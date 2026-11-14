-- Test File: 13_views_validation.sql
-- Description: Verifies that all 9 reporting views execute successfully and yield valid schema

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
DECLARE
  v_count INT;
BEGIN
  -- 1. v_creator_latest_metrics
  BEGIN
    SELECT count(*) INTO v_count FROM v_creator_latest_metrics;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_creator_latest_metrics', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_creator_latest_metrics', 'FAIL', SQLERRM);
  END;

  -- 2. v_creator_cards
  BEGIN
    SELECT count(*) INTO v_count FROM v_creator_cards;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_creator_cards', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_creator_cards', 'FAIL', SQLERRM);
  END;

  -- 3. v_collaborations
  BEGIN
    SELECT count(*) INTO v_count FROM v_collaborations;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_collaborations', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_collaborations', 'FAIL', SQLERRM);
  END;

  -- 4. v_category_distribution
  BEGIN
    SELECT count(*) INTO v_count FROM v_category_distribution;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_category_distribution', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_category_distribution', 'FAIL', SQLERRM);
  END;

  -- 5. v_taluka_stats
  BEGIN
    SELECT count(*) INTO v_count FROM v_taluka_stats;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_taluka_stats', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_taluka_stats', 'FAIL', SQLERRM);
  END;

  -- 6. v_monthly_request_velocity
  BEGIN
    SELECT count(*) INTO v_count FROM v_monthly_request_velocity;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_monthly_request_velocity', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_monthly_request_velocity', 'FAIL', SQLERRM);
  END;

  -- 7. v_top_creators
  BEGIN
    SELECT count(*) INTO v_count FROM v_top_creators;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_top_creators', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_top_creators', 'FAIL', SQLERRM);
  END;

  -- 8. v_top_businesses
  BEGIN
    SELECT count(*) INTO v_count FROM v_top_businesses;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_top_businesses', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_top_businesses', 'FAIL', SQLERRM);
  END;

  -- 9. v_admin_kpis
  BEGIN
    SELECT count(*) INTO v_count FROM v_admin_kpis;
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_admin_kpis', 'PASS', 'Query executed successfully');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('view: v_admin_kpis', 'FAIL', SQLERRM);
  END;
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

