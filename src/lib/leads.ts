import "server-only";
import type { RegisterInterestInput } from "./leads-shared";

/**
 * Lead persistence SEAM (server-only).
 *
 * ⚠️  NOT WIRED TO A STORE YET. This is the single function to swap when the
 *     Palms lead store is provisioned. Plan (see docs/next-actions.md):
 *       1. Neon Postgres `palms_leads` table (mirror FC Hub's db pattern), OR
 *       2. forward to the thepalms.dev hub via a bearer token, OR
 *       3. email-to-inbox via Resend on the ops domain.
 *     Until then we log server-side and return a synthetic id so the full
 *     submit → success UX is exercisable end-to-end without a DB.
 */
export type SavedLead = { id: string; receivedAt: string };

export async function persistRegisterInterest(
  lead: RegisterInterestInput,
): Promise<SavedLead> {
  const id = `pal_${Math.random().toString(36).slice(2, 10)}`;
  const receivedAt = new Date().toISOString();

  // TODO(palms-lead-store): replace this log with a real write.
  console.info("[palms] register-interest captured", {
    id,
    receivedAt,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone ?? null,
    hasNotes: Boolean(lead.notes),
  });

  return { id, receivedAt };
}
