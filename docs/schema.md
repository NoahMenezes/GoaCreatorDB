# GoaConnect Database Schema Specification & Data Dictionary

> **PostgreSQL 16 Relational Architecture Documentation**  
> *Target System: GoaConnect Creator Collaboration Platform*

---

## 1. Overview & Architectural Principles

GoaConnect's database layer is built on PostgreSQL 16, designed around strict relational integrity, formal database normalization (1NF–3NF), named constraints, and transactional state machines. 

### Key Design Tenets
1. **Strong Identity**: Every entity table utilizes an `INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`, ensuring database-enforced non-reusable surrogate keys.
2. **Text Standardization**: Case-insensitive emails via the `citext` PostgreSQL extension ensure deduplicated user identities without manual lowercasing. Trigram pattern matching (`pg_trgm`) powers fuzzy text search across creator names and social handles.
3. **Explicit Named Constraints**: All enumerated domains (roles, statuses, districts, platforms) and validation bounds (ratings, amounts, percentages) are enforced via named `CHECK` constraints (e.g., `ck_requests_amount`) rather than PG ENUM types, making constraints auditable, portable, and easy to explain.
4. **Declarative Referential Integrity**: `ON DELETE CASCADE` is applied to dependent child entities (e.g., social accounts, categories, shortlists), while `ON DELETE RESTRICT` protects master taxonomies and reviewer references (e.g., locations, verifiers).
5. **Separation of Concerns**: The schema strictly segregates the **11 core business ERD tables** from the **3 supporting infrastructure tables** (sessions, password reset tokens, audit trail).

---

## 2. Table Classification

```
┌────────────────────────────────────────────────────────────────────────┐
│                      GOACONNECT DATABASE ENTITIES                      │
├──────────────────────────────────┬─────────────────────────────────────┤
│   CORE ERD ENTITIES (11 Tables)  │   SUPPORTING INFRASTRUCTURE (3)     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 1. users                         │ 12. sessions                        │
│ 2. locations                     │ 13. password_reset_tokens           │
│ 3. categories                    │ 14. audit_log                       │
│ 4. businesses                    │                                     │
│ 5. creators                      │                                     │
│ 6. creator_categories            │                                     │
│ 7. social_accounts               │                                     │
│ 8. creator_metrics               │                                     │
│ 9. collaboration_requests        │                                     │
│ 10. reviews                      │                                     │
│ 11. shortlists                   │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Data Dictionary: Core ERD Tables (1 to 11)

### Table 1: `users`
*Central account table holding authentication credentials, role classification, and platform verification status.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `user_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Surrogate identifier for the user account |
| `email` | `CITEXT` | No | — | `UNIQUE (uq_users_email)` | Case-insensitive registered email address |
| `password_hash` | `TEXT` | No | — | — | Bcrypt salted password hash (12 rounds) |
| `role` | `TEXT` | No | — | `CHECK (ck_users_role: 'admin', 'business', 'creator')` | Authorization role |
| `is_verified` | `BOOLEAN` | No | `false` | `CHECK (ck_users_is_verified: true, false)` | Account-level manual or automated verification badge |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | — | Account creation timestamp (UTC) |
| `updated_at` | `TIMESTAMPTZ` | No | `now()` | — | Automatically updated by `trg_users_set_updated_at` |

---

### Table 2: `locations`
*Geographic master taxonomy covering Goa's 12 talukas, micro-areas/villages, and North/South districts.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `location_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique location identifier |
| `area_name` | `TEXT` | No | — | `UNIQUE (uq_locations_area_taluka)` with `taluka` | Village, beach, or town name (e.g., Calangute, Assagao) |
| `taluka` | `TEXT` | No | — | Part of `uq_locations_area_taluka` | Sub-district / Taluka (e.g., Bardez, Salcete, Tiswadi) |
| `district` | `TEXT` | No | — | `CHECK (ck_locations_district: 'North Goa', 'South Goa')` | District classification |

---

