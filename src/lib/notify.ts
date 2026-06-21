import "server-only";
import { sendMail, emailReady } from "./email";
import { SITE } from "./site";

/**
 * New-lead alert via GOOGLE WORKSPACE on thepalms.dev (SMTP, see ./email).
 * No-op until WORKSPACE_SENDER_EMAIL + WORKSPACE_SMTP_PASSWORD + LEAD_ALERT_TO
 * are set. A send failure never breaks lead capture — the lead is already
 * stored and visible in the hub.
 */
type NewLead = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
};

export async function notifyNewLead(lead: NewLead): Promise<void> {
  const to = process.env.LEAD_ALERT_TO;
  if (!to || !emailReady()) return; // off until Workspace is connected

  const text = [
    `New Founders' List inquiry — ${SITE.shortName}`,
    "",
    `Name:   ${lead.fullName}`,
    `Email:  ${lead.email}`,
    lead.phone ? `Phone:  ${lead.phone}` : null,
    lead.notes ? `\nLooking for:\n${lead.notes}` : null,
    "",
    `Open in the hub → https://${SITE.opsDomain}/hub/leads`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await sendMail({ to, replyTo: lead.email, subject: `New inquiry: ${lead.fullName}`, text });
  } catch (err) {
    console.error("[palms] lead alert send failed", err);
  }
}
