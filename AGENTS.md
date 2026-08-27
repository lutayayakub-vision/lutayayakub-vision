# AgriDoctor AI — Base44 dev notes

## Stack
- Vite 5 + React 18 + TypeScript + Tailwind. Hash-based router (`src/lib/router.tsx`).
- Backend is **Supabase** (auth + Postgres). Client: `src/lib/supabase.ts` reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from `import.meta.env`.
- Schema + seed live in `supabase/migrations/` (uses `auth.uid()` + RLS — meant for a Supabase project).

## Running here
`docker compose -f docker-compose.base44.yml up -d`
- `install` (one-shot): `npm install` into a shared `node_modules` volume.
- `web`: `node:22` bind-mounting the repo, runs `vite` with HMR on port 5173 → host 3000.
- Vite is configured (`vite.config.ts`) with `host: true`, `allowedHosts: true`, and polling watch for bind-mount live reload.

## Secrets
Supabase credentials are external and delivered via `/run/base44/app.env` (env_file listed last in compose so they win over `.env.base44-defaults` placeholders). Without them the landing page still renders, but auth + data features fail.

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the Vite-served HTML (with `/@react-refresh`).
- Preview shows the landing page at `/`. Login/dashboards need valid Supabase creds + migrations applied to that project.
