import "server-only";
import { putDoc, listDocs, getDoc, deleteDoc } from "./store";
import type { Contact, ContactInput, ContactType } from "./contacts-shared";

const COL = "contacts";

function tagsOf(t?: string[] | string): string[] {
  if (Array.isArray(t)) return t.map((x) => x.trim()).filter(Boolean);
  if (typeof t === "string") return t.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

function normalize(input: ContactInput) {
  return {
    type: (input.type || "agent") as ContactType,
    fullName: (input.fullName || "").trim() || "Unnamed contact",
    email: (input.email || "").trim().toLowerCase() || undefined,
    phone: (input.phone || "").trim() || undefined,
    company: (input.company || "").trim() || undefined,
    market: (input.market || "").trim() || undefined,
    tags: tagsOf(input.tags),
    status: input.status || ("new" as const),
    notes: (input.notes || "").trim() || undefined,
  };
}

export async function listContacts(): Promise<Contact[]> {
  const all = await listDocs<Contact>(COL);
  return all.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getContact(id: string): Promise<Contact | null> {
  return getDoc<Contact>(COL, id);
}

export async function createContact(input: ContactInput, sample = false): Promise<Contact> {
  const id = `c_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const c: Contact = { id, source: sample ? "sample" : "manual", sample, createdAt: now, updatedAt: now, ...normalize(input) };
  await putDoc(COL, id, c);
  return c;
}

export async function updateContact(id: string, input: Partial<ContactInput>): Promise<Contact | null> {
  const c = await getDoc<Contact>(COL, id);
  if (!c) return null;
  const merged: Contact = {
    ...c,
    ...normalize({
      type: input.type ?? c.type,
      fullName: input.fullName ?? c.fullName,
      email: input.email ?? c.email,
      phone: input.phone ?? c.phone,
      company: input.company ?? c.company,
      market: input.market ?? c.market,
      tags: input.tags ?? c.tags,
      status: input.status ?? c.status,
      notes: input.notes ?? c.notes,
    }),
    sample: false,
    updatedAt: new Date().toISOString(),
  };
  await putDoc(COL, id, merged);
  return merged;
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(COL, id);
}

/** Seed clearly-marked SAMPLE agents/partners across feeder markets — only if empty. */
export async function seedSampleContacts(): Promise<number> {
  if ((await listContacts()).length > 0) return 0;
  const samples: ContactInput[] = [
    { type: "agent", fullName: "Sample · Houston Luxury Agent", company: "Compass Houston", market: "Houston", tags: ["luxury", "second-home"], status: "active" },
    { type: "agent", fullName: "Sample · Austin Waterfront Agent", company: "Kuper Sotheby's", market: "Austin", tags: ["luxury", "waterfront"], status: "new" },
    { type: "agent", fullName: "Sample · San Antonio Producer", company: "Phyllis Browning", market: "San Antonio", tags: ["luxury"], status: "active" },
    { type: "agent", fullName: "Sample · Coastal Bend Specialist", company: "Realty One Coastal", market: "Coastal Bend", tags: ["waterfront", "investment/STR"], status: "engaged" },
    { type: "partner", fullName: "Sample · Island Moorings Yacht Broker", company: "Marina Yacht Sales", market: "Coastal Bend", tags: ["marina/boat"], status: "active" },
    { type: "partner", fullName: "Sample · Wealth Advisor", company: "Frost Private Bank", market: "San Antonio", tags: ["referral"], status: "new" },
    { type: "prospect", fullName: "Sample · Boat-Owner Prospect", market: "Houston", tags: ["marina/boat", "second-home"], status: "new" },
  ];
  for (const s of samples) await createContact(s, true);
  return samples.length;
}
