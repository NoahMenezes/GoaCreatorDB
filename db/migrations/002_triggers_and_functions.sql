-- Migration: 002_triggers_and_functions.sql
-- Description: PL/pgSQL triggers, validation guards, state machine functions, and rule-based trust score

-- ============================================================================
-- 1. set_updated_at on users
-- Rule: Automatically updates updated_at column to current timestamp whenever a user row is updated.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 2. Request status transitions, deadline validation, and terms immutability
-- Rules:
--   - On INSERT: deadline must be in the future (strictly greater than CURRENT_DATE).
--   - On INSERT: initial status must be 'pending'.
--   - Valid status transitions:
--       pending -> accepted | rejected | cancelled
--       accepted -> completed | cancelled
--       All other transitions are forbidden and raise clear exceptions.
--   - Set responded_at automatically on accept or reject if not already set.
--   - Once a request leaves pending, its terms (offered_amount, deliverables, deadline, collab_type) are immutable.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_collab_request_guard()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.deadline <= CURRENT_DATE THEN
      RAISE EXCEPTION 'Deadline must be in the future (received deadline: %, current date: %)', NEW.deadline, CURRENT_DATE;
    END IF;

    IF NEW.status <> 'pending' THEN
      RAISE EXCEPTION 'New collaboration requests must be created in pending status (received: %)', NEW.status;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Check status transition validity
    IF OLD.status <> NEW.status THEN
      IF OLD.status = 'pending' THEN
        IF NEW.status NOT IN ('accepted', 'rejected', 'cancelled') THEN
          RAISE EXCEPTION 'Invalid status transition: pending cannot transition to %', NEW.status;
        END IF;

        IF NEW.status IN ('accepted', 'rejected') AND NEW.responded_at IS NULL THEN
          NEW.responded_at := now();
        END IF;

      ELSIF OLD.status = 'accepted' THEN
        IF NEW.status NOT IN ('completed', 'cancelled') THEN
          RAISE EXCEPTION 'Invalid status transition: accepted cannot transition to %', NEW.status;
        END IF;

      ELSE
        RAISE EXCEPTION 'Cannot transition request from terminal status % to %', OLD.status, NEW.status;
      END IF;
    END IF;

    -- Terms immutability rule: Once a request leaves pending, terms cannot change
    IF (OLD.status <> 'pending' OR NEW.status <> 'pending') THEN
      IF (NEW.offered_amount <> OLD.offered_amount) OR
         (NEW.deliverables IS DISTINCT FROM OLD.deliverables) OR
         (NEW.deadline <> OLD.deadline) OR
         (NEW.collab_type <> OLD.collab_type) THEN
        RAISE EXCEPTION 'Request terms (offered_amount, deliverables, deadline, collab_type) are immutable once request leaves pending';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collab_request_guard
BEFORE INSERT OR UPDATE ON collaboration_requests
FOR EACH ROW
EXECUTE FUNCTION fn_collab_request_guard();

-- ============================================================================
-- 3. Reviews: Allowed only when request status is completed, and parties match
-- Rule: Reviews can only be submitted for completed requests. Reviewer and reviewee
--       must be exactly the two user_ids representing the business and creator of that request.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_reviews_guard()
RETURNS TRIGGER AS $$
DECLARE
  v_req RECORD;
BEGIN
  SELECT
    cr.status,
    b.user_id AS business_user_id,
    c.user_id AS creator_user_id
  INTO v_req
  FROM collaboration_requests cr
  JOIN businesses b ON cr.business_id = b.business_id
  JOIN creators c ON cr.creator_id = c.creator_id
  WHERE cr.request_id = NEW.request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collaboration request % does not exist', NEW.request_id;
  END IF;

  IF v_req.status <> 'completed' THEN
    RAISE EXCEPTION 'Reviews are permitted only for completed requests (current status: %)', v_req.status;
  END IF;

  IF NOT (
    (NEW.reviewer_id = v_req.business_user_id AND NEW.reviewee_id = v_req.creator_user_id) OR
    (NEW.reviewer_id = v_req.creator_user_id AND NEW.reviewee_id = v_req.business_user_id)
  ) THEN
    RAISE EXCEPTION 'Reviewer (user %) and reviewee (user %) must be exactly the business and creator parties (users % and %)',
      NEW.reviewer_id, NEW.reviewee_id, v_req.business_user_id, v_req.creator_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_guard
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION fn_reviews_guard();

