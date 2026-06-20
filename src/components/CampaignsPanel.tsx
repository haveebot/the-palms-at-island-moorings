"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPAIGN_CHANNELS, CAMPAIGN_STATUSES, type Campaign } from "@/lib/campaigns-shared";

export function CampaignsPanel({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    await call("/api/hub/campaigns", "POST", body);
    setAdding(false);
  }

  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="display text-lg text-[var(--color-anchor)]">Campaigns</h2>
        <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">
          {adding ? "Cancel" : "+ New campaign"}
        </button>
      </div>

      {adding && (
        <form onSubmit={onAdd} className="mt-4 grid gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" required placeholder="Campaign name" className={`${field} sm:col-span-2`} />
          <select name="channel" defaultValue="Email" className={field}>
            {CAMPAIGN_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="status" defaultValue="planned" className={field}>
            {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="notes" placeholder="Notes (optional)" className={`${field} sm:col-span-3`} />
          <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60">Save</button>
        </form>
      )}

      {campaigns.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">No campaigns yet. Track launch pushes, broker incentives, paid + social here.</p>
      ) : (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-2 pr-4 font-medium">Campaign</th>
              <th className="py-2 pr-4 font-medium">Channel</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Notes</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-sand)]/50">
                <td className="py-3 pr-4 font-medium">{c.name}</td>
                <td className="py-3 pr-4">{c.channel}</td>
                <td className="py-3 pr-4 capitalize text-[var(--color-muted)]">{c.status}</td>
                <td className="py-3 pr-4 text-[var(--color-muted)]">{c.notes || "—"}</td>
                <td className="py-3 text-right">
                  <button onClick={() => call(`/api/hub/campaigns/${c.id}`, "DELETE")} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