### Table 3: `categories`
*Standardized classification taxonomy for business industries and creator content niches.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `category_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique category identifier |
| `category_name` | `TEXT` | No | — | `UNIQUE (uq_categories_category_name)` | Category name (e.g., Food & Beach Dining, Luxury Stays & Villas) |

---

### Table 4: `businesses`
*Establishment profiles for Goan cafes, boutique villas, resorts, and coastal brands.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `business_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique business profile identifier |
| `user_id` | `INT` | No | — | `UNIQUE (uq_businesses_user_id)`, `FK -> users(user_id) ON DELETE CASCADE` | 1-to-1 link to user account |
| `location_id` | `INT` | No | — | `FK -> locations(location_id) ON DELETE RESTRICT` | Physical location in Goa |
| `business_name` | `TEXT` | No | — | — | Commercial trading or brand name (e.g., Café Palmeira) |
| `industry` | `TEXT` | Yes | — | — | Business operational niche (e.g., Hospitality, Dining) |
| `description` | `TEXT` | Yes | — | — | Overview of the business, concept, and brand identity |
| `contact_phone` | `TEXT` | Yes | — | — | Private phone contact; revealed to creators only upon accepted requests |
| `instagram_handle` | `TEXT` | Yes | — | — | Business Instagram social presence |

---

### Table 5: `creators`
*Talent profiles for content creators, photographers, vloggers, and digital storytellers in Goa.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `creator_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique creator profile identifier |
| `user_id` | `INT` | No | — | `UNIQUE (uq_creators_user_id)`, `FK -> users(user_id) ON DELETE CASCADE` | 1-to-1 link to user account |
| `location_id` | `INT` | No | — | `FK -> locations(location_id) ON DELETE RESTRICT` | Primary home or operational base in Goa |
| `full_name` | `TEXT` | No | — | — | Full display name (e.g., Rahul Naik) |
| `bio` | `TEXT` | Yes | — | — | Public biography and creative summary |
| `accepts_barter` | `BOOLEAN` | No | `false` | — | Indicates willingness to consider stay/dining exchange collabs |
| `min_paid_rate` | `INT` | No | `0` | `CHECK (ck_creators_min_paid_rate >= 0)` | Starting baseline rate in INR for paid engagements |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | — | Creator registration timestamp |

---

### Table 6: `creator_categories`
*Junction table associating creators with one or more content niches, enforcing exactly one primary category.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `creator_id` | `INT` | No | — | `PK`, `FK -> creators(creator_id) ON DELETE CASCADE` | Associated creator identifier |
| `category_id` | `INT` | No | — | `PK`, `FK -> categories(category_id) ON DELETE CASCADE` | Associated category identifier |
| `is_primary` | `BOOLEAN` | No | `false` | Partial Unique Index `uq_creator_categories_primary` | Flags the creator's single main focus niche |

---

### Table 7: `social_accounts`
*Connected social media profiles (Instagram, YouTube) owned by creators.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `account_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique social account link identifier |
| `creator_id` | `INT` | No | — | `FK -> creators(creator_id) ON DELETE CASCADE` | Owning creator |
| `platform` | `TEXT` | No | — | `CHECK (ck_social_accounts_platform: 'instagram', 'youtube')` | Social media platform |
| `handle` | `TEXT` | No | — | `UNIQUE (uq_social_accounts_platform_handle)` with `platform` | Account username or handle |
| `profile_url` | `TEXT` | Yes | — | — | Direct web URL to the creator's profile |

*Additional Constraint*: `UNIQUE (creator_id, platform)` ensures at most one account per platform per creator.

---

