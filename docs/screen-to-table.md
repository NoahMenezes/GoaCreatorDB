# GoaConnect Screen-to-Table Mapping Reference

> **Complete Page, Endpoint, and Relational Database Matrix**  
> *Mapping every user interface screen to its API endpoints and database read/write dependencies.*

---

## 1. Summary Matrix

| Page Route | Primary API Endpoint(s) | Tables / Views Read | Tables Written | Operation Types |
|---|---|---|---|---|
| **`/` (Landing Page)** | `GET /api/stats/public`<br>`GET /api/creators/featured`<br>`GET /api/categories`<br>`GET /api/locations` | `v_creator_cards`<br>`v_collaborations`<br>`v_category_distribution`<br>`creators`, `businesses`, `locations` | None | Read-only |
| **`/login` (Sign In)** | `POST /api/auth/login`<br>`GET /api/auth/me` | `users`<br>`businesses`<br>`creators`<br>`sessions` | `sessions`<br>`audit_log` | `INSERT` (sessions) |
| **`/register/business`** | `GET /api/taxonomy`<br>`POST /api/auth/register` | `locations`<br>`categories`<br>`users` | `users`<br>`businesses`<br>`audit_log` | `INSERT` (in 1 transaction) |
| **`/register/creator` / `/join`** | `GET /api/taxonomy`<br>`POST /api/auth/register` | `locations`<br>`categories`<br>`users` | `users`<br>`creators`<br>`creator_categories`<br>`social_accounts`<br>`creator_metrics`<br>`audit_log` | `INSERT` (in 1 transaction) |
| **`/forgot-password`** | `POST /api/auth/forgot-password` | `users`<br>`password_reset_tokens` | `password_reset_tokens` | `INSERT` (token hash) |
| **`/reset-password`** | `POST /api/auth/reset-password` | `password_reset_tokens`<br>`users` | `users`<br>`password_reset_tokens`<br>`sessions`<br>`audit_log` | `UPDATE` (password_hash, used_at)<br>`DELETE` (invalidated sessions) |
| **`/creators/[id]` (Public Creator)** | `GET /api/creators/[id]` | `v_creator_cards`<br>`creators`<br>`locations`<br>`creator_categories`<br>`categories`<br>`social_accounts`<br>`creator_metrics`<br>`reviews` | None | Read-only |
| **`/business/dashboard`** | `GET /api/dashboard/stats`<br>`GET /api/requests?limit=5`<br>`GET /api/shortlist`<br>`GET /api/auth/me` | `businesses`<br>`v_collaborations`<br>`collaboration_requests`<br>`shortlists`<br>`v_creator_cards`<br>`reviews` | None | Read-only |
| **`/business/discover`** | `GET /api/creators`<br>`GET /api/taxonomy`<br>`GET /api/shortlist`<br>`PUT /api/shortlist/[id]`<br>`DELETE /api/shortlist/[id]`<br>`POST /api/requests` | `v_creator_cards`<br>`categories`<br>`locations`<br>`shortlists` | `shortlists`<br>`collaboration_requests`<br>`audit_log` | `INSERT`, `DELETE` (shortlists)<br>`INSERT` (requests) |
| **`/business/shortlist`** | `GET /api/shortlist`<br>`DELETE /api/shortlist/[id]` | `shortlists`<br>`v_creator_cards`<br>`businesses` | `shortlists`<br>`audit_log` | `DELETE` (shortlists) |
| **`/business/requests`** | `GET /api/requests`<br>`PATCH /api/requests/[id]` | `collaboration_requests`<br>`v_collaborations`<br>`creators`<br>`businesses` | `collaboration_requests`<br>`audit_log` | `UPDATE` (`fn_complete_request`, `fn_cancel_request`) |
| **`/business/reviews`** | `GET /api/reviews?filter=given`<br>`GET /api/requests?status=completed`<br>`POST /api/reviews` | `reviews`<br>`collaboration_requests`<br>`creators`<br>`businesses` | `reviews`<br>`audit_log` | `INSERT` (reviews) |
| **`/business/profile`** | `GET /api/profile`<br>`PUT /api/profile` | `businesses`<br>`locations`<br>`users` | `businesses`<br>`audit_log` | `UPDATE` (businesses) |
| **Global Collab Modal (`/business/*`)** | `GET /api/creators?limit=20`<br>`POST /api/requests` | `creators`<br>`businesses`<br>`collaboration_requests` | `collaboration_requests`<br>`audit_log` | `INSERT` (requests) |
| **`/creator/dashboard`** | `GET /api/dashboard/stats`<br>`GET /api/requests?limit=5`<br>`GET /api/notifications`<br>`GET /api/auth/me` | `creators`<br>`v_collaborations`<br>`collaboration_requests`<br>`creator_metrics`<br>`reviews`<br>`users` | None | Read-only |
| **`/creator/requests`** | `GET /api/requests`<br>`PATCH /api/requests/[id]` | `collaboration_requests`<br>`businesses`<br>`locations` | `collaboration_requests`<br>`audit_log` | `UPDATE` (`fn_respond_to_request`, `fn_cancel_request`) |
| **`/creator/collaborations`** | `GET /api/collaborations`<br>`GET /api/collaborations/[id]` | `v_collaborations`<br>`collaboration_requests`<br>`businesses`<br>`creators` | None | Read-only |
| **`/creator/reviews`** | `GET /api/reviews?filter=received` | `reviews`<br>`collaboration_requests`<br>`businesses` | None | Read-only |
| **`/creator/profile`** | `GET /api/profile`<br>`PUT /api/profile` | `creators`<br>`creator_categories`<br>`categories`<br>`locations`<br>`users` | `creators`<br>`creator_categories`<br>`audit_log` | `UPDATE` (creators)<br>`DELETE` & `INSERT` (creator_categories in 1 transaction) |
| **`/creator/social`** | `GET /api/social/accounts`<br>`POST /api/social/accounts`<br>`DELETE /api/social/accounts`<br>`GET /api/social/metrics`<br>`POST /api/social/sync` | `social_accounts`<br>`creator_metrics`<br>`creators` | `social_accounts`<br>`creator_metrics`<br>`audit_log` | `INSERT`, `DELETE` (social_accounts)<br>`INSERT` (creator_metrics) |
| **`/admin` (Admin Control Center)** | `GET /api/dashboard/stats`<br>`GET /api/admin/verifications`<br>`POST /api/admin/verifications`<br>`GET /api/admin/users`<br>`PATCH /api/admin/users`<br>`DELETE /api/admin/users` | `v_admin_kpis`<br>`v_monthly_request_velocity`<br>`v_category_distribution`<br>`v_taluka_stats`<br>`v_top_creators`<br>`users`<br>`creator_metrics`<br>`audit_log` | `users`<br>`creator_metrics`<br>`audit_log` | `UPDATE` (users.is_verified, metrics.data_source)<br>`DELETE` (users) |

