/**
 * Brokerage = a managed firm entity (the Palms analog of a Sage HQ agency).
 * The roster of agents is DERIVED from contacts' `company` field — no migration.
 * This file holds only the firm-level metadata layered on top (relationship
 * stage, primary contact, notes, tags). SHARED types (client-safe).
 */
export const BROKERAGE_STAGES: { key: string; label: string }[] = [
  { key: "prospect", label: "Prospect" },
  { key: "contacted", label: "Contacted" },
  { key: "engaged", label: "Engaged" },
  { key: "partner", label: "Active partner" },
  { key: "dormant", label: "Dormant" },
];

export type BrokerageMeta = {
  id: string; // slug of the name
  name: string; // canonical brokerage / company name
  stage: string;
  primaryContactId?: string;
  notes?: string;
  tags: string[];
  updatedAt: string;
};

/** Stable, URL-safe slug from a brokerage name (the page param + the meta id). */
export function brokerageSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
