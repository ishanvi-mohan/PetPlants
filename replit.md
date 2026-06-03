# PetPlants

A gamified pixel-art plant care web app for two users sharing the same account. One person sets up plant schedules remotely; the other waters plants and logs check-ins at home. Your plants are your pets. Treat them like it.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/petplants run dev` — run the frontend (port 24649)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, pixel-art CSS design system
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Fonts: Press Start 2P + VT323 (Google Fonts)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle schema: plants.ts, watering_log.ts, player_stats.ts
- `artifacts/api-server/src/routes/` — plants, log, stats, dashboard routes
- `artifacts/api-server/src/lib/xp.ts` — XP + level calculation logic
- `artifacts/api-server/src/lib/plantHelpers.ts` — plant state computation (next water date, emotional state)
- `artifacts/petplants/src/` — React frontend (pages, components)

## Architecture decisions

- Next watering date is computed, not stored: start from last `watered` log, add `frequency_days` + number of `postponed` logs after that date.
- Plant emotional state (`happy/thirsty/resting/postponed`) is derived at query time from the watering log.
- Player stats live in a single-row `player_stats` table (id=1 always). XP is global, not per-plant.
- All animations use CSS `@keyframes` only — no JS animation libraries.
- Dark-only UI — no light mode toggle.

## Product

- Dashboard: XP level banner, today's summary, 2-column plant grid (due-today cards float to top)
- Plants: full plant list + add/edit forms with emoticon style selector
- Plant Profile: animated emoticon, 10-day history bar, per-plant XP earned
- Watering Log: one-tap water or moist-skip with confetti burst + XP toast
- XP & Leveling: 8 levels (Seedling → Master Gardener), streak bonuses at 3 and 7 days

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `player_stats` table must always have exactly one row with `id=1`. Seeded on first run.
- Press Start 2P never exceeds 16px — it renders very large at small sizes.
- VT323 minimum 18px — looks blurry below that.
- After any OpenAPI spec change, always re-run codegen before editing routes or frontend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
