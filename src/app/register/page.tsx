import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";

export const metadata: Metadata = {
  title: "Join the Founders' List",
  description: `Join the Founders' List for ${SITE.name} — the final marina-front homesites in Island Moorings, Port Aransas.`,
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <p className="eyebrow">The Founders&rsquo; List</p>
          <h1 className="display mt-4 text-4xl text-[var(--color-anchor)] sm:text-5xl">
            Join the Founders&rsquo; List
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-muted)]">
            The Founders&rsquo; List is the first to see renderings, the first to
            reserve, and the first to choose among the final homesites in Island
            Moorings. Share your details and we&rsquo;ll be in touch as the release
            approaches.
          </p>
        </Reveal>
        <div className="mt-10 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/25 p-6 sm:p-8">
          <RegisterInterestForm />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
