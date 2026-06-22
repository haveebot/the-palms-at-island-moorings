"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const ERRORS: Record<string, string> = {
  denied: "That account isn't allowed. Sign in with your @thepalms.dev account.",
  state: "Sign-in expired — please try again.",
  exchange: "Couldn't complete Google sign-in. Try again.",
  "sso-off": "Google sign-in isn't enabled yet — use the access password below.",
  config: "Sign-in isn't configured yet.",
};

export default function HubLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("e");
    if (e && ERRORS[e]) {
      setMsg(ERRORS[e]);
      setStatus("error");
      if (e === "sso-off") setShowPw(true);
    }
  }, []);

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
        <p className="mt-1 text-sm text-[var(--color-muted)]">Sign in to view pre-sales activity.</p>

        {status === "error" && msg && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>
        )}

        <a
          href="/api/auth/google/start"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-sand)] bg-white px-6 py-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-[var(--color-sand)]/25"
        >
          <GoogleMark /> Sign in with Google
        </a>
        <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
          Use your <span className="font-medium">@thepalms.dev</span> account.
        </p>

        <button
          onClick={() => setShowPw((v) => !v)}
          className="mt-6 w-full text-center text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          {showPw ? "Hide" : "Use access password instead"}
        </button>

        {showPw && (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-[var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "submitting" ? "Signing in…" : "Enter the hub"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">{SITE.name}</p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