### Table 8: `creator_metrics`
*Historical time-series snapshots of audience size, engagement rates, and geographic reach.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `metric_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Snapshot identifier |
| `account_id` | `INT` | No | — | `FK -> social_accounts(account_id) ON DELETE CASCADE` | Associated social account |
| `follower_count` | `INT` | No | `0` | `CHECK (follower_count >= 0)` | Total follower or subscriber count |
| `avg_likes` | `NUMERIC` | Yes | — | `CHECK (avg_likes >= 0)` | Average likes per post/video |
| `avg_views` | `NUMERIC` | Yes | — | `CHECK (avg_views >= 0)` | Average views per post/video/reel |
| `avg_comments` | `NUMERIC` | Yes | — | `CHECK (avg_comments >= 0)` | Average comments per post |
| `engagement_rate` | `NUMERIC` | Yes | — | `CHECK (0 <= engagement_rate <= 100)` | Engagement percentage |
| `audience_goa_pct` | `NUMERIC` | Yes | — | `CHECK (0 <= audience_goa_pct <= 100)` | Percentage of audience based in Goa |
| `data_source` | `TEXT` | No | `'self_reported'` | `CHECK ('self_reported', 'admin_verified')` | Provenance of the snapshot |
| `verified_by` | `INT` | Yes | `NULL` | `FK -> users(user_id) ON DELETE RESTRICT` | Admin user ID who certified the snapshot |
| `recorded_at` | `TIMESTAMPTZ` | No | `now()` | `UNIQUE (account_id, recorded_at)` | Timestamp of snapshot recording |

*Cross-Column Constraint*: `ck_creator_metrics_verified_source` enforces that `verified_by IS NOT NULL` if and only if `data_source = 'admin_verified'`.

---

### Table 9: `collaboration_requests`
*Campaign booking and collaboration proposals exchanged between businesses and creators.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `request_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique request identifier |
| `business_id` | `INT` | No | — | `FK -> businesses(business_id) ON DELETE CASCADE` | Requesting business establishment |
| `creator_id` | `INT` | No | — | `FK -> creators(creator_id) ON DELETE CASCADE` | Targeted creator talent |
| `collab_type` | `TEXT` | No | — | `CHECK ('paid', 'barter', 'hybrid')` | Commercial structure of engagement |
| `offered_amount` | `INT` | No | `0` | `CHECK (ck_requests_amount)` | Offered budget in INR (must be >0 for paid/hybrid) |
| `offer_details` | `TEXT` | Yes | — | — | Campaign title and core goals |
| `deliverables` | `TEXT` | Yes | — | — | Specific deliverables (e.g. 1 Reel, 3 Stories) |
| `message` | `TEXT` | Yes | — | — | Custom proposal note |
| `status` | `TEXT` | No | `'pending'` | `CHECK ('pending', 'accepted', 'rejected', 'completed', 'cancelled')` | State machine lifecycle status |
| `requested_at` | `TIMESTAMPTZ` | No | `now()` | — | Proposal submission timestamp |
| `responded_at` | `TIMESTAMPTZ` | Yes | `NULL` | — | Timestamp of acceptance, decline, or completion |
| `deadline` | `DATE` | No | — | — | Target campaign deliverable completion date |

*Partial Unique Index*: `uq_requests_pending_pair` prevents more than one concurrent `pending` request between the same business and creator.

---

### Table 10: `reviews`
*Mutual post-collaboration reviews and ratings submitted after a request reaches `completed` status.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `review_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Unique review identifier |
| `request_id` | `INT` | No | — | `FK -> collaboration_requests(request_id) ON DELETE CASCADE` | Completed collaboration deal |
| `reviewer_id` | `INT` | No | — | `FK -> users(user_id) ON DELETE CASCADE` | User authoring the review |
| `reviewee_id` | `INT` | No | — | `FK -> users(user_id) ON DELETE CASCADE` | Counterpart user receiving the review |
| `rating` | `INT` | No | — | `CHECK (ck_reviews_rating: 1 <= rating <= 5)` | 1 to 5 star rating |
| `comment` | `TEXT` | Yes | — | — | Detailed qualitative feedback |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | — | Review submission timestamp |

*Integrity Constraints*:
- `ck_reviews_different_parties`: Prevents self-reviews (`reviewer_id <> reviewee_id`).
- `uq_reviews_request_reviewer`: Allows exactly one review per party per request.
- `trg_reviews_guard`: Blocks review submission if the request is not in `completed` status or if either party was not part of the request.

---

### Table 11: `shortlists`
*Private bookmarks curated by businesses to organize creators for future campaigns.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `business_id` | `INT` | No | — | `PK`, `FK -> businesses(business_id) ON DELETE CASCADE` | Bookmarking business |
| `creator_id` | `INT` | No | — | `PK`, `FK -> creators(creator_id) ON DELETE CASCADE` | Saved creator profile |
| `note` | `TEXT` | Yes | — | — | Private campaign notes or rationale |
| `saved_at` | `TIMESTAMPTZ` | No | `now()` | — | Timestamp when shortlisted |

---

## 4. Data Dictionary: Supporting System Tables (12 to 14)

### Table 12: `sessions`
*Secure server-side HTTP session storage for active authenticated sessions.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `session_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Session record identifier |
| `token` | `TEXT` | No | — | `UNIQUE (uq_sessions_token)` | High-entropy random session cookie token |
| `user_id` | `INT` | No | — | `FK -> users(user_id) ON DELETE CASCADE` | Authenticated user |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | — | Session issuance timestamp |
| `expires_at` | `TIMESTAMPTZ` | No | — | — | Expiration timestamp (7-day sliding expiry) |

---

