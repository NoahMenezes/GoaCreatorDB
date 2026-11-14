# GoaConnect — Creator Hub

> **The Premier Platform for Creators, Luxury Stays & Hospitality Brands in Goa.**

GoaConnect is a production-grade creator collaboration and discovery platform connecting storytellers, filmmakers, lifestyle creators, boutique villas, culinary experiences, and hospitality brands across North and South Goa. Discover brand partnerships, gain access to verified shoot locations across all 12 Goa talukas, manage negotiation workflows, and collaborate with milestone-backed transparency.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 / React 19)"]
        UI["Tailwind CSS v4 & Base UI Components"]
        Pages["App Router Screens & Portals"]
        State["React Controlled State & SWR / Fetch Hooks"]
        Pages --> UI
        Pages --> State
    end

    subgraph Server["Next.js Server & API Route Handlers"]
        AuthMid["Auth & RBAC Middleware (requireAuth, requireAdmin)"]
        Validation["Zod Input Validation & Sanitization"]
        RouteHandlers["API Handlers (/api/*)"]
        Pool["pg.Pool Connection Singleton (lib/db.ts)"]
        
        State -->|HTTP / JSON Requests| RouteHandlers
        RouteHandlers --> AuthMid
        AuthMid --> Validation
        Validation --> Pool
    end

    subgraph Database["PostgreSQL 16 Engine (Port 5433)"]
        subgraph CoreTables["11 Core Business ERD Tables"]
            Users["users"]
            Locations["locations"]
            Categories["categories"]
            Businesses["businesses"]
            Creators["creators"]
            CC["creator_categories"]
            Social["social_accounts"]
            Metrics["creator_metrics"]
            Requests["collaboration_requests"]
            Reviews["reviews"]
            Shortlists["shortlists"]
        end

        subgraph SystemTables["3 Supporting System Tables"]
            Sessions["sessions"]
            Tokens["password_reset_tokens"]
            Audit["audit_log"]
        end

        subgraph Logic["In-Database Business Logic"]
            Views["Views (v_creator_cards, v_collaborations, v_admin_kpis, etc.)"]
            Functions["PL/pgSQL Functions (fn_accept_collaboration, fn_trust_score, etc.)"]
            Triggers["Triggers (trg_enforce_request_status_transition, audit)"]
        end

        Pool -->|Parameterized Queries & Transactions| Logic
        Logic --> CoreTables
        Logic --> SystemTables
    end

    subgraph Testing["Automated Verification Suite"]
        Unit["Bun Test: Unit Tests"]
        API["Bun Test: API Integration (goa_test DB)"]
        DB["Bun Test: DB Constraints & State Machines"]
        E2E["Playwright E2E: 4 Browser User Journeys"]
    end
