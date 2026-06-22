/**
 * Edge-safe signed session token for the hub. HMAC-SHA256 via Web Crypto (works
 * in the proxy edge runtime AND route handlers — no Buffer / Node APIs).
 *
 * Two shapes:
 *   v1.<expiryMs>.<sig>                — shared access password (legacy/fallback)
 *   v2.<expiryMs>.<emailB64url>.<sig>  — per-user (Google SSO), carries identity
 */
const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/** Legacy shared-password session (no identity). */
export async function signSession(secret: string, ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const payload = `v1.${Date.now() + ttlMs}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

/** Per-user session carrying the signed-in email (Google SSO). */
export async function signSessionFor(secret: string, email: string, ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const payload = `v2.${Date.now() + ttlMs}.${b64url(enc.encode(email))}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

export type Session = { email?: string };

/** Validate a token (v1 or v2) and return its payload, or null if invalid/expired. */
export async function readSession(token: string | undefined, secret: string): Promise<Session | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts[0] === "v1" && parts.length === 3) {
    if ((await hmac(`v1.${parts[1]}`, secret)) !== parts[2]) return null;
    const exp = Number(parts[1]);
    return Number.isFinite(exp) && Date.now() < exp ? {} : null;
  }
  if (parts[0] === "v2" && parts.length === 4) {
    if ((await hmac(`v2.${parts[1]}.${parts[2]}`, secret)) !== parts[3]) return null;
    const exp = Number(parts[1]);
    if (!Number.isFinite(exp) || Date.now() >= exp) return null;
    try {
      return { email: fromB64url(parts[2]) };
    } catch {
      return null;
    }
  }
  return null;
}

/** Boolean gate (used by the proxy). */
export async function verifySession(token: string | undefined, secret: string): Promise<boolean> {
  return (await readSession(token, secret)) !== null;
}

export const HUB_COOKIE = "palms_hub";
