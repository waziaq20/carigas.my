# AGENTS.md

## Repo Shape
- Single-package Next.js app using the App Router from `app/`; there is no `src/` directory.
- `app/layout.tsx` wires `ThemeProvider`, Google fonts, and `app/globals.css`; page work usually starts in `app/page.tsx` or new routes under `app/`.
- `components/ui/` is shadcn-owned UI, `components/theme-provider.tsx` is the only client provider, and shared utilities live in `lib/`.

## Commands
- Use Bun for installs and scripts because `bun.lock` is the only lockfile.
- `bun install` installs dependencies.
- `bun run dev` starts `next dev --turbopack`.
- `bun run lint` runs ESLint with Next core-web-vitals and TypeScript rules.
- `bun run typecheck` runs `tsc --noEmit`.
- `bun run build` runs `next build`.
- `bun run format` runs Prettier only for `**/*.{ts,tsx}`.
- `bun run prisma:generate` regenerates the ignored Prisma client under `lib/generated/prisma/`; `bun run prisma:migrate` requires `DATABASE_URL`.
- No test runner or CI workflow is configured; use lint, typecheck, and build for verification unless you add tests.

## Design Reference
- All UI design must follow `DESIGN.md` — color palette, typography, spacing, shadows, border-radius, and component styles are defined there. Consult it before writing any markup or styles.

## Styling And UI
- Tailwind CSS v4 is configured through `app/globals.css` and PostCSS; do not add a Tailwind config file unless a tool explicitly requires one.
- Prettier uses `prettier-plugin-tailwindcss` with `tailwindStylesheet: "app/globals.css"` and sorts classes inside `cn()` and `cva()`.
- shadcn config is in `components.json`: style `radix-lyra`, base color `stone`, icon library `hugeicons`, aliases like `@/components`, `@/components/ui`, and `@/lib/utils`.
- Theme switching is class-based via `next-themes`; the global provider also binds the `d` key to toggle light/dark outside typing targets.

## Project Conventions
- TypeScript path alias `@/*` maps to the repository root, not `src/`.
- The project uses semicolon-free formatting, double quotes, LF endings, 2-space indentation, and trailing commas where valid in ES5.
- `next-env.d.ts`, `.next/`, `out/`, and `build/` are ignored by ESLint; do not edit generated `.next/` files.
- Prisma 7 uses `prisma.config.ts` for `DATABASE_URL`; app code should import the shared client from `@/lib/prisma`.
