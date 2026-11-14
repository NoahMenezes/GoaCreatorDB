-- Migration: 003_views_and_indexes.sql
-- Description: Create all required foreign key indexes, compound indexes, trigram GIN indexes, and reporting views

-- ============================================================================
-- 1. INDEXES
-- ============================================================================

-- Foreign key indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_location_id ON businesses(location_id);

CREATE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_creators_location_id ON creators(location_id);

CREATE INDEX idx_creator_categories_category_id ON creator_categories(category_id);

CREATE INDEX idx_social_accounts_creator_id ON social_accounts(creator_id);

CREATE INDEX idx_creator_metrics_verified_by ON creator_metrics(verified_by);

CREATE INDEX idx_reviews_request_id ON reviews(request_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE INDEX idx_shortlists_creator_id ON shortlists(creator_id);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Compound indexes specified in requirements
CREATE INDEX idx_creator_metrics_account_recorded_desc ON creator_metrics(account_id, recorded_at DESC);
CREATE INDEX idx_collab_requests_creator_status ON collaboration_requests(creator_id, status);
CREATE INDEX idx_collab_requests_business_status ON collaboration_requests(business_id, status);

-- GIN trigram indexes for fast fuzzy searching
CREATE INDEX idx_creators_full_name_trgm ON creators USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_social_accounts_handle_trgm ON social_accounts USING gin (handle gin_trgm_ops);

-- ============================================================================
-- 2. VIEWS
-- ============================================================================

-- View: v_creator_latest_metrics (latest snapshot per account via DISTINCT ON)
CREATE OR REPLACE VIEW v_creator_latest_metrics AS
SELECT DISTINCT ON (account_id)
  metric_id,
  account_id,
  follower_count,
  avg_likes,
  avg_views,
  avg_comments,
  engagement_rate,
  audience_goa_pct,
  data_source,
  verified_by,
  recorded_at
FROM creator_metrics
ORDER BY account_id, recorded_at DESC;

-- View: v_creator_cards
-- (creator + location + category array + total followers + avg engagement + avg rating + verified flag)
CREATE OR REPLACE VIEW v_creator_cards AS
WITH creator_cats AS (
  SELECT
    cc.creator_id,
    jsonb_agg(
      jsonb_build_object(
        'category_id', c.category_id,
        'category_name', c.category_name,
        'is_primary', cc.is_primary
      ) ORDER BY cc.is_primary DESC, c.category_name ASC
    ) AS categories,
    MAX(CASE WHEN cc.is_primary THEN c.category_name ELSE NULL END) AS primary_category
  FROM creator_categories cc
  JOIN categories c ON cc.category_id = c.category_id
  GROUP BY cc.creator_id
),
creator_metrics_agg AS (
  SELECT
    sa.creator_id,
    COALESCE(SUM(lm.follower_count), 0)::INT AS total_followers,
    ROUND(COALESCE(AVG(lm.engagement_rate), 0)::numeric, 2) AS avg_engagement_rate,
    BOOL_OR(lm.data_source = 'admin_verified') AS has_admin_verified_metrics
  FROM social_accounts sa
  LEFT JOIN v_creator_latest_metrics lm ON sa.account_id = lm.account_id
  GROUP BY sa.creator_id
),
creator_reviews_agg AS (
  SELECT
    r.reviewee_id,
    ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
    COUNT(r.review_id)::INT AS review_count
  FROM reviews r
  GROUP BY r.reviewee_id
)
SELECT
  cr.creator_id,
  cr.user_id,
  u.email,
  cr.full_name,
  cr.bio,
  cr.accepts_barter,
  cr.min_paid_rate,
  cr.created_at,
  l.location_id,
  l.area_name,
  l.taluka,
  l.district,
  COALESCE(cc.categories, '[]'::jsonb) AS categories,
  cc.primary_category,
  COALESCE(cma.total_followers, 0) AS total_followers,
  COALESCE(cma.avg_engagement_rate, 0) AS avg_engagement_rate,
  COALESCE(cra.avg_rating, 0) AS avg_rating,
  COALESCE(cra.review_count, 0) AS review_count,
  u.is_verified AS is_account_verified,
  COALESCE(cma.has_admin_verified_metrics, false) AS is_metrics_verified,
  (u.is_verified OR COALESCE(cma.has_admin_verified_metrics, false)) AS is_verified
FROM creators cr
JOIN users u ON cr.user_id = u.user_id
JOIN locations l ON cr.location_id = l.location_id
LEFT JOIN creator_cats cc ON cr.creator_id = cc.creator_id
LEFT JOIN creator_metrics_agg cma ON cr.creator_id = cma.creator_id
LEFT JOIN creator_reviews_agg cra ON cr.user_id = cra.reviewee_id;

-- View: v_collaborations
-- (requests with status accepted or completed, joined to business and creator names)
CREATE OR REPLACE VIEW v_collaborations AS
SELECT
  cr.request_id,
  cr.business_id,
  b.business_name,
  cr.creator_id,
  c.full_name AS creator_name,
  bl.area_name AS business_area,
  bl.taluka AS business_taluka,
  cl.area_name AS creator_area,
  cl.taluka AS creator_taluka,
  cr.collab_type,
  cr.offered_amount,
  cr.offer_details,
  cr.deliverables,
  cr.message,
  cr.status,
  cr.requested_at,
  cr.responded_at,
  cr.deadline
FROM collaboration_requests cr
JOIN businesses b ON cr.business_id = b.business_id
JOIN locations bl ON b.location_id = bl.location_id
JOIN creators c ON cr.creator_id = c.creator_id
JOIN locations cl ON c.location_id = cl.location_id
WHERE cr.status IN ('accepted', 'completed');

-- View: v_category_distribution
CREATE OR REPLACE VIEW v_category_distribution AS
SELECT
  c.category_id,
  c.category_name,
  COUNT(cc.creator_id)::INT AS creator_count,
  COUNT(CASE WHEN cc.is_primary THEN 1 END)::INT AS primary_creator_count,
  ROUND(
    COUNT(cc.creator_id)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM creators), 0),
    2
  ) AS pct_of_creators
