# The Palms at Island Moorings — project brief

_Kickoff: 2026-06-19._

## What it is

A new **luxury waterfront home development** at the Island Moorings marina,
Port Aransas, TX. **Pre-sales is the goal** (pre-construction interest /
reservations), kept high-level for now.

The name is **coincidental** — NOT related to the Palm Family Ventures brands
(Palm Republic / Palm Social Club / PALMFEST). Don't tie them together.

## Who does what

- **Collie Farley / Farley Creative** — owns the brand + creative (her client/project).
- **Us (Winston + Claude)** — backend + infrastructure, run *ahead* of her creative.

## Domains (both secured)

| Domain | Role |
|---|---|
| `thepalmsatislandmoorings.com` | Public, user-facing pre-sales site |
| `thepalms.dev` | Ops spine — email (`name@thepalms.dev`), hub login, auth |

## Phase 1 (this scaffold)

- ✅ Standalone repo on the FC stack (Next 16 / React 19 / Tailwind 4 / TS / Vercel)
- ✅ Public pre-sales shell — hero · vision · residences (placeholder) · location · register
- ✅ Buyer-interest capture (`/api/register-interest`) → persistence **seam** (no store wired yet)
- ✅ Placeholder coastal-luxury brand tokens (swappable)
- ✅ noindex during pre-sales
- ✅ Repo brain (README, CLAUDE.md, docs, contributor-context)

## Billing context (handled separately)

Collie bills FC work — including this engagement — under **Palm Family Ventures,
LLC (PFV)**, but invoices must NOT read "Port A Local." Plan: a separate
standalone **Farley Creative** Stripe account under PFV. Tracked in workspace
memory (`project_account_structure.md` + `project_palms_island_moorings.md`),
not in this repo. **Three billing identities to keep distinct:** Port A Local
(PFV marketplace) · Farley Creative (PFV agency invoicing) · The Palms pre-sales
deposits (future, likely the developer's entity — not ours).

## Open questions for Collie / the developer

- Real residence offering (count, sizes, plans, pricing, completion timing)
- Brand direction, name treatment, renders, site plan
- Inbound interest address on `thepalms.dev`
- Does The Palms get its own ops hub, or do leads route elsewhere first?
