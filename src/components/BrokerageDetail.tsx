"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BROKERAGE_STAGES, type BrokerageMeta } from "@/lib/brokerages-shared";
import { CONTACT_TYPES, CONTACT_STATUSES, MARKETS, type Contact } from "@/lib/contacts-shared";
import { scoreContact, tierBadgeClass } from "@/lib/scoring";
import { BroadcastComposer } from "@/components/BroadcastComposer";
import { CopyEmailsButton } from "@/components/CopyEmailsButton";

const TYPE_LABEL: Record<string, string> = Object.fromEntries(CONTACT_TYPES.map((t) => [t.key, t.label]));
const STAGE_LABEL: Record<string, string> = Object.fromEntries(BROKERAGE_STAGES.map((s) => [s.key, s.label]));

export function BrokerageDetail({
  slug,
  name,
  agents,
  meta,
  canSend,
}: {
  slug: string;
  name: string;
  agents: Contact[];
  meta: BrokerageMeta | null;
  canSend: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  const [stage, setStage] = useState(meta?.stage || "prospect");
  const [primary, setPrimary] = useState(meta?.primaryContactId || "");
  const [notes, setNotes] = useState(meta?.notes || "");
  const [tags, setTags] = useState((meta?.tags || []).join(", "));
  const [savedMsg, setSavedMsg] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTargets, setComposeTargets] = useState<Contact[]>([]);
  const [composeLabel, setComposeLabel] = useState("");

  const markets = [...new Set(agents.map((a) => a.market).filter(Boolean))].sort();
  const emailable = agents.filter((a) => a.email).length;
  const priorityCount = agents.filter((a) => scoreContact(a).tier === "priority").length;
  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";
  const label = "mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]";

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  async function saveMeta() {
    setBusy(true);
    setSavedMsg("");
    const res = await fetch(`/api/hub/brokerages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stage, primaryContactId: primary, notes, tags }),
    }).catch(() => null);
    setBusy(false);
    setSavedMsg(res?.ok ? "Saved." : "Couldn't save.");
    router.refresh();
  }

  async function onAddAgent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await call("/api/hub/contacts", "POST", { ...data, company: name }); // pinned to this firm
    setAdding(false);
  }

  function toggleSel(id: string) {
    setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function openCompose(targets: Contact[], lbl: string) {
    setComposeTargets(targets);
    setComposeLabel(lbl);
    setComposeOpen(true);
  }

  return (
    <div className="space-y-6">
      <Link href="/hub/sales" className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← Sales</Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Brokerage</p>
          <h1 className="display mt-1 text-2xl text-[var(--color-anchor)]">{name}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {agents.length} agents · {emailable} emailable · {priorityCount} priority · {markets.join(", ") || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyEmailsButton emails={agents.filter((a) => a.email && a.status !== "do-not-contact").map((a) => a.email!)} />
          <button
            onClick={() => openCompose(agents, name)}
            disabled={emailable === 0}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-40 ${emailable ? "bg-[var(--color-accent)] text-[var(--color-ink)]" : "border border-[var(--color-sand)] text-[var(--color-muted)]"}`}
          >
            Email this firm ({emailable})
          </button>
        </div>
      </div>

      {/* Firm-level manage panel */}
      <div className="grid gap-4 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Relationship stage</span>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className={`${field} w-full`}>
            {BROKERAGE_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={label}>Primary contact</span>
          <select value={primary} onChange={(e) => setPrimary(e.target.value)} className={`${field} w-full`}>
            <option value="">—</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${field} w-full`} placeholder="Relationship notes, co-op terms, who to talk to…" />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>Tags</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={`${field} w-full`} placeholder="comma-separated" />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button onClick={saveMeta} disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60">Save firm details</button>
          <span className="text-xs text-[var(--color-muted)]">Current: {STAGE_LABEL[meta?.stage || "prospect"]}</span>
          {savedMsg && <span className="text-sm text-[var(--color-anchor)]">{savedMsg}</span>}
        </div>
      </div>

      {/* Agents at this firm */}
      <div className="flex items-center justify-between">
        <h2 className="display text-lg text-[var(--color-anchor)]">Agents</h2>
        <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">{adding ? "Cancel" : "+ Add agent"}</button>
      </div>

      {sel.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[var(--color-anchor)] px-4 py-2 text-sm text-[var(--color-shell)]">
          <span className="font-medium">{sel.size} selected</span>
          <button onClick={() => setSel(new Set())} className="text-xs uppercase tracking-wide text-[var(--color-sand)] hover:text-white">Clear</button>
          <div className="ml-auto flex items-center gap-2">
            <CopyEmailsButton emails={agents.filter((a) => sel.has(a.id) && a.email && a.status !== "do-not-contact").map((a) => a.email!)} className="rounded-full border border-[var(--color-sand)]/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-sand)] transition hover:text-white disabled:opacity-40" />
            <button onClick={() => openCompose(agents.filter((a) => sel.has(a.id)), `${name} · ${sel.size} selected`)} className="rounded-full bg-[var(--color-accent)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]">Compose to selected →</button>
          </div>
        </div>
      )}

      {adding && (
        <form onSubmit={onAddAgent} className="grid gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <select name="type" defaultValue="agent" className={field}>{CONTACT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select>
          <input name="fullName" required placeholder="Full name" className={field} />
          <input name="email" type="email" placeholder="Email" className={field} />
          <input name="phone" placeholder="Phone" className={field} />
          <select name="market" defaultValue={agents[0]?.market || ""} className={field}><option value="">Market…</option>{MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          <input name="tags" placeholder="Tags (comma-sep)" className={field} />
          <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60 sm:col-span-2 lg:col-span-3">Add to {name}</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-2 pr-3"><input type="checkbox" checked={agents.length > 0 && agents.every((a) => sel.has(a.id))} onChange={() => setSel((s) => agents.every((a) => s.has(a.id)) ? new Set() : new Set(agents.map((a) => a.id)))} aria-label="Select all" /></th>
              <th className="py-2 pr-4 font-medium">Agent</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Market</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map((c) => (
              <tr key={c.id} className={`border-b border-[var(--color-sand)]/50 ${sel.has(c.id) ? "bg-[var(--color-accent)]/10" : ""}`}>
                <td className="py-3 pr-3"><input type="checkbox" checked={sel.has(c.id)} onChange={() => toggleSel(c.id)} /></td>
                <td className="py-3 pr-4 font-medium">
                  <span className="flex flex-wrap items-center gap-2">
                    {c.fullName}
                    {(() => { const s = scoreContact(c); return <span className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide ${tierBadgeClass(s.tier)}`} title={s.reasons.join(" · ")}>{s.tierLabel} · {s.score}</span>; })()}
                    {c.id === meta?.primaryContactId && <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-[var(--color-ink)]">Primary</span>}
                  </span>
                  {c.email && <div className="text-xs"><a href={`mailto:${c.email}`} className="text-[var(--color-muted)] hover:text-[var(--color-anchor)]">{c.email}</a></div>}
                  {c.phone && <div className="text-xs"><a href={`tel:${c.phone}`} className="text-[var(--color-muted)] hover:text-[var(--color-anchor)]">{c.phone}</a></div>}
                  {!c.email && !c.phone && <div className="text-xs italic text-[var(--color-muted)]/60">no contact info</div>}
                </td>
                <td className="py-3 pr-4 text-[var(--color-muted)]">{TYPE_LABEL[c.type]}</td>
                <td className="py-3 pr-4">{c.market || "—"}</td>
                <td className="py-3 pr-4">
                  <select value={c.status} disabled={busy} onChange={(e) => call(`/api/hub/contacts/${c.id}`, "PATCH", { status: e.target.value })} className="rounded border border-[var(--color-sand)] bg-white/70 px-2 py-1 text-xs">
                    {CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </td>
                <td className="py-3 text-right">
                  <button onClick={() => call(`/api/hub/contacts/${c.id}`, "PATCH", { company: "" })} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700" title="Remove from this firm (keeps the contact)">Remove from firm</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BroadcastComposer open={composeOpen} onClose={() => setComposeOpen(false)} targets={composeTargets} label={composeLabel} canSend={canSend} onSent={() => { setSel(new Set()); router.refresh(); }} />
    </div>
  );
}
