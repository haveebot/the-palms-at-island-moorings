"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONTACT_TYPES,
  CONTACT_STATUSES,
  MARKETS,
  type Contact,
  type Broadcast,
} from "@/lib/contacts-shared";

const TYPE_LABEL: Record<string, string> = Object.fromEntries(CONTACT_TYPES.map((t) => [t.key, t.label]));

export function SalesBoard({ contacts, broadcasts }: { contacts: Contact[]; broadcasts: Broadcast[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  // segment filters
  const [type, setType] = useState("");
  const [market, setMarket] = useState("");
  const [tag, setTag] = useState("");

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          (!type || c.type === type) &&
          (!market || c.market === market) &&
          (!tag || (c.tags || []).some((t) => t.toLowerCase().includes(tag.toLowerCase()))),
      ),
    [contacts, type, market, tag],
  );

  const segmentLabel =
    [type && TYPE_LABEL[type], market, tag && `#${tag}`].filter(Boolean).join(" · ") || "All contacts";

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
    await call("/api/hub/contacts", "POST", body);
    setAdding(false);
  }

  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="display text-2xl text-[var(--color-anchor)]">Sales</h1>
        <div className="rounded-xl border border-dashed border-[var(--color-sand)] p-8 text-center">
          <p className="text-sm text-[var(--color-muted)]">No contacts yet — your agent/broker network, referral partners, and buyer prospects live here.</p>
          <button onClick={() => call("/api/hub/seed", "POST")} disabled={busy} className="mt-3 rounded-full border border-[var(--color-sand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-60">
            Seed sample contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl text-[var(--color-anchor)]">Sales</h1>
        <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">
          {adding ? "Cancel" : "+ Add contact"}
        </button>
      </div>

      {adding && (
        <form onSubmit={onAdd} className="grid gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <select name="type" defaultValue="agent" className={field}>
            {CONTACT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input name="fullName" required placeholder="Full name" className={field} />
          <input name="company" placeholder="Brokerage / firm" className={field} />
          <input name="email" type="email" placeholder="Email" className={field} />
          <input name="phone" placeholder="Phone" className={field} />
          <select name="market" defaultValue="" className={field}>
            <option value="">Market…</option>
            {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input name="tags" placeholder="Tags (comma-sep: luxury, marina/boat)" className={`${field} sm:col-span-2`} />
          <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60">Save contact</button>
        </form>
      )}

      {/* Segment builder */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-sand)] bg-white/40 p-4">
        <span className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">Segment:</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="">All types</option>
          {CONTACT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select value={market} onChange={(e) => setMarket(e.target.value)} className={field}>
          <option value="">All markets</option>
          {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" className={`${field} w-32`} />
        <span className="ml-auto text-sm font-medium text-[var(--color-anchor)]">{filtered.length} of {contacts.length}</span>
      </div>

      {/* Contacts table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Company</th>
            <th className="py-2 pr-4 font-medium">Market</th>
            <th className="py-2 pr-4 font-medium">Tags</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-b border-[var(--color-sand)]/50">
              <td className="py-3 pr-4 font-medium">
                {c.fullName}
                {c.sample && <span className="ml-2 text-[0.6rem] uppercase tracking-wide text-[var(--color-muted)]">sample</span>}
                {c.email && <div className="text-xs text-[var(--color-muted)]">{c.email}</div>}
              </td>
              <td className="py-3 pr-4 text-[var(--color-muted)]">{TYPE_LABEL[c.type]}</td>
              <td className="py-3 pr-4">{c.company || "—"}</td>
              <td className="py-3 pr-4">{c.market || "—"}</td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap gap-1">
                  {(c.tags || []).map((t) => <span key={t} className="rounded-full bg-[var(--color-sand)]/60 px-2 py-0.5 text-[0.6rem]">{t}</span>)}
                </div>
              </td>
              <td className="py-3 pr-4">
                <select value={c.status} disabled={busy} onChange={(e) => call(`/api/hub/contacts/${c.id}`, "PATCH", { status: e.target.value })} className="rounded border border-[var(--color-sand)] bg-white/70 px-2 py-1 text-xs">
                  {CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </td>
              <td className="py-3 text-right">
                <button onClick={() => call(`/api/hub/contacts/${c.id}`, "DELETE")} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Broadcast composer */}
      <Composer segmentLabel={segmentLabel} recipientCount={filtered.length} busy={busy} onSent={() => router.refresh()} />

      {/* Recent broadcasts */}
      {broadcasts.length > 0 && (
        <section>
          <h2 className="display text-lg text-[var(--color-anchor)]">Recent broadcasts</h2>
          <ul className="mt-3 divide-y divide-[var(--color-sand)]/60 rounded-xl border border-[var(--color-sand)] bg-white/40 text-sm">
            {broadcasts.slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-medium">{b.subject}</span>
                <span className="text-xs text-[var(--color-muted)]">{b.segment} · {b.recipientCount} recipients · {b.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Composer({ segmentLabel, recipientCount, busy, onSent }: { segmentLabel: string; recipientCount: number; busy: boolean; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setMsg("");
    const res = await fetch("/api/hub/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, segment: segmentLabel, recipientCount }),
    }).catch(() => null);
    setSending(false);
    if (res?.ok) {
      setMsg(`Saved as draft for ${recipientCount} recipients (${segmentLabel}). Sending activates when the thepalms.dev mailbox is connected.`);
      setSubject("");
      setBody("");
      onSent();
    } else {
      setMsg("Couldn't save. Try again.");
    }
  }

  const field = "w-full rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <section className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-6">
      <h2 className="display text-lg text-[var(--color-anchor)]">Broadcast</h2>
      <p className="text-sm text-[var(--color-muted)]">To the current segment — <span className="font-medium text-[var(--color-foreground)]">{segmentLabel}</span> ({recipientCount} contacts).</p>
      <div className="mt-4 space-y-3">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject — e.g. New release: marina residences" className={field} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Message… (broker incentive, release/price-tier deadline, inventory update)" className={field} />
        {msg && <p className="text-sm text-[var(--color-anchor)]">{msg}</p>}
        <button onClick={send} disabled={busy || sending || !subject.trim() || !body.trim() || recipientCount === 0} className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] disabled:opacity-50">
          {sending ? "Saving…" : `Queue to ${recipientCount}`}
        </button>
      </div>
    </section>
  );
}
