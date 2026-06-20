import "server-only";
import { put, list } from "@vercel/blob";
import type { RegisterInterestInput } from "./leads-shared";

/**
 * Lead persistence — The Palms' OWN pre-sales pipeline (not FC agency leads).
 *
 * v1 store: a dedicated Vercel Blob store (`the-palms-leads`), one JSON object
 * per lead under `leads/` with an unguessable suffix. Adequate for low-volume
 * pre-sales on an unlaunched site; migrate to Postgres when the ops hub grows
 * (this file is the only thing that changes — the seam).
 */
export type SavedLead = { id: string; receivedAt: string };

export type StoredLead = {
  id: string;
  receivedAt: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
};

const PREFIX = "leads/";

export async function persistRegisterInterest(
  lead: RegisterInterestInput,
): Promise<SavedLead> {
  const id = `pal_${Math.random().toString(36).slice(2, 10)}`;
  const receivedAt = new Date().toISOString();

  const record: StoredLead = {
    id,
    receivedAt,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    notes: lead.notes,
  };

  // One object per lead → no read-modify-write race. Random suffix → unguessable URL.
  await put(`${PREFIX}${receivedAt}-${id}.json`, JSON.stringify(record), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });

  return { id, receivedAt };
}

/** For the /ops view — list + hydrate all stored leads, newest first. */
export async function listLeads(): Promise<StoredLead[]> {
  const { blobs } = await list({ prefix: PREFIX });
  const records = await Promise.all(
    blobs.map(async (b) => {
      try {
        const r = await fetch(b.url, { cache: "no-store" });
        return (await r.json()) as StoredLead;
      } catch {
        return null;
      }
    }),
  );
  return records
    .filter((r): r is StoredLead => r !== null)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}
