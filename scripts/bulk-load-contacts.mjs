#!/usr/bin/env node
/**
 * Bulk-load web-sourced contacts into the live Sales database (Vercel Blob,
 * consolidated `collections/contacts.json`). Reusable across sourcing waves.
 *
 * - Reads BLOB_READ_WRITE_TOKEN from .env.local (gitignored).
 * - Dedupes new contacts against the LIVE collection (not a stale backup) by
 *   normalized full-name OR exact email — so re-runs are idempotent and we never
 *   create duplicate people.
 * - Appends survivors with fresh ids, source-tagged, cacheControlMaxAge:0 (the
 *   operator hub reads must reflect writes immediately).
 * - Writes a local safety snapshot of the merged collection before pushing.
 *
 * Usage:  node scripts/bulk-load-contacts.mjs <file1.json> [file2.json ...] [--source=phase2-research] [--dry]
 * Each input file is a JSON array of ContactInput-shaped objects.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { put, list } from "@vercel/blob";

// --- load token from .env.local -------------------------------------------
function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  throw new Error("BLOB_READ_WRITE_TOKEN not found (env or .env.local)");
}
const token = loadToken();

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith("--"));
const dry = args.includes("--dry");
const sourceArg = (args.find((a) => a.startsWith("--source=")) || "--source=research").split("=")[1];
if (files.length === 0) {
  console.error("usage: node scripts/bulk-load-contacts.mjs <file.json> [...] [--source=tag] [--dry]");
  process.exit(1);
}

const PATH = "collections/contacts.json";
const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const ALLOWED_TAGS = new Set(["luxury", "marina/boat", "waterfront", "investment/str", "second-home"]);
const ALLOWED_MARKETS = new Set(["Coastal Bend", "Houston", "Austin", "San Antonio", "Dallas", "Other"]);

function tagsOf(t) {
  const arr = Array.isArray(t) ? t : typeof t === "string" ? t.split(",") : [];
  return arr
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => (x.toLowerCase() === "investment/str" ? "investment/STR" : x))
    .filter((x) => ALLOWED_TAGS.has(x.toLowerCase()));
}

async function readLive() {
  const { blobs } = await list({ prefix: PATH, token });
  const hit = blobs.find((b) => b.pathname === PATH);
  if (!hit) return [];
  const res = await fetch(`${hit.url}?t=${Date.now()}`, { cache: "no-store" });
  return res.json();
}

const live = await readLive();
console.log(`live contacts: ${live.length}`);

const seenName = new Set(live.map((c) => norm(c.fullName)));
const seenEmail = new Set(live.map((c) => (c.email || "").toLowerCase()).filter(Boolean));

let added = 0;
const skipped = [];
const now = new Date().toISOString();
const additions = [];

for (const file of files) {
  let rows;
  try {
    rows = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`! skip ${file}: ${e.message}`);
    continue;
  }
  for (const r of rows) {
    const fullName = (r.fullName || "").trim();
    if (!fullName) continue;
    const nname = norm(fullName);
    const email = (r.email || "").trim().toLowerCase() || undefined;
    if (seenName.has(nname) || (email && seenEmail.has(email))) {
      skipped.push(`${fullName}${email ? ` <${email}>` : ""} — dup`);
      continue;
    }
    const market = ALLOWED_MARKETS.has(r.market) ? r.market : "Other";
    const id = `c_${Math.random().toString(36).slice(2, 10)}`;
    additions.push({
      id,
      type: ["agent", "partner", "prospect"].includes(r.type) ? r.type : "agent",
      fullName,
      email,
      phone: (r.phone || "").trim() || undefined,
      company: (r.company || "").trim() || undefined,
      market,
      tags: tagsOf(r.tags),
      status: ["new", "active", "engaged", "do-not-contact"].includes(r.status) ? r.status : "new",
      notes: (r.notes || "").trim() || undefined,
      source: sourceArg,
      sample: false,
      createdAt: now,
      updatedAt: now,
    });
    seenName.add(nname);
    if (email) seenEmail.add(email);
    added++;
  }
}

const merged = [...live, ...additions];
const byMarket = merged.reduce((m, c) => ((m[c.market || "?"] = (m[c.market || "?"] || 0) + 1), m), {});
const emailable = merged.filter((c) => c.email).length;

console.log(`\nnew added: ${added}`);
console.log(`skipped (dup): ${skipped.length}`);
if (skipped.length) skipped.forEach((s) => console.log(`   - ${s}`));
console.log(`\nmerged total: ${merged.length}  | emailable: ${emailable}`);
console.log(`by market:`, byMarket);

// local safety snapshot
const snap = `/tmp/palms-phase2/merged-contacts-${added}added.json`;
writeFileSync(snap, JSON.stringify(merged, null, 2));
console.log(`\nsafety snapshot: ${snap}`);

if (dry) {
  console.log("\n[--dry] no write performed.");
  process.exit(0);
}

await put(PATH, JSON.stringify(merged), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 0,
  token,
});
console.log("\n✓ wrote live collections/contacts.json");
