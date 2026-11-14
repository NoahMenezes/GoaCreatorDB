# GoaConnect — 8-Minute Comprehensive Demo Script

**Platform:** GoaConnect (`GoaCreatorDB`)  
**Audience:** Evaluators, Brands, Creators, and Technical Reviewers  
**Target Duration:** Exactly 8 minutes  
**Demo Notice:** All entities, venues, and creators in this walkthrough are simulated demonstration fixtures.

---

## Demo Schedule & Timeline Summary

| Time | Persona / Role | Account Email | Starting Route | Key Feature Demonstrated |
|---|---|---|---|---|
| **0:00 – 1:00** | Public Guest | *None (Unauthenticated)* | `/` | Landing page, trust metrics, and coastal niche directory |
| **1:00 – 2:30** | Brand / Venue | `palmeira@goaconnect.in` | `/login` → `/business/discover` | Trigram search, taluka filtering, and creator rate cards |
| **2:30 – 3:45** | Brand / Venue | `palmeira@goaconnect.in` | `/business/discover` | Unified collaboration proposal modal & campaign brief |
| **3:45 – 5:00** | Content Creator | `rahul@goaconnect.in` | `/login` → `/creator/requests` | Proposal review, contact privacy unmasking & contract accept |
| **5:00 – 6:15** | Brand / Venue | `palmeira@goaconnect.in` | `/business/requests` → `/business/reviews` | Deal completion transition & verified mutual 5-star review |
| **6:15 – 7:30** | Platform Admin | `admin@goaconnect.in` | `/login` → `/admin` | Executive KPIs, KYC account & metric approvals, audit log |
| **7:30 – 8:00** | System Architect | `admin@goaconnect.in` | `/admin/reports` & Terminal | Architecture recap: PostgreSQL 16 triggers, views & test pass |

---

## Step-by-Step Walkthrough

### Part 1: Public Marketplace Discovery (0:00 – 1:00)
- **Account:** Unauthenticated (Public visitor)
- **Page:** `http://localhost:3000/`
- **Script & Actions:**
  1. **Landing Hero:** Highlight the headline: *"The Premier Platform for Creators, Luxury Stays & Hospitality Brands in Goa."*
  2. **Platform Trust Metrics:** Scroll down to the Trust Metrics banner. Point out the live database counts rendered via `GET /api/stats/public` (120+ creators, 40+ venues, 100+ completed campaigns across North & South Goa).
  3. **Demo Data Disclosure:** Show the notice in the footer: *"Demo Data: All business and creator profiles on this platform are simulated and fictional for demonstration and evaluation purposes."*
  4. **Click "Client Sign In"** or navigate to `/login` to begin the business flow.

---

### Part 2: Business Login & Creator Discovery (1:00 – 2:30)
- **Account:** Business Venue (`palmeira@goaconnect.in` / `business123`)
- **Page:** `/login` → `/business/dashboard` → `/business/discover`
- **Script & Actions:**
  1. On `/login`, click the quick-fill button **"Business (Palmeira Demo)"** or type `palmeira@goaconnect.in` / `business123`. Click **"Sign In to GoaConnect"**.
  2. Land on `/business/dashboard`. Note the personalized welcome: *"Welcome back, Café Palmeira (Demo Fictional)"*, showing active campaigns, saved bookmarks, and live spend stats.
  3. Click **"Discover Creators"** in the left sidebar (navigates to `/business/discover`).
  4. **Live Trigram Search:** In the search bar, type `Rahul`. Notice immediate fuzzy matching highlighting **Rahul Naik (Demo Fictional)** with food & dining vertical tags and Panjim location.
  5. **Filter by Geography:** Clear search, then filter by **Taluka** (e.g. *Assagao*, *Anjuna*, *Calangute*). Demonstrate filtering by **Collab Type** (*Paid*, *Barter*, *Hybrid*) and **Max Rate (₹)**.
  6. Click on **Rahul Naik (Demo Fictional)** to view the dynamic profile at `/business/creators/1`. Show engagement rate, verified badge, and recent review history.

---

### Part 3: Sending a Collaboration Proposal (2:30 – 3:45)
- **Account:** Business Venue (`palmeira@goaconnect.in`)
- **Page:** `/business/discover` or `/business/creators/1`
- **Script & Actions:**
  1. Click the **"New Request"** button (top header) or **"Book Collaboration"** on the creator's profile.
  2. In the modal:
     - **Select Creator:** Choose `Rahul Naik (Demo Fictional)`.
     - **Campaign Brief:** Enter `Monsoon Tasting Menu & Artisan Sourdough Feature`.
     - **Deliverables:** Check `1 Dedicated Instagram Reel` and `2 Story Mentions`. Note how the campaign total recalculates in real-time.
     - **Deadline:** Select a date 14 days in the future.
  3. Click **"Submit Collaboration Request"**.
  4. Point out the success banner: *"Request Sent Successfully! ₹14,000 offer submitted pending creator response."*
  5. Navigate to `/business/requests`. Show the new request listed with status badge `PENDING`. Note that the business phone number is cloaked from third parties.

