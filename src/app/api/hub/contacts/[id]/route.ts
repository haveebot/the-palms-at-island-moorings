import { NextResponse } from "next/server";
import { updateContact, deleteContact } from "@/lib/contacts";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const contact = await updateContact(id, body);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, contact });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteContact(id);
  return NextResponse.json({ ok: true });
}
