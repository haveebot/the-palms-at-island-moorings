/**
 * Lead types + validation — SHARED (no server/DB imports, client-safe).
 * The Palms' OWN pre-sales pipeline (buyers), never FC agency leads.
 */
export type RegisterInterestInput = {
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  /** Honeypot — must be empty. */
  company?: string;
};

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "touring"
  | "reserved"
  | "closed"
  | "lost";

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "touring", label: "Touring" },
  { key: "reserved", label: "Reserved" },
  { key: "closed", label: "Closed" },
  { key: "lost", label: "Lost" },
];

/** Stages that count as "active" in the pipeline (not closed/lost). */
export const ACTIVE_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "touring",
  "reserved",
];

export type ActivityEntry = { at: string; text: string };

export type Lead = {
  id: string;
  receivedAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  source: string;
  stage: LeadStage;
  assignee?: string;
  unitId?: string;
  activity: ActivityEntry[];
};

export type ValidationResult =
  | { ok: true; value: RegisterInterestInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInterest(
  input: Partial<RegisterInterestInput>,
): ValidationResult {
  if (input.company && input.company.trim() !== "") {
    return { ok: false, error: "spam" };
  }
  const fullName = (input.fullName ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  if (fullName.length < 2) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email." };
  return {
    ok: true,
    value: {
      fullName,
      email,
      phone: (input.phone ?? "").trim() || undefined,
      notes: (input.notes ?? "").trim() || undefined,
    },
  };
}
