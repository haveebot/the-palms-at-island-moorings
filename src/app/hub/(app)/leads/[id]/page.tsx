import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads";
import { listUnits } from "@/lib/units";
import { LeadEditor } from "@/components/LeadEditor";
import { stageBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();
  const units = await listUnits();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/hub/leads" className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← Leads</Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="display text-2xl text-[var(--color-anchor)]">{lead.fullName}</h1>
          {stageBadge(lead.stage)}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact + activity */}
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-6 text-sm">
            <dl className="grid grid-cols-2 gap-y-3">
              <dt className="text-[var(--color-muted)]">Email</dt>
              <dd><a className="text-[var(--color-anchor)] underline" href={`mailto:${lead.email}`}>{lead.email}</a></dd>
              <dt className="text-[var(--color-muted)]">Phone</dt>
              <dd>{lead.phone ? <a className="text-[var(--color-anchor)] underline" href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}</dd>
              <dt className="text-[var(--color-muted)]">Source</dt>
              <dd className="capitalize">{lead.source}</dd>
              <dt className="text-[var(--color-muted)]">Received</dt>
              <dd>{new Date(lead.receivedAt).toLocaleString()}</dd>
              {lead.notes && (<><dt className="text-[var(--color-muted)]">Inquiry</dt><dd>{lead.notes}</dd></>)}
            </dl>
          </section>

          <section>
            <h2 className="display text-lg text-[var(--color-anchor)]">Activity</h2>
            <ul className="mt-4 space-y-3">
              {lead.activity.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <div>
                    <p>{a.text}</p>
                    <p className="text-xs text-[var(--color-muted)]">{new Date(a.at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Editor */}
        <aside className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-6">
          <LeadEditor lead={lead} units={units.map((u) => ({ id: u.id, name: u.name }))} />
        </aside>
      </div>
    </div>
  );
}
