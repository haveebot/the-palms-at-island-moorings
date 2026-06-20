"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNIT_STATUSES, formatPrice, type Unit, type UnitStatus } from "@/lib/units-shared";

const STATUS_CLASS: Record<UnitStatus, string> = {
  "coming-soon": "bg-[var(--color-sand)] text-[var(--color-ink)]",
  available: "bg-[var(--color-palm)] text-[var(--color-shell)]",
  reserved: "bg-[var(--color-accent)] text-[var(--color-ink)]",
  sold: "bg-[var(--color-ink)] text-[var(--color-shell)]",
};

export function UnitsBoard({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

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
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    await call("/api/hub/units", "POST", body);
    setAdding(false);
  }

  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl text-[var(--color-anchor)]">Inventory</h1>
        <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">
          {adding ? "Cancel" : "+ Add residence"}
        </button>
      </div>

      {adding && (
        <form onSubmit={onAdd} className="grid gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <input name="name" required placeholder="Residence name" className={field} />
          <select name="status" defaultValue="available" className={field}>
            {UNIT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input name="price" type="number" placeholder="Price (USD)" className={field} />
          <input name="beds" type="number" step="0.5" placeholder="Beds" className={field} />
          <input name="baths" type="number" step="0.5" placeholder="Baths" className={field} />
          <input name="sqft" type="number" placeholder="Sq ft" className={field} />
          <input name="description" placeholder="Short description (optional)" className={`${field} sm:col-span-2 lg:col-span-3`} />
          <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60">Save residence</button>
        </form>
      )}

      {units.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-sand)] p-8 text-center">
          <p className="text-sm text-[var(--color-muted)]">No residences yet.</p>
          <button
            onClick={() => call("/api/hub/seed", "POST")}
            disabled={busy}
            className="mt-3 rounded-full border border-[var(--color-sand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-60"
          >
            Seed sample residences
          </button>
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-2 pr-4 font-medium">Residence</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Price</th>
              <th className="py-2 pr-4 font-medium">Bd / Ba / Sqft</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-sand)]/50">
                <td className="py-3 pr-4 font-medium">
                  {u.name}
                  {u.sample && <span className="ml-2 text-[0.6rem] uppercase tracking-wide text-[var(--color-muted)]">sample</span>}
                </td>
                <td className="py-3 pr-4">
                  <select
                    value={u.status}
                    disabled={busy}
                    onChange={(e) => call(`/api/hub/units/${u.id}`, "PATCH", { status: e.target.value })}
                    className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_CLASS[u.status]}`}
                  >
                    {UNIT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </td>
                <td className="whitespace-nowrap py-3 pr-4">{formatPrice(u.price)}</td>
                <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted)]">
                  {(u.beds ?? "—")} / {(u.baths ?? "—")} / {u.sqft ? u.sqft.toLocaleString() : "—"}
                </td>
                <td className="py-3 text-right">
                  <button onClick={() => call(`/api/hub/units/${u.id}`, "DELETE")} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
