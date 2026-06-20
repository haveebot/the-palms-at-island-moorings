import "server-only";
import { put, list } from "@vercel/blob";

/**
 * Document store over Vercel Blob — ONE object per collection
 * (`collections/<name>.json` = the full array). A list is a single fetch (not
 * N), which is the right-sized fix for a single development's hub (contacts in
 * the thousands, not millions). Reads stay fast as the roster grows.
 *
 * Trade-off: writes are read-modify-write of the whole collection, so two
 * *simultaneous* writes to the SAME collection can last-write-win (one edit
 * lost, recoverable). Fine for a 2–3 person operator team making occasional
 * edits. If this ever becomes a multi-development platform with concurrent
 * teams, move to Postgres (Neon) — the interface below stays identical, so it's
 * a contained swap. Document file binaries live separately under `docfiles/`.
 */
type WithId = { id: string };

const PATH = (c: string) => `collections/${c}.json`;

async function readCollection<T>(collection: string): Promise<T[]> {
  const { blobs } = await list({ prefix: PATH(collection) });
  const hit = blobs.find((b) => b.pathname === PATH(collection));
  if (!hit) return [];
  try {
    return (await (await fetch(hit.url, { cache: "no-store" })).json()) as T[];
  } catch {
    return [];
  }
}

async function writeCollection<T>(collection: string, rows: T[]): Promise<void> {
  await put(PATH(collection), JSON.stringify(rows), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0, // operator hub — reads must reflect writes immediately
  });
}

export async function listDocs<T>(collection: string): Promise<T[]> {
  return readCollection<T>(collection);
}

export async function getDoc<T extends WithId>(
  collection: string,
  id: string,
): Promise<T | null> {
  const rows = await readCollection<T>(collection);
  return rows.find((r) => r.id === id) ?? null;
}

export async function putDoc<T extends WithId>(
  collection: string,
  id: string,
  data: T,
): Promise<void> {
  const rows = await readCollection<T>(collection);
  const i = rows.findIndex((r) => r.id === id);
  if (i >= 0) rows[i] = data;
  else rows.push(data);
  await writeCollection(collection, rows);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const rows = await readCollection<WithId>(collection);
  const next = rows.filter((r) => r.id !== id);
  if (next.length !== rows.length) await writeCollection(collection, next);
}
