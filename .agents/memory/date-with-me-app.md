---
name: Will You Date Me app
description: Key architecture decisions and gotchas for the date-with-me / api-server project
---

# Will You Date Me — Architecture Notes

**Why:** Rebuilt from https://github.com/ezihe-building/Will-you-date-me into a Replit pnpm monorepo.

## API base URL (critical)
Generated Orval hooks already include `/api` in every URL (e.g. `/api/settings`).
`setBaseUrl('/api')` in main.tsx causes double-prefix: `/api/api/settings`.
**Fix:** `setBaseUrl(import.meta.env.VITE_API_URL || null)` — only set when calling a cross-origin API.

## Auth
- Cookie-based HMAC session signed with `SESSION_SECRET` env var (already provisioned).
- Admin password via `ADMIN_PASSWORD` env var (set to "EZIHE").
- Dashboard hidden behind 7-tap footer easter egg → `/dashboard`.
- Cookie options: `sameSite: 'none'`, `secure: true` in production only.

## Vite config (PORT / BASE_PATH)
Original config threw if PORT or BASE_PATH were missing — breaks Vercel static builds.
**Fix:** Default PORT to 3000, BASE_PATH to '/' when env vars absent.

## Vercel single-tap deployment
`vercel.json` at repo root builds both frontend and backend in one project:
- Build: api-server esbuild → `artifacts/api-server/dist/index.mjs`, then Vite → `artifacts/date-with-me/dist/public`
- `/api/(.*)` rewrites to `artifacts/api-server/api/index.ts` (serverless function)
- `(.*)` rewrites to `/index.html` (SPA fallback)
- `BASE_PATH=/` and `PORT=3000` set in vercel.json `env` block for build time
- `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD` must be set in Vercel project env vars

## DB schema tables
proposals, bookings, visitor_responses, site_settings (singleton id=1), visits

## Query hook enabled guards (TanStack Query v5)
Pass `{ query: { enabled: bool, queryKey: [...] } }` — queryKey is required alongside enabled in v5.
