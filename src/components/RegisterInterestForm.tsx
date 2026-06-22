"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Register-interest form → POSTs to /api/register-interest. Captures buyer
 * interest into THE PALMS' own pre-sales pipeline (not FC's agency leads).
 * Includes a honeypot (`company`) hidden from humans.
 */
export function RegisterInterestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-sand)]/40 p-8 text-center">
        <p className="display text-2xl text-[var(--color-anchor)]">You&rsquo;re on the list.</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {`Welcome to the Founders' List for ${SITE.name}. You'll be first to receive renderings, pricing, and reservation details.`}
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-[var(--color-sand)] bg-white/60 px-4 py-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Honeypot — visually hidden (sr-only avoids the off-screen horizontal overflow) */}
      <div className="sr-only" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Full name
          </span>
          <input name="fullName" type="text" required className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Email
          </span>
          <input name="email" type="email" required className={inputClass} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
          Phone <span className="normal-case opacity-70">(optional)</span>
        </span>
        <input name="phone" type="tel" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
          What are you looking for? <span className="normal-case opacity-70">(optional)</span>
        </span>
        <textarea name="notes" rows={3} className={inputClass} />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-[var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Submitting…" : "Join the Founders’ List"}
      </button>
    </form>
  );
}
