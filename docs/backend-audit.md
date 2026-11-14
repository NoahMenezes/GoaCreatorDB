# GoaConnect Backend Audit (v3)

> **Revised:** 2026-11-14  
> **Scope:** Documentation only — no code changes.  
> **ERD baseline:** `docs/erd.eraser` (canonical once saved) + decisions D1–D17.  
> **Target DB:** PostgreSQL 16 in Docker.  
> **Sections:** 1 Schema Diff · 2 Route & Page Inventory · 3 Gap Table · 4 Known Bugs · 5 Missing Screens · 6 Migration Plan · 7 Final Table-to-Table Mapping

---

## §1 — Schema Diff

### §1a — Table-Level Disposition

| Current table | Disposition | Notes |
|---|---|---|
| `users` | **KEEP** | ERD columns only; drop `is_active` and anything else not in the ERD |
| `locations` | **KEEP** | Integer identity PK `location_id`; keep `area_name`, `taluka`, `district` |
| `categories` | **KEEP** | Integer identity PK `category_id`; keep `category_name` |
| `businesses` | **KEEP** | ERD columns only; drop `website_url`, `created_at`, `updated_at` |
| `creators` | **KEEP** (merged with `creator_profiles`) | One table per ERD; drop `is_verified`, `updated_at`, `avatar_url`, `open_for_collabs`, `region_tags`, `default_deliverables` |
| `creator_profiles` | **MERGE → `creators`** | Columns folded in; table dropped |
| `creator_categories` | **NEW** | Replaces the `niche` text column; columns: `creator_id`, `category_id`, `is_primary`; exactly one `is_primary=true` per creator |
| `social_accounts` | **KEEP** (trimmed) | Drop `platform_user_id`, `is_connected`, `connected_at`, `last_synced_at`, `created_at`, `profile_picture_url`, `access_token`, `refresh_token`, `token_expires_at`, `updated_at`; keep `account_id`, `creator_id`, `platform`, `handle` (renamed from `username`), `profile_url`; "last synced" is derived as `MAX(recorded_at)` from `creator_metrics` |
| `social_metrics` | **REPLACE → `creator_metrics`** | FK is `account_id → social_accounts` (not direct `creator_id`); see §1b for exact columns |
| `metric_snapshots` | **DROP** | Superseded by `creator_metrics` |
| `collaboration_requests` | **MERGE** (absorbs `collaborations`) | Trimmed to ERD columns; expose accepted/completed rows via view `v_collaborations` |
| `collaborations` | **MERGE → `collaboration_requests`** | Table dropped after data fold |
| `reviews` | **KEEP** (re-keyed) | `request_id` FK replaces `collaboration_id`; drop `is_verified`, `updated_at` |
| `shortlists` | **NEW** | Per-business only; columns `business_id`, `creator_id`, `note`, `saved_at` |
| `sessions` | **KEEP** | Unchanged |
| `password_reset_tokens` | **NEW** | SHA-256 hashed token, 1-hour expiry, single-use; fix reset URL to `/reset-password` |
| `audit_log` | **NEW** (system) | Triggers on `users`, `collaboration_requests`, `creator_metrics`, `reviews`; trigger reads `current_setting('app.user_id', true)` into `actor_user_id` |
| `reels` | **DROP** | UI grid hidden |
| `payments` | **DROP** | Escrow/payment tracking hidden from UI |
| `notifications` | **DROP** | Replaced by computed `GET /api/notifications` feed (no table) |

---

### §1b — Column-Level Diff per ERD Table

All PKs use `INT GENERATED ALWAYS AS IDENTITY`. All FKs reference the target table's integer PK.

#### `users`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `user_id` | INT IDENTITY PK | `user_id TEXT` | **RETYPE** to identity integer |
| `email` | TEXT NOT NULL UNIQUE | `email` | KEEP |
| `password_hash` | TEXT NOT NULL | `password_hash` | KEEP |
| `role` | TEXT CHECK('admin','business','creator') | `role` | KEEP; verify constraint |
| `is_verified` | BOOL NOT NULL DEFAULT false | `is_verified` | KEEP (admin-approved account flag) |
| `created_at` | TIMESTAMPTZ | `created_at` | KEEP |
| `updated_at` | TIMESTAMPTZ | `updated_at` | KEEP |
| — | — | `is_active` | **DROP** |

#### `locations`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `location_id` | INT IDENTITY PK | `location_id TEXT` | **RETYPE** |
| `area_name` | TEXT NOT NULL | `area_name` | KEEP |
| `taluka` | TEXT NOT NULL | `taluka` | KEEP |
| `district` | TEXT CHECK('North Goa','South Goa') | `district` | KEEP; add CHECK |

#### `categories`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `category_id` | INT IDENTITY PK | `category_id TEXT` | **RETYPE** |
| `category_name` | TEXT NOT NULL | `name` | RENAME |

#### `businesses`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `business_id` | INT IDENTITY PK | `business_id TEXT` | **RETYPE** |
| `user_id` | INT FK→users | `user_id` | RETYPE FK |
| `location_id` | INT FK→locations | `location_id` | RETYPE FK |
| `business_name` | TEXT NOT NULL | `business_name` | KEEP |
| `industry` | TEXT | `industry` | KEEP |
| `description` | TEXT | `description` | KEEP |
| `contact_phone` | TEXT | `contact_phone` | KEEP |
| `instagram_handle` | TEXT | `instagram_handle` | KEEP |
| — | — | `website_url` | **DROP** |
| — | — | `created_at` | **DROP** |
| — | — | `updated_at` | **DROP** |
| — | — | `avatar_url` | **DROP** |

#### `creators`

(Merged from `creators` + `creator_profiles`)