-- ============================================================================
-- 4. creator_metrics.verified_by admin role verification
-- Rule: creator_metrics.verified_by must reference a user whose role is 'admin'.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_creator_metrics_admin_check()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF NEW.verified_by IS NOT NULL THEN
    SELECT role INTO v_role FROM users WHERE user_id = NEW.verified_by;
    IF v_role IS NULL OR v_role <> 'admin' THEN
      RAISE EXCEPTION 'creator_metrics.verified_by must reference a user with role admin (user % has role %)',
        NEW.verified_by, COALESCE(v_role, 'non-existent');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_creator_metrics_admin_check
BEFORE INSERT OR UPDATE ON creator_metrics
FOR EACH ROW
EXECUTE FUNCTION fn_creator_metrics_admin_check();

-- ============================================================================
-- 5. Generic audit trigger
-- Rule: Writes audit entries on INSERT, UPDATE, and DELETE for users, collaboration_requests,
--       creator_metrics, and reviews. Reads the current actor user ID from
--       current_setting('app.user_id', true) and logs OLD/NEW states as jsonb.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_str TEXT;
  v_actor_id INT;
  v_record_id INT;
  v_old_data JSONB := NULL;
  v_new_data JSONB := NULL;
BEGIN
  BEGIN
    v_actor_str := current_setting('app.user_id', true);
    IF v_actor_str IS NOT NULL AND v_actor_str ~ '^\d+$' THEN
      v_actor_id := v_actor_str::INT;
    ELSE
      v_actor_id := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    CASE TG_TABLE_NAME
      WHEN 'users' THEN v_record_id := NEW.user_id;
      WHEN 'collaboration_requests' THEN v_record_id := NEW.request_id;
      WHEN 'creator_metrics' THEN v_record_id := NEW.metric_id;
      WHEN 'reviews' THEN v_record_id := NEW.review_id;
      ELSE v_record_id := 0;
    END CASE;

    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at)
    VALUES (TG_TABLE_NAME, v_record_id, 'INSERT', NULL, v_new_data, v_actor_id, now());

    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    CASE TG_TABLE_NAME
      WHEN 'users' THEN v_record_id := NEW.user_id;
      WHEN 'collaboration_requests' THEN v_record_id := NEW.request_id;
      WHEN 'creator_metrics' THEN v_record_id := NEW.metric_id;
      WHEN 'reviews' THEN v_record_id := NEW.review_id;
      ELSE v_record_id := 0;
    END CASE;

    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at)
    VALUES (TG_TABLE_NAME, v_record_id, 'UPDATE', v_old_data, v_new_data, v_actor_id, now());

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    CASE TG_TABLE_NAME
      WHEN 'users' THEN v_record_id := OLD.user_id;
      WHEN 'collaboration_requests' THEN v_record_id := OLD.request_id;
      WHEN 'creator_metrics' THEN v_record_id := OLD.metric_id;
      WHEN 'reviews' THEN v_record_id := OLD.review_id;
      ELSE v_record_id := 0;
    END CASE;

    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at)
    VALUES (TG_TABLE_NAME, v_record_id, 'DELETE', v_old_data, NULL, v_actor_id, now());

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_collab_requests
AFTER INSERT OR UPDATE OR DELETE ON collaboration_requests
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_creator_metrics
AFTER INSERT OR UPDATE OR DELETE ON creator_metrics
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_reviews
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================================
-- 6. State Machine API Functions (D14)
-- ============================================================================