FROM categories c
LEFT JOIN creator_categories cc ON c.category_id = cc.category_id
GROUP BY c.category_id, c.category_name
ORDER BY creator_count DESC;

-- View: v_taluka_stats
-- (creator count, business count, avg offered_amount, top category)
CREATE OR REPLACE VIEW v_taluka_stats AS
WITH taluka_creators AS (
  SELECT l.taluka, l.district, COUNT(c.creator_id)::INT AS creator_count
  FROM locations l
  LEFT JOIN creators c ON l.location_id = c.location_id
  GROUP BY l.taluka, l.district
),
taluka_businesses AS (
  SELECT l.taluka, COUNT(b.business_id)::INT AS business_count
  FROM locations l
  LEFT JOIN businesses b ON l.location_id = b.location_id
  GROUP BY l.taluka
),
taluka_deals AS (
  SELECT l.taluka, ROUND(AVG(req.offered_amount)::numeric, 2) AS avg_offered_amount
  FROM locations l
  JOIN businesses b ON l.location_id = b.location_id
  JOIN collaboration_requests req ON b.business_id = req.business_id
  GROUP BY l.taluka
),
taluka_cat_counts AS (
  SELECT
    l.taluka,
    cat.category_name,
    COUNT(*)::INT AS cat_count,
    ROW_NUMBER() OVER (PARTITION BY l.taluka ORDER BY COUNT(*) DESC, cat.category_name ASC) AS rn
  FROM locations l
  JOIN creators cr ON l.location_id = cr.location_id
  JOIN creator_categories cc ON cr.creator_id = cc.creator_id
  JOIN categories cat ON cc.category_id = cat.category_id
  GROUP BY l.taluka, cat.category_name
)
SELECT
  tc.taluka,
  tc.district,
  COALESCE(tc.creator_count, 0) AS creator_count,
  COALESCE(tb.business_count, 0) AS business_count,
  COALESCE(td.avg_offered_amount, 0) AS avg_offered_amount,
  tcc.category_name AS top_category
