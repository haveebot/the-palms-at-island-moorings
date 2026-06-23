import type { Contact } from "./contacts-shared";
import {
  MARKET_AFFLUENCE,
  marketNote,
  brokeragePrestige,
  ULTRA_BROKERAGE_WEIGHT,
  LUXURY_BROKERAGE_WEIGHT,
} from "./texas-wealth";

/**
 * Buyer-quality score — how likely a contact is to deliver a qualified Palms
 * buyer. v2 "lead-driver" model (2026-06-22, reweighted with Winston):
 *   BROKER CALIBER is the spine — elite houses bring elite buyers.
 *   MARKET sets the buyer pool (proximity + $2M+ depth).
 *   BUYER-FIT signals enrich a lead but are CAPPED, so stacked water/boat tags
 *     never outweigh caliber — marina/boat is the Island Moorings feature, not
 *     the lead itself (the v1 bug: a yacht broker out-ranked the #1 TX producer).
 *   REACHABILITY makes it actionable.
 * Every point is explainable (`reasons`), and the in-hub Scoring Guide renders
 * SCORING_MODEL below from these SAME constants, so it can't drift from the code.
 *
 * INTEGRITY: geography + brokerage reputation + buyer-fit tags + reachability
 * only. We never fabricate an individual's income or production.
 */
export type Priority = "priority" | "high" | "medium" | "standard";

export const PRIORITY_TIERS: { key: Priority; label: string; min: number; blurb: string }[] = [
  { key: "priority", label: "Priority", min: 70, blurb: "Elite luxury-brokerage producers in the feeder markets — work these first." },
  { key: "high", label: "High", min: 52, blurb: "Strong luxury agents and well-fit partners worth active outreach." },
  { key: "medium", label: "Medium", min: 34, blurb: "Relevant reach — local presence, the marina network, secondary fit." },
  { key: "standard", label: "Standard", min: 0, blurb: "Broader roster — kept for coverage, not the focus." },
];

// Buyer-fit signals — differentiators that ENRICH a lead. Summed, then capped at
// TAG_CONTRIBUTION_CAP so stacked tags can't rival broker caliber.
const TAG_WEIGHTS: Record<string, number> = {
  "luxury": 10,
  "second-home": 8,
  "marina/boat": 8, // the Island Moorings feature — a differentiator, not the driver
  "waterfront": 7,
  "investment/str": 5,
};
export const TAG_CONTRIBUTION_CAP = 22;

const EMAIL_POINTS = 6;
const PHONE_POINTS = 3;

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

  let tagPoints = 0;
  const tagHits: string[] = [];
  for (const t of c.tags || []) {
    const w = TAG_WEIGHTS[t.toLowerCase()];
    if (w) {
      tagPoints += w;
      tagHits.push(t);
    }
  }
  if (tagPoints > 0) {
    score += Math.min(TAG_CONTRIBUTION_CAP, tagPoints);
    reasons.push(...tagHits);
  }

  if (c.email) {
    score += EMAIL_POINTS;
    reasons.push("emailable");
  } else if (c.phone) {
    score += PHONE_POINTS;
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

/**
 * SCORING_MODEL — the single source of truth the in-hub Scoring Guide renders.
 * Built from the SAME constants the engine scores with, so the explainer shown to
 * Shana & Collie can never drift from the live algorithm.
 */
export type ScoreFactor = {
  key: string;
  label: string;
  lead: string;
  items: { label: string; detail?: string; points: number }[];
};

export const SCORING_MODEL: { summary: string; factors: ScoreFactor[]; integrity: string } = {
  summary:
    "Every contact gets a buyer-quality score — how likely they are to bring a qualified Palms buyer. Broker caliber leads, market sets the buyer pool, fit signals enrich, and reachability makes it actionable.",
  factors: [
    {
      key: "broker",
      label: "Broker caliber",
      lead: "The primary driver — elite houses bring elite buyers.",
      items: [
        { label: "Ultra-luxury brokerage", detail: "Sotheby's · Allie Beth Allman · Douglas Elliman · Briggs Freeman · Christie's", points: ULTRA_BROKERAGE_WEIGHT },
        { label: "Luxury brokerage", detail: "Kuper · Compass · Phyllis Browning · Dave Perry-Miller · Moreland · Gottesman · Engel & Völkers · Coldwell Banker", points: LUXURY_BROKERAGE_WEIGHT },
      ],
    },
    {
      key: "market",
      label: "Market",
      lead: "Where the qualified buyers are — proximity to Port Aransas blended with $2M+ pool depth.",
      items: Object.entries(MARKET_AFFLUENCE).map(([m, points]) => ({ label: m, detail: marketNote(m) || undefined, points })),
    },
    {
      key: "fit",
      label: "Buyer-fit signals",
      lead: `Differentiators that enrich a lead — summed but capped at ${TAG_CONTRIBUTION_CAP}, so they sharpen a prospect without ever outweighing broker caliber. Marina/boat is the Island Moorings feature, not the lead itself.`,
      items: Object.entries(TAG_WEIGHTS).map(([t, points]) => ({ label: t, points })),
    },
    {
      key: "reach",
      label: "Reachability",
      lead: "A contact you can actually reach scores higher.",
      items: [
        { label: "Has email", points: EMAIL_POINTS },
        { label: "Has phone (only)", points: PHONE_POINTS },
      ],
    },
  ],
  integrity:
    "Built on geography, brokerage reputation, buyer-fit tags, and reachability only — never a fabricated individual income or production figure.",
};
