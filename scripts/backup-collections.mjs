// Manual off-Vercel snapshot of all hub data collections (contacts, brokerages,
// users, broadcasts, documents, leads, units). Complements the daily Blob cron.
import { list } from "@vercel/blob";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m)?.[1]?.trim();
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not found");

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
const dir = `${process.env.HOME}/palms-backups/${stamp}`;
mkdirSync(dir, { recursive: true });

const { blobs } = await list({ prefix: "collections/", token });
let total = 0;
for (const b of blobs.filter((x) => x.pathname.endsWith(".json"))) {
  const data = await (await fetch(`${b.url}?t=${Date.now()}`, { cache: "no-store" })).text();
  const name = b.pathname.replace("collections/", "");
  writeFileSync(`${dir}/${name}`, data);
  let count = "?";
  try { const a = JSON.parse(data); if (Array.isArray(a)) { count = a.length; total += a.length; } } catch {}
  console.log(`  ${name.padEnd(20)} ${count} records`);
}
console.log(`\n✓ backed up ${blobs.length} collections (${total} records) → ${dir}`);
