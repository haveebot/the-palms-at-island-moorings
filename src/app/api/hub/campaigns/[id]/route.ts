import { NextResponse } from "next/server";
import { deleteCampaign } from "@/lib/campaigns";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteCampaign(id);
  return NextResponse.json({ ok: true });
}
