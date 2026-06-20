import "server-only";
import { put } from "@vercel/blob";
import { listDocs } from "./store";

/**
 * Snapshot every doc-store collection into one timestamped JSON under
 * `backups/`. Durable point-in-time copy that survives accidental collection
 * deletion. Run on a daily Vercel cron + on demand. (Once the store moves to
 * Neon/Postgres, Neon's native PITR + automated backups take over and this
 * becomes a belt-and-suspenders off-store export.)
 */
const COLLECTIONS = ["contacts", "leads", "units", "broadcasts", "campaigns", "documents"];

export async function backupAll(): Promise<{ records: number; key: string }> {
  const snap: { takenAt: string; collections: Record<string, unknown[]> } = {
    takenAt: new Date().toISOString(),
    collections: {},
  };
  let records = 0;
  for (const c of COLLECTIONS) {
    const rows = await listDocs(c); // consolidated store (collections/<c>.json)
    snap.collections[c] = rows;
    records += rows.length;
  }
  const stamp = snap.takenAt.replace(/[:.]/g, "-");
  const key = `backups/palms-data-${stamp}.json`;
  await put(key, JSON.stringify(snap), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
  return { records, key };
}
