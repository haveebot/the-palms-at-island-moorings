import { NextResponse } from "next/server";
import { seedSampleUnits } from "@/lib/units";
import { seedSampleContacts } from "@/lib/contacts";

// Seeds clearly-marked sample residences + sales contacts, each only if empty.
export async function POST() {
  const [units, contacts] = await Promise.all([seedSampleUnits(), seedSampleContacts()]);
  return NextResponse.json({ ok: true, units, contacts });
}
