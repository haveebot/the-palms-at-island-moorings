"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/lib/contacts-shared";

/**
 * Reusable broadcast composer — a modal summoned from anywhere a set of targets
 * is selected (directory filter/selection, a brokerage roster). Same engine as
 * before: personalized, client-chunked send behind a confirm gate, or save a
 * draft. `targets` is the candidate set; sendable = has email AND not opted out.
 */
export function BroadcastComposer({
  open,
  onClose,
  targets,
  label,
  canSend,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  targets: Contact[];
  label: string;
  canSend: boolean;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [phase, setPhase] = useState<"idle" | "confirm" | "sending" | "done">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, sent: 0, failed: 0 });

  const sendIds = targets.filter((c) => c.email && c.status !== "do-not-contact").map((c) => c.id);
  const n = sendIds.length;
  const ready = !!subject.trim() && !!body.trim() && n > 0;

  useEffect(() => {
    if (open) {
      setMsg("");
      setPhase("idle");
      setProgress({ done: 0, total: 0, sent: 0, failed: 0 });
    }
  }, [open]);

  if (!open) return null;

  async function saveDraft() {
    if (!ready) return;
    setPhase("sending");
    setMsg("");
    const res = await fetch("/api/hub/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, segment: label, recipientCount: n }),
    }).catch(() => null);
    setPhase("done");
    if (res?.ok) {
      setMsg(`Saved as draft → ${n} recipients in "${label}".`);
      setSubject("");
      setBody("");
      onSent();
    } else setMsg("Couldn't save. Try again.");
  }

  async function fanOut() {
    setPhase("sending");
    setMsg("");
    setProgress({ done: 0, total: n, sent: 0, failed: 0 });
    const CHUNK = 20;
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < sendIds.length; i += CHUNK) {
      const chunk = sendIds.slice(i, i + CHUNK);
      const res = await fetch("/api/hub/broadcasts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, recipientIds: chunk }),
      }).then((r) => r.json()).catch(() => null);
      if (res?.ok) {
        sent += res.sent.length;
        failed += res.failed.length + res.skipped.length;
      } else failed += chunk.length;
      setProgress({ done: Math.min(i + CHUNK, sendIds.length), total: sendIds.length, sent, failed });
    }
    await fetch("/api/hub/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, segment: label, recipientCount: n, status: "sent", sentCount: sent, failedCount: failed }),
    }).catch(() => {});
    setPhase("done");
    setMsg(`Sent to ${sent}${failed ? ` · ${failed} skipped/failed` : ""}.`);
    setSubject("");
    setBody("");
    onSent();
  }

  const field = "w-full rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";
  const dismissable = phase !== "sending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-ink)]/50" onClick={dismissable ? onClose : undefined} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-shell)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="display text-lg text-[var(--color-anchor)]">Compose email</h2>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">
              To <span className="font-medium text-[var(--color-foreground)]">{label}</span> — {n} sendable.
              <span className="ml-1 italic">Use {"{firstName}"} / {"{name}"}.</span>
            </p>
          </div>
          <button onClick={onClose} disabled={!dismissable} className="text-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-40" aria-label="Close">✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject — e.g. {firstName}, a first look at the marina residences" className={field} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Hi {firstName}, … (broker co-op, release deadline, Founders' List invite). An unsubscribe link + our mailing address are appended automatically." className={field} />

          {!canSend && (
            <p className="rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-muted)]">
              Sending is paused until the Workspace sender + a mailing address are set (the postal address is required by law). Drafts still save.
            </p>
          )}
          {phase === "sending" && progress.total > 0 && (
            <p className="text-sm text-[var(--color-anchor)]">Sending… {progress.done}/{progress.total} ({progress.sent} sent{progress.failed ? `, ${progress.failed} skipped` : ""})</p>
          )}
          {msg && <p className="text-sm text-[var(--color-anchor)]">{msg}</p>}

          {phase === "confirm" ? (
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--color-accent)]/50 bg-white/60 px-4 py-3">
              <span className="text-sm">Email <span className="font-semibold">{n}</span> real contacts now? This can&rsquo;t be undone.</span>
              <button onClick={fanOut} className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)]">Yes, send {n}</button>
              <button onClick={() => setPhase("idle")} className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">Cancel</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-3">
              {phase === "done" && <button onClick={onClose} className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">Close</button>}
              <button onClick={saveDraft} disabled={phase === "sending" || !ready} className="rounded-full border border-[var(--color-sand)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-50">Save draft</button>
              <button onClick={() => setPhase("confirm")} disabled={phase === "sending" || !ready || !canSend} title={!canSend ? "Add the mailing address to enable sending" : ""} className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] disabled:opacity-50">Send to {n}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
