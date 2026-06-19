/**
 * Lead capture — SHARED types + validation (no server/DB imports, safe in
 * client components). Mirrors the farley-creative-hub `*-shared` split so we
 * can later add a `src/lib/db/leads.ts` that imports pg without breaking the
 * client bundle.
 *
 * IMPORTANT: these are THE PALMS' own buyer-interest leads (the development's
 * pre-sales pipeline) — NOT Farley Creative agency leads. Keep them separate.
 */
export type RegisterInterestInput = {
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  /** Honeypot — must be empty. Bots fill it; humans never see it. */
  company?: string;
};

export type ValidationResult =
  | { ok: true; value: Required<Pick<RegisterInterestInput, "fullName" | "email">> & RegisterInterestInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInterest(
  input: Partial<RegisterInterestInput>,
): ValidationResult {
  // Honeypot tripped → treat as a silent success upstream (don't reveal).
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
