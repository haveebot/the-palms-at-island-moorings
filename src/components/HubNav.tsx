"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/hub", label: "Dashboard" },
  { href: "/hub/leads", label: "Leads" },
  { href: "/hub/inventory", label: "Inventory" },
  { href: "/hub/sales", label: "Sales" },
  { href: "/hub/marketing", label: "Marketing" },
  { href: "/hub/documents", label: "Documents" },
];

export function HubNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/hub" ? path === "/hub" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              active
                ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                : "text-[var(--color-sand)] hover:text-[var(--color-shell)]"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
