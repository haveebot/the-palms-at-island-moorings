"use client";

import { useMemo, useState } from "react";
import type { Contact } from "@/lib/contacts-shared";
import type { Score } from "@/lib/scoring";
import { CORRIDORS_BY_METRO, ACS_INCOME_CAP, ACS_HOME_VALUE_CAP, type Corridor } from "@/lib/texas-wealth";

/**
 * Command-center Texas map — a geographic lens over the sales roster. A third
 * view alongside Contacts + Brokerages (it does NOT replace them): the feeder
 * markets plotted on a stylized Texas, sized by roster strength + Priority depth,
 * with the real ACS wealth corridors on tap and a one-click drill into the
 * filtered contacts. The Palms (Island Moorings) is the gold anchor; the feeders
 * arc into it.
 */

// Accurate Texas state boundary (viewBox 0 0 1000 949). Real geometry — US Census
// state-boundary polygon (152 pts) projected equirectangular with a cos(lat)
// aspect correction so the shape reads true. Pin coordinates below come from the
// SAME projection of each metro's real lat/long, so they land geographically.
const TX_PATH =
  "M374.6 24.0L506.2 24.0L506.2 188.5L511.7 187.6L528.0 203.8L536.8 201.0L559.8 202.0L565.0 218.2L579.7 217.3L595.6 224.7L609.9 223.8L615.9 230.8L625.0 222.9L638.9 226.6L644.9 235.9L655.2 237.3L660.8 248.9L673.5 237.8L690.6 244.3L697.0 251.2L705.3 248.0L711.3 258.7L729.6 239.6L734.7 249.4L750.6 249.4L765.7 255.4L771.3 262.8L785.6 249.8L801.1 245.7L808.3 250.3L825.3 241.9L829.3 246.6L848.0 247.0L852.8 239.6L871.5 248.0L878.6 257.7L906.4 267.0L914.0 274.9L928.3 270.7L938.6 274.5L938.6 319.5L938.6 406.4L954.5 425.0L954.9 443.6L974.8 478.0L976.0 496.1L968.4 518.0L961.3 526.8L963.7 538.4L958.5 547.2L964.1 563.5L947.0 593.7L953.3 602.1L941.4 602.5L903.7 614.1L890.1 607.6L887.8 593.7L878.2 603.5L871.5 601.1L867.9 613.2L875.4 618.3L876.6 634.1L863.1 650.9L841.2 671.8L797.5 694.1L793.2 690.4L780.0 695.9L779.6 690.8L761.8 694.5L753.4 683.8L748.2 686.2L767.3 708.0L753.4 715.0L740.3 710.8L738.3 726.1L722.0 741.9L705.3 771.2L694.6 801.9L686.6 799.6L684.6 810.7L693.0 807.9L689.0 830.2L683.4 831.2L683.0 843.7L689.8 850.7L691.8 876.2L699.7 885.1L701.7 901.3L708.1 915.7L685.8 924.6L676.7 913.4L659.6 909.2L636.9 910.1L617.5 896.2L602.8 894.8L591.6 883.7L576.5 879.9L566.2 869.3L559.4 843.7L546.3 828.4L547.9 815.4L541.9 801.4L543.9 789.3L534.8 775.9L527.2 774.5L514.9 762.4L510.9 747.0L500.2 733.1L484.7 721.5L477.1 695.9L470.0 689.0L460.4 668.5L457.3 651.8L448.1 639.7L432.6 629.0L429.0 621.6L414.7 615.1L403.6 596.5L371.8 592.3L352.7 593.2L336.4 586.7L332.9 595.6L315.4 598.3L302.2 616.0L294.3 644.4L289.9 644.8L280.0 661.5L268.1 662.0L250.2 649.0L205.3 628.1L196.5 616.9L179.0 606.2L166.7 582.1L165.9 560.2L153.6 542.6L150.8 527.3L142.9 517.5L114.6 503.1L99.5 483.6L87.2 476.6L74.1 459.9L55.8 451.0L43.1 428.7L32.3 424.1L24.0 414.3L26.0 406.0L283.6 406.0L283.6 320.9L285.2 235.0L285.6 24.0L288.3 24.0L374.6 24.0Z";

