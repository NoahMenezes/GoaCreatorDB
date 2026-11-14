-- ============================================================================
-- GoaConnect Database Demonstration Script
-- File: docs/sql-demo.sql
-- Description: 29 labelled queries demonstrating real-world PostgreSQL 16 schema usage,
--              joins, aggregations, subqueries, CTEs, window functions, views,
--              triggers, transactional atomicity with ROLLBACK, and EXPLAIN ANALYZE.
-- ============================================================================

-- ============================================================================
-- SECTION 1: INNER & LEFT JOINS
-- ============================================================================

-- Query 01 [INNER JOIN]
-- Retrieves active businesses with their registered user account, verified status,
-- and geographic location in Goa.
SELECT
  b.business_id,
  b.business_name,
  b.industry,
  u.email,
  u.is_verified,
  l.area_name,
  l.taluka,
  l.district
FROM businesses b
JOIN users u ON b.user_id = u.user_id
JOIN locations l ON b.location_id = l.location_id
ORDER BY b.business_id
LIMIT 10;

-- Query 02 [LEFT JOIN]
-- Lists creators and their connected social accounts. If a creator has not connected
-- a social platform yet, the creator is still returned with NULL social attributes.
SELECT
  c.creator_id,
  c.full_name,
  c.min_paid_rate,
  sa.platform,
  sa.handle,
  sa.profile_url
FROM creators c
LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id
ORDER BY c.creator_id, sa.platform
LIMIT 15;

-- Query 03 [MULTI-TABLE INNER JOIN]
-- Returns completed collaboration deals with details of the contracting business,
-- the collaborating creator, and the business's taluka.
SELECT
  cr.request_id,
  b.business_name,
  l.taluka AS business_taluka,
  c.full_name AS creator_name,
  cr.collab_type,
  cr.offered_amount,
  cr.responded_at,
  cr.status
FROM collaboration_requests cr
JOIN businesses b ON cr.business_id = b.business_id
JOIN locations l ON b.location_id = l.location_id
JOIN creators c ON cr.creator_id = c.creator_id
WHERE cr.status = 'completed'
ORDER BY cr.responded_at DESC
LIMIT 10;

-- Query 04 [LEFT JOIN with COALESCE & AGGREGATION]
-- Calculates the average rating and total review count for every creator,
-- ensuring creators with zero reviews are represented with a rating of 0.0.
SELECT
  c.creator_id,
  c.full_name,
  COUNT(r.review_id) AS total_reviews,
  COALESCE(ROUND(AVG(r.rating), 2), 0.0) AS average_rating
FROM creators c
LEFT JOIN reviews r ON c.user_id = r.reviewee_id
GROUP BY c.creator_id, c.full_name
ORDER BY total_reviews DESC, average_rating DESC
LIMIT 10;

-- Query 05 [ANTI-JOIN: LEFT JOIN ... WHERE NULL]
-- Identifies creators who have never received any collaboration requests.
SELECT
  c.creator_id,
  c.full_name,
  c.min_paid_rate,
  l.area_name,
  l.taluka
FROM creators c
JOIN locations l ON c.location_id = l.location_id
LEFT JOIN collaboration_requests cr ON c.creator_id = cr.creator_id
WHERE cr.request_id IS NULL
ORDER BY c.creator_id
LIMIT 10;

-- Query 06 [FULL OUTER JOIN]
-- Compares creator count vs business count per taluka to identify geographic supply/demand imbalances.
SELECT
  COALESCE(cl.taluka, bl.taluka) AS taluka,
  COALESCE(cl.creator_count, 0) AS creator_count,
  COALESCE(bl.business_count, 0) AS business_count
FROM (
  SELECT l.taluka, COUNT(c.creator_id) AS creator_count
  FROM locations l
  JOIN creators c ON l.location_id = c.location_id
  GROUP BY l.taluka
) cl
FULL OUTER JOIN (
  SELECT l.taluka, COUNT(b.business_id) AS business_count
  FROM locations l
  JOIN businesses b ON l.location_id = b.location_id
  GROUP BY l.taluka
) bl ON cl.taluka = bl.taluka
ORDER BY creator_count DESC, business_count DESC;

