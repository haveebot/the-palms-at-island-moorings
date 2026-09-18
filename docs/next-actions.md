# Next actions — The Palms at Island Moorings

_Live list. Rewritten 2026-09-18 after a full review; the June build history
lives in git log and the handoff briefs in `docs/session-notes/`._

## Blocking now

- [ ] **Restore `thepalms.dev` email (Google Workspace).** As of 2026-09-18 every
      `@thepalms.dev` address bounces ("account does not exist") and SMTP sign-in
      for `hello@` demands a browser login. Lead alerts fail quietly (leads
      still save to the hub), and the public footer's `info@thepalms.dev`
      bounces. Needs an admin sign-in at admin.google.com as `hello@thepalms.dev`
      to see and clear the cause. Then re-verify: RCPT probe → 250, SMTP auth OK,
      one test alert (and a new app password in Vercel env if the old one is dead).
- [ ] **`BROADCAST_MAILING_ADDRESS`** (CAN-SPAM postal address) in Vercel env →
      turns on brand broadcast sends from the Sales composer. Copy-emails works
      without it.

## Needed from the developer and Farley Creative

- [ ] **Homesite data** for Inventory: the 21 lots (identifiers, frontage,
      size), pricing or price bands, phase/release plan, status.
- [ ] **Renderings / site plan** for the public page and the planned 21-lot
      live-availability map.
- [ ] **Final brand kit** (interim kit is live) → swap `site.ts` + `@theme`.
- [ ] **Launch decision + date** (drives the launch gates below).
- [ ] Confirm the public contact address (footer shows `info@thepalms.dev`).

## Launch gates (do these before driving traffic)

- [ ] Email restored and a live test alert received (above).
- [ ] **Move lead and user data to private storage.** Collections sit on a
      public-access Blob store at predictable paths (the store hostname is not
      published anywhere public). Fine while leads are empty; not fine once real
      buyers sign up. `@vercel/blob` 2.8 supports `access: "private"`.
- [ ] Flip `robots.ts` + `layout.tsx` robots metadata to index; add `sitemap.ts`.
- [ ] DKIM: confirm "Start authentication" is on in Workspace admin (DNS record is published).
- [ ] Optional hardening: Turnstile on the Founders' List form (a honeypot is
      already enforced server-side).

## Hub backlog (build when the need is real)

- [ ] 21-lot interactive availability map (public page ↔ hub Inventory) — once lot data exists
- [ ] Self-service change-password in the hub (today: `scripts/create-user.mjs` resets)
- [ ] Lead delete in the UI; full unit edit (today: add / inline status / delete)
- [ ] Reservations + deposits; CSV export
- [ ] Google SSO (code parked; needs `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET`)
- [ ] Contact data fixes flagged in June (Julie Reupke → Compass; Dana Kisel →
      Phyllis Browning; "Natalia" vs "Natasha" Muse; Mark Rose @ Briggs unconfirmed)
- [ ] Browser pass for the last bot-walled agent emails (needs a logged-in Chrome session)
- [ ] Postgres/Neon only if this becomes a multi-development platform (store interface is swap-ready)

## Done (highlights)

- Public site + Founders' List capture live; hub live with per-user logins
- Sales engine: 560 web-verified contacts, brokerage pages, Census-grounded
  scoring (v2, broker-led), in-hub Scoring Guide, command-center TX map
- Broadcast composer (personalized, chunked, confirm-gated, unsubscribe) + Copy-emails
- Daily backups (every collection as of 2026-09-18); documents library (2 GB/file)
- 2026-09-18: Next 16.3.5 / nodemailer 9.1.1 security patches (0 audit
  advisories); em-dash pass on public copy; placeholder and test data cleared from the hub
