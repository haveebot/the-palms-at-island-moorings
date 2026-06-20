import type { Metadata } from "next";
import { listLeads } from "@/lib/leads";

// Always render live — never statically prerender (needs the Blob token + fresh data).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ops · Leads",
  robots: { index: false, follow: false },
};

export default async function OpsPage() {
  const leads = await listLeads();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-baseline justify-between border-b border-[var(--color-sand)] pb-4">
        <div>
          <h1 className="display text-2xl text-[var(--color-anchor)]">Register-interest leads</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            The Palms at Island Moorings · pre-sales pipeline
          </p>
        </div>
        <span className="text-sm text-[var(--color-muted)]">{leads.length} total</span>
      </div>

      {leads.length === 0 ? (
        <p className="mt-12 text-[var(--color-muted)]">No leads yet.</p>
      ) : (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-2 pr-4 font-medium">Received</th>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-[var(--color-sand)]/50 align-top">
                <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted)]">
                  {new Date(l.receivedAt).toLocaleString()}
                </td>
                <td className="py-3 pr-4 font-medium">{l.fullName}</td>
                <td className="py-3 pr-4">
                  <a className="text-[var(--color-anchor)] underline" href={`mailto:${l.email}`}>
                    {l.email}
                  </a>
                </td>
                <td className="whitespace-nowrap py-3 pr-4">{l.phone || "—"}</td>
                <td className="py-3 text-[var(--color-muted)]">{l.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
