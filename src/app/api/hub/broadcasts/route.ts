import { NextResponse } from "next/server";
import { saveBroadcast } from "@/lib/broadcasts";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.subject || !body?.body) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }
  const broadcast = await saveBroadcast({
    subject: String(body.subject),
    body: String(body.body),
    segment: String(body.segment || "All contacts"),
    recipientCount: Number(body.recipientCount) || 0,
  });
  return NextResponse.json({ ok: true, broadcast });
}
