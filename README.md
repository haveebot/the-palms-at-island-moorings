# The Palms at Island Moorings

Pre-sales marketing site + lead capture for **The Palms at Island Moorings** — a
new luxury waterfront home development at Island Moorings, Port Aransas, TX.

- **Public site** → `thepalmsatislandmoorings.com`
- **Ops spine** (email / hub / auth) → `thepalms.dev`

> Status: **pre-sales scaffold, empty vessel.** Brand, copy, and imagery are
> deliberate placeholders pending Farley Creative (Collie). The infrastructure
> is built ahead of the creative so it drops straight in.

## Stack

Next.js 16 · React 19 · Tailwind 4 (PostCSS) · TypeScript 6 · Vercel
(Analytics + Speed Insights). Identical to `farley-creative-site` for
contributor parity.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure

```
src/app/                 App Router
  page.tsx               Pre-sales home (hero · vision · residences · location · register)
  register/              Dedicated register-interest page
  api/register-interest/ POST endpoint → lead capture seam
  robots.ts              DISALLOW ALL during pre-sales (flip at launch)
src/components/          SiteChrome (header/footer) · Reveal · RegisterInterestForm
src/lib/
  site.ts                Centralized site config — NO hardcoded brand strings elsewhere
  residences.ts          Placeholder residence collection
  leads-shared.ts        Lead types + validation (client-safe)
  leads.ts               Server persistence SEAM (not wired to a store yet)
```

## Conventions

- **No hardcoded brand strings** outside `src/lib/site.ts`.
- **Placeholder brand** — everything in `globals.css @theme` is swappable; do
  not treat colors/type as final until Collie's brand lands.
- **The Palms' leads ≠ Farley Creative's leads.** Buyer interest captured here
  is the *development's* pre-sales pipeline, kept separate from FC's agency leads.
- **Author commits as** `haveebot <haveebot@gmail.com>` for Vercel build-author parity.
- **Commits:** lowercase imperative subject — `feat:`, `fix:`, `polish:`, `copy:`, `docs:`.

See `docs/project-brief.md` for scope and `docs/next-actions.md` for the live list.
