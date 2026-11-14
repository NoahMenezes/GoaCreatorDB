# GoaConnect — Creator Hub

> **The Premier Platform for Creators, Luxury Stays & Brands in Goa.**

GoaConnect is a production-grade creator collaboration platform connecting storytellers, filmmakers, lifestyle creators, boutique villas, and hospitality brands across North & South Goa. Discover brand partnerships, gain access to verified shoot locations across 12 Goa talukas, and monetize your creative lifestyle with escrow-backed agreements.

---

## Architecture & Database Layer

- **Database**: PostgreSQL 16 (running via Docker Compose on port 5433)
- **Extensions**: `citext` (case-insensitive emails), `pg_trgm` (fuzzy trigram search on creators & handles)
- **Primary Keys**: `INT GENERATED ALWAYS AS IDENTITY`
- **Integrity**: Explicit named `CHECK` constraints, state machine triggers, and PostgreSQL database functions
- **Schema Management**: Pure SQL migrations in `db/migrations/`, tracked in `schema_migrations`
- **Views**: High-performance views (`v_creator_cards`, `v_collaborations`, `v_admin_kpis`, `v_taluka_stats`, etc.)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **UI Primitives**: Base UI, Shadcn, Lucide icons, Magic UI theme toggler
- **Runtime**: Bun 1.4.0+
- **Language**: TypeScript 5 (Strict mode)
- **Database Driver**: `pg` Pool singleton with connection pooling and transaction helpers
- **Testing**: Bun Test (Unit & API), Playwright (E2E)

---

## Getting Started

### Prerequisites

1. [Bun](https://bun.sh) (v1.4.0 or higher)
2. [Docker](https://www.docker.com) & Docker Compose (for PostgreSQL 16)

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

Ensure `.env` contains:
```env
DATABASE_URL=postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb
```

### 3. Start PostgreSQL Container

```bash
docker compose up -d
```

### 4. Migrate and Seed Database

```bash
bun run db:migrate
bun run db:seed
```

### 5. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Business** | `palmeira@goaconnect.in` | `business123` | Café Palmeira (Calangute, North Goa) |
| **Creator** | `rahul@goaconnect.in` | `creator123` | Rahul Naik (Food & Dining Creator) |
| **Admin** | `admin@goaconnect.in` | `admin123` | System Administrator |

---

## Testing Suite

The testing strategy is organized into 4 specialized suites:

```bash
# Run unit, API, and DB constraint tests together (does not run e2e)
bun run test

# 1. Unit Tests (Password hashing, input validation)
bun run test:unit

# 2. API Integration Tests (Isolated against goa_test database)
bun run test:api

# 3. Database Constraints & State Machine Tests (SQL-level triggers & functions)
bun run test:db

# 4. Playwright End-to-End Tests (Full user browser flows)
bun run test:e2e
```

### API Test Database Isolation (`goa_test`)

API tests run against an isolated database (`goa_test`) rather than the development database (`goacreatordb`):
- `scripts/setup-test-db.ts` automatically creates `goa_test`, drops public schema, applies all migrations, and loads deterministic fixtures before the test run.
- Zero dependency on the developer's seed state in `goacreatordb`.

### Playwright E2E Prerequisites & Flows

#### Prerequisites for E2E:
1. PostgreSQL container running: `docker compose up -d`
2. Install Chromium browser for Playwright:
   ```bash
   bun x playwright install chromium
   ```
3. Run E2E tests:
   ```bash
   bun run test:e2e
   ```
   *(Playwright's webServer automatically starts the Next.js development server on `http://localhost:3000` if not already running)*.

#### E2E Flows Covered:
- **Flow A (`e2e/01-business-request.spec.ts`)**: Business logs in, discovers creators via directory, opens collaboration modal, and submits an escrow-backed collaboration request.
- **Flow B (`e2e/02-creator-accept.spec.ts`)**: Creator logs in, views received requests in dashboard, and accepts the collaboration request.
- **Flow C (`e2e/03-business-complete-review.spec.ts`)**: Business marks accepted collaboration as completed, navigates to reviews, and publishes a verified 5-star review.
- **Flow D (`e2e/04-admin-verify.spec.ts`)**: Admin logs in, reviews the verification queue, approves an unverified user account, and verifies a self-reported creator metrics snapshot.

---

## Code Quality & Verification

To verify code quality and type safety:

```bash
# TypeScript compiler check
bun x tsc --noEmit

# ESLint check
bun run lint
```

---

## License

This project is licensed under the MIT License.
