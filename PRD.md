# PRD: carigas.my — LPG Shop Finder for Malaysia

> **Status:** v1.0 (Live)
> **Domain:** https://carigas.my
> **Tagline:** "Gas terdekat sekarang" / "Nearby gas now"

---

## 1. Product Overview

A multi-language web app that helps Malaysian households and small businesses find nearby LPG (liquefied petroleum gas) shops offering cylinder exchange and new cylinder purchases. Users browse an interactive map or list of approved shops sorted by distance, with prices, phone numbers, and Google Maps directions.

---

## 2. Problem Statement

- Malaysian households often run out of cooking gas unexpectedly and need to find the nearest supplier quickly.
- Existing solutions (Google Maps, word-of-mouth, WhatsApp groups) are fragmented — no central directory of LPG shops with real prices and services.
- Small gas shop owners lack a digital storefront to be discovered by nearby customers.
- The market spans multiple languages (Malay, English, Chinese, Tamil) — a single-language directory excludes large segments.

---

## 3. Target Audience

| Segment | Need |
|---|---|
| Households | Find nearest gas shop when running low on LPG |
| Small businesses (food stalls, restaurants) | Regular LPG supply at competitive prices |
| Shop owners | Get discovered by nearby customers |
| Community contributors | Help build and maintain the directory |

---

## 4. User Personas

**Aina (30, KL) — Household User**
- Runs out of gas while cooking dinner
- Opens carigas.my on mobile, grants location
- Sees nearest shop is 1.2 km away, RM 26.60 for exchange
- Calls to confirm stock, walks over

**Ramesh (45, Ipoh) — Shop Owner**
- Runs a hardware store that sells gas cylinders
- Wants his shop listed so nearby customers can find him
- Asks community to submit his shop via Google Form
- Admin approves the listing within a day

**Admin (Developer/Owner)**
- Logs into admin dashboard to review new submissions
- Approves/rejects shops, edits details, imports CSV batches
- Monitors listing stats (total, pending, priced)

---

## 5. Features & Requirements

### P0 — Core (Live)

| Feature | Description |
|---|---|
| Interactive Map | Leaflet map with custom marker icons showing shop locations, price badges, and service indicators (exchange/new cylinder) |
| Shop List View | Sortable scrollable list of shops with distance, price, phone, and actions |
| Geolocation | Browser location detection with Haversine distance calculation and sorting |
| Shop Details | Name, address, distance, price (RM), phone (tap-to-call), Google Maps directions link |
| Multi-language | Malay (ms), English (en), Chinese (zh), Tamil (ta) with locale routing `/ms`, `/en`, `/zh`, `/ta` |
| Admin Dashboard | Login-protected CRUD for shops, paginated table, approval toggle, stats |
| Admin Auth | HMAC-signed session cookies, rate-limited login, env-var credentials |
| SEO | Per-locale meta/OG tags, sitemap.xml, robots.txt, JSON-LD structured data |
| Responsive Design | Mobile-first with map/list toggle, adaptive sidebar, touch-friendly targets |

### P1 — High Priority (Live)

| Feature | Description |
|---|---|
| Distance Sorting | Server-side Haversine sorting via API, with client-side fallback |
| Summary Panel | Shop count, nearest distance, lowest price |
| Insights Panel | Priced count, exchange count, new cylinder count, contactable count |
| Community Submission | "Add Shop" button linking to external Google Form for crowd-sourced data |
| Bulk CSV Import/Export | Admin can upload CSV to batch-create shops and download full export |
| Dark Mode | Full dark theme via next-themes with `d` key shortcut |
| Analytics | Optional Google Analytics via env var |

### P1 — In-App Shop Submission (Priority)

| # | Requirement | Details |
|---|---|---|
| 1 | Submission Form | Multi-step form accessible from a "Add Shop" button on the main page (map/list). Fields: shop name, address, lat/lng (via pin-drop on a mini Leaflet map), price (optional), phone (optional), exchange toggle, sell-new toggle. |
| 2 | Map Picker | Leaflet map with a draggable pin. User can search for an address or pan/zoom to their location and drop a pin. Lat/lng are captured automatically from pin position. Reverse-geocode (optional via Nominatim) to fill address field. |
| 3 | Validation | Name and address required. Phone normalized to E.164 (`+60...`). Price must be a positive integer (in sen). Lat/lng must be within Malaysia bounds. |
| 4 | Submission Flow | On submit → POST `/api/shops` with `approved: false` → success toast + redirect back to main page. Flash message: "Shop submitted for review. Admin will approve it shortly." |
| 5 | Pending Shop Seeding | Add a `submittedBy` field (optional string, e.g., email for follow-up) to the Shop model. All submissions start as unapproved — admin must toggle before public visibility. |
| 6 | Admin Notification | New submissions appear in the admin dashboard with a "pending" badge on stats. Additionally, send a Telegram bot notification or email to admin when a new submission arrives (via `fetch` in the API handler). |
| 7 | Admin Review Flow | Admin dashboard gets a "Pending" tab/section showing unapproved shops sorted by newest first. Admin can approve, edit, or delete directly. |
| 8 | Rate Limiting | Max 1 submission per IP per hour to prevent spam. Track via in-memory Map (same pattern as login rate limiting). |

