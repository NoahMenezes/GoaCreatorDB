# Goa Creator

> **The Premier Platform for Creators, Luxury Stays & Brands in Goa.**

Goa Creator is a full-stack web platform built for storytellers, filmmakers, lifestyle creators, boutique villas, and brands operating in Goa. Discover brand partnerships, gain access to secret shoot locations across North & South Goa, and monetize your creative lifestyle in paradise.

---

## Features

- **Curated Shoot Locations**: Discover pre-vetted private Portuguese heritage villas in Fontainhas, Assagao boutique stays, and cliffside sunset viewpoints with verified filming permits.
- **Direct Brand Partnerships**: Connect creators directly with luxury resorts, beach clubs, and lifestyle brands without intermediary agencies.
- **Escrow Payouts**: Guaranteed milestone-based compensation deposited securely and released within 24 hours of deliverable approval.
- **Animated Theme Toggling**: Seamless dark and light mode switching powered by Magic UI's View Transitions API.
- **Real-Time Media Kits**: Dynamic analytics displaying verified Goa reach, impressions, and engagement metrics.
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

---

## Project Structure

```
GoaCreatorDB/
├── app/
│   ├── favicon.ico
│   ├── globals.css              # Tailwind v4 theme tokens & View Transitions
│   ├── layout.tsx               # Root layout with Geist fonts & dark mode support
│   └── page.tsx                 # Main Goa Creator landing page
├── components/
│   ├── hero-section-2.tsx       # Cinematic interactive campaign player with live milestone stats
│   ├── hero-section-2-header.tsx# Fixed navbar with AnimatedThemeToggler & mobile drawer
│   ├── features-3.tsx           # Vertical 9:16 creator reels & brand collabs showcase
│   ├── features-4.tsx           # Shoot locations & creator residencies video showcase
│   ├── content-2.tsx            # Live production & milestone escrow workflow
│   ├── stats-2.tsx              # Platform metrics & revenue counter
│   ├── pricing-2.tsx            # Explorer, Creator Pro & Brand pricing tiers
│   ├── faqs-1.tsx               # Interactive FAQ accordion
│   ├── call-to-action-2.tsx     # Final onboarding CTA
│   ├── footer-2.tsx             # Luxury brand footer & community links
│   ├── logo.tsx                 # Bespoke Goa Creator aperture & horizon brand identity
│   └── ui/                      # Base UI & Shadcn primitives (buttons, cards, toggler)
├── hooks/
│   └── use-media.ts             # useSyncExternalStore responsive media query hook
├── public/
│   └── *.svg                    # Brand and vector assets
├── components.json              # Shadcn & Tailark OSS registry config
├── next.config.ts               # Next.js 16 configuration (PPR, Unsplash remote patterns)
├── package.json                 # Project dependencies & scripts
└── tsconfig.json                # Strict TypeScript configuration
```

---

## License

This project is licensed under the MIT License.
