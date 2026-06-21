import { NextResponse } from "next/server";
import { saveBroadcast } from "@/lib/broadcasts";

/**
 * Save a broadcast: a draft by default, or a completed "sent" record (with
 * totals) once the client has finished fanning out the chunks via
 * /api/hub/broadcasts/send.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.subject || !body?.body) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }
  const broadcast = await saveBroadcast(
    {
      subject: String(body.subject),
      body: String(body.body),
      segment: String(body.segment || "All contacts"),
      recipientCount: Number(body.recipientCount) || 0,
    },
    {
      status: body.status === "sent" ? "sent" : "draft",
      sentCount: body.sentCount != null ? Number(body.sentCount) : undefined,
      failedCount: body.failedCount != null ? Number(body.failedCount) : undefined,
    },
  );
  return NextResponse.json({ ok: true, broadcast });
}
