import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Header + footer chrome. Server component, CSS-only responsive (no client
 * state needed for the scaffold). Logo: Collie's lockup SVG in /public/brand
 * (plain <img> — Next's image optimizer rejects SVG; no ESLint in this repo).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-sand)]/70 bg-[var(--color-shell)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center" aria-label={SITE.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/the-palms-logo.svg"
            alt={SITE.name}
            className="h-12 w-auto sm:h-11"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#residences" className="hidden text-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline">
            Homesites
          </Link>
          <Link href="/#location" className="hidden text-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline">
            Location
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] transition hover:opacity-90"
          >
            Founders&rsquo; List
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-sand)] bg-[var(--color-shell)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/the-palms-logo.svg"
              alt={SITE.name}
              className="h-12 w-auto"
            />
            <p className="mt-3 text-sm text-[var(--color-muted)]">{SITE.location}</p>
          </div>
          <div className="text-sm text-[var(--color-muted)]">
            <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[var(--color-foreground)]">
              {SITE.contactEmail}
            </a>
          </div>
        </div>
        <div className="hairline my-8" />
        <div className="text-xs text-[var(--color-muted)]">
          <p>© {SITE.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
