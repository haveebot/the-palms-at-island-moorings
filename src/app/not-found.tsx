import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-4xl text-[var(--color-anchor)]">
          This page drifted out to sea.
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          The page you&rsquo;re looking for isn&rsquo;t here.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-[var(--color-accent)] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90"
        >
          Back home
        </Link>
      </section>
      <SiteFooter />
    </>
  );
}
