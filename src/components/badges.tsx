import { LEAD_STAGES, type LeadStage } from "@/lib/leads-shared";

const STAGE_CLASS: Record<LeadStage, string> = {
  new: "bg-[var(--color-accent)] text-[var(--color-ink)]",
  contacted: "bg-[var(--color-harbor)] text-[var(--color-shell)]",
  qualified: "bg-[var(--color-palm)] text-[var(--color-shell)]",
  touring: "bg-[var(--color-sand)] text-[var(--color-ink)]",
  reserved: "bg-[var(--color-anchor)] text-[var(--color-shell)]",
  closed: "bg-[var(--color-ink)] text-[var(--color-shell)]",
  lost: "bg-[var(--color-fog)] text-[var(--color-muted)]",
};

export function stageBadge(stage: LeadStage) {
  const label = LEAD_STAGES.find((s) => s.key === stage)?.label ?? stage;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STAGE_CLASS[stage]}`}>
      {label}
    </span>
  );
}
