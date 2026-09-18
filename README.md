# The Palms at Island Moorings

Pre-sales site and operator hub for **The Palms at Island Moorings**, a luxury
waterfront homesite development at Island Moorings, Port Aransas, TX.

- **Public site** → `thepalmsatislandmoorings.com` (live, noindexed until launch)
- **Operator hub** → `thepalms.dev` (live, login-gated)

Brand and public-site creative by Farley Creative. Backend, hub, and
infrastructure built ahead of the creative so it drops straight in.

## Stack

Next.js 16 · React 19 · Tailwind 4 (PostCSS) · TypeScript 6 · Vercel
(Blob storage, Cron, Analytics, Speed Insights). Same stack as
`farley-creative-site` for contributor parity.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000 (both surfaces; hub still gated)
npm run build    # production build
```

`.env.local` (gitignored) needs `BLOB_READ_WRITE_TOKEN`, `HUB_SESSION_SECRET`,
and `HUB_ACCESS_PASSWORD`. **Local dev reads and writes the production Blob
store**, so treat hub mutations on localhost as real.

## Structure

```
src/proxy.ts               Host split (public vs hub) + hub/API session gate
src/app/
  page.tsx                 Public pre-sales page (hero film · story · offering · location · Founders' List)
  register/                Dedicated Founders' List page
  api/register-interest/   Public lead capture (honeypot-protected) → leads collection + email alert
  api/unsubscribe/         Signed broadcast unsubscribe link
  api/cron/backup/         Daily snapshot of every collection
  api/documents-upload/    Session-gated client-upload tokens for large files
  api/hub/*                Hub mutations (leads, units, contacts, brokerages, broadcasts, campaigns, documents)
  hub/login/               Hub sign-in (email + password, team-password fallback)
  hub/(app)/               Dashboard · Leads · Inventory · Sales (+ brokerage pages, TX map) · Marketing · Documents
src/components/            Site chrome, Founders' List form, hub boards, composer, scoring guide, sales map
src/lib/
  site.ts                  Brand strings (the only place they live)
  store.ts                 Blob doc store (one JSON object per collection)
  scoring.ts, texas-wealth.ts   Buyer-quality scoring + Census-grounded TX corridors
  email.ts, notify.ts, broadcasts.ts   Workspace SMTP, lead alerts, broadcast fan-out
  users.ts, password.ts, hub-session.ts   Hub identity + sessions
scripts/                   create-user · backup-collections · bulk-load-contacts · palms-cleanup · upload-design-asset
```

## Conventions

- Brand strings only in `src/lib/site.ts`; color and type only in `globals.css @theme`.
- No em dashes in public copy.
- The development's leads never merge into Farley Creative's agency pipeline.
- This repo is public: no secrets or contact data in tracked files.
- Commit as `haveebot <haveebot@gmail.com>`; lowercase imperative subjects.

See `CLAUDE.md` for the full conventions, `docs/next-actions.md` for the live
list, and `docs/session-notes/` for the latest handoff.
