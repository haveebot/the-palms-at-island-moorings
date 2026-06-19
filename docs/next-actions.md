# Next actions — The Palms at Island Moorings

_Live list. Newest decisions at top._

## Outward-facing

- [x] **GitHub repo** — `haveebot/the-palms-at-island-moorings` (public) ✅ 2026-06-19
- [x] **Vercel project** — `the-palms-at-island-moorings` in `haveebots-projects`, autodeploy on push ✅
- [x] **DNS / domain** — `thepalmsatislandmoorings.com` LIVE (apex 200, www→apex 308), `ssoProtection:null` ✅
- [ ] **`thepalms.dev`** — intentionally NOT attached to this project; reserved for the ops hub (`hub.thepalms.dev`) + email
- [ ] **Google Workspace** on `thepalms.dev` — inbound interest address + Collie/ops mailboxes
- [ ] ⚠️ **Lead store — REQUIRED BEFORE DRIVING TRAFFIC.** `register-interest` currently persists to logs only (ephemeral on Vercel). Wire the seam in `src/lib/leads.ts`: Neon `palms_leads` (FC Hub pattern) **or** forward to a `thepalms.dev` hub **or** Resend email-to-inbox. Site is noindexed + unadvertised, so safe until we promote it.
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
