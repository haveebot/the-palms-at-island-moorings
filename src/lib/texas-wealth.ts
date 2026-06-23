/**
 * Texas wealth-geography intelligence — the overlay that powers buyer-quality
 * scoring and (later) the command-center map.
 *
 * INTEGRITY: every corridor now carries a REAL, SOURCED figure — ACS 2024 5-year
 * median household income (table B19013) and median owner-occupied home value
 * (B25077), each with the exact Census geography measured and a citation URL.
 * No fabricated stats. Tiers are DERIVED FROM THE DATA via `tierFromCensus()`
 * (see the rule below), not asserted from reputation — so where the data and a
 * neighborhood's reputation disagree, the data wins and the note says so.
 *
 * Two honest caveats are encoded per corridor in `note`:
 *  - TOP-CODE: ACS caps income at $250,001 and home value at $2,000,001. A capped
 *    figure means "at least that" — the true median is higher (these are floors).
 *  - ZIP PROXY: a few corridors are neighborhoods with no incorporated-place
 *    record, so a ZCTA (ZIP) stands in. Where that ZIP sweeps in non-luxury blocks
 *    and provably understates the enclave (River Oaks, Tanglewood, The Dominion),
 *    the tier defers to the established reputation and the note flags the dilution.
 *
 * Client-safe (pure data + functions) — scoring runs in the Sales board.
 */
export type WealthTier = 1 | 2 | 3; // 1 = ultra-affluent · 2 = affluent · 3 = upper-middle

/** ACS top-code ceilings — a value at the cap means "this or higher". */
export const ACS_INCOME_CAP = 250001;
export const ACS_HOME_VALUE_CAP = 2000001;

export type Corridor = {
  area: string;
  metro: string;
  tier: WealthTier;
  /** ACS 2024 5-yr median household income (B19013). `ACS_INCOME_CAP` = top-coded. */
  medianIncome: number;
  /** ACS 2024 5-yr median owner-occupied home value (B25077). `ACS_HOME_VALUE_CAP` = top-coded. */
  medianHomeValue: number;
  /** Exact Census geography the figures describe. */
  censusGeo: string;
  /** Citation — the page the figures were read off (ACS 2024 5-year via Census Reporter). */
  source: string;
  /** Honest caveats: top-codes, ZIP-proxy dilution, wide small-sample margins. */
  note?: string;
};

/**
 * Tier rule (transparent + auditable): the median HOME VALUE is the cleanest
 * luxury signal, with a top-coded income also forcing tier 1.
 *   tier 1 (ultra-affluent): home value ≥ $1.2M, OR either figure top-coded
 *   tier 2 (affluent):       home value ≥ $700k
 *   tier 3 (upper-middle):   below $700k
 * Corridors carrying a `dilutedProxy` flag below override the computed tier with
 * their reputational tier (the ZIP understates a known ultra-luxury enclave).
 */
export function tierFromCensus(medianHomeValue: number, medianIncome: number): WealthTier {
  if (
    medianHomeValue >= 1_200_000 ||
    medianHomeValue >= ACS_HOME_VALUE_CAP ||
    medianIncome >= ACS_INCOME_CAP
  )
    return 1;
  if (medianHomeValue >= 700_000) return 2;
  return 3;
}

const CR = (slug: string) => `https://censusreporter.org/profiles/${slug}/`;

/**
 * Texas's affluent corridors — the overlay backbone. Figures are ACS 2024 5-year
 * (Census Reporter, which republishes B19013 / B25077; Census QuickFacts blocks
 * automated reads). `tier` is `tierFromCensus()` applied to each row, except the
 * three ZIP-proxy enclaves noted inline, which keep their reputational tier.
 */
