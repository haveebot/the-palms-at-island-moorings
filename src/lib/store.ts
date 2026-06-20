import "server-only";
import { put, list, del } from "@vercel/blob";

/**
 * Tiny document store over Vercel Blob — one JSON object per record at a STABLE
 * path (`<collection>/<id>.json`) so records can be updated (overwritten).
 * Adequate for a single development's pre-sales volume; swap for Postgres later
 * without touching callers.
 */
export async function putDoc<T>(collection: string, id: string, data: T): Promise<void> {
  await put(`${collection}/${id}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function listDocs<T>(collection: string): Promise<T[]> {
  const { blobs } = await list({ prefix: `${collection}/` });
  const docs = await Promise.all(
    blobs.map(async (b) => {
      try {
        return (await (await fetch(b.url, { cache: "no-store" })).json()) as T;
      } catch {
        return null;
      }
    }),
  );
  return docs.filter((d) => d !== null) as T[];
}

export async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  const path = `${collection}/${id}.json`;
  const { blobs } = await list({ prefix: path });
  const hit = blobs.find((b) => b.pathname === path);
  if (!hit) return null;
  try {
    return (await (await fetch(hit.url, { cache: "no-store" })).json()) as T;
  } catch {
    return null;
  }
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const path = `${collection}/${id}.json`;
  const { blobs } = await list({ prefix: path });
  const hit = blobs.find((b) => b.pathname === path);
  if (hit) await del(hit.url);
}
