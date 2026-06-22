import "server-only";
import { putDoc, listDocs } from "./store";
import type { Broadcast, Contact } from "./contacts-shared";
import { listContacts } from "./contacts";
import { sendMail, emailReady } from "./email";
import { unsubUrl } from "./unsubscribe";
import { SITE } from "./site";

const COL = "broadcasts";

/**
 * Sending is gated on BOTH a working Workspace sender AND a physical mailing
 * address (CAN-SPAM requires a postal address + opt-out on commercial email).
 * No address → drafts still save, but the send path refuses.
 */
export function broadcastReady(): boolean {
  return emailReady() && !!process.env.BROADCAST_MAILING_ADDRESS;
}

export async function listBroadcasts(): Promise<Broadcast[]> {
  const all = await listDocs<Broadcast>(COL);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Persist a broadcast — a "draft" by default, or a completed "sent" record with totals. */
export async function saveBroadcast(
  input: { subject: string; body: string; segment: string; recipientCount: number },
  opts?: { status?: "draft" | "sent"; sentCount?: number; failedCount?: number },
): Promise<Broadcast> {
  const id = `b_${Math.random().toString(36).slice(2, 10)}`;
  const status = opts?.status ?? "draft";
  const now = new Date().toISOString();
  const b: Broadcast = {
    id,
    subject: input.subject.trim(),
    body: input.body.trim(),
    segment: input.segment,
    recipientCount: input.recipientCount,
    status,
    sentCount: opts?.sentCount,
    failedCount: opts?.failedCount,
    createdAt: now,
    sentAt: status === "sent" ? now : undefined,
  };
  await putDoc(COL, id, b);
  return b;
}

function firstNameOf(full: string): string {
  return (full || "").trim().split(/\s+/)[0] || "there";
}

function personalize(t: string, c: Contact): string {
  return t.replace(/\{firstName\}/g, firstNameOf(c.fullName)).replace(/\{name\}/g, c.fullName || "there");
}

/**
 * Send ONE chunk of a broadcast (the client orchestrates chunks + progress so
 * no single request risks a serverless timeout). Per recipient: merge
 * {firstName}/{name}, append the CAN-SPAM footer (postal address + signed
 * unsubscribe link), send individually. Skips no-email and do-not-contact.
 */
export async function sendBroadcastChunk(input: {
  subject: string;
  body: string;
  recipientIds: string[];
  replyTo?: string; // the signed-in operator — broker replies route to them, not hello@
}): Promise<{ sent: string[]; failed: string[]; skipped: string[] }> {
  if (!broadcastReady()) throw new Error("Broadcast sending not configured");
  const secret = process.env.HUB_SESSION_SECRET || "";
  const address = process.env.BROADCAST_MAILING_ADDRESS || "";
  const byId = new Map((await listContacts()).map((c) => [c.id, c]));

  const sent: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  await Promise.all(
    input.recipientIds.map(async (id) => {
      const c = byId.get(id);
      if (!c || !c.email || c.status === "do-not-contact") {
        skipped.push(id);
        return;
      }
      try {
        const link = await unsubUrl(c.id, secret);
        const text =
          personalize(input.body, c) +
          `\n\n—\n${SITE.name}\n${address}\n\nPrefer not to hear from us? Unsubscribe: ${link}`;
        await sendMail({ to: c.email, subject: personalize(input.subject, c), text, replyTo: input.replyTo });
        sent.push(id);
      } catch {
        failed.push(id);
      }
    }),
  );

  return { sent, failed, skipped };
}