FROM taluka_creators tc
LEFT JOIN taluka_businesses tb ON tc.taluka = tb.taluka
LEFT JOIN taluka_deals td ON tc.taluka = td.taluka
LEFT JOIN taluka_cat_counts tcc ON tc.taluka = tcc.taluka AND tcc.rn = 1
ORDER BY tc.district, tc.taluka;

-- View: v_monthly_request_velocity
CREATE OR REPLACE VIEW v_monthly_request_velocity AS
SELECT
  to_char(date_trunc('month', requested_at), 'YYYY-MM') AS month,
  COUNT(*)::INT AS total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END)::INT AS pending_count,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END)::INT AS accepted_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT AS completed_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END)::INT AS rejected_count,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INT AS cancelled_count,
  COALESCE(SUM(offered_amount), 0)::BIGINT AS total_offered_amount,
  COALESCE(SUM(CASE WHEN status = 'completed' THEN offered_amount ELSE 0 END), 0)::BIGINT AS completed_offered_amount
FROM collaboration_requests
GROUP BY date_trunc('month', requested_at)
ORDER BY date_trunc('month', requested_at) DESC;

-- View: v_top_creators
-- (completed deals, sum of offered_amount for paid/hybrid, avg rating)
CREATE OR REPLACE VIEW v_top_creators AS
SELECT
  c.creator_id,
  c.user_id,
  c.full_name,
  COUNT(CASE WHEN req.status = 'completed' THEN 1 END)::INT AS completed_deals,
  COALESCE(
    SUM(CASE WHEN req.status = 'completed' AND req.collab_type IN ('paid', 'hybrid') THEN req.offered_amount ELSE 0 END),
    0
  )::BIGINT AS total_earned,
  ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
  COUNT(DISTINCT r.review_id)::INT AS review_count
FROM creators c
LEFT JOIN collaboration_requests req ON c.creator_id = req.creator_id
LEFT JOIN reviews r ON c.user_id = r.reviewee_id
GROUP BY c.creator_id, c.user_id, c.full_name
ORDER BY completed_deals DESC, total_earned DESC, avg_rating DESC NULLS LAST;

-- View: v_top_businesses
CREATE OR REPLACE VIEW v_top_businesses AS
SELECT
  b.business_id,
  b.user_id,
  b.business_name,
  b.industry,
  COUNT(CASE WHEN req.status = 'completed' THEN 1 END)::INT AS completed_deals,
  COALESCE(
    SUM(CASE WHEN req.status = 'completed' AND req.collab_type IN ('paid', 'hybrid') THEN req.offered_amount ELSE 0 END),
    0
  )::BIGINT AS total_spent,
  ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
  COUNT(DISTINCT r.review_id)::INT AS review_count
FROM businesses b
LEFT JOIN collaboration_requests req ON b.business_id = req.business_id
LEFT JOIN reviews r ON b.user_id = r.reviewee_id
GROUP BY b.business_id, b.user_id, b.business_name, b.industry
ORDER BY completed_deals DESC, total_spent DESC, avg_rating DESC NULLS LAST;

-- View: v_admin_kpis
CREATE OR REPLACE VIEW v_admin_kpis AS
SELECT
  (SELECT COUNT(*)::INT FROM users) AS total_users,
  (SELECT COUNT(*)::INT FROM creators) AS total_creators,
  (SELECT COUNT(*)::INT FROM businesses) AS total_businesses,
  (SELECT COUNT(*)::INT FROM users WHERE is_verified = true) AS verified_users,
  (SELECT COUNT(*)::INT FROM collaboration_requests WHERE status = 'pending') AS pending_requests,
  (SELECT COUNT(*)::INT FROM collaboration_requests WHERE status = 'accepted') AS active_collaborations,
  (SELECT COUNT(*)::INT FROM collaboration_requests WHERE status = 'completed') AS completed_collaborations,
  (SELECT COALESCE(SUM(offered_amount), 0)::BIGINT FROM collaboration_requests WHERE status = 'completed' AND collab_type IN ('paid', 'hybrid')) AS total_completed_deal_volume,
  (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews) AS platform_avg_rating,
  (SELECT COUNT(*)::INT FROM audit_log) AS total_audit_entries;

