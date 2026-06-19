# Contributor context — The Palms at Island Moorings

If you're opening this repo, here's the frame.

## The project

A pre-sales marketing site for **The Palms at Island Moorings**, a new luxury
waterfront home development in Port Aransas, TX. It's **Collie Farley's creative
project** (Farley Creative). This repo is the **backend/infrastructure**, built
ahead of her creative so it drops straight in.

## Two surfaces, two domains

- **Public** → `thepalmsatislandmoorings.com` — the user-facing pre-sales site.
- **Ops** → `thepalms.dev` — email, hub login, auth. Keep operator/dev surfaces here.

## What to know before you change anything

1. **It's an empty vessel.** Brand, copy, and images are placeholders. Don't
   polish placeholder copy as if it's final, and don't invent property
   specifics (home counts, sizes, prices, dates) — we don't have them yet.
2. **Brand lives in two places only:** `src/lib/site.ts` (strings) and the
   `@theme` block in `src/app/globals.css` (color + type). Change brand there,
   nowhere else.
3. **Leads here belong to the development, not the agency.** `register-interest`
   is The Palms' buyer pipeline — never merge it into Farley Creative's leads.
4. **Stack = farley-creative-site's stack.** Stay on it for contributor parity.
5. **Commit as** `haveebot <haveebot@gmail.com>`; lowercase imperative subjects.

## Where the rest of the brain is

- `README.md` — dev quickstart + structure
- `CLAUDE.md` — full conventions for AI sessions
- `docs/project-brief.md` — scope + who-does-what
- `docs/next-actions.md` — the live list
