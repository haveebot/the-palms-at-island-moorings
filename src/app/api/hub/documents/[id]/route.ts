import { NextResponse } from "next/server";
import { deleteDocument } from "@/lib/documents";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteDocument(id);
  return NextResponse.json({ ok: true });
}
