# CLAUDE.md — the-palms-at-island-moorings

Auto-loads when a Claude session opens this repo. Points you at the right context.

## What this repo is

The **pre-sales marketing site + buyer-interest capture** for **The Palms at
Island Moorings** — a new **luxury waterfront home development** at the Island
Moorings marina, Port Aransas, TX.

- It is **Collie Farley's / Farley Creative's creative client.** FC owns the
  brand and creative. **Our remit is the backend/infrastructure**, built ahead
  of her so her creative drops into a ready home.
- As of the 2026-06-19 kickoff it is **truly an empty vessel** — brand, copy,
  and imagery are deliberate placeholders.

## Domains

- `thepalmsatislandmoorings.com` → public user-facing site
- `thepalms.dev` → ops spine (email `name@thepalms.dev`, hub login, auth)

## Stack

Next.js 16 · React 19 · Tailwind 4 (PostCSS) · TS 6 · Vercel. Mirror of
`farley-creative-site` for contributor parity. Don't introduce a different stack.

## Conventions (non-negotiable)

- **Placeholder brand.** `src/app/globals.css @theme` holds PLACEHOLDER coastal-
  luxury tokens + Cormorant Garamond / Montserrat. Swap the entire block the
  moment Collie's real brand lands. Nothing here is final.
- **No hardcoded brand strings** outside `src/lib/site.ts`.
- **Photo/render-led, but none exist yet.** Hero, residence cards, and the map
  are CSS-gradient placeholders. Replace with real imagery; don't fabricate
  specifics (home counts, sizes, prices, dates) — we don't have them.
- **The Palms' leads ≠ FC's leads.** `register-interest` captures the
  *development's* buyer pipeline. Do NOT route it into Farley Creative's agency
  pipeline. (`src/lib/leads.ts` is the persistence seam — not wired to a store yet.)
- **noindex during pre-sales.** `robots.ts` disallows all; layout sets
  `robots:{index:false}`. Flip both at public launch.
- **Author commits as** `haveebot <haveebot@gmail.com>` (Vercel build-author parity).
- **Commit convention:** lowercase imperative subject — `feat:` `fix:` `polish:` `copy:` `docs:`.

## Not yet created (outward-facing — needs Winston's go)

GitHub repo · Vercel project · DNS for either domain · Neon/lead store · Workspace
email on `thepalms.dev`. See `docs/next-actions.md`.

## Cross-references

- FC site (template parity): `~/Projects/workspace/farley-creative-site/`
- FC Hub (lead/pipeline patterns): `~/Projects/workspace/farley-creative-hub/`
- Workspace memory: `~/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/`
  (see `project_palms_island_moorings.md`)
