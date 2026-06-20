import { NextResponse } from "next/server";
import { createCampaign } from "@/lib/campaigns";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const campaign = await createCampaign(body);
  return NextResponse.json({ ok: true, campaign });
}
