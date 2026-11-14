-- Test File: 02_constraints_locations_categories.sql
-- Description: Tests for locations and categories constraints

CREATE TEMP TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
DELETE FROM test_results;

DO $test$
BEGIN
  -- 1. Negative: locations UNIQUE(area_name, taluka)
  BEGIN
    INSERT INTO locations (area_name, taluka, district)
    VALUES ('Assagao', 'Bardez', 'North Goa'); -- already exists in reference data

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_locations_area_taluka', 'FAIL', 'Duplicate area_name and taluka was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_locations_area_taluka', 'PASS', 'Rejected duplicate (area_name, taluka)');
  END;

  -- 2. Negative: locations.district check constraint
  BEGIN
    INSERT INTO locations (area_name, taluka, district)
    VALUES ('TestArea', 'TestTaluka', 'Central Goa');

    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_locations_district', 'FAIL', 'Invalid district Central Goa was allowed');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('ck_locations_district', 'PASS', 'Rejected invalid district');
  END;

  -- 3. Negative: categories.category_name UNIQUE
  BEGIN
    INSERT INTO categories (category_name)
    VALUES ('Food & Beach Dining'); -- already exists in reference data

    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_categories_category_name', 'FAIL', 'Duplicate category_name was allowed');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO test_results (test_name, status, message)
    VALUES ('uq_categories_category_name', 'PASS', 'Rejected duplicate category_name');
  END;
END $test$;

SELECT status, test_name, message FROM test_results ORDER BY id;

