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

1. **Interim brand is applied — final kit pending.** Collie's Concept Moodboard
   V1 direction is in as an INTERIM: green/brass/cream `@theme`, the "Join the
   Founders' List" mechanic, and the real public facts from her brief (21
   homesites · 5,000–10,000 sq ft · est. 1960 · 245-slip marina). When the
   **final brand kit** (logo suite, locked palette, type, guidelines) lands,
   swap the whole `@theme` block + `src/lib/site.ts`. Collie's 4 prelim PDFs
   (moodboard, brief, roadmap, proposal) live in the hub → Documents →
   **Brand & Design**. Don't invent property specifics beyond the brief.
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
