"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export default function HubLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMsg("");
    try {
      const res = await fetch("/api/hub/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/hub";
        return;
      }
      const b = await res.json().catch(() => ({}));
      setStatus("error");
      setMsg(b.error || "Something went wrong.");
    } catch {
      setStatus("error");
      setMsg("Something went wrong.");
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(900px 500px at 70% -10%, rgba(176,138,79,0.30), transparent 60%), linear-gradient(160deg, var(--color-harbor) 0%, var(--color-ink) 75%)",
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-shell)] p-8 shadow-2xl">
        <p className="eyebrow">The Palms · Island Moorings</p>
        <h1 className="display mt-3 text-2xl text-[var(--color-anchor)]">Owner &amp; Partner Hub</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Sign in to view pre-sales activity.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Access password
            </span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--color-sand)] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            />
          </label>

          {status === "error" && <p className="text-sm text-red-700">{msg}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-[var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "submitting" ? "Signing in…" : "Enter the hub"}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {SITE.name}
        </p>
      </div>
    </main>
  );
}
