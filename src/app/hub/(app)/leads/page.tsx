import Link from "next/link";
import { listLeads } from "@/lib/leads";
import { LEAD_STAGES } from "@/lib/leads-shared";
import { stageBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const all = await listLeads();
  const leads = stage ? all.filter((l) => l.stage === stage) : all;

  const tab = (key: string | undefined, label: string) => {
    const active = (stage ?? "") === (key ?? "");
    const href = key ? `/hub/leads?stage=${key}` : "/hub/leads";
    return (
      <Link
        key={label}
        href={href}
        className={`rounded-full px-3 py-1 text-xs ${active ? "bg-[var(--color-ink)] text-[var(--color-shell)]" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="display text-2xl text-[var(--color-anchor)]">Leads</h1>
        <span className="text-sm text-[var(--color-muted)]">{leads.length} shown</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tab(undefined, "All")}
        {LEAD_STAGES.map((s) => tab(s.key, s.label))}
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No leads here yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 pr-4 font-medium">Stage</th>
              <th className="py-2 pr-4 font-medium">Owner</th>
              <th className="py-2 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-[var(--color-sand)]/50 hover:bg-[var(--color-sand)]/15">
                <td className="py-3 pr-4 font-medium">
                  <Link href={`/hub/leads/${l.id}`} className="hover:text-[var(--color-anchor)]">{l.fullName}</Link>
                </td>
                <td className="py-3 pr-4 text-[var(--color-muted)]">{l.email}</td>
                <td className="whitespace-nowrap py-3 pr-4">{l.phone || "—"}</td>
                <td className="py-3 pr-4">{stageBadge(l.stage)}</td>
                <td className="py-3 pr-4 text-[var(--color-muted)]">{l.assignee || "—"}</td>
                <td className="whitespace-nowrap py-3 text-[var(--color-muted)]">{new Date(l.receivedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
