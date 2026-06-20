import { NextResponse } from "next/server";
import { createUnit } from "@/lib/units";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const unit = await createUnit(body);
  return NextResponse.json({ ok: true, unit });
}
