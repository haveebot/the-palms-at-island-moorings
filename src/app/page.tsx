import Link from "next/link";
import { SITE } from "@/lib/site";
import { RESIDENCES } from "@/lib/residences";
import { Reveal } from "@/components/Reveal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";

export default function Home() {
  return (
    <>
      <SiteHeader />

      {/* HERO — placeholder gradient stands in for hero photography / renders */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 70% -10%, rgba(176,138,79,0.35), transparent 60%), linear-gradient(160deg, var(--color-harbor) 0%, var(--color-ink) 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-6 py-24 text-[var(--color-shell)]">
          <p className="eyebrow animate-fade-in !text-[var(--color-sand)]">{SITE.location}</p>
          <h1 className="display animate-fade-in mt-4 text-5xl leading-[1.02] sm:text-7xl">
            The Palms
            <span className="block text-2xl font-light tracking-wide text-[var(--color-sand)] sm:text-3xl">
              at Island Moorings
            </span>
          </h1>
          <p className="animate-fade-in-delayed mt-6 max-w-xl text-lg text-[var(--color-fog)]">
            An exclusive collection of luxury waterfront residences on the Texas
            coast. Now reserving for pre-sales.
          </p>
          <div className="animate-fade-in-delayed mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-[var(--color-accent)] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90"
            >
              Register Interest
            </Link>
            <Link
              href="#residences"
              className="rounded-full border border-[var(--color-sand)]/50 px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-shell)] transition hover:bg-white/10"
            >
              View Residences
            </Link>
          </div>
        </div>
      </section>

      {/* VISION — high-level placeholder copy (honest; pending Collie's creative) */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <p className="eyebrow">The Development</p>
          <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
            Waterfront living, reimagined at the marina&rsquo;s edge.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--color-muted)]">
            The Palms brings a limited collection of luxury homes to one of Port
            Aransas&rsquo; most protected waterfront settings. Full details — plans,
            finishes, and pricing — are being finalized. Register your interest to
            be among the first to receive them.
          </p>
        </Reveal>
      </section>

      {/* RESIDENCES — placeholder grid, clearly "coming soon" */}
      <section id="residences" className="bg-[var(--color-sand)]/35 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow">The Residences</p>
            <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
              A limited collection.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RESIDENCES.map((r, i) => (
              <Reveal as="article" key={r.slug} delay={i * 90}>
                <div className="group h-full overflow-hidden rounded-lg border border-[var(--color-sand)] bg-[var(--color-shell)]">
                  {/* Placeholder image area — swap for residence render/photo */}
                  <div
                    className="aspect-[4/3] w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-fog), var(--color-sand))",
                    }}
                    aria-hidden="true"
                  />
                  <div className="p-6">
                    <h3 className="display text-xl text-[var(--color-anchor)]">{r.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{r.summary}</p>
                    <span className="mt-4 inline-block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      Coming soon
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION — Island Moorings (public facts, high-level) */}
      <section id="location" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">The Location</p>
            <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
              Island Moorings, Port Aransas.
            </h2>
            <p className="mt-6 text-[var(--color-muted)]">
              Set along Port Aransas&rsquo; private, wind-protected Island Moorings
              marina — minutes from the Gulf, the golf course, and the heart of a
              town built on the water. A rare waterfront setting for a home that
              lives like a retreat.
            </p>
          </Reveal>
          <Reveal delay={120}>
            {/* Placeholder map / aerial area */}
            <div
              className="aspect-[5/4] w-full rounded-lg border border-[var(--color-sand)]"
              style={{
                background:
                  "linear-gradient(160deg, var(--color-harbor), var(--color-palm))",
              }}
              aria-hidden="true"
            />
          </Reveal>
        </div>
      </section>

      {/* REGISTER — inline capture */}
      <section id="register" className="bg-[var(--color-ink)] py-24 text-[var(--color-shell)]">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <p className="eyebrow !text-[var(--color-sand)]">Pre-Sales</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl">Register your interest.</h2>
            <p className="mt-4 text-[var(--color-fog)]">
              Be first to receive plans, pricing, and reservation details for {SITE.shortName}.
            </p>
          </Reveal>
          <div className="mt-10 rounded-xl bg-[var(--color-shell)] p-6 text-[var(--color-foreground)] sm:p-8">
            <RegisterInterestForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