-- ============================================================================
-- SECTION 2: AGGREGATIONS & GROUP BY WITH HAVING
-- ============================================================================

-- Query 07 [GROUP BY & AGGREGATION]
-- Aggregates creator counts, average rates, and min/max rates across primary categories.
SELECT
  cat.category_name,
  COUNT(cc.creator_id) AS creator_count,
  ROUND(AVG(c.min_paid_rate), 2) AS avg_min_rate,
  MIN(c.min_paid_rate) AS lowest_min_rate,
  MAX(c.min_paid_rate) AS highest_min_rate
FROM categories cat
JOIN creator_categories cc ON cat.category_id = cc.category_id AND cc.is_primary = true
JOIN creators c ON cc.creator_id = c.creator_id
GROUP BY cat.category_id, cat.category_name
ORDER BY creator_count DESC;

-- Query 08 [GROUP BY with HAVING]
-- Filters for talukas having at least 3 creators and an average minimum paid rate >= ₹8,000.
SELECT
  l.taluka,
  l.district,
  COUNT(c.creator_id) AS total_creators,
  ROUND(AVG(c.min_paid_rate), 2) AS avg_base_rate
FROM locations l
JOIN creators c ON l.location_id = c.location_id
GROUP BY l.taluka, l.district
HAVING COUNT(c.creator_id) >= 3 AND AVG(c.min_paid_rate) >= 8000
ORDER BY total_creators DESC;

-- Query 09 [GROUP BY with HAVING]
-- Identifies high-value businesses that have spent more than ₹30,000 across completed campaigns.
SELECT
  b.business_id,
  b.business_name,
  COUNT(cr.request_id) AS completed_deals,
  SUM(cr.offered_amount) AS total_spend,
  ROUND(AVG(cr.offered_amount), 2) AS avg_deal_size
FROM businesses b
JOIN collaboration_requests cr ON b.business_id = cr.business_id
WHERE cr.status = 'completed'
GROUP BY b.business_id, b.business_name
HAVING SUM(cr.offered_amount) > 30000
ORDER BY total_spend DESC;

-- ============================================================================
-- SECTION 3: SUBQUERIES (SCALAR, IN, EXISTS, CORRELATED)
-- ============================================================================

-- Query 10 [SCALAR SUBQUERY in SELECT]
-- Lists creators along with their latest follower count from a subquery against creator_metrics.
SELECT
  c.creator_id,
  c.full_name,
  c.min_paid_rate,
  (
    SELECT cm.follower_count
    FROM social_accounts sa
    JOIN creator_metrics cm ON sa.account_id = cm.account_id
    WHERE sa.creator_id = c.creator_id
    ORDER BY cm.recorded_at DESC
    LIMIT 1
  ) AS latest_followers
FROM creators c
ORDER BY latest_followers DESC NULLS LAST
LIMIT 10;

-- Query 11 [SUBQUERY with IN]
-- Finds businesses situated in prime coastal tourism talukas (Bardez and Salcete).
SELECT
  b.business_id,
  b.business_name,
  b.industry,
  l.area_name,
  l.taluka
FROM businesses b
JOIN locations l ON b.location_id = l.location_id
WHERE b.location_id IN (
  SELECT location_id
  FROM locations
  WHERE taluka IN ('Bardez', 'Salcete')
)
ORDER BY b.business_name
LIMIT 10;

-- Query 12 [SUBQUERY with EXISTS]
-- Selects verified creators who possess at least one 5-star review from a completed collaboration.
SELECT
  c.creator_id,
  c.full_name,
  u.email
FROM creators c
JOIN users u ON c.user_id = u.user_id
WHERE u.is_verified = true
  AND EXISTS (
    SELECT 1
    FROM reviews r
    WHERE r.reviewee_id = c.user_id AND r.rating = 5
  )
ORDER BY c.full_name
LIMIT 10;

-- Query 13 [CORRELATED SUBQUERY]
-- Selects creators whose minimum rate is strictly above the average rate of all creators
-- sharing their same primary niche category.
SELECT
  c.creator_id,
  c.full_name,
  cat.category_name,
  c.min_paid_rate