---

## 2. Detailed Page Breakdowns

### 2.1 Public Pages

#### 1. Landing Page (`/`)
- **Component**: `app/page.tsx`, `components/hero-section-2.tsx`
- **Endpoints**:
  - `GET /api/stats/public`: Reads counts from `creators`, `businesses`, and `collaboration_requests` (where status is `completed`).
  - `GET /api/creators/featured`: Reads verified creators from `v_creator_cards` ordered by `total_followers DESC LIMIT 6`.
  - `GET /api/categories`: Reads all active rows from `categories`.
  - `GET /api/locations`: Reads all Goan locations grouped by district and taluka.
- **Tables Read**: `v_creator_cards`, `categories`, `locations`, `collaboration_requests`, `creators`, `businesses`.
- **Tables Written**: None.

#### 2. Sign In (`/login`)
- **Component**: `app/login/page.tsx`
- **Endpoints**:
  - `POST /api/auth/login`: Authenticates credentials with bcrypt against `users`, then loads role profile from `businesses` or `creators`. Inserts a new row into `sessions`.
  - `GET /api/auth/me`: Reads session validity and user profile.
- **Tables Read**: `users`, `businesses`, `creators`, `sessions`.
- **Tables Written**: `sessions` (INSERT `token`, `user_id`, `expires_at`).