### Table 13: `password_reset_tokens`
*Cryptographically secure single-use tokens for self-service password recovery.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `token_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Token record identifier |
| `user_id` | `INT` | No | — | `FK -> users(user_id) ON DELETE CASCADE` | Targeted user account |
| `token_hash` | `TEXT` | No | — | `UNIQUE (uq_password_reset_tokens_hash)` | SHA-256 hash of the issued reset token (raw token is never persisted) |
| `expires_at` | `TIMESTAMPTZ` | No | — | — | Token expiry (strictly 1 hour from issuance) |
| `used_at` | `TIMESTAMPTZ` | Yes | `NULL` | — | Timestamp of redemption; non-null prevents replay attacks |

---

### Table 14: `audit_log`
*Append-only system audit log recording all mutations across critical tables.*

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
|---|---|---|---|---|---|
| `log_id` | `INT` | No | `ALWAYS AS IDENTITY` | `PRIMARY KEY` | Immutable audit log record identifier |
| `table_name` | `TEXT` | No | — | — | Targeted database table (e.g. `users`, `collaboration_requests`) |
| `record_id` | `INT` | No | — | — | Primary key value of the mutated entity |
| `action` | `TEXT` | No | — | `CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))` | Mutation type |
| `old_data` | `JSONB` | Yes | `NULL` | — | Pre-mutation row snapshot |
| `new_data` | `JSONB` | Yes | `NULL` | — | Post-mutation row snapshot |
| `changed_by` | `INT` | Yes | `NULL` | — | User ID of the actor responsible (retrieved from `app.user_id` session config) |
| `changed_at` | `TIMESTAMPTZ` | No | `now()` | — | Wall-clock timestamp of the transaction |

---

## 5. Normalization Justification (1NF through 3NF)

The GoaConnect schema strictly adheres to third normal form (3NF), ensuring data integrity, elimination of update/delete anomalies, and optimal storage efficiency.

### 5.1 First Normal Form (1NF)
- **Atomic Values**: Every attribute stores a single atomic value. No multi-valued strings, comma-separated lists, or serialized arrays are used for relational data. For example, a creator's multiple social media channels are stored in separate rows in `social_accounts`, not in a comma-delimited string.
- **Unique Row Identification**: All tables feature an explicit primary key (`user_id`, `location_id`, etc.) using `INT GENERATED ALWAYS AS IDENTITY`.
- **Order Insensitivity**: Row and column positions carry no semantic meaning.

### 5.2 Second Normal Form (2NF)
- **Full Functional Dependency on Primary Key**: All tables satisfy 1NF, and all non-key attributes are fully functionally dependent on the primary key.
- **Composite Key Tables**:
  - `creator_categories(creator_id, category_id)`: The only non-key attribute is `is_primary`, which depends on the entire composite pair $(creator\_id, category\_id)$.
  - `shortlists(business_id, creator_id)`: The attributes `note` and `saved_at` are fully dependent on the combination of the contracting business and the saved creator.

### 5.3 Third Normal Form (3NF)
- **Elimination of Transitive Dependencies**: Non-key attributes depend *only* on the candidate key, with zero transitive dependencies ($X \to Y \to Z$):
  - **Geographic Normalization**: In early design drafts, `taluka` and `district` might have been stored directly in `businesses` or `creators`. In this schema, `locations` models the hierarchy: $(area\_name, taluka) \to district$. Both `businesses` and `creators` hold only a foreign key reference to `location_id`. Updating a taluka or district spelling occurs in a single row in `locations`.
  - **Identity Normalization**: Authentication attributes (`email`, `password_hash`, `role`, `is_verified`) live strictly in `users`. `businesses` and `creators` maintain 1-to-1 relationships referencing `user_id`, preventing duplication of account metadata.

### 5.4 Deliberate Denormalization & Architectural Trade-offs
To balance pure normalization with the high read throughput demanded by a consumer directory, specific, deliberate architectural patterns were chosen:

1. **Dynamic SQL Views Over Materialized Redundancy**:
   Rather than storing derived aggregations (such as `total_followers`, `avg_rating`, `review_count`, or `completed_deals`) directly on the `creators` table, GoaConnect uses dynamic database views (`v_creator_cards`, `v_top_creators`, `v_collaborations`). This completely prevents update anomalies and drift while guaranteeing zero-lag consistency.
2. **Snapshot Time-Series in `creator_metrics`**:
   Rather than overwriting follower counts in place on `social_accounts`, metrics are appended as timestamped snapshots. The current state is extracted via `v_creator_latest_metrics` using PostgreSQL's `DISTINCT ON (account_id) ... ORDER BY recorded_at DESC`. This preserves complete audit histories for trend analysis.
3. **Generic JSONB in `audit_log`**:
   The `audit_log` table stores `old_data` and `new_data` as semi-structured `JSONB`. This deliberate trade-off provides a unified, zero-overhead audit log covering 6 tables without needing 6 duplicate shadow tables.

---

## 6. Catalog of Database Constraints

### 6.1 Check Constraints
- `ck_users_role`: `role IN ('admin', 'business', 'creator')`
- `ck_users_is_verified`: `is_verified IN (true, false)`
- `ck_locations_district`: `district IN ('North Goa', 'South Goa')`
- `ck_creators_min_paid_rate`: `min_paid_rate >= 0`
- `ck_social_accounts_platform`: `platform IN ('instagram', 'youtube')`
- `ck_creator_metrics_counts`: `follower_count >= 0 AND avg_likes >= 0 AND avg_views >= 0 AND avg_comments >= 0`
- `ck_creator_metrics_rates`: `0 <= engagement_rate <= 100 AND 0 <= audience_goa_pct <= 100`
- `ck_creator_metrics_data_source`: `data_source IN ('self_reported', 'admin_verified')`
- `ck_creator_metrics_verified_source`: `(data_source = 'admin_verified') = (verified_by IS NOT NULL)`
- `ck_requests_collab_type`: `collab_type IN ('paid', 'barter', 'hybrid')`
- `ck_requests_status`: `status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')`
- `ck_requests_amount`: `offered_amount >= 0 AND (collab_type NOT IN ('paid', 'hybrid') OR offered_amount > 0)`
- `ck_reviews_rating`: `rating BETWEEN 1 AND 5`
- `ck_reviews_different_parties`: `reviewer_id <> reviewee_id`
- `ck_audit_log_action`: `action IN ('INSERT', 'UPDATE', 'DELETE')`

