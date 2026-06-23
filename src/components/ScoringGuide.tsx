"use client";

import { SCORING_MODEL, PRIORITY_TIERS, tierBadgeClass } from "@/lib/scoring";

/**
 * In-hub Scoring Guide — a plain-English explainer of the buyer-quality engine
 * for Shana & Collie, rendered straight from SCORING_MODEL (the same constants
 * the score uses, so it can't drift). Lives in the hub, not a stray document.
 */
export function ScoringGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-ink)]/50" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-shell)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="display text-xl text-[var(--color-anchor)]">How prospects are scored</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{SCORING_MODEL.summary}</p>
          </div>
          <button onClick={onClose} className="text-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)]" aria-label="Close">✕</button>
        </div>

        {/* Tiers — what the badges mean */}
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">What the tiers mean</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PRIORITY_TIERS.map((t) => (
            <div key={t.key} className="rounded-xl border border-[var(--color-sand)] bg-white/50 p-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${tierBadgeClass(t.key)}`}>{t.label}</span>
                <span className="text-xs text-[var(--color-muted)]">score ≥ {t.min}</span>
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-foreground)]/80">{t.blurb}</p>
            </div>
          ))}
        </div>

        {/* Factors — what goes into a score */}
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">What goes into a score</h3>
        <div className="mt-2 space-y-3">
          {SCORING_MODEL.factors.map((f, i) => (
            <div key={f.key} className="rounded-xl border border-[var(--color-sand)] bg-white/40 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-semibold text-[var(--color-anchor)]">
                  <span className="mr-1.5 text-[var(--color-muted)]">{i + 1}.</span>{f.label}
                </h4>
                <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">points</span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{f.lead}</p>
              <ul className="mt-2 divide-y divide-[var(--color-sand)]/50">
                {f.items.map((it) => (
                  <li key={it.label} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">{it.label}</span>
                      {it.detail && <span className="ml-1 text-xs text-[var(--color-muted)]">— {it.detail}</span>}
                    </span>
                    <span className="shrink-0 font-semibold text-[var(--color-anchor)]">+{it.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-foreground)]">Integrity:</span> {SCORING_MODEL.integrity}
        </p>
      </div>
    </div>
  );
}
