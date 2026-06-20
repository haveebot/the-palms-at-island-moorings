"use client";

export function HubLogout() {
  async function logout() {
    await fetch("/api/hub/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/hub/login";
  }
  return (
    <button
      onClick={logout}
      className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
    >
      Sign out
    </button>
  );
}
