# carigas.my

`carigas.my` is a multilingual Next.js app for finding nearby LPG gas shops in Malaysia. It shows approved shops on a themed map and list view, requests user location when available, and sorts shops by nearest distance through the API.

## Features

- Multilingual routes for BM, English, Chinese, and Tamil.
- Map and list views for LPG gas shops.
- First-load geolocation request with silent fallback if permission is denied.
- Manual **My location** action with visible error feedback.
- API-backed distance sorting using `lat`, `lng`, and `locale` query params.
- Google Maps directions links from shop cards and map detail cards.
- Shared shop types under `types/` for API, server, and client use.
- Tailwind CSS v4, shadcn/ui, next-themes, Prisma, and Bun.

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7
- PostgreSQL
- Leaflet / React Leaflet
- Bun

## Project Structure

```txt
app/                      App Router pages, API routes, metadata, icons
components/home-page.tsx  Home page state and composition
components/layout/        Site header and language switcher
components/shops/         Reusable shop UI components
components/icons/         Inline app icons
components/ui/            shadcn/ui components
lib/                      Shared utilities, Prisma client, shop helpers
types/                    Shared domain/API types
prisma/                   Prisma schema and seed script
```

## Commands

Use Bun because `bun.lock` is the project lockfile.

```bash
bun install
bun run dev
bun run lint
bun run typecheck
bun run build
bun run format
```

## Environment

Prisma reads the database URL through `prisma.config.ts`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

## API

### List Shops

```txt
GET /api/shops
GET /api/shops?locale=en&lat=3.0738&lng=101.5183
```

Without coordinates, approved shops are returned alphabetically with a localized unavailable-distance label. With coordinates, the API returns UI-ready shops sorted by nearest distance.

### Create Shop

```txt
POST /api/shops
```

Creates a shop using validated JSON input. New shops still depend on approval before appearing in public listings.

## Notes

- The homepage import remains `@/components/home-page`.
- The public map uses OpenStreetMap tiles with app-themed Leaflet styling.
- Browser geolocation requires HTTPS or localhost.
- Existing verification is lint, typecheck, and build; no test runner is configured yet.
