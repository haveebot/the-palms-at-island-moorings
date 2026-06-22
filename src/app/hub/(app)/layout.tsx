import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HubNav } from "@/components/HubNav";
import { HubLogout } from "@/components/HubLogout";
import { readSession, HUB_COOKIE } from "@/lib/hub-session";

export const metadata: Metadata = {
  title: "Hub · The Palms",
  robots: { index: false, follow: false },
};

export default async function HubAppLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession((await cookies()).get(HUB_COOKIE)?.value, process.env.HUB_SESSION_SECRET || "");
  return (
    <div className="min-h-screen bg-[var(--color-shell)]">
      <header className="sticky top-0 z-40 bg-[var(--color-ink)] text-[var(--color-shell)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="leading-tight">
              <p className="display text-lg">The Palms · Hub</p>
              <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-sand)]">
                Island Moorings · pre-sales
              </p>
            </div>
            <HubNav />
          </div>
          <div className="flex items-center gap-4">
            {session?.email && (
              <span className="hidden text-xs text-[var(--color-sand)] sm:inline" title="Signed in">{session.email}</span>
            )}
            <HubLogout />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
