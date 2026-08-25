# Base44 Dev Environment

## What this is
AgriDoctor AI — a Vite + React + TypeScript single-page app. The backend is a **remote Supabase** project (auth + Postgres); there is no local backend service. AI diagnosis is local keyword matching (`src/lib/ai.ts`); image generation uses the free pollinations.ai endpoint (`src/lib/imageGen.ts`) — no API keys.

## Running
- `docker compose -f docker-compose.base44.yml up -d` starts the Vite dev server on host port 3000 (container port 5173).
- The compose service bind-mounts the repo and runs `npm install && npm run dev -- --host 0.0.0.0 --port 5173`. Edits hot-reload live.
- `node_modules` lives in a named volume (not bind-mounted) to avoid host/container conflicts.

## Secrets (external — user supplied)
- `VITE_SUPABASE_URL` — Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — Supabase anon public key.
- Both are delivered via `/run/base44/app.env` (listed last in `env_file:`). Repo-level placeholders in `.env.base44-defaults` let the app boot without them, but login, demo accounts, and all data features require real values.
- The Supabase project must have the migrations in `supabase/migrations/` applied and email auth enabled. Demo accounts (`sarah@agridoctor.demo`, `david@agridoctor.demo`, `admin@agridoctor.demo`, all password `demo1234`) are auto-created on first load via `src/lib/demo.ts`.

## Vite config
- `vite.config.ts` sets `server.host: true` and `allowedHosts: true` so the preview's external hostname is accepted.

## Verifying
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the app HTML.
- `/src/main.tsx` serves unhashed source (confirms dev mode, not a prebuilt bundle).
