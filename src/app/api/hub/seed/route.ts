import { NextResponse } from "next/server";
import { seedSampleUnits } from "@/lib/units";

// Seeds clearly-marked sample residences, only if inventory is empty.
export async function POST() {
  const seeded = await seedSampleUnits();
  return NextResponse.json({ ok: true, seeded });
}