FROM creators c
JOIN creator_categories cc ON c.creator_id = cc.creator_id AND cc.is_primary = true
JOIN categories cat ON cc.category_id = cat.category_id
WHERE c.min_paid_rate > (
  SELECT AVG(c2.min_paid_rate)
  FROM creators c2
  JOIN creator_categories cc2 ON c2.creator_id = cc2.creator_id AND cc2.is_primary = true
  WHERE cc2.category_id = cc.category_id
)
ORDER BY cat.category_name, c.min_paid_rate DESC
LIMIT 10;

-- ============================================================================
-- SECTION 4: COMMON TABLE EXPRESSIONS (CTEs)
-- ============================================================================

-- Query 14 [SIMPLE CTE]
-- Aggregates gross earnings and deal completion counts per creator using a CTE.
WITH creator_earnings AS (
  SELECT
    cr.creator_id,
    COUNT(cr.request_id) AS total_deals,
    SUM(cr.offered_amount) AS gross_earnings
  FROM collaboration_requests cr
  WHERE cr.status = 'completed'
  GROUP BY cr.creator_id
)
SELECT
  c.creator_id,
  c.full_name,
  ce.total_deals,
  ce.gross_earnings
FROM creators c
JOIN creator_earnings ce ON c.creator_id = ce.creator_id
ORDER BY ce.gross_earnings DESC
LIMIT 10;

-- Query 15 [CHAINED / MULTIPLE CTEs]
-- Segments creators into follower tiers, then aggregates average booking rate per tier.
WITH latest_creator_stats AS (
  SELECT
    c.creator_id,
    c.full_name,
    c.min_paid_rate,
    COALESCE(MAX(cm.follower_count), 0) AS max_followers
  FROM creators c
  LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id
  LEFT JOIN creator_metrics cm ON sa.account_id = cm.account_id
  GROUP BY c.creator_id, c.full_name, c.min_paid_rate
),
creator_tiers AS (
  SELECT
    creator_id,
    full_name,
    min_paid_rate,
    max_followers,
    CASE
      WHEN max_followers >= 100000 THEN 'Macro (100k+)'
      WHEN max_followers >= 25000 THEN 'Mid-Tier (25k-100k)'
      WHEN max_followers >= 5000 THEN 'Micro (5k-25k)'
      ELSE 'Nano (<5k)'
    END AS audience_tier
  FROM latest_creator_stats
)
SELECT
  audience_tier,
  COUNT(*) AS creator_count,
  ROUND(AVG(max_followers), 0) AS avg_followers,
  ROUND(AVG(min_paid_rate), 2) AS avg_min_rate
FROM creator_tiers
GROUP BY audience_tier
ORDER BY avg_followers DESC;

-- Query 16 [RECURSIVE CTE]
-- Generates a 30-day timeline series and joins request velocity to report daily activity
-- even for dates with 0 submitted requests.
WITH RECURSIVE date_series AS (
  SELECT CURRENT_DATE - INTERVAL '29 days' AS day_date
  UNION ALL
  SELECT (day_date + INTERVAL '1 day')::date
  FROM date_series
  WHERE day_date < CURRENT_DATE
),
daily_collabs AS (
  SELECT
    DATE(requested_at) AS collab_date,
    COUNT(*) AS request_count,
    SUM(offered_amount) AS daily_offered
  FROM collaboration_requests
  WHERE requested_at >= CURRENT_DATE - INTERVAL '29 days'
  GROUP BY DATE(requested_at)
)
SELECT
  ds.day_date::date AS calendar_date,
  COALESCE(dc.request_count, 0) AS requests_submitted,
  COALESCE(dc.daily_offered, 0) AS total_offered_amount
FROM date_series ds
LEFT JOIN daily_collabs dc ON ds.day_date = dc.collab_date
ORDER BY calendar_date DESC
LIMIT 15;

-- ============================================================================
-- SECTION 5: WINDOW FUNCTIONS (RANK, DENSE_RANK, RUNNING TOTALS, MOVING AVG, LAG)
-- ============================================================================

-- Query 17 [WINDOW FUNCTION: RANK() & DENSE_RANK()]
-- Ranks creators within their primary category based on minimum paid rate.
SELECT
  c.creator_id,
  c.full_name,
  cat.category_name,
  c.min_paid_rate,
  RANK() OVER (
    PARTITION BY cat.category_id
    ORDER BY c.min_paid_rate DESC
  ) AS rate_rank,
  DENSE_RANK() OVER (
    PARTITION BY cat.category_id
    ORDER BY c.min_paid_rate DESC
  ) AS dense_rate_rank
