import type { Metadata } from "next";
import { HubNav } from "@/components/HubNav";
import { HubLogout } from "@/components/HubLogout";

export const metadata: Metadata = {
  title: "Hub · The Palms",
  robots: { index: false, follow: false },
};

export default function HubAppLayout({ children }: { children: React.ReactNode }) {
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
          <HubLogout />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
