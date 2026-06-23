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

// Stylized Texas silhouette (viewBox 0 0 1000 940) — recognizable, brand-clean.
const TX_PATH =
  "M250 82 L373 82 L373 250 L432 250 L474 292 L542 276 L602 302 L662 282 L722 302 L770 296 " +
  "L777 360 L763 430 L802 470 L773 512 L742 522 Q702 562 662 582 Q622 612 587 652 Q562 686 541 716 " +
  "L521 754 L496 742 L471 702 L446 662 L411 642 L396 606 L361 561 L346 576 L321 601 L301 576 L286 541 " +
  "L251 511 L161 431 L110 431 L151 406 L151 251 L250 251 Z";

const MARKET_GEO: Record<string, { x: number; y: number; label: string }> = {
  Dallas: { x: 578, y: 320, label: "Dallas–Fort Worth" },
  Houston: { x: 702, y: 508, label: "Houston" },
  Austin: { x: 527, y: 482, label: "Austin" },
  "San Antonio": { x: 470, y: 542, label: "San Antonio" },
  "Coastal Bend": { x: 560, y: 672, label: "Coastal Bend" },
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
        <svg viewBox="0 0 1000 940" className="h-auto w-full" role="img" aria-label="Texas feeder-market map">
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