| ERD column | Type | Legacy source | Action |
|---|---|---|---|
| `creator_id` | INT IDENTITY PK | `creators.creator_id TEXT` | **RETYPE** |
| `user_id` | INT FK→users | `creators.user_id` | RETYPE FK |
| `location_id` | INT FK→locations | `creators.location_id` | RETYPE FK |
| `full_name` | TEXT NOT NULL | `creator_profiles.full_name` | PULL from profiles |
| `bio` | TEXT | `creator_profiles.bio` | PULL from profiles |
| `accepts_barter` | BOOL NOT NULL DEFAULT false | `creator_profiles.accepts_barter` | PULL from profiles |
| `min_paid_rate` | INT | `creator_profiles.base_rate` | RENAME + PULL |
| `created_at` | TIMESTAMPTZ | `creators.created_at` | KEEP |
| — | — | `creator_profiles.handle` | → `social_accounts.handle` |
| — | — | `creator_profiles.niche` | → `creator_categories` table |
| — | — | `creator_profiles.followers` | → `creator_metrics.follower_count` |
| — | — | `creator_profiles.engagement_rate` | → `creator_metrics.engagement_rate` |
| — | — | `creator_profiles.instagram_url` | → `social_accounts.profile_url` |
| — | — | `creator_profiles.verified` | **DROP** (badge derived from metrics) |
| — | — | `creators.is_verified` | **DROP** (not in ERD creators) |
| — | — | `creators.updated_at` | **DROP** |
| — | — | `creators.avatar_url` | **DROP** |
| — | — | `creators.open_for_collabs` | **DROP** |
| — | — | `creators.region_tags` | **DROP** |
| — | — | `creators.default_deliverables` | **DROP** |

#### `creator_categories` (new)

| ERD column | Type | Notes |
|---|---|---|
| `creator_id` | INT FK→creators | Composite PK with `category_id` |
| `category_id` | INT FK→categories | Composite PK with `creator_id` |
| `is_primary` | BOOL NOT NULL DEFAULT false | Exactly one `is_primary=true` per creator (enforced via partial unique index or trigger) |

No legacy source — seeded by mapping the old `niche_slug` text values to the new integer `category_id`.

#### `social_accounts`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `account_id` | INT IDENTITY PK | `account_id TEXT` | **RETYPE** |
| `creator_id` | INT FK→creators | `user_id FK→users` | **RETYPE + REKEY** (now points to creators) |
| `platform` | TEXT CHECK('instagram','youtube') | `platform` | KEEP; verify CHECK |
| `handle` | TEXT NOT NULL | `username` | **RENAME** |
| `profile_url` | TEXT | `profile_url` | KEEP |
| — | — | `platform_user_id` | **DROP** |
| — | — | `is_connected` | **DROP** |
| — | — | `connected_at` | **DROP** |
| — | — | `last_synced_at` | **DROP** (derived as `MAX(recorded_at)` from `creator_metrics`) |
| — | — | `created_at` | **DROP** |
| — | — | `profile_picture_url` | **DROP** |
| — | — | `access_token` | **DROP** |
| — | — | `refresh_token` | **DROP** |
| — | — | `token_expires_at` | **DROP** |
| — | — | `updated_at` | **DROP** |

#### `creator_metrics` (replaces `social_metrics`)

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `metric_id` | INT IDENTITY PK | `metric_id TEXT` | **RETYPE** |
| `account_id` | INT FK→social_accounts | `creator_id` (direct) | **REKEY** — FK now points to `social_accounts.account_id`, not `creators.creator_id` |
| `follower_count` | INT | `followers` | **RENAME** |
| `avg_likes` | NUMERIC | `avg_likes` | KEEP |
| `avg_views` | NUMERIC | `avg_views` | KEEP |
| `avg_comments` | NUMERIC | `avg_comments` | KEEP |
| `engagement_rate` | NUMERIC | `engagement_rate` | KEEP |
| `audience_goa_pct` | NUMERIC | *(none)* | **NEW** — no legacy source; default null |
| `data_source` | TEXT CHECK('self_reported','admin_verified') | `source` | **RENAME**; map `creator_submitted`→`self_reported`, `official_api`→`admin_verified` |
| `verified_by` | INT FK→users NULL | *(none)* | **NEW** — set by admin on Verifications screen |
| `recorded_at` | TIMESTAMPTZ | `recorded_at` | KEEP |
| — | — | `following` | **DROP** |
| — | — | `posts` | **DROP** |
| — | — | `likes` | **DROP** |
| — | — | `comments` | **DROP** |
| — | — | `shares` | **DROP** |
| — | — | `impressions` | **DROP** |
| — | — | `reach` | **DROP** |
| — | — | `verified` (INT) | **DROP** |

**Constraint:** `CHECK ((data_source = 'admin_verified') = (verified_by IS NOT NULL))`

#### `collaboration_requests` (merged from `collaboration_requests` + `collaborations`)