```

---

## Database Architecture & Schema Design

The persistence tier runs on **PostgreSQL 16** with the `citext` (case-insensitive email) and `pg_trgm` (fuzzy trigram indexing) extensions.

### 1. The 11 Core ERD Tables
All business tables employ `INT GENERATED ALWAYS AS IDENTITY` primary keys, explicit named `CHECK` constraints, and strict `FOREIGN KEY` cascades/restrictions:

1. **`users`**: Platform authentication identity (`email citext UNIQUE`, `password_hash`, `role IN ('business','creator','admin')`, `is_verified`).
2. **`locations`**: Curated geographic entities (`area_name`, `taluka`, `district IN ('North Goa','South Goa')`, `UNIQUE(area_name, taluka)`).
3. **`categories`**: Content verticals (`category_name UNIQUE`).
4. **`businesses`**: Commercial brand profiles (`user_id UNIQUE FK`, `business_name`, `industry`, `description`, `contact_phone`, `location_id FK`, `instagram_handle`).
5. **`creators`**: Influencer/creator profiles (`user_id UNIQUE FK`, `full_name`, `bio`, `location_id FK`, `accepts_barter`, `min_paid_rate >= 0`).
6. **`creator_categories`**: Many-to-many junction (`creator_id FK`, `category_id FK`, `is_primary`, `PRIMARY KEY (creator_id, category_id)`). Exactly one primary category enforced per creator.
7. **`social_accounts`**: Connected platforms (`creator_id FK`, `platform IN ('instagram','youtube')`, `handle`, `profile_url`, `UNIQUE (creator_id, platform)`).
8. **`creator_metrics`**: Append-only engagement time-series (`account_id FK`, `follower_count`, `avg_views`, `avg_likes`, `avg_comments`, `engagement_rate`, `audience_goa_pct`, `data_source IN ('self_reported','admin_verified')`, `verified_by FK`, `recorded_at`).
9. **`collaboration_requests`**: Campaign agreements & state machine (`business_id FK`, `creator_id FK`, `collab_type IN ('paid','barter','hybrid')`, `offered_amount`, `deliverables`, `offer_details`, `message`, `deadline DATE`, `status IN ('pending','accepted','rejected','completed','cancelled')`, `requested_at`, `responded_at`).
10. **`reviews`**: Two-sided verified feedback (`request_id UNIQUE FK`, `reviewer_id FK`, `reviewee_id FK`, `rating BETWEEN 1 AND 5`, `comment`, `created_at`). Only allowed on completed deals.
11. **`shortlists`**: Business candidate bookmarks (`business_id FK`, `creator_id FK`, `note`, `saved_at`, `PRIMARY KEY (business_id, creator_id)`).

### 2. The 3 Supporting System Tables
12. **`sessions`**: Server-side session tokens (`session_id VARCHAR(64) PRIMARY KEY`, `user_id FK`, `expires_at`, `created_at`).
13. **`password_reset_tokens`**: Ephemeral password reset tokens (`token_hash VARCHAR(64) PRIMARY KEY`, `user_id FK`, `expires_at`, `used_at`, `created_at`).
14. **`audit_log`**: Immutable audit trail (`log_id IDENTITY PRIMARY KEY`, `table_name`, `record_id`, `action`, `old_data JSONB`, `new_data JSONB`, `changed_by FK`, `changed_at`).

### 3. Database Views & Performance Layer
- **`v_creator_cards`**: Pre-aggregated creator search view joining categories, location names, and latest verified metrics.
- **`v_collaborations`**: Unified collaboration contracts displaying both business and creator metadata.
- **`v_admin_kpis`**: Real-time platform KPI dashboard aggregates.
- **`v_taluka_stats`**: Micro-geographic creator and business distribution across all 12 Goa talukas.
- **`v_creator_latest_metrics`**: Window function (`ROW_NUMBER() OVER (...)`) resolving each social account's latest metric snapshot.
- **`v_top_creators`** & **`v_top_businesses`**: Ranked leaderboards based on completed deals and ratings.

### 4. PL/pgSQL Stored Functions & Triggers
- **`trg_enforce_request_status_transition`**: State machine trigger preventing invalid collaboration status transitions.
- **`fn_accept_collaboration(req_id, user_id)`**: Creator acceptance transition.
- **`fn_complete_collaboration(req_id, user_id)`**: Business completion transition.
- **`fn_cancel_collaboration(req_id, user_id)`**: Mutual cancellation transition.
- **`fn_reject_collaboration(req_id, user_id)`**: Creator decline transition.
- **`fn_trust_score(creator_id)`**: Dynamic trust calculation based on verification, reviews, and audience density.
- **`fn_audit_trigger()`**: Generic trigger logging `INSERT`, `UPDATE`, and `DELETE` events into `audit_log`.

Detailed documentation:
- [docs/schema.md](file:///home/piyush/GoaCreatorDB/docs/schema.md) — Comprehensive Data Dictionary & 1NF–3NF Normalization Justification.
- [docs/sql-demo.sql](file:///home/piyush/GoaCreatorDB/docs/sql-demo.sql) — 29 Labelled SQL queries covering all major relational patterns.
- [docs/er-diagram.eraser](file:///home/piyush/GoaCreatorDB/docs/er-diagram.eraser) — Eraser diagram-as-code schema specification.
- [docs/screen-to-table.md](file:///home/piyush/GoaCreatorDB/docs/screen-to-table.md) — Screen-to-table read/write mapping.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Frontend Library** | React 19 |
| **Styling** | Tailwind CSS v4 |
| **UI Primitives** | Base UI, Lucide Icons |
| **Runtime** | Bun 1.4.0+ |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database** | PostgreSQL 16 (Official Docker image with healthcheck) |
| **Database Driver** | `pg` Pool Singleton (`lib/db.ts`) with transaction helpers |
| **Testing** | Bun Test (Unit, API, DB Constraints), Playwright (End-to-End) |

---

## Getting Started

### Prerequisites
1. [Bun](https://bun.sh) (v1.4.0 or higher)
2. [Docker](https://www.docker.com) & Docker Compose

### 1. Installation
```bash
git clone <repository-url>
cd goa-creator
bun install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```
Ensure `.env` matches:
```env
DATABASE_URL=postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb
AUTH_SECRET=demo_auth_secret_must_be_configured_in_production_32chars
```

### 3. Launch PostgreSQL Container
```bash
docker compose up -d
```
Verify container status:
```bash
docker compose ps
```

### 4. Run Migrations & Seed Database
```bash
# Option A: One-command demo reset (resets schema, runs migrations, and seeds demo data)
bun run demo:reset

