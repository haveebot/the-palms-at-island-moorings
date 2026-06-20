# Next actions — The Palms at Island Moorings

_Live list. Newest decisions at top._

## Outward-facing

- [x] **GitHub repo** — `haveebot/the-palms-at-island-moorings` (public) ✅ 2026-06-19
- [x] **Vercel project** — `the-palms-at-island-moorings` in `haveebots-projects`, autodeploy on push ✅
- [x] **DNS / domain** — `thepalmsatislandmoorings.com` LIVE (apex 200, www→apex 308), `ssoProtection:null` ✅
- [x] **Domain split** — `thepalms.dev` = operator **hub** (login → leads); `thepalmsatislandmoorings.com` = marketing only (hub paths 404). Host-routed in `src/proxy.ts`. ✅ 2026-06-19
- [x] **Hub login** — branded `/hub/login` on `thepalms.dev`, **single shared demo password** (`HUB_ACCESS_PASSWORD`), HMAC-signed cookie session (`HUB_SESSION_SECRET`), `/hub` gated. For Shana (owner/developer) + Collie (creative). ✅
- [x] **Lead store** — wired to a dedicated **Vercel Blob store** (`the-palms-leads`), one object per lead via `src/lib/leads.ts`. ✅ _(v1; migrate to Postgres when the hub grows — seam is one file)_
- [x] **Operator hub** — full pre-sales ops on `thepalms.dev`: **Dashboard** (stats + lead funnel + needs-first-touch), **Leads CRM** (`/hub/leads` — stages, assignee, notes/activity, residence link, detail editor), **Inventory** (`/hub/inventory` — add/edit/delete residences, inline status, price/specs, sample seeding). Blob doc store (`leads/` + `units/`), gated `/api/hub/*`. ✅ 2026-06-19 (commit `e90b0f5`)

- [x] **Sales** — contacts database (agents/partners/prospects), segment builder, broadcast composer (drafts; send rides the pending `.dev` sender). ✅ 2026-06-19 (commit `4cce150`)
- [x] **Documents** — Blob file library (upload/categorize/download/delete). ✅
- [x] **Marketing** — lead-source breakdown, public-site link, campaign tracker. ✅

### Hub follow-ups (next)
- [x] **Source the agent database** — **101 real web-verified contacts** loaded (84 agents + 17 partners, 64 w/ email): Houston 18 · Austin 16 · SA 16 · Dallas 15 · Coastal Bend 36, incl. the Galati Yacht Sales marina partner. ✅ 2026-06-19 (commit `0b0b39d`)
- [ ] **Source deeper + enrich** — more per-market depth; find emails for the 37 contacts captured without one (name+brokerage+market are there)
- [ ] _Not fabricated:_ residences/documents/leads stay sample/empty until Shana's real specs+prices, Collie's floor plans, and real buyers exist
- [ ] **Wire broadcast send** — flips on with the `.dev` email sender (same gate as lead alerts)
- [ ] **Per-user logins** for Shana + Collie (replace the shared demo password)
- [ ] **Lead delete** in the UI (units have delete; leads don't yet)
- [ ] **Real residence data** to replace the 8 seeded samples; **Collie's brand** to skin the hub
- [ ] **Full unit edit** (currently add / inline-status / delete; price/spec edit = delete + re-add)
- [ ] Reservations/deposits + per-residence detail; CSV export; Postgres migration if volume grows
- [ ] **Lead alerts** — code shipped, **env-gated OFF** (`src/lib/notify.ts`): set `RESEND_API_KEY` + `LEAD_ALERT_TO` (+ `LEAD_ALERT_FROM`) to turn on. Cleanest sender = thepalms.dev Workspace, or a dedicated Resend key. Deliberately no borrowed creds.
- [ ] **`thepalms.dev`** — intentionally NOT attached to this project; reserved for the ops hub (`hub.thepalms.dev`) + email
- [ ] **Google Workspace** on `thepalms.dev` — inbound interest address + Collie/ops mailboxes (unblocks lead alerts + a branded `/ops` home)
- [ ] Collie GitHub collaborator invite (when she's ready to work in-repo)

## Content / brand (pending Farley Creative)

- [ ] Swap `globals.css @theme` for real brand tokens + type
- [ ] Logo into `/public/brand`; favicon + OG image
- [ ] Real hero photography / renders (hero, residence cards, location aerial/map)
- [ ] Real residence offering data → `src/lib/residences.ts` (no fabricated specifics until we have them)
- [ ] Real copy across hero / vision / location

## Launch gating

- [ ] Flip `robots.ts` to allow + remove `robots:{index:false}` in `layout.tsx`
- [ ] Add `sitemap.ts` at launch (intentionally omitted while noindexed)
- [ ] DKIM/SPF for `thepalms.dev` email deliverability

## Separate workstream — FC billing under PFV (tracked in workspace memory)

- [ ] Stand up the Farley Creative Stripe account under PFV (walkthrough with Winston — he'll initiate)
- [ ] Winston's 3 answers: payout bank · existing-billing migration · Collie dashboard-now vs Hub-later
