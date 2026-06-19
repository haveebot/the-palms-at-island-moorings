import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";

export const metadata: Metadata = {
  title: "Register Interest",
  description: `Register your interest in ${SITE.name} — luxury waterfront residences at Island Moorings, Port Aransas.`,
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <p className="eyebrow">Pre-Sales</p>
          <h1 className="display mt-4 text-4xl text-[var(--color-anchor)] sm:text-5xl">
            Register your interest
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-muted)]">
            {SITE.name} is now reserving for pre-sales. Share your details and
            we&rsquo;ll be in touch with plans, pricing, and early-access reservation
            information as it&rsquo;s released.
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
