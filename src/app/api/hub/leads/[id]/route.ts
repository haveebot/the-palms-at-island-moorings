import { NextResponse } from "next/server";
import { updateLead } from "@/lib/leads";

// Auth is enforced by src/proxy.ts (gates /api/hub/*).
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const lead = await updateLead(id, body);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}
