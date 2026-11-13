# Goa Creator

> **The Premier Platform for Creators, Luxury Stays & Brands in Goa.**

Goa Creator is a full-stack web platform built for storytellers, filmmakers, lifestyle creators, boutique villas, and brands operating in Goa. Discover brand partnerships, gain access to secret shoot locations across North & South Goa, and monetize your creative lifestyle in paradise.

---

## Features

- **Curated Shoot Locations**: Discover pre-vetted private Portuguese heritage villas in Fontainhas, Assagao boutique stays, and cliffside sunset viewpoints with verified filming permits.
- **Direct Brand Partnerships**: Connect creators directly with luxury resorts, beach clubs, and lifestyle brands without intermediary agencies.
- **Collaboration Requests**: Businesses can send collaboration requests to creators with deliverables and pricing.
- **Creator Portfolios**: Creators maintain public profiles with rates, deliverables, and verified reviews.
- **Animated Theme Toggling**: Seamless dark and light mode switching powered by Magic UI's View Transitions API.
- **Next.js 16 & React 19 Architecture**: Partial Prerendering (PPR), Turbopack compilation, and React Server Component caching for ultra-fast performance.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, PPR, RSC Cache)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with `@tailwindcss/turbopack`
- **UI & Components**:
  - [Tailark Dusk](https://tailark.com) landing page architecture
  - [Magic UI](https://magicui.design) Animated Theme Toggler
  - [Base UI](https://base-ui.com) & [Shadcn UI](https://ui.shadcn.com) primitives
  - [Lucide React](https://lucide.dev) icons
- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Language**: TypeScript 5 (Strict mode)
- **Database**: SQLite (via [sql.js](https://sql.js.org/)) with migration from JSON
- **Authentication**: Session-based with bcrypt password hashing

---

## Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh) installed (recommended: `bun@1.4.0` or higher).

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/NoahMenezes/GoaCreatorDB.git
cd GoaCreatorDB
bun install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | SQLite database path (optional, defaults to `.data/goa-creator.db`) | No |
| `AUTH_SECRET` | Secret for session signing | Yes (production) |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes (production) |
| `NODE_ENV` | Environment (`development` or `production`) | No |

### Database Setup

The application uses SQLite for persistent storage. On first run, existing data from `.data/db.json` is automatically migrated to SQLite.

To initialize the database:

```bash
bun run scripts/migrate.ts
bun run scripts/seed.ts
```

The migration script preserves existing JSON data as `.data/db.json.bak`.

### Development Server

Start the Turbopack development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build

Create an optimized static / PPR production build:

```bash
bun run build
bun run start
```

### Linting

Run ESLint strict checks:

```bash
bun run lint
```

### Testing

Run the test suite:

```bash
# Unit tests
bun run test:unit

# API integration tests
bun run test:api

# All tests
bun run test
```

---

## Project Structure

```
GoaCreatorDB/
├── app/
│   ├── api/
│   │   ├── auth/     # Login, logout, me, register
│   │   ├── creators/ # Creator discovery API
│   │   └── reels/    # Reels showcase API
│   ├── business/     # Business portal routes
│   ├── creator/      # Creator portal routes
│   ├── login/        # Sign-in page
│   ├── register/     # Registration pages
│   ├── join/         # Role selection
│   ├── dashboard/    # Dashboard redirect
│   ├── portal/       # Portal redirect
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Landing page
├── components/       # React components
├── lib/
│   ├── db.ts         # SQLite database layer
│   ├── auth.ts       # Authentication (bcrypt + sessions)
│   ├── showcase-data.ts # Showcase creator/reel data
│   ├── types.ts      # TypeScript interfaces
│   └── utils.ts      # Utility functions
├── scripts/
│   ├── migrate.ts    # JSON to SQLite migration
│   └── seed.ts       # Showcase data seeding
├── tests/
│   ├── unit/         # Unit tests
│   └── api/          # API integration tests
├── types/            # Bun module type declarations
├── .data/            # SQLite database file
├── .env.example      # Environment variable template
├── next.config.ts    # Next.js configuration
├── package.json      # Dependencies & scripts
├── tsconfig.json     # TypeScript configuration
└── eslint.config.mjs # ESLint configuration
```

---

## Authentication

The application uses session-based authentication with secure HTTP-only cookies:

- Passwords are hashed with bcrypt (12 salt rounds)
- Session tokens are stored in `goa_session` cookie (httpOnly, secure in production)
- Sessions expire after 7 days
- Protected routes enforce server-side authorization

Demo credentials (for development):
- Business: `palmeira@goaconnect.in` / `business123`
- Creator: `rahul@goaconnect.in` / `creator123`

---

## Production Readiness

- Persistent SQLite database (no dependency on local JSON storage)
- Secure authentication with bcrypt and secure cookies
- API authorization enforcement
- Environment variable configuration
- Unit and API integration tests
- Migration path from JSON to SQLite

---

## License

This project is licensed under the MIT License.