-- Rule: Creator responds to request (accept or reject). Locks row with FOR UPDATE,
--       verifies caller is the assigned creator, ensures status is pending, updates status and sets responded_at.
CREATE OR REPLACE FUNCTION fn_respond_to_request(
  p_request_id INT,
  p_creator_id INT,
  p_action TEXT
)
RETURNS collaboration_requests AS $$
DECLARE
  v_req collaboration_requests;
  v_target_status TEXT;
BEGIN
  IF p_action NOT IN ('accept', 'reject') THEN
    RAISE EXCEPTION 'Invalid response action: %. Allowed actions are accept or reject', p_action;
  END IF;

  SELECT * INTO v_req
  FROM collaboration_requests
  WHERE request_id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collaboration request % not found', p_request_id;
  END IF;

  IF v_req.creator_id <> p_creator_id THEN
    RAISE EXCEPTION 'Unauthorized: only assigned creator (creator_id %) can respond to request %', v_req.creator_id, p_request_id;
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Cannot respond to request in status: % (must be pending)', v_req.status;
  END IF;

  v_target_status := CASE p_action
    WHEN 'accept' THEN 'accepted'
    WHEN 'reject' THEN 'rejected'
  END;

  UPDATE collaboration_requests
  SET status = v_target_status,
      responded_at = now()
  WHERE request_id = p_request_id
  RETURNING * INTO v_req;

  RETURN v_req;
END;
$$ LANGUAGE plpgsql;

-- Rule: Business marks request as completed. Locks row with FOR UPDATE,
--       verifies caller is the requesting business, ensures status is accepted, updates status to completed.
CREATE OR REPLACE FUNCTION fn_complete_request(
  p_request_id INT,
  p_business_id INT
)
RETURNS collaboration_requests AS $$
DECLARE
  v_req collaboration_requests;
BEGIN
  SELECT * INTO v_req
  FROM collaboration_requests
  WHERE request_id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collaboration request % not found', p_request_id;
  END IF;

  IF v_req.business_id <> p_business_id THEN
    RAISE EXCEPTION 'Unauthorized: only requesting business (business_id %) can complete request %', v_req.business_id, p_request_id;
  END IF;

  IF v_req.status <> 'accepted' THEN
    RAISE EXCEPTION 'Cannot complete request in status: % (must be accepted)', v_req.status;
  END IF;

  UPDATE collaboration_requests
  SET status = 'completed'
  WHERE request_id = p_request_id
  RETURNING * INTO v_req;

  RETURN v_req;
END;
$$ LANGUAGE plpgsql;

-- Rule: Cancel request enforcing D14 actor rules:
--       - Business can cancel from pending (withdraw) or accepted.
--       - Creator can cancel from accepted only (in pending, creator must reject, cannot cancel).
--       - Locks row with FOR UPDATE.
CREATE OR REPLACE FUNCTION fn_cancel_request(
  p_request_id INT,
  p_user_id INT
)
RETURNS collaboration_requests AS $$
DECLARE
  v_req collaboration_requests;
  v_biz_user_id INT;
  v_creator_user_id INT;
BEGIN
  SELECT * INTO v_req
  FROM collaboration_requests
  WHERE request_id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collaboration request % not found', p_request_id;
  END IF;

  SELECT b.user_id INTO v_biz_user_id
  FROM businesses b
  WHERE b.business_id = v_req.business_id;

  SELECT c.user_id INTO v_creator_user_id
  FROM creators c
  WHERE c.creator_id = v_req.creator_id;

  IF p_user_id <> v_biz_user_id AND p_user_id <> v_creator_user_id THEN
    RAISE EXCEPTION 'Unauthorized: user % is not a party to collaboration request %', p_user_id, p_request_id;
  END IF;

  IF p_user_id = v_biz_user_id THEN
    IF v_req.status NOT IN ('pending', 'accepted') THEN
      RAISE EXCEPTION 'Business cannot cancel request in status: % (must be pending or accepted)', v_req.status;
    END IF;
  ELSIF p_user_id = v_creator_user_id THEN
    IF v_req.status <> 'accepted' THEN
      RAISE EXCEPTION 'Creator cannot cancel request in status: % (creator can cancel accepted requests only; reject pending requests)', v_req.status;
    END IF;
  END IF;

  UPDATE collaboration_requests
  SET status = 'cancelled'
  WHERE request_id = p_request_id
  RETURNING * INTO v_req;

  RETURN v_req;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Rule-Based Trust Score Function