#### 3. Business Registration (`/register/business`)
- **Component**: `app/register/business/page.tsx`
- **Endpoints**:
  - `GET /api/taxonomy`: Reads `locations` and `categories` to populate dropdowns.
  - `POST /api/auth/register`: Runs in a single ACID transaction (`withTransaction`):
    1. Inserts row into `users` (`email`, `password_hash`, `role = 'business'`).
    2. Inserts row into `businesses` (`user_id`, `location_id`, `business_name`, `industry`, `description`, `contact_phone`, `instagram_handle`).
    3. Triggers write to `audit_log`.
- **Tables Read**: `locations`, `categories`, `users`.
- **Tables Written**: `users`, `businesses`, `audit_log`.

#### 4. Creator Registration (`/register/creator` / `/join`)
- **Component**: `app/join/page.tsx`
- **Endpoints**:
  - `GET /api/taxonomy`: Reads `locations` and `categories`.
  - `POST /api/auth/register`: Runs in a single transaction:
    1. Inserts row into `users` (`role = 'creator'`).
    2. Inserts row into `creators` (`user_id`, `location_id`, `full_name`, `min_paid_rate`, `accepts_barter`).
    3. Inserts row into `creator_categories` with `is_primary = true`.
    4. Optional: inserts row into `social_accounts` and initial `creator_metrics` snapshot.
- **Tables Read**: `locations`, `categories`, `users`.
- **Tables Written**: `users`, `creators`, `creator_categories`, `social_accounts`, `creator_metrics`, `audit_log`.

---

### 2.2 Business Portal Pages

#### 5. Business Dashboard (`/business/dashboard`)
- **Component**: `app/business/dashboard/page.tsx`
- **Endpoints**:
  - `GET /api/dashboard/stats`: Aggregates active deals, spend, pending requests from `collaboration_requests` and `v_collaborations`.
  - `GET /api/requests?limit=5`: Reads recent incoming/outgoing proposals.
  - `GET /api/shortlist`: Reads current shortlisted creators.
- **Tables Read**: `businesses`, `collaboration_requests`, `v_collaborations`, `shortlists`, `v_creator_cards`, `reviews`.
- **Tables Written**: None.

#### 6. Business Creator Discovery (`/business/discover`)
- **Component**: `components/portal/discover-view.tsx`
- **Endpoints**:
  - `GET /api/creators`: Multi-faceted trigram query on `v_creator_cards` with filters for `q`, `category`, `district`, `taluka`, `minFollowers`, `maxFollowers`, `minEngagement`, `collabType`, `maxRate`, `verifiedOnly`, `sort`, `page`, and `limit`.
  - `PUT /api/shortlist/[creatorId]`: Inserts into `shortlists` (`business_id`, `creator_id`, `saved_at`).
  - `DELETE /api/shortlist/[creatorId]`: Deletes from `shortlists`.
  - `POST /api/requests` (via New Request modal): Creates a collaboration request.
- **Tables Read**: `v_creator_cards`, `categories`, `locations`, `shortlists`.
- **Tables Written**: `shortlists`, `collaboration_requests`, `audit_log`.

#### 7. Business Requests Management (`/business/requests`)
- **Component**: `app/business/requests/page.tsx`
- **Endpoints**:
  - `GET /api/requests`: Scoped to `business_id` from session; reads from `collaboration_requests` joined with `creators`.
  - `PATCH /api/requests/[id]`:
    - `action: complete` calls stored function `fn_complete_request(request_id, business_user_id)`.
    - `action: cancel` calls stored function `fn_cancel_request(request_id, user_id)`.
- **Tables Read**: `collaboration_requests`, `v_collaborations`, `creators`, `businesses`.
- **Tables Written**: `collaboration_requests` (`status`, `responded_at`), `audit_log`.

#### 8. Business Reviews (`/business/reviews`)
- **Component**: `app/business/reviews/page.tsx`
- **Endpoints**:
  - `GET /api/reviews?filter=given`: Reads reviews authored by the business from `reviews` joined with `collaboration_requests` and `creators`.
  - `GET /api/requests?status=completed`: Fetches completed collaborations awaiting review.
  - `POST /api/reviews`: Validates completion, inserts into `reviews` (`request_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`). Guarded by `trg_reviews_guard`.
