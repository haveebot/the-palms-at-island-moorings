# Contributor context — The Palms at Island Moorings

If you're opening this repo, here's the frame. _Refreshed 2026-09-18._

## The project

The pre-sales site and operator hub for **The Palms at Island Moorings**, a
luxury waterfront homesite development in Port Aransas, TX. Farley Creative
(Collie) owns the brand and the public site's creative; this repo is also where
the backend and the operator hub live.

## Two surfaces, one app

- **Public** → `thepalmsatislandmoorings.com`: the pre-sales page and the
  "Join the Founders' List" capture. Live but noindexed until launch.
- **Hub** → `thepalms.dev`: the operator hub (Dashboard, Leads, Inventory,
  Sales, Marketing, Documents). Login-gated.

Both deploy from `main` of this one repo (Vercel autodeploys every push).
Push a branch instead to get a preview URL first.

## What to know before you change anything

1. **Brand lives in two places only:** `src/lib/site.ts` (strings) and the
   `@theme` block in `src/app/globals.css` (color + type). Collie's interim
   brand kit is what's live; when the final kit lands, swap those two.
   Brand assets are in `public/brand/`; her brand docs are in the hub →
   Documents → **Brand & Design**.
2. **Public copy has no em dashes.** Use commas, periods, or a middle dot.
3. **Only publish facts we've been given** (21 homesites · 5,000–10,000 sq ft ·
   est. 1960 · private 245-slip marina & yacht club). No prices, lot details,
   or dates until the developer provides them.
4. **Leads here belong to the development, not the agency.** The Founders'
   List feeds the hub's Leads, never Farley Creative's pipeline.
5. **Stack = farley-creative-site's stack.** Stay on it.
6. **This repo is public.** Nothing private goes in tracked files.
7. **Before you push:** `git fetch && git rebase origin/main`, then
   `npm run build` must pass.
8. **Commit as** `haveebot <haveebot@gmail.com>`; lowercase imperative subjects.

## Where the rest of the brain is

- `CLAUDE.md` — full conventions for AI sessions
- `README.md` — dev quickstart + structure
- `docs/next-actions.md` — the live list
- `docs/session-notes/` — the latest handoff brief
