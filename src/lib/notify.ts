import "server-only";

/**
 * New-lead alert — ENV-GATED, ships OFF.
 *
 * Email provider = GOOGLE WORKSPACE on thepalms.dev (decided 2026-06-20).
 * When Workspace is connected (a sender mailbox like alerts@thepalms.dev +
 * credentials), this sends the alert from a thepalms.dev address. The exact
 * transport — Gmail API (OAuth) vs Workspace SMTP — is finalized when the
 * Workspace is live. Until then this is a no-op: the lead is still stored and
 * visible in the hub. No borrowed creds, no third-party ESP.
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
  // Set once Google Workspace sending is wired (e.g. "alerts@thepalms.dev").
  const workspaceReady = Boolean(process.env.WORKSPACE_SENDER_EMAIL);
  if (!to || !workspaceReady) return; // off until Workspace is connected

  // TODO(workspace-send): deliver via Google Workspace (Gmail API or SMTP) from
  // WORKSPACE_SENDER_EMAIL → `to`. Implemented when Workspace creds land.
  console.info("[palms] lead alert queued for Workspace send", { id: lead.id, to });
}
