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
const STATUS_LABEL: Record<string, string> = Object.fromEntries(CONTACT_STATUSES.map((s) => [s.key, s.label]));
const NO_FIRM = "— Independent —";

type Brokerage = { name: string; count: number; emailable: number; markets: string[]; types: Set<string> };

export function SalesBoard({ contacts, broadcasts }: { contacts: Contact[]; broadcasts: Broadcast[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<"contacts" | "brokerages">("contacts");

  // filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [market, setMarket] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [emailOnly, setEmailOnly] = useState(false);
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    const s = new Set<string>();
    contacts.forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [contacts]);

  const allBrokerages = useMemo(
    () => [...new Set(contacts.map((c) => c.company).filter(Boolean) as string[])].sort(),
    [contacts],
  );

  const brokerageRollup = useMemo(() => {
    const map = new Map<string, Brokerage>();
    for (const c of contacts) {
      const name = c.company || NO_FIRM;
      const b = map.get(name) || { name, count: 0, emailable: 0, markets: [], types: new Set<string>() };
      b.count++;
      if (c.email) b.emailable++;
      if (c.market && !b.markets.includes(c.market)) b.markets.push(c.market);
      b.types.add(c.type);
      map.set(name, b);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [contacts]);

  const stats = useMemo(() => ({
    total: contacts.length,
    brokerages: allBrokerages.length,
    agents: contacts.filter((c) => c.type === "agent").length,
    emailable: contacts.filter((c) => c.email).length,
  }), [contacts, allBrokerages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = contacts.filter((c) =>
      (!type || c.type === type) &&
      (!market || c.market === market) &&
      (!status || c.status === status) &&
      (!tag || (c.tags || []).includes(tag)) &&
      (!brokerage || c.company === brokerage) &&
      (!emailOnly || !!c.email) &&
      (!q || c.fullName.toLowerCase().includes(q) || (c.company || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q)),
    );
    const by: Record<string, (a: Contact, b: Contact) => number> = {
      name: (a, b) => a.fullName.localeCompare(b.fullName),
      company: (a, b) => (a.company || "").localeCompare(b.company || ""),
      market: (a, b) => (a.market || "").localeCompare(b.market || ""),
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
    };
    return [...out].sort(by[sort] || by.name);
  }, [contacts, search, type, market, status, tag, brokerage, emailOnly, sort]);

  const targetContacts = selected.size > 0 ? contacts.filter((c) => selected.has(c.id)) : filtered;
  const emailableTarget = targetContacts.filter((c) => c.email).length;
  const segmentLabel = selected.size > 0
    ? `${selected.size} selected`
    : [brokerage, type && TYPE_LABEL[type], market, status && STATUS_LABEL[status], tag && `#${tag}`, emailOnly && "has-email"].filter(Boolean).join(" · ") || "All contacts";

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => {});
    setBusy(false);
    router.refresh();
  }
  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await call("/api/hub/contacts", "POST", Object.fromEntries(new FormData(e.currentTarget).entries()));
    setAdding(false);
  }
  function toggle(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    const ids = filtered.map((c) => c.id);
    const allSel = ids.length > 0 && ids.every((id) => selected.has(id));
    setSelected((prev) => { const n = new Set(prev); ids.forEach((id) => (allSel ? n.delete(id) : n.add(id))); return n; });
  }
  function clearFilters() { setSearch(""); setType(""); setMarket(""); setStatus(""); setTag(""); setBrokerage(""); setEmailOnly(false); }
  function drillIntoBrokerage(name: string) {
    clearFilters();
    setBrokerage(name === NO_FIRM ? "" : name);
    setSelected(new Set());
    setView("contacts");
  }

  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="display text-2xl text-[var(--color-anchor)]">Sales</h1>
        <div className="rounded-xl border border-dashed border-[var(--color-sand)] p-8 text-center">
          <p className="text-sm text-[var(--color-muted)]">No contacts yet — agents, referral partners, and buyer prospects live here.</p>
          <button onClick={() => call("/api/hub/seed", "POST")} disabled={busy} className="mt-3 rounded-full border border-[var(--color-sand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-60">Seed sample contacts</button>
        </div>
      </div>
    );
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="display text-2xl text-[var(--color-anchor)]">Sales</h1>
          {/* view toggle */}
          <div className="flex rounded-full border border-[var(--color-sand)] p-0.5 text-xs">
            {(["contacts", "brokerages"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1 font-semibold uppercase tracking-[0.1em] transition ${view === v ? "bg-[var(--color-ink)] text-[var(--color-shell)]" : "text-[var(--color-muted)]"}`}>{v}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">{adding ? "Cancel" : "+ Add contact"}</button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 text-sm">
        {[["Contacts", stats.total], ["Brokerages", stats.brokerages], ["Agents", stats.agents], ["Emailable", stats.emailable]].map(([l, n]) => (
          <span key={l as string} className="rounded-full border border-[var(--color-sand)] bg-white/50 px-3 py-1"><span className="font-semibold text-[var(--color-anchor)]">{n}</span> <span className="text-[var(--color-muted)]">{l}</span></span>
        ))}
      </div>

      {adding && (
        <form onSubmit={onAdd} className="grid gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <select name="type" defaultValue="agent" className={field}>{CONTACT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select>
          <input name="fullName" required placeholder="Full name" className={field} />
          <input name="company" placeholder="Brokerage / firm" className={field} />
          <input name="email" type="email" placeholder="Email" className={field} />
          <input name="phone" placeholder="Phone" className={field} />
          <select name="market" defaultValue="" className={field}><option value="">Market…</option>{MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          <input name="tags" placeholder="Tags (comma-sep)" className={`${field} sm:col-span-2`} />
          <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)] disabled:opacity-60">Save contact</button>
        </form>
      )}

      {view === "brokerages" ? (
        /* ============ BROKERAGES ROLLUP ============ */
        <div className="overflow-x-auto">
          <p className="mb-3 text-sm text-[var(--color-muted)]">Your coverage organized by firm. Click a brokerage to see its agents.</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Brokerage</th>
                <th className="py-2 pr-4 font-medium">Contacts</th>
                <th className="py-2 pr-4 font-medium">Emailable</th>
                <th className="py-2 pr-4 font-medium">Markets</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {brokerageRollup.map((b) => (
                <tr key={b.name} className="border-b border-[var(--color-sand)]/50 hover:bg-[var(--color-sand)]/15">
                  <td className="py-3 pr-4 font-medium">
                    <button onClick={() => drillIntoBrokerage(b.name)} className="hover:text-[var(--color-anchor)] hover:underline">{b.name}</button>
                  </td>
                  <td className="py-3 pr-4"><span className="font-semibold text-[var(--color-anchor)]">{b.count}</span></td>
                  <td className="py-3 pr-4 text-[var(--color-muted)]">{b.emailable}</td>
                  <td className="py-3 pr-4 text-[var(--color-muted)]">{b.markets.sort().join(", ") || "—"}</td>
                  <td className="py-3 text-right"><button onClick={() => drillIntoBrokerage(b.name)} className="text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ============ CONTACTS ============ */
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-sand)] bg-white/40 p-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / brokerage / email" className={`${field} min-w-[180px] flex-1`} />
            <select value={brokerage} onChange={(e) => setBrokerage(e.target.value)} className={field}><option value="">All brokerages</option>{allBrokerages.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            <select value={type} onChange={(e) => setType(e.target.value)} className={field}><option value="">All types</option>{CONTACT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className={field}><option value="">All markets</option>{MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}><option value="">Any status</option>{CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className={field}><option value="">Any tag</option>{allTags.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <label className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]"><input type="checkbox" checked={emailOnly} onChange={(e) => setEmailOnly(e.target.checked)} /> has email</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={field}><option value="name">Sort: Name</option><option value="company">Brokerage</option><option value="market">Market</option><option value="recent">Recently added</option></select>
            <button onClick={clearFilters} className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">Clear</button>
            <span className="ml-auto text-sm font-medium text-[var(--color-anchor)]">{filtered.length} of {contacts.length}</span>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-anchor)] px-4 py-2 text-sm text-[var(--color-shell)]">
              <span className="font-medium">{selected.size} selected</span>
              <button onClick={() => setSelected(new Set())} className="text-xs uppercase tracking-wide text-[var(--color-sand)] hover:text-white">Clear selection</button>
              <span className="ml-auto text-xs text-[var(--color-sand)]">↓ compose a broadcast to these {emailableTarget} emailable</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <th className="py-2 pr-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all" /></th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Brokerage</th>
                  <th className="py-2 pr-4 font-medium">Market</th>
                  <th className="py-2 pr-4 font-medium">Tags</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`border-b border-[var(--color-sand)]/50 ${selected.has(c.id) ? "bg-[var(--color-accent)]/10" : ""}`}>
                    <td className="py-3 pr-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                    <td className="py-3 pr-4 font-medium">
                      {c.fullName}
                      {c.email ? <div className="text-xs text-[var(--color-muted)]">{c.email}</div> : <div className="text-xs italic text-[var(--color-muted)]/60">no email</div>}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-muted)]">{TYPE_LABEL[c.type]}</td>
                    <td className="py-3 pr-4">
                      {c.company ? <button onClick={() => setBrokerage(c.company!)} className="hover:text-[var(--color-anchor)] hover:underline" title="Filter to this brokerage">{c.company}</button> : "—"}
                    </td>
                    <td className="py-3 pr-4">{c.market || "—"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t) => <button key={t} onClick={() => setTag(t)} className="rounded-full bg-[var(--color-sand)]/60 px-2 py-0.5 text-[0.6rem] hover:bg-[var(--color-accent)]" title={`Filter by ${t}`}>{t}</button>)}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select value={c.status} disabled={busy} onChange={(e) => call(`/api/hub/contacts/${c.id}`, "PATCH", { status: e.target.value })} className="rounded border border-[var(--color-sand)] bg-white/70 px-2 py-1 text-xs">
                        {CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right"><button onClick={() => call(`/api/hub/contacts/${c.id}`, "DELETE")} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Composer segmentLabel={segmentLabel} recipientCount={emailableTarget} totalInTarget={targetContacts.length} busy={busy} onSent={() => { setSelected(new Set()); router.refresh(); }} />
        </>
      )}

      {broadcasts.length > 0 && (
        <section>
          <h2 className="display text-lg text-[var(--color-anchor)]">Recent broadcasts</h2>
          <ul className="mt-3 divide-y divide-[var(--color-sand)]/60 rounded-xl border border-[var(--color-sand)] bg-white/40 text-sm">
            {broadcasts.slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center justify-between px-5 py-3"><span className="font-medium">{b.subject}</span><span className="text-xs text-[var(--color-muted)]">{b.segment} · {b.recipientCount} recipients · {b.status}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Composer({ segmentLabel, recipientCount, totalInTarget, busy, onSent }: { segmentLabel: string; recipientCount: number; totalInTarget: number; busy: boolean; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true); setMsg("");
    const res = await fetch("/api/hub/broadcasts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body, segment: segmentLabel, recipientCount }) }).catch(() => null);
    setSending(false);
    if (res?.ok) { setMsg(`Saved as draft → ${recipientCount} emailable in "${segmentLabel}". Sends via Google Workspace once thepalms.dev mail is connected.`); setSubject(""); setBody(""); onSent(); }
    else setMsg("Couldn't save. Try again.");
  }

  const field = "w-full rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <section className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-6">
      <h2 className="display text-lg text-[var(--color-anchor)]">Broadcast</h2>
      <p className="text-sm text-[var(--color-muted)]">To <span className="font-medium text-[var(--color-foreground)]">{segmentLabel}</span> — {recipientCount} emailable of {totalInTarget}.</p>
      <div className="mt-4 space-y-3">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject — e.g. New release: marina residences" className={field} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Message… (broker incentive, release/price-tier deadline, inventory update)" className={field} />
        {msg && <p className="text-sm text-[var(--color-anchor)]">{msg}</p>}
        <button onClick={send} disabled={busy || sending || !subject.trim() || !body.trim() || recipientCount === 0} className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] disabled:opacity-50">{sending ? "Saving…" : `Queue to ${recipientCount}`}</button>
      </div>
    </section>
  );
}
