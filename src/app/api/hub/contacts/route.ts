import { NextResponse } from "next/server";
import { createContact } from "@/lib/contacts";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.fullName || !String(body.fullName).trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const contact = await createContact(body);
  return NextResponse.json({ ok: true, contact });
}
