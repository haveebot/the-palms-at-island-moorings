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
  return (
    <>
      <SiteHeader />

      {/* HERO — drone footage (0.56 over #1b4f4c) + white logo rising from blur */}
      <section className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden">
        {/* base tint — #1b4f4c gradient (brass glow effect kept) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 70% -10%, rgba(176,138,79,0.28), transparent 60%), linear-gradient(160deg, #1b4f4c 0%, #102d2b 78%)",
          }}
          aria-hidden="true"
        />
        {/* drone loop at 56% — the #1b4f4c base shows through and tints it */}
        <video
          className="absolute inset-0 h-full w-full scale-[1.15] object-cover opacity-[0.56]"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/hero/gulf-poster.jpg"
          aria-hidden="true"
        >
          <source src="/brand/hero/gulf.webm" type="video/webm" />
          <source src="/brand/hero/gulf.mp4" type="video/mp4" />
        </video>
        {/* gentle center darken so the white logo holds over moving water */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 58% at 50% 50%, rgba(16,45,43,0.45), transparent 76%)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center px-6 text-center text-[var(--color-shell)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/the-palms-logo-white.svg"
            alt={SITE.name}
            className="hero-logo w-[clamp(260px,46vw,560px)]"
          />
          <p className="hero-sub mt-9 max-w-xl text-base text-white/85 sm:text-lg">
            The final 21 homesites in Island Moorings — Port Aransas&rsquo; original
            marina community, on the water since 1960. The Founders&rsquo; List is now forming.
          </p>
          <div className="hero-cta mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-[var(--color-accent)] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90"
            >
              Join the Founders&rsquo; List
            </Link>
            <Link
              href="#residences"
              className="rounded-full border border-white/45 px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
            >
              The Homesites
            </Link>
          </div>
        </div>
      </section>

      {/* VISION — the legacy / last-parcel story (public facts, high-level) */}
      <section className="bg-[#1f352e] py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <p className="eyebrow !text-[var(--color-accent)]">The Development</p>
            <h2 className="display mt-4 text-3xl text-[var(--color-shell)] sm:text-4xl">
              The last legacy parcel in Island Moorings.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[var(--color-shell)]/80">
              Island Moorings was planned in 1960 as Port Aransas&rsquo; original
              waterfront community — homes built around a private, wind-protected
              marina and yacht club. The Palms is its final undeveloped parcel: a
              limited release of marina-front homesites. Renderings and reservation
              details are being finalized — join the Founders&rsquo; List to be first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* THE OFFERING — composition banner on desktop; bigger readable layout on mobile */}
      <section id="residences" className="bg-[#0C0804]">
        {/* Desktop (md+): Collie's designed composition with clickable CTA overlay */}
        <Reveal>
          <div className="relative hidden w-full md:block">
            <picture>
              <source srcSet="/brand/offering/offering-banner.webp" type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/offering/offering-banner.jpg"
                alt="Twenty-one marina-front homesites, 5,000–10,000 square feet — The Palms at Island Moorings"
                className="block w-full"
              />
            </picture>
            <Link
              href="/register"
              aria-label="Join the Founders' List"
              className="absolute"
              style={{ left: "6%", top: "80%", width: "16.5%", height: "9.5%" }}
            />
          </div>
        </Reveal>

        {/* Mobile (<md): larger, stacked, readable — CTA dropped to the bottom */}
        <div className="px-6 py-16 text-center text-[var(--color-shell)] md:hidden">
          <Reveal>
            <p className="eyebrow !text-[var(--color-accent)]">The Offering</p>
            <h2 className="display mt-3 text-4xl leading-[1.06] text-[var(--color-shell)]">
              Twenty-one homesites. One legacy address.
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <p className="display text-5xl text-[var(--color-accent)]">21</p>
                <p className="mt-2 text-base font-medium">Marina-front homesites</p>
                <p className="text-sm text-white/55">A single, limited release</p>
              </div>
              <div>
                <p className="display text-5xl text-[var(--color-accent)]">5,000&ndash;10,000</p>
                <p className="mt-2 text-base font-medium">Square feet per homesite</p>
                <p className="text-sm text-white/55">Room to build the legacy</p>
              </div>
            </div>
            <Link
              href="/register"
              className="mt-12 inline-block rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90"
            >
              Join the Founders&rsquo; List
            </Link>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/location/island-moorings-marina.jpg"
              alt="The Island Moorings marina at sunset — Port Aransas"
              className="aspect-[3/2] w-full rounded-lg border border-[var(--color-sand)] object-cover shadow-sm"
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
