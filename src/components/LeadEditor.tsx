"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STAGES, type Lead } from "@/lib/leads-shared";

type UnitOpt = { id: string; name: string };

export function LeadEditor({ lead, units }: { lead: Lead; units: UnitOpt[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState(lead.assignee ?? "");
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/hub/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    setBusy(false);
    startTransition(() => router.refresh());
  }

  const field = "w-full rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">Stage</label>
        <select
          className={field}
          value={lead.stage}
          disabled={busy}
          onChange={(e) => patch({ stage: e.target.value })}
        >
          {LEAD_STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">Owner</label>
        <div className="flex gap-2">
          <input className={field} value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Shana / Collie" />
          <button onClick={() => patch({ assignee })} disabled={busy} className="rounded-md bg-[var(--color-ink)] px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-shell)] disabled:opacity-60">Save</button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">Interested residence</label>
        <select
          className={field}
          value={lead.unitId ?? ""}
          disabled={busy}
          onChange={(e) => patch({ unitId: e.target.value || null })}
        >
          <option value="">— none —</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">Add a note</label>
        <textarea className={field} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Call summary, next step…" />
        <button
          onClick={async () => { if (note.trim()) { await patch({ note }); setNote(""); } }}
          disabled={busy || !note.trim()}
          className="mt-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] disabled:opacity-50"
        >
          Log note
        </button>
      </div>
    </div>
  );
}
