import type { Contact } from "./contacts-shared";
import { MARKET_AFFLUENCE, marketNote, brokeragePrestige } from "./texas-wealth";

/**
 * Buyer-quality score — likelihood an agent/partner brings a qualified Palms
 * buyer. Transparent + tied to Collie's brief: luxury brokerage × feeder-market
 * affluence × buyer-fit signals (marina/boat is the wedge) × reachability.
 * Every point is explainable (see `reasons`).
 */
export type Priority = "priority" | "high" | "medium" | "standard";

export const PRIORITY_TIERS: { key: Priority; label: string; min: number }[] = [
  { key: "priority", label: "Priority", min: 55 },
  { key: "high", label: "High", min: 38 },
  { key: "medium", label: "Medium", min: 20 },
  { key: "standard", label: "Standard", min: 0 },
];

const TAG_WEIGHTS: Record<string, number> = {
  "marina/boat": 20, // the wedge — Island Moorings is a marina + yacht-club community
  "second-home": 12,
  "luxury": 12,
  "waterfront": 10,
  "investment/str": 8,
};

export type Score = { score: number; tier: Priority; tierLabel: string; reasons: string[] };

export function scoreContact(c: Contact): Score {
  let score = 0;
  const reasons: string[] = [];

  const pres = brokeragePrestige(c.company);
  if (pres.weight) {
    score += pres.weight;
    reasons.push(pres.label!);
  }

  if (c.market) {
    score += MARKET_AFFLUENCE[c.market] ?? MARKET_AFFLUENCE.Other;
    const note = marketNote(c.market);
    reasons.push(note ? `${c.market} (${note})` : c.market);
  }

  for (const t of c.tags || []) {
    const w = TAG_WEIGHTS[t.toLowerCase()];
    if (w) {
      score += w;
      reasons.push(t);
    }
  }

  if (c.type === "partner") {
    score += 6;
    reasons.push("referral partner");
  }

  if (c.email) {
    score += 5;
    reasons.push("emailable");
  } else if (c.phone) {
    score += 3;
    reasons.push("callable");
  }

  score = Math.min(100, score);
  const tier = PRIORITY_TIERS.find((t) => score >= t.min) ?? PRIORITY_TIERS[PRIORITY_TIERS.length - 1];
  return { score, tier: tier.key, tierLabel: tier.label, reasons };
}

/** Tailwind classes for a tier badge (brand tokens). */
export function tierBadgeClass(tier: Priority): string {
  switch (tier) {
    case "priority":
      return "bg-[var(--color-accent)] text-[var(--color-ink)]";
    case "high":
      return "bg-[var(--color-anchor)] text-[var(--color-shell)]";
    case "medium":
      return "bg-[var(--color-sand)] text-[var(--color-foreground)]";
    default:
      return "border border-[var(--color-sand)] text-[var(--color-muted)]";
  }
}