const MARKET_GEO: Record<string, { x: number; y: number; label: string }> = {
  Dallas: { x: 738, y: 340, label: "Dallas–Fort Worth" },
  Houston: { x: 842, y: 596, label: "Houston" },
  Austin: { x: 670, y: 553, label: "Austin" },
  "San Antonio": { x: 615, y: 625, label: "San Antonio" },
  "Coastal Bend": { x: 716, y: 757, label: "Coastal Bend" },
};
const FEEDERS = ["Dallas", "Houston", "Austin", "San Antonio"];
const ANCHOR = MARKET_GEO["Coastal Bend"];

function money(n: number, cap: number): string {
  const top = n >= cap;
  const s = n >= 1_000_000 ? `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M` : `$${Math.round(n / 1000)}k`;
  return top ? `${s}+` : s;
}

const TIER_META: Record<number, { label: string; cls: string }> = {
  1: { label: "Ultra-affluent", cls: "bg-[var(--color-accent)] text-[var(--color-ink)]" },
  2: { label: "Affluent", cls: "bg-[var(--color-anchor)] text-[var(--color-shell)]" },
  3: { label: "Upper-middle", cls: "border border-[var(--color-sand)] text-[var(--color-muted)]" },
};

type MarketStat = { market: string; x: number; y: number; label: string; count: number; priority: number; emailable: number; r: number };