### 6.2 Unique Constraints & Partial Unique Indexes
- `uq_users_email`: `UNIQUE (email)` on `users` (case-insensitive via `citext`)
- `uq_locations_area_taluka`: `UNIQUE (area_name, taluka)` on `locations`
- `uq_categories_category_name`: `UNIQUE (category_name)` on `categories`
- `uq_businesses_user_id`: `UNIQUE (user_id)` on `businesses`
- `uq_creators_user_id`: `UNIQUE (user_id)` on `creators`
- `uq_creator_categories_primary`: `UNIQUE INDEX (creator_id) WHERE is_primary = true` (enforces at most one primary category per creator)
- `uq_social_accounts_platform_handle`: `UNIQUE (platform, handle)` on `social_accounts`
- `uq_social_accounts_creator_platform`: `UNIQUE (creator_id, platform)` on `social_accounts`
- `uq_creator_metrics_account_recorded`: `UNIQUE (account_id, recorded_at)` on `creator_metrics`
- `uq_requests_pending_pair`: `UNIQUE INDEX (business_id, creator_id) WHERE status = 'pending'` (prevents duplicate pending requests)
- `uq_reviews_request_reviewer`: `UNIQUE (request_id, reviewer_id)` on `reviews`
- `uq_sessions_token`: `UNIQUE (token)` on `sessions`
- `uq_password_reset_tokens_hash`: `UNIQUE (token_hash)` on `password_reset_tokens`

---

## 7. Catalog of Triggers & Database Functions

### 7.1 Triggers
1. **`trg_users_set_updated_at`** (`BEFORE UPDATE ON users`): Advances `updated_at` automatically using `clock_timestamp()`.
2. **`trg_collab_request_guard`** (`BEFORE INSERT OR UPDATE ON collaboration_requests`):
   - Enforces future deadline on insertion.
   - Enforces initial status of `'pending'`.
   - Enforces valid state machine transitions:
     - `pending` $\to$ `accepted`, `rejected`, or `cancelled`
     - `accepted` $\to$ `completed` or `cancelled`
     - Terminal statuses (`rejected`, `completed`, `cancelled`) cannot transition further.
   - Enforces immutability of terms (`offered_amount`, `deliverables`, `deadline`, `collab_type`) once a request leaves `pending`.
