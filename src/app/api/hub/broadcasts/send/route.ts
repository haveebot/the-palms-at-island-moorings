import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendBroadcastChunk, broadcastReady } from "@/lib/broadcasts";
import { readSession, HUB_COOKIE } from "@/lib/hub-session";

// One chunk at a time (client paces them) — comfortably inside the limit.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!broadcastReady()) {
    return NextResponse.json(
      { error: "Sending is paused — the email sender or mailing address isn't configured yet." },
      { status: 400 },
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.subject || !body?.body || !Array.isArray(body?.recipientIds)) {
    return NextResponse.json({ error: "subject, body, and recipientIds are required." }, { status: 400 });
  }
  if (body.recipientIds.length > 50) {
    return NextResponse.json({ error: "Chunk too large (max 50)." }, { status: 400 });
  }
  // Replies route to the signed-in operator's mailbox, not hello@.
  const session = await readSession((await cookies()).get(HUB_COOKIE)?.value, process.env.HUB_SESSION_SECRET || "");
  const result = await sendBroadcastChunk({
    subject: String(body.subject),
    body: String(body.body),
    recipientIds: body.recipientIds.map(String),
    replyTo: session?.email,
  });
  return NextResponse.json({ ok: true, ...result });
}
