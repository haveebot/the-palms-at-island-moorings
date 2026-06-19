# Next actions — The Palms at Island Moorings

_Live list. Newest decisions at top._

## Outward-facing (needs Winston's go — NOT done in the scaffold)

- [ ] **GitHub repo** — `haveebot/the-palms-at-island-moorings` (public, per Vercel contributor-onboarding rule)
- [ ] **Vercel project** — `haveebots-projects` scope, autodeploy on push
- [ ] **DNS** — point `thepalmsatislandmoorings.com` (apex/www) at Vercel; decide `thepalms.dev` usage (hub subdomain + email)
- [ ] **Google Workspace** on `thepalms.dev` — inbound interest address + Collie/ops mailboxes
- [ ] **Lead store** — provision the `register-interest` persistence (the seam in `src/lib/leads.ts`):
      Neon `palms_leads` table (FC Hub pattern) **or** forward to a `thepalms.dev` hub **or** Resend email-to-inbox
- [ ] Collie GitHub collaborator invite once repo exists

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