export function SalesMap({
  contacts,
  scoreOf,
  onPickMarket,
}: {
  contacts: Contact[];
  scoreOf: Map<string, Score>;
  onPickMarket: (market: string) => void;
}) {
  const [active, setActive] = useState<string>("");

  const stats = useMemo<MarketStat[]>(() => {
    return Object.entries(MARKET_GEO).map(([market, geo]) => {
      const cs = contacts.filter((c) => c.market === market);
      const priority = cs.filter((c) => scoreOf.get(c.id)?.tier === "priority").length;
      const emailable = cs.filter((c) => c.email).length;
      const r = Math.min(48, 16 + Math.sqrt(cs.length) * 1.7);
      return { market, ...geo, count: cs.length, priority, emailable, r };
    });
  }, [contacts, scoreOf]);

  const byMarket = useMemo(() => Object.fromEntries(stats.map((s) => [s.market, s])), [stats]);
  const sel = active ? byMarket[active] : null;
  const corridors: Corridor[] = active ? CORRIDORS_BY_METRO[active] || [] : [];
  const totalPriority = stats.reduce((n, s) => n + s.priority, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      {/* ---- the map ---- */}
      <div className="rounded-2xl border border-[var(--color-sand)] bg-gradient-to-b from-white/60 to-[var(--color-sand)]/20 p-2">
        <svg viewBox="0 0 1000 949" className="h-auto w-full" role="img" aria-label="Texas feeder-market map">
          {/* feeder arcs into the anchor */}
          {FEEDERS.map((m) => {
            const g = MARKET_GEO[m];
            const mx = (g.x + ANCHOR.x) / 2 + (ANCHOR.y - g.y) * 0.12;
            const my = (g.y + ANCHOR.y) / 2 - (ANCHOR.x - g.x) * 0.12;
            return (
              <path key={m} d={`M${g.x} ${g.y} Q${mx} ${my} ${ANCHOR.x} ${ANCHOR.y}`} fill="none"
                stroke="var(--color-accent)" strokeWidth={active === m ? 2.4 : 1.2}
                strokeOpacity={active && active !== m ? 0.18 : 0.5} strokeDasharray="3 6" />
            );
          })}

          {/* Texas outline */}
          <path d={TX_PATH} fill="var(--color-anchor)" fillOpacity={0.07}
            stroke="var(--color-anchor)" strokeOpacity={0.4} strokeWidth={2.5} strokeLinejoin="round" />

          {/* market pins */}
          {stats.filter((s) => s.market !== "Coastal Bend").map((s) => {
            const isActive = active === s.market;
            return (
              <g key={s.market} className="cursor-pointer" onMouseEnter={() => setActive(s.market)}
                onClick={() => onPickMarket(s.market)} role="button" aria-label={`${s.label}: ${s.count} contacts`}>
                <circle cx={s.x} cy={s.y} r={s.r} fill="var(--color-anchor)"
                  fillOpacity={isActive ? 0.95 : 0.8} stroke="var(--color-shell)" strokeWidth={2} />
                {s.priority > 0 && (
                  <circle cx={s.x} cy={s.y} r={s.r} fill="none" stroke="var(--color-accent)" strokeWidth={3}
                    strokeDasharray={`${(s.priority / s.count) * 2 * Math.PI * s.r} ${2 * Math.PI * s.r}`}
                    transform={`rotate(-90 ${s.x} ${s.y})`} />
                )}
                <text x={s.x} y={s.y - 2} textAnchor="middle" className="fill-[var(--color-shell)] font-semibold"
                  style={{ fontSize: 22 }}>{s.count}</text>
                <text x={s.x} y={s.y + 16} textAnchor="middle" className="fill-[var(--color-shell)]/80"
                  style={{ fontSize: 11 }}>{s.priority} pri</text>
                <text x={s.x} y={s.y + s.r + 18} textAnchor="middle"
                  className="fill-[var(--color-anchor)] font-medium" style={{ fontSize: 15 }}>{s.label}</text>
              </g>
            );
          })}

          {/* anchor — The Palms (Coastal Bend home market) */}
          {(() => {
            const s = byMarket["Coastal Bend"];
            if (!s) return null;
            const isActive = active === "Coastal Bend";
            const star = starPoints(ANCHOR.x, ANCHOR.y, 26, 12);
            return (
              <g className="cursor-pointer" onMouseEnter={() => setActive("Coastal Bend")} onClick={() => onPickMarket("Coastal Bend")}>
                <circle cx={ANCHOR.x} cy={ANCHOR.y} r={34} fill="var(--color-accent)" fillOpacity={isActive ? 0.28 : 0.16} />
                <polygon points={star} fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth={1} />
                <text x={ANCHOR.x} y={ANCHOR.y + 54} textAnchor="middle" className="fill-[var(--color-anchor)] font-semibold" style={{ fontSize: 16 }}>The Palms · Island Moorings</text>
                <text x={ANCHOR.x} y={ANCHOR.y + 72} textAnchor="middle" className="fill-[var(--color-muted)]" style={{ fontSize: 12.5 }}>Coastal Bend · {s.count} local + marina ({s.priority} pri)</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ---- detail panel ---- */}
      <div className="rounded-2xl border border-[var(--color-sand)] bg-white/50 p-5">
        {!sel ? (
          <div className="text-sm text-[var(--color-muted)]">
            <h3 className="display text-lg text-[var(--color-anchor)]">Command center</h3>
            <p className="mt-2">Your roster across Texas — pin size is contact volume, the gold ring is the Priority share, and the arcs trace each feeder into Island Moorings.</p>
            <p className="mt-3"><span className="font-semibold text-[var(--color-anchor)]">{contacts.length}</span> contacts · <span className="font-semibold text-[var(--color-anchor)]">{totalPriority}</span> Priority across {stats.length} markets.</p>
            <p className="mt-3 italic">Hover a market for its wealth corridors; click to open its contacts.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="display text-lg text-[var(--color-anchor)]">{sel.label}</h3>
              <span className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">{marketRole(sel.market)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-[var(--color-ink)]"><span className="font-semibold">{sel.priority}</span> Priority</span>
              <span className="rounded-full border border-[var(--color-sand)] bg-white/60 px-3 py-1"><span className="font-semibold text-[var(--color-anchor)]">{sel.count}</span> contacts</span>
              <span className="rounded-full border border-[var(--color-sand)] bg-white/60 px-3 py-1"><span className="font-semibold text-[var(--color-anchor)]">{sel.emailable}</span> emailable</span>
            </div>

            {corridors.length > 0 ? (
              <>
                <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">Wealth corridors <span className="font-normal normal-case">· ACS 2024 5-yr</span></h4>
                <ul className="mt-2 space-y-1.5">
                  {corridors.map((c) => (
                    <li key={c.area} className="rounded-lg border border-[var(--color-sand)]/60 bg-white/50 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{c.area}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide ${TIER_META[c.tier].cls}`}>{TIER_META[c.tier].label}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                        Income {money(c.medianIncome, ACS_INCOME_CAP)} · Home {money(c.medianHomeValue, ACS_HOME_VALUE_CAP)}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-muted)]">The development&rsquo;s home market — local sellers + the Island Moorings marina / boat-owner network (the wedge).</p>
            )}

            <button onClick={() => onPickMarket(sel.market)} className="mt-4 w-full rounded-full bg-[var(--color-anchor)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-shell)]">
              View {sel.count} {sel.label} contacts →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function marketRole(market: string): string {
  if (market === "San Antonio" || market === "Austin") return "Closest feeder";
  if (market === "Houston" || market === "Dallas") return "Deep buyer pool";
  if (market === "Coastal Bend") return "Home market";
  return "";
}

// Five-point star polygon points string.
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}