3. **`trg_reviews_guard`** (`BEFORE INSERT ON reviews`): Validates that the referenced request is in `'completed'` status and that the `reviewer_id` and `reviewee_id` are strictly the business and creator parties of that deal.
4. **`trg_creator_metrics_admin_check`** (`BEFORE INSERT OR UPDATE ON creator_metrics`): Enforces that `verified_by` references a user with `role = 'admin'`.
5. **Audit Triggers** (`AFTER INSERT OR UPDATE OR DELETE` on `users`, `businesses`, `creators`, `collaboration_requests`, `reviews`, `creator_metrics`): Automatically captures pre- and post-mutation payloads into `audit_log`, identifying the acting user from session config `app.user_id`.

### 7.2 Stored Functions
1. **`fn_respond_to_request(p_request_id INT, p_creator_user_id INT, p_action TEXT)`**: Validates creator ownership, executes acceptance or rejection, and records response timestamp.
2. **`fn_complete_request(p_request_id INT, p_business_user_id INT)`**: Validates business ownership and marks accepted collaboration as completed.
3. **`fn_cancel_request(p_request_id INT, p_user_id INT)`**: Handles cancellation logic with role-specific constraints (business can cancel pending/accepted; creator can cancel only accepted).
4. **`fn_trust_score(p_user_id INT)`**: Computes a deterministic 0–100 trust score based on profile completeness, connected social accounts, verified metrics, and completed collaborations.

---

## 8. Catalog of Database Views

1. **`v_creator_latest_metrics`**: Extracts the most recent metric snapshot for each social account using `DISTINCT ON (account_id) ... ORDER BY recorded_at DESC`.
2. **`v_creator_cards`**: Primary discovery view combining creator identity, primary category, aggregated follower count across all platforms, average engagement rate, review count, average rating, and verification badges.
3. **`v_collaborations`**: Unified collaboration view exposing campaign deliverables, status, offered amount, and role-appropriate counterpart details.
4. **`v_category_distribution`**: Aggregates creator counts and active campaigns per category.
5. **`v_taluka_stats`**: Geographic market intelligence summarizing creator and business density across all 12 Goa talukas.
6. **`v_monthly_request_velocity`**: Time-series analytics tracking proposal volumes and revenue over rolling 6-month windows.
7. **`v_top_creators`**: Ranks top creators by completed collaboration volume and earnings.
8. **`v_top_businesses`**: Ranks top businesses by platform spend and completed campaigns.
9. **`v_admin_kpis`**: Real-time platform KPI dashboard metrics (total creators, total businesses, active collaborations, total platform earnings).

---

## 9. Catalog of Database Indexes

### 9.1 Foreign Key & Join Performance Indexes
- `idx_businesses_user_id` on `businesses(user_id)`
- `idx_businesses_location_id` on `businesses(location_id)`
- `idx_creators_user_id` on `creators(user_id)`
- `idx_creators_location_id` on `creators(location_id)`
- `idx_creator_categories_category_id` on `creator_categories(category_id)`
- `idx_social_accounts_creator_id` on `social_accounts(creator_id)`
- `idx_creator_metrics_verified_by` on `creator_metrics(verified_by)`
- `idx_reviews_request_id` on `reviews(request_id)`
- `idx_reviews_reviewer_id` on `reviews(reviewer_id)`
- `idx_reviews_reviewee_id` on `reviews(reviewee_id)`
- `idx_shortlists_creator_id` on `shortlists(creator_id)`
- `idx_sessions_user_id` on `sessions(user_id)`
- `idx_password_reset_tokens_user_id` on `password_reset_tokens(user_id)`
- `idx_audit_log_changed_by` on `audit_log(changed_by)`
- `idx_audit_log_table_record` on `audit_log(table_name, record_id)`

### 9.2 Filter & Composite Sorting Indexes
- `idx_creator_metrics_account_recorded_desc` on `creator_metrics(account_id, recorded_at DESC)`: Optimizes `DISTINCT ON` snapshot lookups.
- `idx_collab_requests_creator_status` on `collaboration_requests(creator_id, status)`: Accelerates creator dashboard query filtering.
- `idx_collab_requests_business_status` on `collaboration_requests(business_id, status)`: Accelerates business dashboard query filtering.

### 9.3 Trigram (GIN) Full-Text Search Indexes
- `idx_creators_full_name_trgm` on `creators USING gin (full_name gin_trgm_ops)`: Accelerates substring and typo-tolerant trigram queries on creator full names.
- `idx_social_accounts_handle_trgm` on `social_accounts USING gin (handle gin_trgm_ops)`: Accelerates handle search across social accounts.

