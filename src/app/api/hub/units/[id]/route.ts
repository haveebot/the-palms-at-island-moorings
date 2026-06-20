import { NextResponse } from "next/server";
import { updateUnit, deleteUnit } from "@/lib/units";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const unit = await updateUnit(id, body);
  if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, unit });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteUnit(id);
  return NextResponse.json({ ok: true });
}
