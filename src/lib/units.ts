import "server-only";
import { putDoc, listDocs, getDoc, deleteDoc } from "./store";
import type { Unit, UnitInput, UnitStatus } from "./units-shared";

const COL = "units";

export async function listUnits(): Promise<Unit[]> {
  const units = await listDocs<Unit>(COL);
  return units.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export async function getUnit(id: string): Promise<Unit | null> {
  return getDoc<Unit>(COL, id);
}

export async function createUnit(input: UnitInput, sample = false): Promise<Unit> {
  const id = `unit_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const unit: Unit = { id, createdAt: now, updatedAt: now, sample, ...normalize(input) };
  await putDoc(COL, id, unit);
  return unit;
}

export async function updateUnit(
  id: string,
  input: Partial<UnitInput> & { reservedByLeadId?: string | null },
): Promise<Unit | null> {
  const unit = await getDoc<Unit>(COL, id);
  if (!unit) return null;
  const merged: Unit = {
    ...unit,
    ...normalize({ ...toInput(unit), ...input } as UnitInput),
    reservedByLeadId:
      input.reservedByLeadId === undefined
        ? unit.reservedByLeadId
        : input.reservedByLeadId || undefined,
    sample: false, // any manual edit promotes it to real inventory
    updatedAt: new Date().toISOString(),
  };
  await putDoc(COL, id, merged);
  return merged;
}

export async function deleteUnit(id: string): Promise<void> {
  await deleteDoc(COL, id);
}

function toInput(u: Unit): UnitInput {
  return { name: u.name, status: u.status, price: u.price, beds: u.beds, baths: u.baths, sqft: u.sqft, description: u.description };
}

function normalize(input: UnitInput) {
  const num = (v: unknown) => {
    const n = typeof v === "string" ? Number(v) : (v as number);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    name: (input.name || "").trim() || "Untitled residence",
    status: (input.status || "available") as UnitStatus,
    price: num(input.price),
    beds: num(input.beds),
    baths: num(input.baths),
    sqft: num(input.sqft),
    description: (input.description || "").trim() || undefined,
  };
}

/** Seed clearly-marked SAMPLE residences so the board demos — only if empty. */
export async function seedSampleUnits(): Promise<number> {
  const existing = await listUnits();
  if (existing.length > 0) return 0;
  const samples: UnitInput[] = [
    { name: "Residence 01 · Marina", status: "available", price: 2450000, beds: 4, baths: 4.5, sqft: 3400 },
    { name: "Residence 02 · Marina", status: "available", price: 2375000, beds: 4, baths: 4.5, sqft: 3300 },
    { name: "Residence 03 · Canal", status: "reserved", price: 1985000, beds: 3, baths: 3.5, sqft: 2900 },
    { name: "Residence 04 · Canal", status: "available", price: 1950000, beds: 3, baths: 3.5, sqft: 2850 },
    { name: "Residence 05 · Bayfront", status: "coming-soon", price: 3200000, beds: 5, baths: 5.5, sqft: 4200 },
    { name: "Residence 06 · Bayfront", status: "sold", price: 3100000, beds: 5, baths: 5.5, sqft: 4100 },
    { name: "Residence 07 · Garden", status: "available", price: 1650000, beds: 3, baths: 3, sqft: 2400 },
    { name: "Residence 08 · Garden", status: "available", price: 1625000, beds: 3, baths: 3, sqft: 2350 },
  ];
  for (const s of samples) await createUnit(s, true);
  return samples.length;
}