### P1 — Search & Filter (Priority)

| # | Requirement | Details |
|---|---|---|
| 1 | Search Bar | Text input at top of the shop list. Filters shops by name and address (case-insensitive substring match). Uses client-side filtering on the already-fetched shop list. Debounced (300ms). |
| 2 | Service Type Filters | Toggle chips below the search bar: "Exchange", "New Cylinder", "Has Phone". Shops must match all active filters (AND logic). |
| 3 | Clear All | A "Clear filters" button/link that resets search text and all toggles. |
| 4 | Empty State | When no shops match filters, show a friendly illustration + message: "No shops match your search. Try adjusting filters or add a new shop." with a CTA to the submission form. |
| 5 | i18n | Search placeholder, filter labels, and empty state translated across all 4 locales. |

### P2 — Future Scope (Not Built)

| Feature | Description |
|---|---|
| User Accounts | Favorites, recent searches, notifications |
| Shop Visit Tracking | Analytics on which shops users view/call |
| Reporting | Flag incorrect prices, closed shops, or wrong phone numbers |
| Map Clustering | Cluster markers when zoomed out for better performance at scale |

---

## 6. Technical Architecture

```
[Browser] → Next.js 16 (App Router) → API Routes → Prisma 7 → PostgreSQL
                    ↕
          ISR (revalidate: 3600s)
                    ↕
              Static Generation
          (sitemap, robots.txt)
```

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.7 (Turbopack) |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4, shadcn/ui (radix-lyra), tw-animate-css |
| Maps | Leaflet 1.9 + react-leaflet 5.0 |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Custom HMAC-SHA256 session cookies |
| Icons | @hugeicons/core-free-icons + @hugeicons/react |
| Fonts | Geist, Geist Mono, JetBrains Mono (next/font) |
| Internationalization | Custom locale routing (`ms`, `en`, `zh`, `ta`) |
| Deployment | Vercel (inferred from Next.js conventions) |

---

## 7. Data Model

### Shop

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Shop name |
| address | String | Full street address |
| lat | Float | Latitude |
| lng | Float | Longitude |
| exchange | Boolean | Offers cylinder exchange service (default: true) |
| sellNew | Boolean | Sells new cylinders (default: false) |
| price | Int? | Price in sen (e.g., 2660 = RM 26.60) |
| phone | String? | E.164 format (`+60xxxxxxxxx`) |
| approved | Boolean | Admin-approved for public display (default: false) |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-updated |

### Price Format
- Stored as integer **sen** (e.g., 2660 → RM 26.60)
- Displayed via `Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" })`

### Phone Format
- Normalized to E.164: `+60` + 8-10 national digits
- Mobile: starts with `1`; Landline: starts with `3-9`
- Display: grouped digits for readability (e.g., `+60 12-345 6789`)

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Performance | Lighthouse score > 90 (mobile), ISR for instant page loads |
| Availability | 99.9% uptime (Vercel SLA) |
| Security | Admin auth via HMAC + timing-safe comparison + rate limiting; same-origin enforcement on writes |
| SEO | Fully indexable across all 4 locales; structured data for rich results |
| Accessibility | Touch targets ≥ 44×44px, semantic HTML, keyboard-navigable map/list |
| Internationalization | Complete UI translation in 4 languages, locale-aware number/currency formatting |

---

## 9. Future Roadmap

| Phase | Features |
|---|---|
| v1.1 | In-app shop submission with map picker + search/filter (text + service toggles) + Telegram/email notification for admin |
| v1.2 | Map clustering for dense areas, user reporting (wrong price/closed) |
| v1.3 | Shop owner accounts (claim and manage own listing), visit analytics |
| v2.0 | Mobile app (React Native or PWA), push notifications for nearby shops |
