/**
 * Residence collection — PLACEHOLDER scaffold data.
 *
 * ⚠️  We have NO real offering details yet (count, sizes, prices, plans). These
 *     three entries exist only so the grid layout is visible and clearly reads
 *     "coming soon." Do NOT fabricate specifics. Real residence data comes from
 *     the developer + Collie's creative; replace this file then.
 */
export type ResidenceStatus = "coming-soon" | "available" | "reserved";

export type Residence = {
  slug: string;
  name: string;
  summary: string;
  status: ResidenceStatus;
};

export const RESIDENCES: Residence[] = [
  {
    slug: "residence-i",
    name: "Residence I",
    summary: "Waterfront home — details coming soon.",
    status: "coming-soon",
  },
  {
    slug: "residence-ii",
    name: "Residence II",
    summary: "Waterfront home — details coming soon.",
    status: "coming-soon",
  },
  {
    slug: "residence-iii",
    name: "Residence III",
    summary: "Waterfront home — details coming soon.",
    status: "coming-soon",
  },
];
