import { listLeads } from "@/lib/leads";
import { listCampaigns } from "@/lib/campaigns";
import { CampaignsPanel } from "@/components/CampaignsPanel";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const [leads, campaigns] = await Promise.all([listLeads(), listCampaigns()]);

  const bySource = leads.reduce<Record<string, number>>((acc, l) => {
    const s = l.source || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-10">
      <h1 className="display text-2xl text-[var(--color-anchor)]">Marketing</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Lead sources */}
        <section className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-6">
          <h2 className="display text-lg text-[var(--color-anchor)]">Where leads come from</h2>
          {sources.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">No leads yet — sources appear as inquiries arrive.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {sources.map(([s, n]) => (
                <li key={s} className="flex items-center justify-between">
                  <span className="capitalize text-[var(--color-muted)]">{s}</span>
                  <span className="font-medium">{n}</span>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-[var(--color-sand)] pt-2"><span className="text-[var(--color-muted)]">Total</span><span className="font-medium">{leads.length}</span></li>
            </ul>
          )}
        </section>

        {/* Public site */}
        <section className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-6">
          <h2 className="display text-lg text-[var(--color-anchor)]">Public site</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">The pre-sales marketing site that feeds the leads pipeline.</p>
          <a href={SITE.url} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-[var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">
            {SITE.publicDomain} →
          </a>
          <p className="mt-3 text-xs text-[var(--color-muted)]">Status: live · <span className="font-medium">noindex</span> during pre-sales (flip at launch).</p>
        </section>
      </div>

      <CampaignsPanel campaigns={campaigns} />
    </div>
  );
}