---

### Part 4: Creator Contract Review & Acceptance (3:45 – 5:00)
- **Account:** Content Creator (`rahul@goaconnect.in` / `creator123`)
- **Page:** `/login` → `/creator/dashboard` → `/creator/requests`
- **Script & Actions:**
  1. Log out via the sidebar or open an incognito window, navigate to `/login`.
  2. Click **"Creator (Rahul Demo)"** or enter `rahul@goaconnect.in` / `creator123`. Click **"Sign In to GoaConnect"**.
  3. Land on `/creator/dashboard`. Show creator metrics: 85K followers, ₹8,500 base rate, and 4.9 average rating.
  4. Click **"Collaboration Requests"** in the navigation bar.
  5. Locate the incoming proposal from **Café Palmeira (Demo Fictional)**.
  6. Point out:
     - The offer amount (₹14,000) and deliverables scope are immutable as enforced by PostgreSQL triggers.
     - The business contact phone is hidden while `pending`.
  7. Click **"Accept Request"** (confirms via prompt).
  8. Watch the atomic transaction run: status updates to `Accepted • In Progress`, and the business venue's contact phone (`+91 98221 44556`) is unmasked!

---

### Part 5: Campaign Completion & Verified Review (5:00 – 6:15)
- **Account:** Business Venue (`palmeira@goaconnect.in` / `business123`)
- **Page:** `/login` → `/business/requests` → `/business/reviews`
- **Script & Actions:**
  1. Switch back to the business account (`palmeira@goaconnect.in`).
  2. Navigate to `/business/requests`. Locate the accepted collaboration with Rahul Naik.
  3. Click **"Mark Completed"** (triggers transactional PL/pgSQL function `fn_complete_collaboration`).
  4. The request status badge changes to `Completed`.
  5. Navigate to `/business/reviews` in the sidebar.
  6. Under **"Leave a Collaboration Review"**:
     - The newly completed request is automatically selected.
     - Select **5 Stars**.
     - In the feedback textarea, type: *"Incredible visual storytelling! The reel drove massive engagement and weekend reservations."*
     - Click **"Publish Verified Review"**.
  7. Confirm the success notification: *"Review published to creator's verified public profile."* The review immediately appears in the published reviews stream below.

---

### Part 6: Platform Governance & Admin Verification (6:15 – 7:30)
- **Account:** System Administrator (`admin@goaconnect.in` / `admin123`)
- **Page:** `/login` → `/admin` → `/admin/verifications` → `/admin/users`
- **Script & Actions:**
  1. Log in as administrator: `admin@goaconnect.in` / `admin123`.
  2. **Platform Control Center (`/admin`):**
     - Review live aggregate KPIs: Total Creators (120), Businesses (40), Total Requests (400+), Completed Deals Volume (>₹1.9M).
     - Inspect the **6-Month Request Velocity** SVG chart and **Category Distribution** bar graphs.
     - Note the visible **Demo Data Environment** notice.
  3. Click **"Verifications"** (`/admin/verifications`):
     - **Accounts Tab:** Inspect unverified applicants with their dynamic trust score (`fn_trust_score`) and risk categorization (`LOW` / `MEDIUM` / `HIGH`).
     - Click **"Approve"** on a pending creator account, confirm in the modal. Note the instant success toast.
     - **Metrics Tab:** Click the **Metrics** tab. Review self-reported engagement metrics submitted by creators.
     - Click **"Approve"** on a metric record, transitioning `data_source` from `self_reported` to `admin_verified`.
  4. Click **"Users"** (`/admin/users`):
     - Show the administrative user directory with role badges (`creator`, `business`, `admin`) and verification toggles.
     - Note the built-in safeguards: the last remaining admin cannot be deleted or unverified.

---

### Part 7: Technical Architecture & Conformance Wrap-Up (7:30 – 8:00)
- **Audience:** Technical Reviewers & Evaluators
- **Page:** Terminal & `docs/schema.md`
- **Script & Actions:**
  1. **Schema Integrity:** Explain that the platform runs on 11 normalized ERD tables and 3 audit/system tables, with zero client-side schema drift:
     ```bash
     bun run db:erd-check
     ```
     *(Outputs: PASSED: 100% ERD Conformance. No schema drift detected.)*
  2. **Automated Verification:**
     ```bash
     bun run test
     ```
     *(Runs 176 tests across unit, API, and PL/pgSQL database constraints — 100% passing in <15s).*
  3. **Production Security:** Mention that Content Security Policy (CSP), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and frame ancestor protections are active, `AUTH_SECRET` is required in production, and login endpoints are strictly rate-limited.
  4. **Conclusion:** *"GoaConnect delivers a modern, resilient, and enterprise-grade creator economy infrastructure purpose-built for Goa's hospitality ecosystem."*
