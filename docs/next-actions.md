# Next actions — The Palms at Island Moorings

_Live list. Newest decisions at top._

## Outward-facing

- [x] **GitHub repo** — `haveebot/the-palms-at-island-moorings` (public) ✅ 2026-06-19
- [x] **Vercel project** — `the-palms-at-island-moorings` in `haveebots-projects`, autodeploy on push ✅
- [x] **DNS / domain** — `thepalmsatislandmoorings.com` LIVE (apex 200, www→apex 308), `ssoProtection:null` ✅
- [x] **Lead store** — wired to a dedicated **Vercel Blob store** (`the-palms-leads`), one object per lead via `src/lib/leads.ts`. ✅ 2026-06-19 _(v1; migrate to Postgres when the hub grows — seam is one file)_
- [x] **Ops view** — `/ops` lists leads, gated by basic auth (`OPS_USER`/`OPS_PASSWORD` in Vercel env). Seed of the pre-sales hub. ✅
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