FROM creators c
JOIN creator_categories cc ON c.creator_id = cc.creator_id AND cc.is_primary = true
JOIN categories cat ON cc.category_id = cat.category_id
ORDER BY cat.category_name, rate_rank
LIMIT 15;

-- Query 18 [WINDOW FUNCTION: RUNNING TOTAL]
-- Computes a cumulative running total of platform deal value over time for accepted collaborations.
SELECT
  request_id,
  business_id,
  creator_id,
  offered_amount,
  requested_at,
  SUM(offered_amount) OVER (
    ORDER BY requested_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_deal_volume
FROM collaboration_requests
WHERE status IN ('accepted', 'completed')
ORDER BY requested_at
LIMIT 15;

-- Query 19 [WINDOW FUNCTION: MOVING AVERAGE]
-- Computes a 3-record moving average of engagement rates for consecutive metrics snapshots.
SELECT
  metric_id,
  account_id,
  recorded_at,
  engagement_rate,
  ROUND(
    AVG(engagement_rate) OVER (
      PARTITION BY account_id
      ORDER BY recorded_at
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ),
    2
  ) AS moving_avg_engagement
FROM creator_metrics
WHERE engagement_rate IS NOT NULL
ORDER BY account_id, recorded_at
LIMIT 15;

-- Query 20 [WINDOW FUNCTION: LAG()]
-- Calculates snapshot-over-snapshot follower growth between successive metric updates.
SELECT
  metric_id,
  account_id,
  recorded_at,
  follower_count,
  LAG(follower_count, 1) OVER (
    PARTITION BY account_id
    ORDER BY recorded_at
  ) AS previous_followers,
  follower_count - LAG(follower_count, 1) OVER (
    PARTITION BY account_id
    ORDER BY recorded_at
  ) AS follower_delta
FROM creator_metrics
ORDER BY account_id, recorded_at
LIMIT 15;

-- ============================================================================
-- SECTION 6: VIEW USAGE & SYSTEM ANALYTICS
-- ============================================================================

-- Query 21 [VIEW: v_creator_cards]
-- Powers the public directory and discover page with trigram search, filtering by
-- category, district, and follower counts.
SELECT
  creator_id,
  full_name,
  primary_category,
  taluka,
  district,
  total_followers,
  avg_engagement_rate,
  min_paid_rate,
  accepts_barter,
  is_verified,
  review_count,
  avg_rating
FROM v_creator_cards
WHERE district = 'North Goa'
  AND total_followers >= 10000
ORDER BY total_followers DESC
LIMIT 10;

-- Query 22 [VIEW: v_collaborations]
-- Provides the collaboration overview for deals with counterpart visibility.
SELECT
  request_id,
  business_name,
  creator_name,
  collab_type,
  offered_amount,
  status,
  requested_at,
  responded_at
FROM v_collaborations
WHERE status = 'accepted'
ORDER BY responded_at DESC
LIMIT 10;

-- Query 23 [VIEW: v_taluka_stats]
-- Demonstrates geographic market insights for platform management across Goa talukas.
SELECT
  ts.taluka,
  ts.district,
  ts.creator_count,
  ts.business_count,
  ts.avg_offered_amount,
  ts.top_category
FROM v_taluka_stats ts
WHERE ts.creator_count > 0
ORDER BY ts.creator_count DESC, ts.business_count DESC;

-- Query 24 [VIEW: v_top_creators]
-- Retrieves top performing creators by completed revenue and ratings from the view.
SELECT
  tc.creator_id,
  tc.full_name,
  tc.completed_deals,
  tc.total_earned,
  tc.avg_rating,
  tc.review_count
FROM v_top_creators tc
ORDER BY tc.total_earned DESC
LIMIT 5;

-- Query 25 [STORED FUNCTION: fn_trust_score]
-- Demonstrates the rule-based trust score engine (0 to 100) combining profile completeness,
-- connected accounts, and verified metrics.
SELECT
  u.user_id,
  u.email,
  u.role,
  u.is_verified,
  fn_trust_score(u.user_id) AS computed_trust_score,
  CASE
    WHEN fn_trust_score(u.user_id) >= 80 THEN 'HIGH TRUST'
    WHEN fn_trust_score(u.user_id) >= 50 THEN 'MEDIUM TRUST'
    ELSE 'LOW TRUST'
  END AS trust_classification
FROM users u
WHERE u.role IN ('business', 'creator')
ORDER BY computed_trust_score DESC
LIMIT 10;

-- ============================================================================
-- SECTION 7: TRIGGER DEMONSTRATION (ILLEGAL STATE TRANSITION)
-- ============================================================================

-- Query 26 [TRIGGER DEMO: State Machine Enforcement]
-- Demonstrates trg_collab_request_guard blocking an illegal direct state transition
-- from 'pending' to 'completed'. The transaction captures the exception cleanly.
DO $$
DECLARE
  v_req_id INT;
  v_status TEXT;
BEGIN
  -- 1. Locate a pending collaboration request
  SELECT request_id, status INTO v_req_id, v_status
  FROM collaboration_requests
  WHERE status = 'pending'
  LIMIT 1;

  RAISE NOTICE 'Selected Request ID: %, Current Status: %', v_req_id, v_status;

  -- 2. Attempt illegal transition: pending -> completed
  BEGIN
    UPDATE collaboration_requests
    SET status = 'completed'
    WHERE request_id = v_req_id;

    RAISE EXCEPTION 'TRIGGER FAILED: Illegal transition was unexpectedly allowed!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: trg_collab_request_guard successfully blocked illegal transition: %', SQLERRM;
  END;
END $$;

-- ============================================================================
-- SECTION 8: TRANSACTION ATOMICITY & ROLLBACK
-- ============================================================================

-- Query 27 [TRANSACTION DEMO with ROLLBACK]
-- Demonstrates ACID atomicity when creating a collaboration request.
-- If an error or condition fails midway, the entire transaction is rolled back,
-- leaving zero orphaned records.
BEGIN;

-- 1. Insert an audit log entry for the intended action
INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by, changed_at)
VALUES ('collaboration_requests', 999999, 'INSERT', '{"demo": "rollback_test"}'::jsonb, 1, now());

