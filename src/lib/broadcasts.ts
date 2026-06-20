import "server-only";
import { putDoc, listDocs } from "./store";
import type { Broadcast } from "./contacts-shared";

const COL = "broadcasts";

export async function listBroadcasts(): Promise<Broadcast[]> {
  const all = await listDocs<Broadcast>(COL);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Save a broadcast. Sending is gated on the email sender (the same `.dev`
 * Workspace pending for lead alerts) — until then everything is saved as a
 * "draft" and the segment + body are ready to fire the moment a sender exists.
 */
export async function saveBroadcast(input: {
  subject: string;
  body: string;
  segment: string;
  recipientCount: number;
}): Promise<Broadcast> {
  const id = `b_${Math.random().toString(36).slice(2, 10)}`;
  const senderReady = Boolean(process.env.RESEND_API_KEY && process.env.LEAD_ALERT_FROM);
  const b: Broadcast = {
    id,
    subject: input.subject.trim(),
    body: input.body.trim(),
    segment: input.segment,
    recipientCount: input.recipientCount,
    status: "draft", // flips to "sent" once sending is wired
    createdAt: new Date().toISOString(),
  };
  await putDoc(COL, id, b);
  // NOTE: when senderReady, this is where we'd fan out via the email sender.
  void senderReady;
  return b;
}