export const TX_CORRIDORS: Corridor[] = [
  // ── Dallas–Fort Worth ──
  { area: "Highland Park", metro: "Dallas", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: 1_989_900, censusGeo: "Highland Park town, TX", source: CR("16000US4833824-highland-park-tx"), note: "Income top-coded ($250k+). Home-value MOE ±$182k." },
  { area: "University Park", metro: "Dallas", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: 1_861_800, censusGeo: "University Park city, TX", source: CR("16000US4874492-university-park-tx"), note: "Income top-coded ($250k+)." },
  { area: "Preston Hollow", metro: "Dallas", tier: 1, medianIncome: 200_234, medianHomeValue: 1_671_900, censusGeo: "ZCTA 75225 (proxy)", source: CR("86000US75225-75225"), note: "ZIP proxy (75225 = core Preston Hollow + Park Cities-adjacent blocks); figures still firmly tier 1." },
  { area: "Southlake", metro: "Dallas", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: 1_014_500, censusGeo: "Southlake city, TX", source: CR("16000US4869032-southlake-tx"), note: "Income top-coded ($250k+) → tier 1 despite sub-$1.2M home value." },
  { area: "Westlake", metro: "Dallas", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: ACS_HOME_VALUE_CAP, censusGeo: "Westlake town, TX", source: CR("16000US4877620-westlake-tx"), note: "Both figures top-coded. Tiny place (~1,670 pop) → wide MOE; treat as floors." },
  { area: "Colleyville", metro: "Dallas", tier: 2, medianIncome: 218_328, medianHomeValue: 784_900, censusGeo: "Colleyville city, TX", source: CR("16000US4815988-colleyville-tx"), note: "Not top-coded." },
  // ── Houston ──
  { area: "River Oaks", metro: "Houston", tier: 1, medianIncome: 116_423, medianHomeValue: 816_500, censusGeo: "ZIP 77019 (proxy)", source: CR("86000US77019-77019"), note: "ZIP PROXY understates: 77019 is renter-heavy and extends past the gated mansion district. Tier 1 by reputation (Houston's premier enclave); ZIP figures are not representative." },
  { area: "Memorial", metro: "Houston", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: ACS_HOME_VALUE_CAP, censusGeo: "Piney Point Village city, TX", source: CR("16000US4857800-piney-point-village-tx"), note: "Represented by Piney Point Village (wealthiest Memorial Village). Both figures top-coded." },
  { area: "West University Place", metro: "Houston", tier: 1, medianIncome: ACS_INCOME_CAP, medianHomeValue: 1_472_000, censusGeo: "West University Place city, TX", source: CR("16000US4877956-west-university-place-tx"), note: "Income top-coded ($250k+)." },
  { area: "Tanglewood", metro: "Houston", tier: 1, medianIncome: 93_499, medianHomeValue: 860_900, censusGeo: "ZIP 77056 (proxy)", source: CR("86000US77056-77056"), note: "ZIP PROXY understates: 77056 folds in the dense Galleria high-rise/condo zone, depressing the median. Tier 1 by reputation (Tanglewood single-family core)." },
  { area: "Bellaire", metro: "Houston", tier: 2, medianIncome: 244_015, medianHomeValue: 1_037_500, censusGeo: "Bellaire city, TX", source: CR("16000US4807300-bellaire-tx"), note: "High income (near cap); home value $1.04M → tier 2 (borderline)." },
  { area: "The Woodlands", metro: "Houston", tier: 3, medianIncome: 140_701, medianHomeValue: 511_700, censusGeo: "The Woodlands CDP, TX", source: "https://api.censusreporter.org/1.0/data/show/acs2024_5yr?table_ids=B19013,B25077&geo_ids=16000US4872656", note: "CDP-wide median is upper-middle (5-yr $512k; 1-yr profile $617k) → tier 3 by data, though luxury sub-enclaves exist (Carlton Woods). A breadth, not a wealth-density, market." },
  // ── Austin ──
  { area: "West Lake Hills", metro: "Austin", tier: 1, medianIncome: 198_125, medianHomeValue: 1_664_500, censusGeo: "West Lake Hills city, TX", source: CR("16000US4877632-west-lake-hills-tx"), note: "Home-value MOE ±$318k." },
  { area: "Rollingwood", metro: "Austin", tier: 1, medianIncome: 240_114, medianHomeValue: ACS_HOME_VALUE_CAP, censusGeo: "Rollingwood city, TX", source: CR("16000US4863008-rollingwood-tx"), note: "Home value top-coded ($2M+)." },
  { area: "Tarrytown", metro: "Austin", tier: 1, medianIncome: 153_036, medianHomeValue: 1_495_800, censusGeo: "ZCTA 78703 (proxy)", source: CR("86000US78703-78703"), note: "ZIP proxy (broader than Tarrytown proper — adds Old Enfield/Clarksville/Pemberton); figures still firmly tier 1." },
  { area: "Barton Creek", metro: "Austin", tier: 1, medianIncome: 203_947, medianHomeValue: ACS_HOME_VALUE_CAP, censusGeo: "Barton Creek CDP, TX", source: CR("16000US4805750-barton-creek-tx"), note: "Home value top-coded ($2M+). Small-sample CDP → income MOE ±$62k." },
  { area: "Lakeway", metro: "Austin", tier: 2, medianIncome: 190_060, medianHomeValue: 841_300, censusGeo: "Lakeway city, TX", source: CR("16000US4840984-lakeway-tx"), note: "Not top-coded." },
  // ── San Antonio ──
  { area: "Alamo Heights", metro: "San Antonio", tier: 2, medianIncome: 183_088, medianHomeValue: 779_400, censusGeo: "Alamo Heights city, TX", source: CR("16000US4801600-alamo-heights-tx"), note: "SA's prestige address, but home value $779k → tier 2. SA's top corridors sit a notch below DFW/Houston/Austin luxury in absolute value." },
  { area: "Terrell Hills", metro: "San Antonio", tier: 2, medianIncome: 186_400, medianHomeValue: 838_400, censusGeo: "Terrell Hills city, TX", source: CR("16000US4872296-terrell-hills-tx"), note: "Home-value MOE ±$91k (small place)." },
  { area: "Olmos Park", metro: "San Antonio", tier: 2, medianIncome: 176_500, medianHomeValue: 896_300, censusGeo: "Olmos Park city, TX", source: CR("16000US4853988-olmos-park-tx"), note: "Highest of the SA Heights-area cities. Home-value MOE ±$142k (tiny sample)." },
  { area: "The Dominion", metro: "San Antonio", tier: 2, medianIncome: 81_301, medianHomeValue: 670_400, censusGeo: "ZCTA 78257 (proxy)", source: CR("86000US78257-78257"), note: "ZIP PROXY heavily understates: 78257 spans apartments/retail/non-gated tracts well beyond the gated community. Tier 2 by reputation (SA's premier gated luxury); ZIP figures unrepresentative." },
  { area: "Stone Oak", metro: "San Antonio", tier: 3, medianIncome: 117_835, medianHomeValue: 480_500, censusGeo: "ZCTA 78258 (proxy)", source: CR("86000US78258-78258"), note: "Affluent-suburban; even the wealthier adjacent 78260 is ~$498k home value → tier 3. A volume neighborhood, not an ultra-luxury enclave." },
];