-- 2. Insert a temporary collaboration request
INSERT INTO collaboration_requests (
  business_id,
  creator_id,
  collab_type,
  offered_amount,
  deliverables,
  deadline,
  status
)
VALUES (
  1,
  1,
  'paid',
  25000,
  '1 Dedicated Reel (Rollback Test)',
  CURRENT_DATE + INTERVAL '14 days',
  'pending'
);

-- 3. Verify inserted records exist in uncommitted transaction state
SELECT COUNT(*) AS uncommitted_requests
FROM collaboration_requests
WHERE deliverables LIKE '%Rollback Test%';

-- 4. Execute ROLLBACK to abort all mutations atomically
ROLLBACK;

-- 5. Verify records were completely discarded
SELECT COUNT(*) AS post_rollback_requests
FROM collaboration_requests
WHERE deliverables LIKE '%Rollback Test%';

-- ============================================================================
-- SECTION 9: QUERY PERFORMANCE OPTIMIZATION (EXPLAIN ANALYZE BEFORE & AFTER INDEX)
-- ============================================================================

-- Query 28 [EXPLAIN ANALYZE: BEFORE INDEX]
-- Filters collaboration requests by deadline without an index on deadline.
-- Observe execution plan: Seq Scan on collaboration_requests.
EXPLAIN ANALYZE
SELECT request_id, business_id, creator_id, offered_amount, status
FROM collaboration_requests
WHERE deadline = CURRENT_DATE + INTERVAL '14 days';

-- Query 29 [EXPLAIN ANALYZE: AFTER INDEX]
-- Creates an index on deadline, analyzes the new execution plan, and removes index.
CREATE INDEX idx_demo_collab_deadline ON collaboration_requests (deadline);

EXPLAIN ANALYZE
SELECT request_id, business_id, creator_id, offered_amount, status
FROM collaboration_requests
WHERE deadline = CURRENT_DATE + INTERVAL '14 days';

-- Cleanup temporary demonstration index
DROP INDEX idx_demo_collab_deadline;
