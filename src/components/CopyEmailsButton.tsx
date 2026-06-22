"use client";

import { useState } from "react";

/**
 * Copy a set of email addresses to the clipboard (comma-separated) so an
 * operator can paste them into whichever mail account they're actually working
 * in — no assumption about the machine's default mail client (Collie + Shana
 * juggle many addresses). For "from me, to a few" personal sends.
 */
export function CopyEmailsButton({ emails, className }: { emails: string[]; className?: string }) {
  const [copied, setCopied] = useState(false);
  const n = emails.length;

  async function copy() {
    if (n === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <button
      onClick={copy}
      disabled={n === 0}
      title="Copy these email addresses — paste them into your own inbox to send from your address"
      className={className ?? "rounded-full border border-[var(--color-sand)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] transition hover:text-[var(--color-foreground)] disabled:opacity-40"}
    >
      {copied ? "Copied ✓" : `Copy ${n} email${n === 1 ? "" : "s"}`}
    </button>
  );
}
