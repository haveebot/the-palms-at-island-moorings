# The Palms at Island Moorings — project brief

_Kickoff 2026-06-19 · refreshed 2026-09-18._

## What it is

A **luxury waterfront homesite development** at Island Moorings, Port Aransas,
TX: the last undeveloped parcel in Island Moorings. **Pre-sales is the goal**
(a warm Founders' List first, then reservations and timed releases).

Public facts (safe to publish): **21 homesites · homes 5,000–10,000 sq ft ·
Island Moorings established 1960 · private 245-slip Marina & Yacht Club.**
Anything beyond that (pricing, lot details, dates) waits for the developer.

The name is **coincidental**. It is not related to the Palm Family Ventures
brands (Palm Republic / Palm Social Club / PALMFEST). Don't tie them together.

## Who does what

- **Shana**, developer/owner: the client, the source of property facts, a hub operator.
- **Collie / Farley Creative**: brand, creative, and the public site's design; a hub operator.
- **Winston + Claude**: backend, the operator hub, email, data, infrastructure.

## Domains

| Domain | Role |
|---|---|
| `thepalmsatislandmoorings.com` | Public pre-sales site |
| `thepalms.dev` | Ops spine: operator hub, `name@thepalms.dev` email (Google Workspace), auth |

Both are registered through Vercel with auto-renew on (next renewal June 2027).

## What's built

- **Public site**: hero film, the legacy story, the offering, location, and the
  Founders' List capture. Collie's interim brand is applied. Noindexed until launch.
- **Operator hub** (`thepalms.dev`):
  - **Dashboard**: inquiries, pipeline, inventory snapshot
  - **Leads**: Founders' List CRM (stages, notes, activity)
  - **Inventory**: homesites/residences with status and pricing, ready for real data
  - **Sales**: 560 web-verified agent and partner contacts, brokerage pages,
    buyer-quality scoring with a built-in guide, a Texas command-center map,
    compose/broadcast and copy-emails
  - **Marketing**: lead sources, campaigns
  - **Documents**: the project library (brand kit, brief, roadmap, proposal)

## Billing context (handled separately)

Farley Creative's billing is tracked in the operator's private workspace
memory, not in this public repo. Three billing identities stay distinct:
Port A Local · Farley Creative · The Palms pre-sales deposits (future, likely
the developer's own entity, not ours).
