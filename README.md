# GoaConnect — Creator Hub

> **The Premier Platform for Creators, Luxury Stays & Brands in Goa.**

GoaConnect is a full-stack creator collaboration platform connecting storytellers, filmmakers, lifestyle creators, boutique villas, and hospitality brands in Goa. Discover brand partnerships, gain access to verified shoot locations across North & South Goa, and monetize your creative lifestyle.

---

## Features

- **Creator Dashboard**: Overview of requests, collaborations, earnings, and audience metrics
- **Creator Profile Management**: Edit public profile, commercial terms, deliverables, and availability
- **Social Accounts & Metrics**: Connect Instagram/YouTube, sync audience metrics (creator-submitted or verified via official API)
- **Collaboration Requests**: Receive, accept, or decline collaboration requests from businesses
- **Collaboration Management**: Track accepted collaborations through their lifecycle (pending → accepted → in production → submitted → completed)
- **Reviews & History**: Submit and receive verified reviews for completed collaborations
- **Business Account Foundation**: Business registration, profile, campaign creation, and request tracking
- **Authentication**: Session-based auth with bcrypt password hashing, 7-day sessions, Remember Me, forgot password
- **Role-Based Access Control**: Creator and business experiences with isolated data and permissions

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **UI**: Base UI, Shadcn primitives, Lucide icons, Magic UI theme toggler
- **Runtime**: Bun 1.4.0
- **Language**: TypeScript 5 (Strict mode)
- **Database**: SQLite via sql.js (WASM), with migrations from JSON
- **Authentication**: Session-based with bcrypt (12 salt rounds), httpOnly cookies

---

## Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh) installed (recommended: `bun@1.4.0` or higher).

### Installation

```bash
git clone <repository-url>
cd goa-creator
bun install
```

### Environment Setup

```bash
cp .env.example .env
```

### Database Setup

Run the migration and seed scripts:

```bash
bun run scripts/migrate.ts
bun run scripts/seed.ts
```

The migration script preserves existing JSON data as `.data/db.json.bak`. The seed script creates demo accounts with valid password hashes.

### Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
bun run build
bun run start
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Business | `palmeira@goaconnect.in` | `business123` |
| Creator | `rahul@goaconnect.in` | `creator123` |

Demo accounts are created by the seed script with bcrypt password hashes.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Turbopack dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test:unit` | Unit tests |
| `bun run test:api` | API integration tests |
| `bun run test:e2e` | Playwright end-to-end tests |
| `bun run test` | All tests |

---

## Database Schema

The application uses SQLite with the following tables:

- **users** — Platform users (creator, business, admin roles)
- **locations** — Goa locations (area, taluka, district)
- **categories** — Business/creator categories
- **businesses** — Business profiles
- **creators** — Creator profiles
- **sessions** — Authentication sessions
- **creator_profiles** — Public creator showcase profiles
- **reels** — Creator reels/showcase content
- **social_accounts** — Connected social media accounts
- **social_metrics** — Audience metrics snapshots
- **metric_snapshots** — Historical metric data
- **collaboration_requests** — Collaboration requests from businesses
- **collaborations** — Accepted collaborations
- **payments** — Payment and escrow records
- **reviews** — Verified reviews for completed collaborations
- **notifications** — User notifications
- **audit_logs** — Audit trail for sensitive operations

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and create session
- `POST /api/auth/logout` — Logout and invalidate session
- `GET /api/auth/me` — Get current session user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token

### Creator Hub
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/profile` — Get creator profile
- `PUT /api/profile` — Update creator profile
- `GET /api/social/accounts` — List connected social accounts
- `POST /api/social/accounts` — Connect a social account
- `DELETE /api/social/accounts?id=<id>` — Disconnect a social account
- `GET /api/social/metrics` — Get social metrics
- `POST /api/social/sync` — Sync metrics (creator-submitted)
- `GET /api/requests` — List collaboration requests
- `POST /api/requests` — Create a collaboration request (business only)
- `POST /api/requests?id=<id>&action=accept\|decline` — Accept or decline a request
- `GET /api/collaborations` — List collaborations
- `GET /api/collaborations?id=<id>` — Get collaboration details
- `GET /api/reviews` — List reviews
- `POST /api/reviews` — Submit a review
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications` — Mark notification as read

### Public
- `GET /api/creators` — List creators (filter by niche/location)
- `GET /api/reels` — List reels (filter by category/location/search)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database path (defaults to `.data/goa-creator.db`) | No |
| `AUTH_SECRET` | Secret for session signing | Yes (production) |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes (production) |
| `NODE_ENV` | Environment (`development` or `production`) | No |

---

## External Integrations

### Social Media OAuth
Social account connections support Instagram and YouTube. Without OAuth credentials, metrics are creator-submitted and clearly labelled as unverified. To enable verified API sync:

1. Configure Meta/Facebook OAuth credentials for Instagram
2. Configure Google OAuth credentials for YouTube
3. Add credentials to environment variables

### Password Reset
Forgot password generates a reset token. In production, configure email delivery to send the reset link to users.

---

## Testing

```bash
# Unit tests (password hashing, validation)
bun run test:unit

# API integration tests (registration, login)
bun run test:api

# End-to-end tests (Playwright)
bun run test:e2e

# All tests
bun run test
```

---

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- Session tokens in httpOnly, secure cookies (7-day expiry)
- Role-based authorization on all API endpoints
- Server-side ownership checks for all data access
- SQL injection prevention via parameterized queries
- Audit logging for sensitive operations
- No secrets in client-side bundles

See `SECURITY.md` for details.

---

## License

This project is licensed under the MIT License. No copyright holder is asserted — contributors retain rights to their contributions.
