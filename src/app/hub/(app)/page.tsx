import Link from "next/link";
import { listLeads } from "@/lib/leads";
import { listUnits } from "@/lib/units";
import { LEAD_STAGES, ACTIVE_STAGES } from "@/lib/leads-shared";
import { formatPrice } from "@/lib/units-shared";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-sand)] bg-white/50 p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p className="display mt-2 text-3xl text-[var(--color-anchor)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--color-muted)]">{sub}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const [leads, units] = await Promise.all([listLeads(), listUnits()]);

  const newLeads = leads.filter((l) => l.stage === "new");
  const activeLeads = leads.filter((l) => ACTIVE_STAGES.includes(l.stage));
  const byStage = Object.fromEntries(
    LEAD_STAGES.map((s) => [s.key, leads.filter((l) => l.stage === s.key).length]),
  );

  const available = units.filter((u) => u.status === "available");
  const reserved = units.filter((u) => u.status === "reserved");
  const sold = units.filter((u) => u.status === "sold");
  const sum = (arr: typeof units) => arr.reduce((t, u) => t + (u.price || 0), 0);

  const maxStage = Math.max(1, ...LEAD_STAGES.map((s) => byStage[s.key] || 0));

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Pre-sales overview</p>
        <h1 className="display mt-2 text-3xl text-[var(--color-anchor)]">The Palms at Island Moorings</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New inquiries" value={String(newLeads.length)} sub="awaiting first touch" />
        <Stat label="Active pipeline" value={String(activeLeads.length)} sub="leads in motion" />
        <Stat label="Available" value={String(available.length)} sub={`${formatPrice(sum(available))} of inventory`} />
        <Stat label="Reserved + sold" value={String(reserved.length + sold.length)} sub={`${formatPrice(sum(reserved) + sum(sold))} committed`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pipeline funnel */}
        <section className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-lg text-[var(--color-anchor)]">Lead pipeline</h2>
            <Link href="/hub/leads" className="text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">View all →</Link>
          </div>
          <div className="mt-5 space-y-2.5">
            {LEAD_STAGES.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-[var(--color-muted)]">{s.label}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-[var(--color-sand)]/40">
                  <div
                    className="h-full rounded bg-[var(--color-anchor)]"
                    style={{ width: `${((byStage[s.key] || 0) / maxStage) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-medium">{byStage[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory snapshot */}
        <section className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-lg text-[var(--color-anchor)]">Inventory</h2>
            <Link href="/hub/inventory" className="text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">Manage →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div><p className="text-2xl font-medium text-[var(--color-anchor)]">{units.length}</p><p className="text-xs text-[var(--color-muted)]">total residences</p></div>
            <div><p className="text-2xl font-medium text-[var(--color-palm)]">{available.length}</p><p className="text-xs text-[var(--color-muted)]">available</p></div>
            <div><p className="text-2xl font-medium text-[var(--color-accent)]">{reserved.length}</p><p className="text-xs text-[var(--color-muted)]">reserved</p></div>
            <div><p className="text-2xl font-medium text-[var(--color-muted)]">{sold.length}</p><p className="text-xs text-[var(--color-muted)]">sold</p></div>
          </div>
          <div className="mt-5 border-t border-[var(--color-sand)] pt-4 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Sold to date</span><span className="font-medium">{formatPrice(sum(sold))}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-[var(--color-muted)]">Reserved</span><span className="font-medium">{formatPrice(sum(reserved))}</span></div>
          </div>
        </section>
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="display text-lg text-[var(--color-anchor)]">Needs first touch</h2>
        <p className="text-sm text-[var(--color-muted)]">Speed-to-lead — reach these before they cool.</p>
        {newLeads.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">All caught up. New inquiries will surface here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-sand)]/60 rounded-xl border border-[var(--color-sand)] bg-white/40">
            {newLeads.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link href={`/hub/leads/${l.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-sand)]/20">
                  <span className="font-medium">{l.fullName}</span>
                  <span className="text-sm text-[var(--color-muted)]">{l.email}</span>
                  <span className="text-xs text-[var(--color-muted)]">{new Date(l.receivedAt).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
