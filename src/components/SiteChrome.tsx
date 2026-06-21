import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Header + footer chrome. Server component, CSS-only responsive (no client
 * state needed for the scaffold). Wordmark is a type-set placeholder until
 * Collie's logo lands in /public/brand.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-sand)]/70 bg-[var(--color-shell)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="display text-lg uppercase tracking-[0.08em] text-[var(--color-anchor)]">
          THE&nbsp;PALMS
          <span className="ml-2 hidden text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-muted)] sm:inline">
            Island Moorings
          </span>
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
            <p className="display text-xl text-[var(--color-anchor)]">{SITE.name}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{SITE.location}</p>
          </div>
          <div className="text-sm text-[var(--color-muted)]">
            <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[var(--color-foreground)]">
              {SITE.contactEmail}
            </a>
          </div>
        </div>
        <div className="hairline my-8" />
        <div className="flex flex-col gap-2 text-xs text-[var(--color-muted)] sm:flex-row sm:justify-between">
          <p>© {SITE.name}. All rights reserved.</p>
          {/* Internal marker — remove at public launch */}
          <p className="opacity-70">Pre-sales preview · interim brand (Moodboard V1) · final kit pending Farley Creative</p>
        </div>
      </div>
    </footer>
  );
}
