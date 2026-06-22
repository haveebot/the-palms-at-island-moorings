/**
 * Texas wealth-geography intelligence — the overlay that powers buyer-quality
 * scoring and (later) the command-center map.
 *
 * INTEGRITY: built on PUBLICLY ESTABLISHED affluence. The named corridors are
 * consistently ranked among Texas's wealthiest areas; tiers are reputational
 * classifications, NOT fabricated statistics. Precise Census income / home-value
 * figures get sourced + attached in a later pass to refine these weights.
 *
 * Client-safe (pure data + functions) — scoring runs in the Sales board.
 */
export type WealthTier = 1 | 2 | 3; // 1 = ultra-affluent · 2 = affluent · 3 = upper-middle

export type Corridor = { area: string; metro: string; tier: WealthTier };

/** Texas's affluent corridors — the overlay backbone (real, well-known areas). */
export const TX_CORRIDORS: Corridor[] = [
  // Dallas–Fort Worth
  { area: "Highland Park", metro: "Dallas", tier: 1 },
  { area: "University Park", metro: "Dallas", tier: 1 },
  { area: "Preston Hollow", metro: "Dallas", tier: 1 },
  { area: "Southlake", metro: "Dallas", tier: 1 },
  { area: "Westlake", metro: "Dallas", tier: 1 },
  { area: "Colleyville", metro: "Dallas", tier: 2 },
  // Houston
  { area: "River Oaks", metro: "Houston", tier: 1 },
  { area: "Memorial", metro: "Houston", tier: 1 },
  { area: "West University Place", metro: "Houston", tier: 1 },
  { area: "Tanglewood", metro: "Houston", tier: 1 },
  { area: "Bellaire", metro: "Houston", tier: 2 },
  { area: "The Woodlands", metro: "Houston", tier: 2 },
  // Austin
  { area: "West Lake Hills", metro: "Austin", tier: 1 },
  { area: "Rollingwood", metro: "Austin", tier: 1 },
  { area: "Tarrytown", metro: "Austin", tier: 1 },
  { area: "Barton Creek", metro: "Austin", tier: 1 },
  { area: "Lakeway", metro: "Austin", tier: 2 },
  // San Antonio
  { area: "Alamo Heights", metro: "San Antonio", tier: 1 },
  { area: "Terrell Hills", metro: "San Antonio", tier: 1 },
  { area: "Olmos Park", metro: "San Antonio", tier: 1 },
  { area: "The Dominion", metro: "San Antonio", tier: 1 },
  { area: "Stone Oak", metro: "San Antonio", tier: 2 },
];

export const CORRIDORS_BY_METRO: Record<string, Corridor[]> = TX_CORRIDORS.reduce((m, c) => {
  (m[c.metro] ||= []).push(c);
  return m;
}, {} as Record<string, Corridor[]>);

/**
 * Feeder-market weight tuned to THE PALMS' buyer (Collie's brief): San Antonio +
 * Austin are the closest feeders; Coastal Bend is local sellers + the marina /
 * boat-owner network (the wedge); Houston + DFW are meaningful secondaries.
 */
export const MARKET_AFFLUENCE: Record<string, number> = {
  "Coastal Bend": 20,
  "San Antonio": 20,
  "Austin": 18,
  "Houston": 12,
  "Dallas": 12,
  "Other": 6,
};

export function marketNote(market?: string): string {
  if (market === "Coastal Bend") return "local / marina";
  if (market === "San Antonio" || market === "Austin") return "closest feeder";
  if (market === "Houston" || market === "Dallas") return "secondary feeder";
  return "";
}

// Publicly established luxury brands (case-insensitive substring match on company).
const ULTRA_LUXURY = ["sotheby", "allie beth allman", "briggs freeman", "douglas elliman", "christie"];
const LUXURY = [
  "kuper", "compass", "phyllis browning", "dave perry-miller", "engel", "moreland",
  "gottesman", "nan and company", "nan & company", "martha turner", "coldwell banker", "ebby halliday",
];

/** Brokerage prestige signal — implies affluent-corridor access. */
export function brokeragePrestige(company?: string): { weight: number; label: string | null } {
  if (!company) return { weight: 0, label: null };
  const c = company.toLowerCase();
  if (ULTRA_LUXURY.some((p) => c.includes(p))) return { weight: 25, label: "Ultra-luxury brokerage" };
  if (LUXURY.some((p) => c.includes(p))) return { weight: 18, label: "Luxury brokerage" };
  return { weight: 0, label: null };
}
