import { put, list } from "@vercel/blob";

const u = (await list({ prefix: "collections/contacts.json" })).blobs[0].url + "?x=" + Math.random();
let c = await (await fetch(u, { cache: "no-store" })).json();
const before = c.length;
const removed = [];

// 1) normalize company: collapse subgroup labels + merge known variants
function cmap(co) {
  if (!co) return co;
  co = co.trim();
  if (/^Compass \(.+\)$/.test(co)) return "Compass";
  if (/^Keller Williams Coastal Bend \(.+\)$/.test(co)) return "Keller Williams Coastal Bend";
  if (co === "Keller Williams (The Paradise Team)") return "Keller Williams Coastal Bend";
  if (/^Moreland Properties \(.+\)$/.test(co)) return "Moreland Properties";
  if (/^Kimberly Howell Properties \(.+\)$/.test(co)) return "Kimberly Howell Properties";
  if (/^Dave Perry-Miller Real Estate \(.+\)$/.test(co)) return "Dave Perry-Miller Real Estate";
  if (co === "Coldwell Banker Island, Realtors (CBIR)") return "Coldwell Banker Island Escapes";
  if (co === "Nan and Company Properties") return "Nan & Company Properties";
  return co;
}

// 2) clean fullName: strip a trailing "(...)" only when the base is a PERSON name
const FIRMWORDS = /realty|real estate|properties|realtors|group|llc|\binc\b|sotheby|compan|associates|brokerage|marina|yacht|capital|management|interiors/i;
function cleanName(n) {
  n = (n || "").trim();
  const m = n.match(/^(.+?)\s*\(.+\)$/);
  if (m) {
    const base = m[1].trim();
    if (!FIRMWORDS.test(base) && base.split(/\s+/).length <= 3) return base;
  }
  return n;
}

// remove "(brokerage)" placeholder rows; normalize the rest
let kept = [];
for (const x of c) {
  if (/\(brokerage\)/i.test(x.fullName || "")) { removed.push(`placeholder: ${x.fullName}`); continue; }
  x.company = cmap(x.company);
  x.fullName = cleanName(x.fullName);
  kept.push(x);
}
c = kept;

// 3) drop "Independent / Rockport Realtor" rows whose person exists at a real firm
const realNames = new Set(c.filter((x) => x.company && !/independent/i.test(x.company)).map((x) => x.fullName.toLowerCase()));
c = c.filter((x) => {
  if (/independent/i.test(x.company || "") && realNames.has(x.fullName.toLowerCase())) { removed.push(`independent-dup: ${x.fullName}`); return false; }
  return true;
});

// 4) dedup by name+company, keep richest (email>phone)
const score = (x) => (x.email ? 2 : 0) + (x.phone ? 1 : 0);
const m1 = new Map();
for (const x of c) {
  const k = x.fullName.toLowerCase() + "|" + (x.company || "").toLowerCase();
  const ex = m1.get(k);
  if (!ex || score(x) > score(ex)) m1.set(k, x);
}
const exactRemoved = c.length - m1.size;
c = [...m1.values()];

// 5) same person across DIFFERENT firms (moved/dual-labeled): keep richest, report
const byName = new Map();
for (const x of c) {
  const k = x.fullName.toLowerCase();
  (byName.get(k) || byName.set(k, []).get(k)).push(x);
}
const crossMerged = [];
const final = [];
for (const [, arr] of byName) {
  if (arr.length === 1) { final.push(arr[0]); continue; }
  arr.sort((a, b) => score(b) - score(a));
  final.push(arr[0]);
  crossMerged.push(`${arr[0].fullName}: kept @${arr[0].company}, dropped @${arr.slice(1).map((x) => x.company).join(", @")}`);
}
c = final;

// 6) tag normalize: merge "investment" -> "investment/STR"; dedupe tags
for (const x of c) {
  x.tags = [...new Set((x.tags || []).map((t) => (t === "investment" ? "investment/STR" : t)))];
}

await put("collections/contacts.json", JSON.stringify(c), {
  access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0,
});

const email = c.filter((x) => x.email).length, phone = c.filter((x) => x.phone).length, either = c.filter((x) => x.email || x.phone).length;
console.log(`before ${before} -> after ${c.length} (removed ${before - c.length}; exact-dupes ${exactRemoved}, cross-firm ${crossMerged.length}, placeholders/independent ${removed.length})`);
console.log(`brokerages: ${new Set(c.map((x) => x.company).filter(Boolean)).size}`);
console.log(`reachable: emailable ${email} | phone ${phone} | ${either} (${Math.round((either / c.length) * 100)}%)`);
console.log("\nREMOVED:", removed.join(" | ") || "none");
console.log("\nCROSS-FIRM MERGED:", crossMerged.join(" | ") || "none");