| ERD column | Type | Legacy source | Action |
|---|---|---|---|
| `request_id` | INT IDENTITY PK | `collaboration_requests.id TEXT` | **RETYPE** |
| `business_id` | INT FK→businesses | `business_id` | RETYPE FK |
| `creator_id` | INT FK→creators | `creator_id` | RETYPE FK |
| `collab_type` | TEXT CHECK('paid','barter','hybrid') | `compensation_type` | **RENAME**; verify CHECK |
| `offered_amount` | INT | `compensation_amount` | **RENAME** |
| `offer_details` | TEXT | `objective` | **RENAME**; prepend old `title` as first line |
| `deliverables` | TEXT | `deliverables` | KEEP |
| `message` | TEXT | booking-modal `note` / `collaborations.campaign_brief` | **MAP** |
| `status` | TEXT CHECK('pending','accepted','rejected','completed','cancelled') | `status` | KEEP name; trim CHECK values (remove `in_production`, `submitted`, `declined`) |
| `requested_at` | TIMESTAMPTZ | `created_at` | **RENAME** |
| `responded_at` | TIMESTAMPTZ | `responded_at` | KEEP |
| `deadline` | DATE | `deadline` | KEEP |
| — | — | `title` | **DROP** (folded into `offer_details`) |
| — | — | `description` | **DROP** |
| — | — | `updated_at` | **DROP** |
| — | — | `completed_at` | **DROP** |
| — | — | `shoot_date` | **DROP** |
| — | — | `usage_terms` | **DROP** |
| — | — | `licensing_terms` | **DROP** |
| — | — | `collaboration_type` | **DROP** |
| — | — | `collaborations.payment_amount` | **DROP** |
| — | — | `collaborations.payment_status` | **DROP** |
| — | — | `collaborations.escrow_*` | **DROP** |
| — | — | `collaborations.completed_at` | **DROP** |

**View `v_collaborations`:** `status IN ('accepted','completed')`. Pre-joins: `business_name` from `businesses`, `creator full_name` from `creators`, `area_name` from `locations`. No email columns in the view.

**State machine (D14):**

| Action | Who | From state | To state |
|---|---|---|---|
| `accept` | Creator only | `pending` | `accepted` |
| `reject` | Creator only | `pending` | `rejected` |
| `complete` | Business only | `accepted` | `completed` |
| `cancel` (withdraw) | Business only | `pending` or `accepted` | `cancelled` |
| `cancel` | Creator only | `accepted` | `cancelled` |

Enforce in PL/pgSQL functions; return HTTP 403 for wrong party, 409 for wrong state.

#### `reviews`

| ERD column | Type | Legacy column | Action |
|---|---|---|---|
| `review_id` | INT IDENTITY PK | `review_id TEXT` | **RETYPE** |
| `request_id` | INT FK→collaboration_requests | `collaboration_id` | **RENAME + RETYPE FK** |
| `reviewer_id` | INT FK→users | `reviewer_id` | RETYPE FK |
| `reviewee_id` | INT FK→users | `reviewee_id` | RETYPE FK |
| `rating` | INT CHECK(1–5) | `rating` | KEEP |
| `comment` | TEXT | `comment` | KEEP |
| `created_at` | TIMESTAMPTZ | `created_at` | KEEP |
| — | — | `is_verified` | **DROP** |
| — | — | `updated_at` | **DROP** |

#### `shortlists` (new)

