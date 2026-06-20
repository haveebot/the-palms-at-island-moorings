import type { Metadata } from "next";
import { listLeads } from "@/lib/leads";
import { HubLogout } from "@/components/HubLogout";

// Always live — needs the Blob token + fresh data; never statically prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hub · The Palms",
  robots: { index: false, follow: false },
};

export default async function HubPage() {
  const leads = await listLeads();

  return (
    <div className="min-h-screen bg-[var(--color-shell)]">
      {/* Hub bar */}
      <header className="border-b border-[var(--color-sand)] bg-[var(--color-ink)] text-[var(--color-shell)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="display text-lg">The Palms · Hub</p>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-sand)]">
              Island Moorings · pre-sales
            </p>
          </div>
          <HubLogout />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-baseline justify-between border-b border-[var(--color-sand)] pb-4">
          <h1 className="display text-2xl text-[var(--color-anchor)]">Register-interest leads</h1>
          <span className="text-sm text-[var(--color-muted)]">{leads.length} total</span>
        </div>

        {leads.length === 0 ? (
          <p className="mt-12 text-[var(--color-muted)]">
            No leads yet. Inquiries from the public site will appear here.
          </p>
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
    </div>
  );
}
