# CLAUDE.md — the-palms-at-island-moorings

Auto-loads when a Claude session opens this repo. Points you at the right context.

_Last refreshed 2026-09-18._

## What this repo is

One Next.js app serving two surfaces for **The Palms at Island Moorings**, a
luxury waterfront homesite development at the Island Moorings marina,
Port Aransas, TX (21 homesites, homes 5,000–10,000 sq ft, pre-sales stage).

| Surface | Domain | What it is |
|---|---|---|
| Public site | `thepalmsatislandmoorings.com` | Pre-sales marketing page + "Join the Founders' List" capture. Still **noindex** (stealth) until launch. |
| Operator hub | `thepalms.dev` | Login-gated "Owner & Partner Hub": Dashboard · Leads · Inventory · Sales · Marketing · Documents. |

Host-routing lives in `src/proxy.ts` (hub paths 404 on the public domain; the
hub and every `/api/hub/*` route are session-gated there).

**Who owns what.** Farley Creative (Collie) owns the brand and the public
site's creative. We (Winston + Claude) own the backend and the hub. Shana is
the developer/owner and a hub operator.

## Stack

Next.js 16 · React 19 · Tailwind 4 (PostCSS) · TypeScript 6 · Vercel
(project `the-palms-at-island-moorings`, team `haveebots-projects`, autodeploys
`main`). Mirrors `farley-creative-site` for contributor parity. Don't
introduce a different stack or a mapping/UI library.

## How the pieces work

- **Data** = Vercel Blob doc store, one JSON object per collection
  (`collections/<name>.json`) behind `src/lib/store.ts`
  (`listDocs/getDoc/putDoc/deleteDoc`). Collections: contacts, leads, units,
  broadcasts, campaigns, documents, brokerages, users. Writes are
  whole-collection read-modify-write, so rapid parallel writes to one
  collection can drop an edit. Do bulk changes in one write.
- **Document files** upload browser-direct to Blob (`/api/documents-upload`
  mints session-gated tokens), up to 2 GB per file.
- **Backups**: daily Vercel cron `/api/cron/backup` (07:00 UTC,
  `CRON_SECRET`) snapshots every collection to `backups/`.
  `scripts/backup-collections.mjs` makes an off-Vercel copy in `~/palms-backups/`.
- **Auth**: per-user email + password (`src/lib/users.ts`, PBKDF2 in
  `src/lib/password.ts`) with a shared team password as fallback. Sessions are
  HMAC-signed cookies (`src/lib/hub-session.ts`). Google SSO code exists but is
  parked (no OAuth env). Add or reset a user:
  `node scripts/create-user.mjs <email> "<Name>" operator [password]`.
- **Email**: Google Workspace on `thepalms.dev`, SMTP app password on
  `hello@thepalms.dev` (`src/lib/email.ts`). Lead alerts (`src/lib/notify.ts`)
  and Sales broadcasts (`src/lib/broadcasts.ts`) both ride it. Broadcast sends
  stay gated OFF until `BROADCAST_MAILING_ADDRESS` (CAN-SPAM postal address) is
  set in Vercel env.
- **Sales engine**: `src/lib/scoring.ts` + `src/lib/texas-wealth.ts` (ACS
  Census-grounded corridors). The in-hub Scoring Guide renders from the same
  constants, so it can't drift. Never fabricate individual income/production.

## Conventions (non-negotiable)

- **Brand lives in two places only:** strings in `src/lib/site.ts`, color and
  type in the `@theme` block of `src/app/globals.css`. Collie's interim brand
  kit is what's applied; swap the whole block when her final kit lands.
- **Public copy has no em dashes** (commas, periods, or a middle dot in
  titles). Code comments and hub-internal text are exempt.
- **Don't invent property specifics.** Only publish facts from the developer
  or Farley Creative (21 homesites · 5,000–10,000 sq ft · Island Moorings est.
  1960 · private 245-slip marina & yacht club). No prices, lot data, or dates
  until they're provided.
- **The Palms' leads ≠ Farley Creative's leads.** `register-interest` feeds the
  development's own pipeline. Never route it into FC's agency pipeline.
- **noindex until launch.** Flip `src/app/robots.ts` and the `robots` metadata
  in `src/app/layout.tsx` together, and add `sitemap.ts`, at public launch.
- **This repo is PUBLIC on GitHub.** No secrets, no contact data, no internal
  business detail in tracked files. Env lives in Vercel; `.env.local` is gitignored.
- **Multi-contributor git:** `git fetch && git rebase origin/main` before every
  push (Collie pushes the public site; we push the hub).
- **Author commits as** `haveebot <haveebot@gmail.com>`; lowercase imperative
  subjects (`feat:` `fix:` `polish:` `copy:` `docs:`).

## Where the rest of the brain is

- `docs/next-actions.md` — the live list (blockers, launch gates, backlog)
- `docs/session-notes/` — dated handoff briefs (read the newest first)
- `docs/project-brief.md` — scope and who-does-what
- `contributor-context/README.md` — the short version for contributors
- Workspace memory (operator side, private):
  `~/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/project_palms_island_moorings.md`