| ERD column | Type | Notes |
|---|---|---|
| `business_id` | INT FK→businesses | Composite PK with `creator_id` |
| `creator_id` | INT FK→creators | Composite PK with `business_id` |
| `note` | TEXT | Optional business note |
| `saved_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | Not `created_at` |

Add on conflict: `ON CONFLICT DO NOTHING`, return 200 (D17).

#### System tables

**`sessions`** — unchanged.

**`password_reset_tokens`**

| ERD column | Type |
|---|---|
| `token_id` | INT IDENTITY PK |
| `user_id` | INT FK→users |
| `token_hash` | TEXT NOT NULL (SHA-256) |
| `expires_at` | TIMESTAMPTZ NOT NULL |
| `used_at` | TIMESTAMPTZ NULL |

**`audit_log`**

| ERD column | Type |
|---|---|
| `log_id` | INT IDENTITY PK |
| `table_name` | TEXT NOT NULL |
| `operation` | TEXT CHECK('INSERT','UPDATE','DELETE') |
| `record_id` | INT NOT NULL |
| `old_values` | JSONB NULL |
| `new_values` | JSONB NULL |
| `actor_user_id` | INT NULL (read from `current_setting('app.user_id', true)`) |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT now() |

Triggers fire on: `users`, `collaboration_requests`, `creator_metrics`, `reviews`.

---

## §2 — Route and Page Inventory

### API Routes

| Path | Method | Current data source | ERD tables read | ERD tables written |
|---|---|---|---|---|
| `/api/auth/register` | POST | Live DB | `users` | `users`, `businesses` or `creators` |
| `/api/auth/login` | POST | Live DB | `users`, `sessions` | `sessions` |
| `/api/auth/logout` | POST | Live DB | `sessions` | `sessions` |
| `/api/auth/forgot-password` | POST | Live DB (broken) | `users` | `password_reset_tokens` |
| `/api/auth/reset-password` | POST | Live DB (broken) | `password_reset_tokens` | `users`, `password_reset_tokens` |
| `/api/creators` | GET | Mock / showcase data | `creators`, `creator_categories`, `social_accounts`, `creator_metrics` | — |
| `/api/creators/[id]` | GET | Mock / showcase data | `creators`, `creator_categories`, `social_accounts`, `creator_metrics`, `reviews` | — |
| `/api/businesses/[id]` | GET | Live DB (partial) | `businesses` | — |
| `/api/requests` | GET | Live DB | `collaboration_requests` | — |
| `/api/requests` | POST | Live DB | `creators`, `businesses` | `collaboration_requests` |
| `/api/requests/[id]` | GET | Live DB | `collaboration_requests` | — |
| `/api/requests/[id]` | PATCH | Live DB | `collaboration_requests` | `collaboration_requests` (via PL/pgSQL; body `{ action: 'accept' \| 'reject' \| 'complete' \| 'cancel' }`) |
| `/api/reviews` | GET | Live DB | `reviews` | — |
| `/api/reviews` | POST | Live DB | `collaboration_requests` | `reviews` |
| `/api/shortlist` | GET | Live DB | `shortlists`, `creators` | — |
| `/api/shortlist` | POST | Live DB | — | `shortlists` (`ON CONFLICT DO NOTHING`) |
| `/api/shortlist/[id]` | DELETE | Live DB | `shortlists` | `shortlists` |
| `/api/notifications` | GET | Computed (no table) | `collaboration_requests`, `reviews` | — |
| `/api/stats/public` | GET | Live DB | `users`, `creators`, `businesses`, `collaboration_requests` | — |
| `/api/admin/users` | GET | Live DB | `users`, `businesses`, `creators` | — |
| `/api/admin/users/[id]` | PATCH | Live DB | `users` | `users` |
| `/api/admin/verifications` | GET | Live DB | `creators`, `creator_metrics` | — |
| `/api/admin/verifications/[id]` | PATCH | Live DB | `creator_metrics` | `creator_metrics` (set `data_source`, `verified_by`) |
| `/api/admin/taxonomy` | GET | Live DB | `categories`, `locations` | — |
| `/api/admin/taxonomy` | POST/PUT | Live DB | — | `categories`, `locations` |
| `/api/admin/reports` | GET | Live DB | all tables | — |
| `/api/admin/audit-log` | GET | Live DB (read-only) | `audit_log` | — |

### Pages

| Path | Current data source | ERD tables read | ERD tables written |
|---|---|---|---|
| `/` | Hardcoded / showcase | `users`, `creators`, `businesses`, `collaboration_requests` (stats) | — |
| `/join` | Form → API | — | `users`, `businesses` or `creators` |
| `/login` | Form → API | `users`, `sessions` | `sessions` |
| `/forgot-password` | Missing | `users` | `password_reset_tokens` |
| `/reset-password` | Missing | `password_reset_tokens` | `users` |
| `/business/dashboard` | Live DB + mock | `collaboration_requests`, `creators` | — |
| `/business/discover` | Mock / showcase | `creators`, `creator_categories`, `social_accounts`, `creator_metrics` | — |
| `/business/creators/[id]` | Missing (hardcoded profile) | `creators`, `creator_categories`, `social_accounts`, `creator_metrics`, `reviews` | — |
| `/business/requests` | Live DB | `collaboration_requests`, `creators` | — |
| `/business/reviews` | Live DB | `reviews`, `creators`, `collaboration_requests` | — |
| `/business/shortlist` | Live DB + mock | `shortlists`, `creators`, `creator_metrics` | `shortlists` |
| `/business/profile` | Hardcoded | `businesses`, `users` | `businesses`, `users` |
| `/creator/dashboard` | Live DB + mock | `collaboration_requests`, `businesses` | — |
| `/creator/requests` | Live DB | `collaboration_requests`, `businesses` | `collaboration_requests` |
| `/creator/collaborations` | Live DB | `collaboration_requests` via `v_collaborations`, `businesses` | — |
| `/creator/social` | Live DB + mock | `social_accounts`, `creator_metrics` | `social_accounts`, `creator_metrics` |
| `/creator/profile` | Hardcoded | `creators`, `users`, `creator_categories` | `creators`, `creator_categories` |
| `/admin` | Missing | `users`, `creators`, `businesses`, `collaboration_requests` | — |
| `/admin/verifications` | Missing | `creators`, `creator_metrics`, `social_accounts` | `creator_metrics` |
| `/admin/users` | Missing | `users`, `businesses`, `creators` | `users` |
| `/admin/taxonomy` | Missing | `categories`, `locations` | `categories`, `locations` |
| `/admin/reports` | Missing | all tables | — |
| `/admin/audit-log` | Missing (read-only) | `audit_log` | — |

---

## §3 — Gap Table

Fields and features the UI currently shows that have no direct home in the ERD, with the disposition and reason for each.

| UI element | Current state | Disposition | Reason / rule |
|---|---|---|---|
| Escrow / payment tracking | Shown in collaborations table | **HIDE** | `payments` table is dropped; no payment columns in ERD |
| Payment labels / columns | Request cards show "Payment Pending" etc. | **HIDE** | Same as above |
| "In production" stage | Status badge in request cards | **HIDE / REMAP** | Removed per D3; map `in_production`→display as "In progress" (accepted); remove from status CHECK |
| "Submitted" stage | Status badge | **HIDE / REMAP** | Removed per D3; map `submitted`→display as "In progress" |
| "Declined" badge | Shown to users | **REMAP** | The API status is `rejected`; the UI displays `rejected` as "Declined" (D3). The UI must never send "declined" to the API. |
| Open-for-collabs toggle | Creator profile | **HIDE** | Column dropped from `creators` |
| Region tags | Creator cards | **HIDE** | Dropped; location comes from `locations.area_name` |
| Deliverables-package selector | Booking modal | **HIDE** (selector) | Deliverables are stored as free text in `collaboration_requests.deliverables`; the selector UI is replaced with a free-text/multi-select that writes to that column |
| Reel base rate display | Creator cards / profile | **HIDE** | Show only `creators.min_paid_rate`; reel-specific rate not in ERD |
| GST number field | Registration form | **HIDE** | Not in `businesses` ERD |
| Work email field | Registration form | **HIDE** | Not in ERD (email is on `users`) |
| User suspension controls | Admin UI concept | **HIDE** | No `is_active` or suspension column in ERD; admin can only toggle `users.is_verified` |
| Reels grid | Creator profile | **HIDE** | `reels` table dropped |
| "Verified via official API" label | Creator badge | **REPLACE** | Badge becomes **"Admin-verified"** if the creator's latest `creator_metrics.data_source = 'admin_verified'`; otherwise **"Self-reported"**. `users.is_verified` is a separate flag meaning the admin approved the account — it is not the badge driver. |
| Notification bell (live feed) | Header | **REPLACE** | No `notifications` table; replaced by computed `GET /api/notifications` that derives events from `collaboration_requests` and `reviews` state changes |
| Landing-page trust metrics | Hero section ("500+ creators", etc.) | **REPLACE** | Must be real counts from `GET /api/stats/public` hitting live DB tables |
| Creator avatar / profile image | Cards, profiles | **REPLACE** | ERD has no image column; use initials avatar derived from `creators.full_name` |
| Campaign Chat / messaging | Sidebar nav, request detail | **REPLACE** | No chat table; replace with **"Contact"** action that reveals counterpart contact details only when `status IN ('accepted','completed')`: business sees `users.email` + `social_accounts.handle` + `social_accounts.profile_url`; creator sees `users.email` + `businesses.contact_phone` + `businesses.instagram_handle` (D16) |
| Pricing tiers (Pro, Agency, etc.) | Pricing page | **KEEP (non-functional)** | Non-functional marketing copy per D7; paid tiers show "Coming soon"; no subscription table or enforcement |
| Deliverables chosen in booking modal | Booking form | **KEEP** | Stored as text in `collaboration_requests.deliverables` |
| Quoted price in booking modal | Booking form | **KEEP** | Stored as `collaboration_requests.offered_amount` |

---

## §4 — Known Bugs

From `PROJECT_STATUS.md`:

| Bug | Description | Resolution |
|---|---|---|
| B1 | Password-reset link points to wrong URL (`/forgot-password` instead of `/reset-password`) | Fixed in Step 3 (D4): `password_reset_tokens` table with correct `/reset-password` route |
| B2 | `is_active` column referenced in auth checks but never set | Disappears with refactor — column is dropped from `users` |
| B3 | Creator profile page hardcoded to one demo creator | Fixed in Step 5 (D5): dynamic route `/business/creators/[id]` using integer `creator_id` |
| B4 | Shortlist accessible to creators (should be business-only) | Fixed in Step 4 (D6): shortlist API checks session role; `shortlists.business_id` enforces ownership |
| B5 | "Declined" sent to API as a status value | Fixed in Step 3 (D3): status CHECK only allows `pending | accepted | rejected | completed | cancelled`; API rejects any other value |
| B6 | Chat/messages nav item leads to empty page | Fixed in Step 5 (D8): replaced with Contact reveal action |
| B7 | Social metrics FK targets `users` not `creators` (data model mismatch) | Fixed in Step 2 (migration): `creator_metrics.account_id` FK→`social_accounts.account_id` |
| B8 | Metric snapshots grow unboundedly | Disappears with refactor — `metric_snapshots` table is dropped |
| B9 | Landing-page stats are hardcoded strings | Fixed in Step 5: `GET /api/stats/public` returns live counts |
| B10 | `social_accounts.user_id` should reference `creators`, not `users` directly | Fixed in Step 2 (migration): rekey to `social_accounts.creator_id FK→creators` |
| B11 | OAuth token columns stored in `social_accounts` (security risk) | Fixed in Step 2: columns dropped entirely |
| B12 | Notification bell has no backend | Fixed in Step 5 (D8): computed `GET /api/notifications` derived from request/review state |

---

## §5 — Missing Screens

| Screen | Route | Status | Notes |
|---|---|---|---|
| Admin dashboard | `/admin` | ❌ Missing | Summary cards: total users, creators, businesses, open requests, recent audit events |
| Admin verifications | `/admin/verifications` | ❌ Missing | List creators with self-reported metrics; admin sets `data_source='admin_verified'` + `verified_by` |
| Admin users | `/admin/users` | ❌ Missing | List all users; toggle `users.is_verified`; view role and join date |
| Admin taxonomy | `/admin/taxonomy` | ❌ Missing | CRUD for `categories` and `locations` |
| Admin reports | `/admin/reports` | ❌ Missing | Aggregate stats: requests by status, reviews by rating, top creators |
| Admin audit log | `/admin/audit-log` | ❌ Missing | Read-only view of `audit_log` table |
| Creator profile (dynamic) | `/business/creators/[id]` | ❌ Missing | Replaces the hardcoded `/business/profile`; uses integer `creator_id` (D5) |
| Collaboration-request detail | `/business/requests/[id]` and `/creator/requests/[id]` | ❌ Missing | Shows full request; inline Contact reveal when status accepted/completed |
| Business profile / settings | `/business/settings` | ❌ Missing | Edit `businesses` row; linked to `users` email/password |
| Forgot-password page | `/forgot-password` | ❌ Missing | Submits email; creates `password_reset_tokens` row |
| Reset-password page | `/reset-password` | ❌ Missing | Validates token hash; updates `users.password_hash`; marks `used_at` |

---

## §6 — Migration Plan

### Step 1 — Infrastructure & tooling

1. Add `pg` (node-postgres) as the database driver. Remove any `bun:sqlite` dependency.
2. Create `/db/migrations/` directory. Write numbered SQL migration files (`001_init.sql`, `002_...`, etc.).
3. Write a migration runner script (`/db/runner.ts` or `scripts/db-migrate.ts`) that runs pending migrations in order, tracking applied migrations in a `schema_migrations` table.
4. Add npm scripts: `db:reset` (drop + recreate schema + run all migrations) and `db:seed` (run the seed generator).
5. Provision PostgreSQL 16 in Docker (`docker-compose.yml`). Existing dev SQLite data is disposable.

**Risks:** Breaking change for any deployed environment; must ensure `DATABASE_URL` env var is set before any app code runs.

---

### Step 2 — Schema migration

Run migrations in this order:

1. Create `users`, `locations`, `categories` with identity PKs and correct column sets.
2. Create `businesses`, `creators` (merged from `creator_profiles`).
3. Create `creator_categories` with `is_primary` constraint.
4. Create `social_accounts` (trimmed columns, FK→`creators`).
5. Create `creator_metrics` (FK→`social_accounts.account_id`; add `audience_goa_pct`, `verified_by`, `data_source` CHECK with paired constraint).
6. Create `collaboration_requests` (merged; trimmed status CHECK).
7. Create view `v_collaborations` (status IN ('accepted','completed'); pre-join business_name, creator full_name, area names; no emails).
8. Create `reviews` (re-keyed to `request_id`).
9. Create `shortlists` (composite PK; `saved_at` not `created_at`).
10. Create system tables: `sessions`, `password_reset_tokens`, `audit_log`.
11. Create PL/pgSQL state-machine functions for `collaboration_requests` actions (accept/reject/complete/cancel); enforce party and state rules; return 403/409 as appropriate.
12. Create audit triggers on `users`, `collaboration_requests`, `creator_metrics`, `reviews`. Trigger function reads `current_setting('app.user_id', true)` into `audit_log.actor_user_id`. API sets this via `set_config('app.user_id', $userId::text, true)` inside `withTransaction()`.
13. Drop old tables: `reels`, `payments`, `notifications`, `metric_snapshots`, `collaborations` (after data fold), `creator_profiles` (after data fold).

**Risks:** Data-type change from TEXT PKs to INT IDENTITY requires re-seeding from scratch (dev data is disposable per D9). FK re-keying (`social_accounts.creator_id`, `creator_metrics.account_id`) must be done in dependency order.

---

### Step 3 — API layer refactor

1. Replace all SQL clients with `pg` parameterized queries inside a `withTransaction(userId, fn)` helper that calls `set_config('app.user_id', ..., true)` before the callback.
2. Rename all references: `username`→`handle`, `followers`→`follower_count`, `source`→`data_source`, `compensation_type`→`collab_type`, `compensation_amount`→`offered_amount`, `objective`→`offer_details`, `created_at`→`requested_at` (on `collaboration_requests`), `saved_at` (on `shortlists`).
3. `PATCH /api/requests/[id]` with body `{ action: 'accept' | 'reject' | 'complete' | 'cancel' }` — calls the PL/pgSQL state-machine function. Remove any POST/?action= variants.
4. Remove status values `in_production`, `submitted`, `declined` from all API input validation.
5. `GET /api/notifications` — computed from `collaboration_requests` and `reviews`; no `notifications` table read.
6. `GET /api/stats/public` — live counts from DB; no hardcoded values.
7. Contact-reveal endpoint: return extra fields only when `status IN ('accepted','completed')` (D16).
8. Shortlist add: `ON CONFLICT DO NOTHING`, always return 200 (D17).

**Risks:** Any client code sending `declined` or `in_production` to the API will receive 400. Update the UI before cutting over.

---

### Step 4 — Shortlist & data-access rules

1. Shortlist API: verify session role is `business` before read/write. Creators cannot shortlist (D6).
2. Businesses only see their own shortlists (filter by `business_id` from session).
3. Creator-discovery API (`GET /api/creators`): serve real data from the joined query (creators + creator_categories + social_accounts + latest creator_metrics); remove all mock/showcase fallback.

---

### Step 5 — UI changes

1. Apply all HIDE dispositions from §3 (hide payment columns, open-for-collabs toggle, region tags, deliverables-package selector, reel base rate, GST/work-email fields, user-suspension controls, reels grid, "Verified via official API" label).
2. Apply all REPLACE dispositions: initials avatars, computed notification feed, live stats from `/api/stats/public`, "Admin-verified" / "Self-reported" badge rule.
3. Build missing screens: dynamic `/business/creators/[id]`, request-detail pages, business settings, forgot-password, reset-password.
4. Rename Campaign Chat nav to Contact; implement Contact reveal modal.
5. Pricing page: mark paid tiers "Coming soon" (no logic change).
6. Status display mapping: `rejected`→"Declined", `accepted`→"In progress" (never send "declined" or "in progress" to the API).

---

### Step 6 — Admin console

Build all admin pages under `/admin/*` (protected by `role='admin'` session check):

- `/admin` — summary dashboard
- `/admin/verifications` — set `data_source` + `verified_by` on `creator_metrics`
- `/admin/users` — toggle `users.is_verified`; view roles
- `/admin/taxonomy` — CRUD for `categories` and `locations`
- `/admin/reports` — aggregate read-only stats
- `/admin/audit-log` — read-only paginated view of `audit_log`

---

### Step 7 — Seed

1. **Locations:** 12 Goa talukas with micro-hub area names (North Goa: Bardez, Tiswadi, Pernem, Bicholim, Sattari, Ponda; South Goa: Salcete, Marmagao, Quepem, Sanguem, Canacona, Mormugao).
2. **Categories:** 6 categories (e.g. Food & Dining, Travel & Lifestyle, Fashion & Beauty, Fitness & Wellness, Arts & Culture, Tech & Business).
3. **Demo records:** 3 creators, 1 business; for each demo account: at least one `collaboration_request` in every status (`pending`, `accepted`, `rejected`, `completed`, `cancelled`); at least one `completed` request with a review in each direction (business→creator, creator→business) (D15).
4. **Bulk generator (deterministic):** ~120 creators, ~40 businesses, ~400 requests + reviews. Use a fixed seed for repeatability.

---

### Migration risks summary

| Risk | Mitigation |
|---|---|
| TEXT→INT PK conversion breaks foreign keys | Run migrations in dependency order; dev data is disposable (D9) |
| PL/pgSQL state machine edge cases | Cover all 5 statuses × 3 actors in seed data; add integration tests |
| `set_config` not called → `actor_user_id` NULL in audit log | `withTransaction` wrapper enforces the call; validate in audit-log integration test |
| `is_primary` constraint on `creator_categories` | Enforce via partial unique index on `(creator_id) WHERE is_primary = true` |
| `data_source` / `verified_by` consistency | DB-level CHECK constraint; also enforce in Verifications API handler |
| Dropping `is_active` removes existing auth guard | Replace with `users.is_verified` where needed; audit all auth middleware |

---

## §7 — Final Table-to-Table Mapping

For every current (legacy) table and column, this section records exactly where its data goes in the ERD schema.

---

### `users`

| Legacy column | ERD destination |
|---|---|
| `user_id TEXT` | `users.user_id INT GENERATED ALWAYS AS IDENTITY` |
| `email` | `users.email` |
| `password_hash` | `users.password_hash` |
| `role` | `users.role` CHECK('admin','business','creator') |
| `is_verified` | `users.is_verified` BOOL |
| `created_at` | `users.created_at` |
| `updated_at` | `users.updated_at` |
| `is_active` | **DROPPED** |

---

### `locations`

| Legacy column | ERD destination |
|---|---|
| `location_id TEXT` | `locations.location_id INT GENERATED ALWAYS AS IDENTITY` |
| `area_name` | `locations.area_name` |
| `taluka` | `locations.taluka` |
| `district` | `locations.district` CHECK('North Goa','South Goa') |

---

### `categories`

| Legacy column | ERD destination |
|---|---|
| `category_id TEXT` | `categories.category_id INT GENERATED ALWAYS AS IDENTITY` |
| `name` | `categories.category_name` (RENAME) |

---

### `businesses`

| Legacy column | ERD destination |
|---|---|
| `business_id TEXT` | `businesses.business_id INT GENERATED ALWAYS AS IDENTITY` |
| `user_id` | `businesses.user_id` INT FK→users |
| `location_id` | `businesses.location_id` INT FK→locations |
| `business_name` | `businesses.business_name` |
| `industry` | `businesses.industry` |
| `description` | `businesses.description` |
| `contact_phone` | `businesses.contact_phone` |
| `instagram_handle` | `businesses.instagram_handle` |
| `avatar_url` | **DROPPED** |
| `website_url` | **DROPPED** |
| `created_at` | **DROPPED** |
| `updated_at` | **DROPPED** |

---

### `creators` (legacy)

| Legacy column | ERD destination |
|---|---|
| `creator_id TEXT` | `creators.creator_id INT GENERATED ALWAYS AS IDENTITY` |
| `user_id` | `creators.user_id` INT FK→users |
| `location_id` | `creators.location_id` INT FK→locations |
| `created_at` | `creators.created_at` |
| `avatar_url` | **DROPPED** |
| `is_verified` | **DROPPED** (not in ERD creators; `users.is_verified` is the account flag) |
| `open_for_collabs` | **DROPPED** |
| `region_tags` | **DROPPED** |
| `default_deliverables` | **DROPPED** |
| `updated_at` | **DROPPED** |

---

### `creator_profiles` (legacy)

| Legacy column | ERD destination |
|---|---|
| `full_name` | `creators.full_name` |
| `bio` | `creators.bio` |
| `accepts_barter` | `creators.accepts_barter` BOOL |
| `base_rate` | `creators.min_paid_rate` INT (RENAME) |
| `handle` | `social_accounts.handle` |
| `niche` / `niche_slug` | `creator_categories.category_id` (mapped by slug→integer) |
| `followers` | `creator_metrics.follower_count` |
| `engagement_rate` | `creator_metrics.engagement_rate` |
| `instagram_url` | `social_accounts.profile_url` |
| `rating` | DERIVED: `AVG(reviews.rating)` WHERE `reviewee_id = users.user_id` |
| `verified` | **DROPPED** (badge is derived from `creator_metrics.data_source`) |

---

### `creator_categories` (new — no legacy table)

| ERD column | Source |
|---|---|
| `creator_id` | Mapped from `creator_profiles.creator_id` |
| `category_id` | Mapped from `creator_profiles.niche_slug` → `categories.category_id` |
| `is_primary` | First/only category row gets `true`; seed assigns one primary per creator |

---

### `social_accounts`

| Legacy column | ERD destination |
|---|---|
| `account_id TEXT` | `social_accounts.account_id INT GENERATED ALWAYS AS IDENTITY` |
| `user_id FK→users` | `social_accounts.creator_id INT FK→creators` (REKEY) |
| `platform` | `social_accounts.platform` CHECK('instagram','youtube') |
| `username` | `social_accounts.handle` (RENAME) |
| `profile_url` | `social_accounts.profile_url` |
| `profile_picture_url` | **DROPPED** |
| `platform_user_id` | **DROPPED** |
| `is_connected` | **DROPPED** |
| `connected_at` | **DROPPED** |
| `last_synced_at` | **DROPPED** (derived: `MAX(creator_metrics.recorded_at)` for this account) |
| `created_at` | **DROPPED** |
| `updated_at` | **DROPPED** |
| `access_token` | **DROPPED** |
| `refresh_token` | **DROPPED** |
| `token_expires_at` | **DROPPED** |

---

### `social_metrics` (legacy) → `creator_metrics`

| Legacy column | ERD destination |
|---|---|
| `metric_id TEXT` | `creator_metrics.metric_id INT GENERATED ALWAYS AS IDENTITY` |
| `creator_id FK→creators` | → `creator_metrics.account_id INT FK→social_accounts` (REKEY via account lookup) |
| `followers` | `creator_metrics.follower_count` (RENAME) |
| `avg_likes` | `creator_metrics.avg_likes` |
| `avg_views` | `creator_metrics.avg_views` |
| `avg_comments` | `creator_metrics.avg_comments` |
| `engagement_rate` | `creator_metrics.engagement_rate` |
| `source` | `creator_metrics.data_source` (RENAME; `creator_submitted`→`self_reported`, `official_api`→`admin_verified`) |
| `recorded_at` | `creator_metrics.recorded_at` |
| *(no legacy source)* | `creator_metrics.audience_goa_pct` **NEW** |
| *(no legacy source)* | `creator_metrics.verified_by` INT FK→users **NEW** |
| `following` | **DROPPED** |
| `posts` | **DROPPED** |
| `likes` | **DROPPED** |
| `comments` | **DROPPED** |
| `shares` | **DROPPED** |
| `impressions` | **DROPPED** |
| `reach` | **DROPPED** |
| `verified` (INT) | **DROPPED** |

---

### `metric_snapshots` (legacy)

Entire table **DROPPED**. No columns carry forward.

---

### `collaboration_requests` (legacy) + `collaborations` (legacy) → `collaboration_requests`

| Legacy column | ERD destination |
|---|---|
| `collaboration_requests.id TEXT` | `collaboration_requests.request_id INT GENERATED ALWAYS AS IDENTITY` |
| `business_id` | `collaboration_requests.business_id` INT FK→businesses |
| `creator_id` | `collaboration_requests.creator_id` INT FK→creators |
| `compensation_type` | `collaboration_requests.collab_type` CHECK('paid','barter','hybrid') (RENAME) |
| `compensation_amount` | `collaboration_requests.offered_amount` INT (RENAME) |
| `objective` | `collaboration_requests.offer_details` TEXT (RENAME; `title` prepended as first line then dropped) |
| `deliverables` | `collaboration_requests.deliverables` TEXT |
| booking-modal `note` / `collaborations.campaign_brief` | `collaboration_requests.message` TEXT |
| `status` | `collaboration_requests.status` CHECK('pending','accepted','rejected','completed','cancelled') |
| `created_at` | `collaboration_requests.requested_at` TIMESTAMPTZ (RENAME) |
| `responded_at` | `collaboration_requests.responded_at` |
| `deadline` | `collaboration_requests.deadline` DATE |
| `title` | **DROPPED** (first line of `offer_details`) |
| `description` | **DROPPED** |
| `updated_at` | **DROPPED** |
| `completed_at` | **DROPPED** |
| `shoot_date` | **DROPPED** |
| `usage_terms` | **DROPPED** |
| `licensing_terms` | **DROPPED** |
| `collaboration_type` | **DROPPED** |
| `collaborations.payment_amount` | **DROPPED** |
| `collaborations.payment_status` | **DROPPED** |
| `collaborations.escrow_*` | **DROPPED** |
| `collaborations.completed_at` | **DROPPED** |

---

### `reviews`

| Legacy column | ERD destination |
|---|---|
| `review_id TEXT` | `reviews.review_id INT GENERATED ALWAYS AS IDENTITY` |
| `collaboration_id FK→collaborations` | `reviews.request_id INT FK→collaboration_requests` (RENAME + REKEY) |
| `reviewer_id FK→users` | `reviews.reviewer_id INT FK→users` |
| `reviewee_id FK→users` | `reviews.reviewee_id INT FK→users` |
| `rating` | `reviews.rating` INT CHECK(1–5) |
| `comment` | `reviews.comment` TEXT |
| `created_at` | `reviews.created_at` TIMESTAMPTZ |
| `is_verified` | **DROPPED** |
| `updated_at` | **DROPPED** |

---

### `shortlists` (new — no legacy table)

| ERD column | Notes |
|---|---|
| `business_id INT FK→businesses` | Composite PK |
| `creator_id INT FK→creators` | Composite PK |
| `note TEXT` | Optional |
| `saved_at TIMESTAMPTZ` | Default `now()` |

---

### `sessions`

Unchanged. No column mapping needed.

---

### `password_reset_tokens` (new — no legacy table)

| ERD column | Notes |
|---|---|
| `token_id INT GENERATED ALWAYS AS IDENTITY` | PK |
| `user_id INT FK→users` | |
| `token_hash TEXT` | SHA-256 of the reset token |
| `expires_at TIMESTAMPTZ` | 1-hour expiry |
| `used_at TIMESTAMPTZ NULL` | Set on consumption; prevents reuse |

---

### `audit_log` (new — no legacy table)

| ERD column | Notes |
|---|---|
| `log_id INT GENERATED ALWAYS AS IDENTITY` | PK |
| `table_name TEXT` | Name of the audited table |
| `operation TEXT` | CHECK('INSERT','UPDATE','DELETE') |
| `record_id INT` | PK of the affected row |
| `old_values JSONB NULL` | Previous row (NULL for INSERT) |
| `new_values JSONB NULL` | New row (NULL for DELETE) |
| `actor_user_id INT NULL` | `current_setting('app.user_id', true)` cast to INT |
| `created_at TIMESTAMPTZ` | DEFAULT now() |

---

### Legacy tables with no ERD destination

| Legacy table | Disposition |
|---|---|
| `reels` | **DROPPED** entirely |
| `payments` | **DROPPED** entirely |
| `notifications` | **DROPPED** entirely |
| `metric_snapshots` | **DROPPED** entirely |
| `creator_profiles` | **DROPPED** after merge into `creators` |
| `collaborations` | **DROPPED** after merge into `collaboration_requests` |

---

No further questions.