export const CORRIDORS_BY_METRO: Record<string, Corridor[]> = TX_CORRIDORS.reduce((m, c) => {
  (m[c.metro] ||= []).push(c);
  return m;
}, {} as Record<string, Corridor[]>);

/**
 * Wealth DEPTH per metro, derived from the sourced data — how many tier-1
 * (ultra-affluent) corridors a metro holds. This is the data-backed luxury-pool
 * signal for the Phase-3 command-center map (and a candidate scoring input once
 * contacts are geocoded to corridors). It is DISTINCT from feeder weighting:
 * Houston (4) and Dallas (5) hold the deepest $2M+ pools, yet are weighted lower
 * below because they are the farthest feeders. See MARKET_AFFLUENCE.
 */
export const METRO_WEALTH_DEPTH: Record<string, number> = Object.fromEntries(
  Object.entries(CORRIDORS_BY_METRO).map(([metro, cs]) => [metro, cs.filter((c) => c.tier === 1).length]),
);

/**
 * Feeder-market weight — tuned to THE PALMS' buyer (Collie's brief): proximity to
 * Port Aransas is the strategic axis, NOT raw corridor wealth. San Antonio +
 * Austin are the closest major-metro feeders; Coastal Bend is local sellers + the
 * marina / boat-owner network (the wedge); Houston + DFW are meaningful but
 * farther secondaries.
 *
 * NB (surfaced by the Phase-2 Census pass): the deepest pools of $2M+ buyers
 * actually sit in Houston + Dallas (see METRO_WEALTH_DEPTH), which proximity
 * weighting deliberately discounts. Whether to lift the secondary-feeder floor to
 * chase that depth is a brief decision (Collie/Winston), not a data inference, so
 * these weights are unchanged here — the data is surfaced, the call is theirs.
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
  // added in the Phase-2 producer pass (firms that surfaced among the elite roster):
  "greenwood king", "bernstein realty", "beth wolff",
];

/** Brokerage prestige signal — implies affluent-corridor access. */
export function brokeragePrestige(company?: string): { weight: number; label: string | null } {
  if (!company) return { weight: 0, label: null };
  const c = company.toLowerCase();
  if (ULTRA_LUXURY.some((p) => c.includes(p))) return { weight: 25, label: "Ultra-luxury brokerage" };
  if (LUXURY.some((p) => c.includes(p))) return { weight: 18, label: "Luxury brokerage" };
  return { weight: 0, label: null };
}
