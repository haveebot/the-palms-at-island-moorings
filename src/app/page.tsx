import Link from "next/link";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";

/*
 * Homepage copy is INTERIM — facts are public + non-fabricated (21 homesites,
 * 5,000–10,000 sq ft, Island Moorings est. 1960, 245-slip marina & yacht club),
 * drawn from Farley Creative's brief. The final brand VOICE, logo, and imagery
 * are Collie's, landing the week of June 22. No prices/comps/tactics (internal).
 */
export default function Home() {
  const facts = [
    { stat: "21", label: "Marina-front homesites", note: "A single, limited release" },
    { stat: "5,000–10,000", label: "Square feet per homesite", note: "Room to build the legacy" },
    { stat: "1960", label: "Island Moorings, established", note: "Port Aransas' original marina community" },
  ];

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
          <h1 className="display animate-fade-in mt-4 text-5xl uppercase leading-[1.02] tracking-[0.02em] sm:text-7xl">
            The Palms
            <span className="block text-2xl font-light uppercase tracking-[0.22em] text-[var(--color-sand)] sm:text-3xl">
              at Island Moorings
            </span>
          </h1>
          <p className="animate-fade-in-delayed mt-6 max-w-xl text-lg text-[var(--color-fog)]">
            The final 21 homesites in Island Moorings — Port Aransas&rsquo;
            original marina community, on the water since 1960. The Founders&rsquo;
            List is now forming.
          </p>
          <div className="animate-fade-in-delayed mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-[var(--color-accent)] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90"
            >
              Join the Founders&rsquo; List
            </Link>
            <Link
              href="#residences"
              className="rounded-full border border-[var(--color-sand)]/50 px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-shell)] transition hover:bg-white/10"
            >
              The Homesites
            </Link>
          </div>
        </div>
      </section>

      {/* VISION — the legacy / last-parcel story (public facts, high-level) */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <p className="eyebrow">The Development</p>
          <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
            The last legacy parcel in Island Moorings.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--color-muted)]">
            Island Moorings was planned in 1960 as Port Aransas&rsquo; original
            waterfront community — homes built around a private, wind-protected
            marina and yacht club. The Palms is its final undeveloped parcel: a
            limited release of marina-front homesites. Renderings and reservation
            details are being finalized — join the Founders&rsquo; List to be first.
          </p>
        </Reveal>
      </section>

      {/* THE OFFERING — real, public product facts (no fabrication) */}
      <section id="residences" className="bg-[var(--color-sand)]/35 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow">The Offering</p>
            <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
              Twenty-one homesites. One legacy address.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {facts.map((f, i) => (
              <Reveal as="article" key={f.label} delay={i * 90}>
                <div className="h-full rounded-lg border border-[var(--color-sand)] bg-[var(--color-shell)] p-8">
                  <p className="display text-4xl text-[var(--color-anchor)] sm:text-5xl">{f.stat}</p>
                  <p className="mt-3 text-sm font-medium text-[var(--color-foreground)]">{f.label}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{f.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-10 max-w-2xl text-sm text-[var(--color-muted)]">
              Architectural renderings and homesite plans are in production with
              Farley Creative. Founders&rsquo; List members see them first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* LOCATION — Island Moorings marina (public facts) */}
      <section id="location" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">The Location</p>
            <h2 className="display mt-4 text-3xl text-[var(--color-anchor)] sm:text-4xl">
              Island Moorings, Port Aransas.
            </h2>
            <p className="mt-6 text-[var(--color-muted)]">
              Set along the private Island Moorings Marina &amp; Yacht Club — a
              wind-protected, 245-slip harbor with a fast run to the Ship Channel
              and the Gulf. Minutes from the beach, the golf course, and the heart
              of a town built on the water. Your boat in your backyard.
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

      {/* FOUNDERS' LIST — inline capture */}
      <section id="register" className="bg-[var(--color-ink)] py-24 text-[var(--color-shell)]">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <p className="eyebrow !text-[var(--color-sand)]">The Founders&rsquo; List</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl">First look. First pricing. First choice.</h2>
            <p className="mt-4 text-[var(--color-fog)]">
              The Founders&rsquo; List is the first to see renderings, the first to
              reserve, and the first to choose a homesite at {SITE.shortName}.
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
