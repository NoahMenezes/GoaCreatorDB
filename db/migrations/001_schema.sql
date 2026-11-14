-- Migration: 001_schema.sql
-- Description: Enable extensions and create 11 ERD tables + sessions, password_reset_tokens, and audit_log

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. users
CREATE TABLE users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email CITEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT ck_users_role CHECK (role IN ('admin', 'business', 'creator')),
  CONSTRAINT ck_users_is_verified CHECK (is_verified IN (true, false))
);

-- 2. locations
CREATE TABLE locations (
  location_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  area_name TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  CONSTRAINT uq_locations_area_taluka UNIQUE (area_name, taluka),
  CONSTRAINT ck_locations_district CHECK (district IN ('North Goa', 'South Goa'))
);

-- 3. categories
CREATE TABLE categories (
  category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_name TEXT NOT NULL,
  CONSTRAINT uq_categories_category_name UNIQUE (category_name)
);

-- 4. businesses
CREATE TABLE businesses (
  business_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  contact_phone TEXT,
  instagram_handle TEXT,
  CONSTRAINT uq_businesses_user_id UNIQUE (user_id),
  CONSTRAINT fk_businesses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_businesses_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT
);

-- 5. creators
CREATE TABLE creators (
  creator_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  accepts_barter BOOLEAN NOT NULL DEFAULT false,
  min_paid_rate INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_creators_user_id UNIQUE (user_id),
  CONSTRAINT fk_creators_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_creators_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
  CONSTRAINT ck_creators_min_paid_rate CHECK (min_paid_rate >= 0)
);

-- 6. creator_categories
CREATE TABLE creator_categories (
  creator_id INT NOT NULL,
  category_id INT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT pk_creator_categories PRIMARY KEY (creator_id, category_id),
  CONSTRAINT fk_creator_categories_creator FOREIGN KEY (creator_id) REFERENCES creators(creator_id) ON DELETE CASCADE,
  CONSTRAINT fk_creator_categories_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_creator_categories_primary ON creator_categories (creator_id) WHERE is_primary = true;

-- 7. social_accounts
CREATE TABLE social_accounts (
  account_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creator_id INT NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT,
  CONSTRAINT fk_social_accounts_creator FOREIGN KEY (creator_id) REFERENCES creators(creator_id) ON DELETE CASCADE,
  CONSTRAINT ck_social_accounts_platform CHECK (platform IN ('instagram', 'youtube')),
  CONSTRAINT uq_social_accounts_platform_handle UNIQUE (platform, handle),
  CONSTRAINT uq_social_accounts_creator_platform UNIQUE (creator_id, platform)
);

-- 8. creator_metrics
CREATE TABLE creator_metrics (
  metric_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id INT NOT NULL,
  follower_count INT NOT NULL DEFAULT 0,
  avg_likes NUMERIC,
  avg_views NUMERIC,
  avg_comments NUMERIC,
  engagement_rate NUMERIC,
  audience_goa_pct NUMERIC,
  data_source TEXT NOT NULL DEFAULT 'self_reported',
  verified_by INT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_creator_metrics_account FOREIGN KEY (account_id) REFERENCES social_accounts(account_id) ON DELETE CASCADE,
  CONSTRAINT fk_creator_metrics_verified_by FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT uq_creator_metrics_account_recorded UNIQUE (account_id, recorded_at),
  CONSTRAINT ck_creator_metrics_counts CHECK (
    follower_count >= 0 AND
    (avg_likes IS NULL OR avg_likes >= 0) AND
    (avg_views IS NULL OR avg_views >= 0) AND
    (avg_comments IS NULL OR avg_comments >= 0)
  ),
  CONSTRAINT ck_creator_metrics_rates CHECK (
    (engagement_rate IS NULL OR (engagement_rate >= 0 AND engagement_rate <= 100)) AND
    (audience_goa_pct IS NULL OR (audience_goa_pct >= 0 AND audience_goa_pct <= 100))
  ),
  CONSTRAINT ck_creator_metrics_data_source CHECK (data_source IN ('self_reported', 'admin_verified')),
  CONSTRAINT ck_creator_metrics_verified_source CHECK ((data_source = 'admin_verified') = (verified_by IS NOT NULL))
);

-- 9. collaboration_requests
CREATE TABLE collaboration_requests (
  request_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id INT NOT NULL,
  creator_id INT NOT NULL,
  collab_type TEXT NOT NULL,
  offered_amount INT NOT NULL DEFAULT 0,
  offer_details TEXT,
  deliverables TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  deadline DATE NOT NULL,
  CONSTRAINT fk_collab_requests_business FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  CONSTRAINT fk_collab_requests_creator FOREIGN KEY (creator_id) REFERENCES creators(creator_id) ON DELETE CASCADE,
  CONSTRAINT ck_requests_collab_type CHECK (collab_type IN ('paid', 'barter', 'hybrid')),
  CONSTRAINT ck_requests_status CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  CONSTRAINT ck_requests_amount CHECK (offered_amount >= 0 AND (collab_type NOT IN ('paid', 'hybrid') OR offered_amount > 0))
);

CREATE UNIQUE INDEX uq_requests_pending_pair ON collaboration_requests (business_id, creator_id) WHERE status = 'pending';

-- 10. reviews
CREATE TABLE reviews (
  review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_reviews_request FOREIGN KEY (request_id) REFERENCES collaboration_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT ck_reviews_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT ck_reviews_different_parties CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT uq_reviews_request_reviewer UNIQUE (request_id, reviewer_id)
);

-- 11. shortlists
CREATE TABLE shortlists (
  business_id INT NOT NULL,
  creator_id INT NOT NULL,
  note TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_shortlists PRIMARY KEY (business_id, creator_id),
  CONSTRAINT fk_shortlists_business FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  CONSTRAINT fk_shortlists_creator FOREIGN KEY (creator_id) REFERENCES creators(creator_id) ON DELETE CASCADE
);

-- 12. sessions
CREATE TABLE sessions (
  session_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token TEXT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uq_sessions_token UNIQUE (token),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 13. password_reset_tokens
CREATE TABLE password_reset_tokens (
  token_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  CONSTRAINT uq_password_reset_tokens_hash UNIQUE (token_hash),
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. audit_log
CREATE TABLE audit_log (
  log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by INT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_audit_log_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

