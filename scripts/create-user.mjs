// One-off: create a hub user. Hashes with the SAME PBKDF2 scheme as
// src/lib/password.ts (pbkdf2$120000$saltB64$hashB64) so the app verifies it.
// Usage: node scripts/create-user.mjs <email> <name> <role> [password]
import { put, list } from "@vercel/blob";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m)?.[1]?.trim();
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not found");

const [email, name, role = "operator", pwArg] = process.argv.slice(2);
if (!email || !name) throw new Error('usage: node scripts/create-user.mjs <email> <name> <role> [password]');

// Generate a readable strong password if none supplied (no ambiguous chars).
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
const rnd = crypto.getRandomValues(new Uint8Array(10));
const password = pwArg || "palms-" + Array.from(rnd, (b) => ALPHA[b % ALPHA.length]).join("");

const enc = new TextEncoder();
const ITER = 120000;
async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, key, 256));
  return `pbkdf2$${ITER}$${Buffer.from(salt).toString("base64")}$${Buffer.from(bits).toString("base64")}`;
}

const user = {
  id: "u_" + Math.random().toString(36).slice(2, 10),
  email: email.trim().toLowerCase(),
  name: name.trim(),
  role,
  passwordHash: await hashPassword(password),
  createdAt: new Date().toISOString(),
};

const PATH = "collections/users.json";
const { blobs } = await list({ prefix: PATH, token });
const hit = blobs.find((b) => b.pathname === PATH);
let rows = hit ? await (await fetch(`${hit.url}?t=${Date.now()}`, { cache: "no-store" })).json() : [];
rows = rows.filter((u) => u.email !== user.email); // replace if exists
rows.push(user);
await put(PATH, JSON.stringify(rows), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0, token });

console.log(`created user: ${user.email} (${user.name}, ${user.role}) — users.json now has ${rows.length}`);
console.log(`PASSWORD: ${password}`);
