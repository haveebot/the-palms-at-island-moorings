import { NextResponse } from "next/server";
import { upsertBrokerageMeta } from "@/lib/brokerages";

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  const fields: { stage?: string; primaryContactId?: string; notes?: string; tags?: string[] } = {};
  if (typeof body.stage === "string") fields.stage = body.stage;
  if (typeof body.notes === "string") fields.notes = body.notes;
  if (body.primaryContactId !== undefined) fields.primaryContactId = String(body.primaryContactId || "");
  if (Array.isArray(body.tags)) fields.tags = body.tags.map(String);
  else if (typeof body.tags === "string") fields.tags = body.tags.split(",").map((t: string) => t.trim()).filter(Boolean);

  const meta = await upsertBrokerageMeta(slug, body.name, fields);
  return NextResponse.json({ ok: true, meta });
}