- **Tables Read**: `reviews`, `collaboration_requests`, `creators`, `businesses`.
- **Tables Written**: `reviews`, `audit_log`.

---

### 2.3 Creator Portal Pages

#### 9. Creator Dashboard (`/creator/dashboard`)
- **Component**: `app/creator/dashboard/page.tsx`
- **Endpoints**:
  - `GET /api/dashboard/stats`: Computes earnings, pending requests, average ratings, and profile completeness score.
  - `GET /api/requests?limit=5`: Fetches received collaboration requests.
  - `GET /api/notifications`: Dynamically computes notification feed from request updates.
- **Tables Read**: `creators`, `v_collaborations`, `collaboration_requests`, `creator_metrics`, `reviews`, `users`.
- **Tables Written**: None.

#### 10. Creator Requests Management (`/creator/requests`)
- **Component**: `app/creator/requests/page.tsx`
- **Endpoints**:
  - `GET /api/requests`: Scoped to `creator_id` from session; reads received requests with business details. Note: business `contact_phone` is masked as `NULL` while status is `'pending'`.
  - `PATCH /api/requests/[id]`:
    - `action: accept` or `reject` calls stored function `fn_respond_to_request(request_id, creator_user_id, action)`.
    - `action: cancel` calls stored function `fn_cancel_request(request_id, user_id)`.
- **Tables Read**: `collaboration_requests`, `businesses`, `locations`.
- **Tables Written**: `collaboration_requests` (`status`, `responded_at`), `audit_log`.

#### 11. Creator Collaborations (`/creator/collaborations`)
- **Component**: `app/creator/collaborations/page.tsx`
- **Endpoints**:
  - `GET /api/collaborations`: Reads active and completed engagements directly from `v_collaborations`.
  - `GET /api/collaborations/[id]`: Reads single deal details.
- **Tables Read**: `v_collaborations`, `collaboration_requests`, `businesses`, `creators`.
- **Tables Written**: None.

#### 12. Creator Social & Metrics Hub (`/creator/social`)
- **Component**: `app/creator/social/page.tsx`
- **Endpoints**:
  - `GET /api/social/accounts`: Lists creator's connected social accounts from `social_accounts`.
  - `POST /api/social/accounts`: Links a new Instagram or YouTube handle (`INSERT INTO social_accounts`).
  - `DELETE /api/social/accounts`: Deletes connected social account (`DELETE FROM social_accounts WHERE account_id = $1`). Enforces strict creator ownership.
  - `GET /api/social/metrics`: Reads historical metric snapshots for owner's accounts.
  - `POST /api/social/sync`: Appends a new self-reported metrics snapshot into `creator_metrics`.
- **Tables Read**: `social_accounts`, `creator_metrics`, `creators`.
- **Tables Written**: `social_accounts` (INSERT, DELETE), `creator_metrics` (INSERT), `audit_log`.

---

### 2.4 Admin Portal Pages

#### 13. Admin Overview & Control Center (`/admin`)
- **Component**: `app/admin/page.tsx`
- **Endpoints**:
  - `GET /api/dashboard/stats`: Reads overall KPIs from `v_admin_kpis`.
  - `GET /api/admin/verifications?type=accounts`: Reads unverified users with calculated `fn_trust_score(user_id)` and risk badges.
  - `GET /api/admin/verifications?type=metrics`: Reads self-reported creator metrics snapshots awaiting admin certification.
  - `POST /api/admin/verifications`:
    - Approving an account sets `users.is_verified = true`.
    - Approving a metric sets `creator_metrics.data_source = 'admin_verified'` and `verified_by = admin_user_id`.
    - Rejecting leaves records unchanged and writes review notes into `audit_log`.
- **Tables Read**: `v_admin_kpis`, `v_monthly_request_velocity`, `v_category_distribution`, `v_taluka_stats`, `v_top_creators`, `users`, `creator_metrics`, `audit_log`.
- **Tables Written**: `users` (UPDATE `is_verified`), `creator_metrics` (UPDATE `data_source`, `verified_by`), `audit_log` (INSERT).