# Option B: Individual step-by-step commands
bun run db:migrate
bun run db:seed
```

### 5. Start Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

The seeded database contains pre-configured accounts for all three roles:

| Role | Email | Password | Entity & Context |
|------|-------|----------|-------------------|
| **Business** | `palmeira@goaconnect.in` | `business123` | **Café Palmeira (Demo Fictional)** (Calangute, North Goa) |
| **Creator** | `rahul@goaconnect.in` | `creator123` | **Rahul Naik (Demo Fictional)** (Culinary & Food Creator) |
| **Admin** | `admin@goaconnect.in` | `admin123` | **System Administrator** |

---

## API Catalog & Reference

All endpoints return JSON responses in the standard `{ success: boolean, data?: any, error?: string }` format. You can test every route using the comprehensive [api.http](file:///home/piyush/GoaCreatorDB/api.http) REST Client file.

### 1. Authentication & Identity
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new business or creator with transactional profile setup |
| `POST` | `/api/auth/login` | Public | Login with rate limiting; creates 7-day server session cookie |
| `POST` | `/api/auth/logout` | Session | Revoke current session from database |
| `GET` | `/api/auth/me` | Session | Retrieve active user session and role-specific profile |
| `POST` | `/api/auth/forgot-password`| Public | Generate SHA-256 hashed password reset token |
| `POST` | `/api/auth/reset-password` | Public | Consume reset token and update password hash |

### 2. Public Directory & Taxonomy
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/stats/public` | Public | Platform trust counts (verified creators, brands, completed deals) |
| `GET` | `/api/taxonomy` | Public | Full taxonomy tree (all categories and locations hierarchy) |
| `GET` | `/api/categories` | Public | List all content verticals |
| `GET` | `/api/locations` | Public | Geographic locations grouped by district and taluka |
| `GET` | `/api/creators` | Public | Filtered creator directory (trigram search, category, location, rate) |
| `GET` | `/api/creators/featured` | Public | Top-rated verified creator showcase |
| `GET` | `/api/creators/[id]` | Public | Full creator profile with metrics history and verified reviews |
| `GET` | `/api/reels` | Public | Trending portfolio reels and video highlights |

### 3. Profile & Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/profile` | Session | Retrieve current user's role-aware profile |
| `PUT` | `/api/profile` | Session | Update business or creator profile details |
| `GET` | `/api/dashboard/stats` | Session | Role-scoped dashboard summary KPIs and deal velocity |
| `GET` | `/api/notifications` | Session | Computed notification feed from requests and reviews |
| `PATCH` | `/api/notifications` | Session | Mark notifications as read |

### 4. Social Channels & Metric Sync
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/social/accounts` | Session (Creator) | List connected social accounts with latest metrics |
| `POST` | `/api/social/accounts` | Session (Creator) | Connect new Instagram or YouTube channel |
| `DELETE`| `/api/social/accounts` | Session (Creator) | Disconnect social account (`?id=...`) |
| `GET` | `/api/social/metrics` | Session (Creator) | Historical engagement metrics time-series |
| `POST` | `/api/social/sync` | Session (Creator) | Record/sync new engagement metric snapshot |

### 5. Shortlists (Business Only)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/shortlist` | Session (Business) | List bookmarked creators with notes |
| `POST` | `/api/shortlist` | Session (Business) | Add creator to shortlist with notes |
| `PUT` | `/api/shortlist/[creatorId]` | Session (Business) | Update shortlist bookmark note |
| `DELETE`| `/api/shortlist/[creatorId]` | Session (Business) | Remove creator from shortlist |

