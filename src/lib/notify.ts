import "server-only";

/**
 * New-lead alert — ENV-GATED, ships OFF.
 *
 * Sends only when BOTH `RESEND_API_KEY` and `LEAD_ALERT_TO` are set on the
 * project. Until a sender is chosen (cleanest: the thepalms.dev Workspace, or
 * a dedicated Resend key), this is a no-op — the lead is still stored and
 * visible in /ops. We deliberately do NOT borrow another project's creds.
 */
type NewLead = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
};

export async function notifyNewLead(lead: NewLead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_ALERT_TO;
  if (!apiKey || !to) return; // off until a sender is configured

  const from = process.env.LEAD_ALERT_FROM || "onboarding@resend.dev";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        subject: `New interest — The Palms (${lead.fullName})`,
        text:
          `New register-interest submission:\n\n` +
          `Name:  ${lead.fullName}\n` +
          `Email: ${lead.email}\n` +
          `Phone: ${lead.phone || "—"}\n` +
          `Notes: ${lead.notes || "—"}\n` +
          `ID:    ${lead.id}\n\n` +
          `See all in the hub: https://thepalms.dev`,
      }),
    });
  } catch (err) {
    console.error("[palms] lead notify failed", err);
  }
}
