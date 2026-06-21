// One-off: upload a large local file straight to Blob as a hub Document,
// bypassing the 4.5MB serverless body limit. Reuses the store's consolidated
// collections/documents.json shape exactly. Usage: node scripts/upload-design-asset.mjs "<path>" "<display name>" "<category>"
import { put, list } from "@vercel/blob";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m)?.[1]?.trim();
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not found in .env.local");

const [path, name, category = "Design Assets"] = process.argv.slice(2);
if (!path || !name) throw new Error('usage: node scripts/upload-design-asset.mjs "<path>" "<name>" [category]');

const buf = readFileSync(path);
const id = "doc_" + Math.random().toString(36).slice(2, 10);

const blob = await put(`docfiles/${id}-${name}`, buf, {
  access: "public",
  addRandomSuffix: true,
  contentType: "application/pdf",
  token,
});
console.log("binary →", blob.url);

const PATH = "collections/documents.json";
const { blobs } = await list({ prefix: PATH, token });
const hit = blobs.find((b) => b.pathname === PATH);
let rows = [];
if (hit) rows = await (await fetch(`${hit.url}?t=${Date.now()}`, { cache: "no-store" })).json();

rows.push({ id, name, category, url: blob.url, size: buf.length, uploadedAt: new Date().toISOString() });

await put(PATH, JSON.stringify(rows), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 0,
  token,
});
console.log(`documents.json now has ${rows.length} records (added ${id} under "${category}")`);