### 6. Collaboration Requests & Lifecycle
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/requests` | Session (Business) | Submit new collaboration proposal |
| `GET` | `/api/requests` | Session | List collaboration proposals scoped by role |
| `GET` | `/api/requests/[id]` | Session (Parties/Admin) | Get request proposal details |
| `PATCH`| `/api/requests/[id]` | Session (Parties) | Execute lifecycle transition (`accept`, `reject`, `complete`, `cancel`) |
| `GET` | `/api/collaborations` | Session | View active and completed contracts |
| `GET` | `/api/collaborations/[id]` | Session | View contract details and milestones |

### 7. Verified Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reviews` | Public / Session | Fetch reviews by `creator_id` or view received/given reviews |
| `POST` | `/api/reviews` | Session (Parties) | Submit verified rating & review for completed collaboration |

### 8. Admin Operations & Platform Governance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/dashboard` | Session (Admin) | Executive KPIs, revenue metrics, and velocity charts |
| `GET` | `/api/admin/verifications` | Session (Admin) | Verification queue (`accounts` with trust score or `metrics`) |
| `POST` | `/api/admin/verifications` | Session (Admin) | Approve or reject account verification or metric record |
| `GET` | `/api/admin/users` | Session (Admin) | User directory with search, role filters, and pagination |
| `PATCH`| `/api/admin/users/[id]` | Session (Admin) | Toggle user verification status |
| `DELETE`| `/api/admin/users/[id]` | Session (Admin) | Delete user account (with last-admin protection) |
| `GET` | `/api/admin/categories` | Session (Admin) | Category management with creator distribution counts |
| `POST` | `/api/admin/categories` | Session (Admin) | Create new content vertical |
| `PUT` | `/api/admin/categories/[id]` | Session (Admin) | Update category name |
| `DELETE`| `/api/admin/categories/[id]` | Session (Admin) | Delete category |
| `GET` | `/api/admin/locations` | Session (Admin) | Locations roster with creator & business density counts |
| `POST` | `/api/admin/locations` | Session (Admin) | Add new location (area, taluka, district) |
| `PUT` | `/api/admin/locations/[id]` | Session (Admin) | Update location details |
| `DELETE`| `/api/admin/locations/[id]` | Session (Admin) | Delete location |
| `GET` | `/api/admin/reports` | Session (Admin) | Analytical performance reports across time intervals |

---

## Testing Suite & Verification

The platform features a rigorous 4-tier testing hierarchy with complete database isolation:

```bash
# Run unit, API, and DB constraint tests together (176 tests total + ERD check)
bun run test

# 1. Unit Tests (Password hashing, token generation, Zod schemas)
bun run test:unit

# 2. API Integration Tests (Isolated against goa_test database)
bun run test:api

# 3. Database Constraint Tests (Triggers, state machines, checks)
bun run test:db

# 4. Playwright End-to-End Tests (Full user browser journeys)
bun run test:e2e
```

### Test Database Isolation (`goa_test`)
To guarantee that API tests are deterministic and never corrupt the development seed:
- `scripts/setup-test-db.ts` dynamically creates the `goa_test` database.
- It applies pure SQL migrations and seeds dedicated fixtures.
- API tests run 100% isolated on `goa_test`.
- Dev data in `goacreatordb` remains completely untouched.

### Playwright E2E User Journeys
Prerequisites:
```bash
# Ensure PostgreSQL container is running
docker compose up -d

# Install Chromium browser for Playwright
bun x playwright install chromium

# Run all 4 browser specs
bun run test:e2e
```
Flows verified:
- **Flow A (`e2e/01-business-request.spec.ts`)**: Business logs in, discovers creators via directory, opens collaboration modal, and submits a collaboration proposal.
- **Flow B (`e2e/02-creator-accept.spec.ts`)**: Creator logs in, reviews the incoming proposal, and accepts it.
- **Flow C (`e2e/03-business-complete-review.spec.ts`)**: Business marks accepted collaboration as completed, navigates to reviews, and publishes a verified 5-star rating.
- **Flow D (`e2e/04-admin-verify.spec.ts`)**: Administrator reviews pending verifications, approves an unverified user account, and approves self-reported creator metrics.

---

## Code Quality & Static Analysis

```bash
# TypeScript compiler type check
bun x tsc --noEmit

# ESLint analysis
bun run lint
```

---

## License

This project is licensed under the MIT License.