-- Rule: Computes a deterministic 0-100 credibility score based on:
--       - Profile completeness (max 25 pts)
--       - Social account presence (max 20 pts)
--       - Plausible engagement rate for follower tier (max 20 pts)
--       - Average views to followers organic ratio (max 20 pts)
--       - Account age & identity verification (max 15 pts)
--       THIS IS STRICTLY RULE-BASED LOGIC (NOT AI / NOT ML).
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trust_score(p_user_id INT)
RETURNS INT AS $$
DECLARE
  v_user RECORD;
  v_creator RECORD;
  v_category_count INT := 0;
  v_social_count INT := 0;
  v_has_profile_url BOOLEAN := false;
  v_followers INT := 0;
  v_er NUMERIC := 0;
  v_views NUMERIC := 0;
  v_view_ratio NUMERIC := 0;
  v_account_age_days INT := 0;
  v_score INT := 0;
BEGIN
  -- Verify user exists
  SELECT * INTO v_user FROM users WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Verify creator profile exists
  SELECT * INTO v_creator FROM creators WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    -- Non-creator users or incomplete accounts receive basic baseline
    IF v_user.is_verified THEN
      RETURN 20;
    ELSE
      RETURN 10;
    END IF;
  END IF;

  -- --------------------------------------------------------------------------
  -- Pillar 1: Profile Completeness (max 25 points)
  -- --------------------------------------------------------------------------
  -- +5 pts: Creator record exists
  v_score := v_score + 5;

  -- +5 pts: Full name >= 3 chars
  IF LENGTH(TRIM(v_creator.full_name)) >= 3 THEN
    v_score := v_score + 5;
  END IF;

  -- +5 pts: Bio length >= 20 chars
  IF v_creator.bio IS NOT NULL AND LENGTH(TRIM(v_creator.bio)) >= 20 THEN
    v_score := v_score + 5;
  END IF;

  -- +5 pts: Location assigned
  IF v_creator.location_id IS NOT NULL THEN
    v_score := v_score + 5;
  END IF;

  -- +5 pts: At least one category tagged
  SELECT COUNT(*) INTO v_category_count
  FROM creator_categories
  WHERE creator_id = v_creator.creator_id;

  IF v_category_count > 0 THEN
    v_score := v_score + 5;
  END IF;

  -- --------------------------------------------------------------------------
  -- Pillar 2: Social Account & Link Presence (max 20 points)
  -- --------------------------------------------------------------------------
  SELECT
    COUNT(*),
    BOOL_OR(profile_url IS NOT NULL AND profile_url <> '')
  INTO v_social_count, v_has_profile_url
  FROM social_accounts
  WHERE creator_id = v_creator.creator_id;

  IF v_social_count >= 1 THEN
    v_score := v_score + 10;
  END IF;

  IF v_social_count >= 2 THEN
    v_score := v_score + 5;
  END IF;

  IF COALESCE(v_has_profile_url, false) THEN
    v_score := v_score + 5;
  END IF;

  -- --------------------------------------------------------------------------
  -- Retrieve latest metrics across accounts for Pillars 3 & 4
  -- --------------------------------------------------------------------------
  SELECT
    COALESCE(SUM(lm.follower_count), 0)::INT,
    COALESCE(AVG(lm.engagement_rate), 0),
    COALESCE(AVG(lm.avg_views), 0)
  INTO v_followers, v_er, v_views
  FROM social_accounts sa
  JOIN LATERAL (
    SELECT follower_count, engagement_rate, avg_views
    FROM creator_metrics cm
    WHERE cm.account_id = sa.account_id
    ORDER BY recorded_at DESC
    LIMIT 1
  ) lm ON true
  WHERE sa.creator_id = v_creator.creator_id;

  -- --------------------------------------------------------------------------
  -- Pillar 3: Engagement Rate Plausibility for Follower Tier (max 20 points)
  -- --------------------------------------------------------------------------
  IF v_social_count = 0 OR v_followers = 0 THEN
    -- Baseline for new creator without published metrics yet
    v_score := v_score + 10;
  ELSIF v_followers < 10000 THEN
    -- Nano: normal ER is 2.0% - 12.0%
    IF v_er >= 2.0 AND v_er <= 12.0 THEN
      v_score := v_score + 20;
    ELSIF v_er >= 1.0 AND v_er <= 15.0 THEN
      v_score := v_score + 12;
    ELSE
      v_score := v_score + 5;
    END IF;
  ELSIF v_followers < 50000 THEN
    -- Micro: normal ER is 1.5% - 8.0%
    IF v_er >= 1.5 AND v_er <= 8.0 THEN
      v_score := v_score + 20;
    ELSIF v_er >= 1.0 AND v_er <= 10.0 THEN
      v_score := v_score + 12;
    ELSE
      v_score := v_score + 5;
    END IF;
  ELSIF v_followers < 500000 THEN
    -- Mid-tier: normal ER is 1.0% - 5.0%
    IF v_er >= 1.0 AND v_er <= 5.0 THEN
      v_score := v_score + 20;
    ELSIF v_er >= 0.5 AND v_er <= 7.0 THEN
      v_score := v_score + 12;
    ELSE
      v_score := v_score + 5;
    END IF;
  ELSE
    -- Macro (> 500k): normal ER is 0.8% - 3.5%
    IF v_er >= 0.8 AND v_er <= 3.5 THEN
      v_score := v_score + 20;
    ELSIF v_er >= 0.4 AND v_er <= 5.0 THEN
      v_score := v_score + 12;
    ELSE
      v_score := v_score + 5;
    END IF;
  END IF;

  -- --------------------------------------------------------------------------
  -- Pillar 4: Avg Views to Followers Organic Ratio (max 20 points)
  -- --------------------------------------------------------------------------
  IF v_followers = 0 OR v_views = 0 THEN
    -- Baseline if views not tracked yet
    v_score := v_score + 10;
  ELSE
    v_view_ratio := v_views / v_followers::NUMERIC;
    IF v_view_ratio >= 0.05 AND v_view_ratio <= 1.5 THEN
      -- Organic view reach (5% to 150% of followers)
      v_score := v_score + 20;
    ELSIF (v_view_ratio >= 0.01 AND v_view_ratio < 0.05) OR (v_view_ratio > 1.5 AND v_view_ratio <= 3.0) THEN
      -- Acceptable reach
      v_score := v_score + 10;
    ELSE
      -- Highly unnatural / bot traffic (< 1% or > 300%)
      v_score := v_score + 0;
    END IF;
  END IF;

  -- --------------------------------------------------------------------------
  -- Pillar 5: Account Age & Identity Verification (max 15 points)
  -- --------------------------------------------------------------------------
  v_account_age_days := GREATEST(0, EXTRACT(DAY FROM (now() - v_user.created_at))::INT);

  IF v_account_age_days >= 90 THEN
    v_score := v_score + 10;
  ELSIF v_account_age_days >= 30 THEN
    v_score := v_score + 7;
  ELSE
    v_score := v_score + 4;
  END IF;

  IF v_user.is_verified THEN
    v_score := v_score + 5;
  END IF;

  -- Ensure score is capped strictly between 0 and 100
  RETURN LEAST(100, GREATEST(0, v_score));
END;
$$ LANGUAGE plpgsql;
