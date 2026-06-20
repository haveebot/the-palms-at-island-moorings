/**
 * Edge-safe signed session token for the hub. HMAC-SHA256 via Web Crypto so it
 * works in BOTH the proxy (edge runtime) and the login route — no Buffer / Node
 * APIs. Token shape: `v1.<expiryMs>.<sig>`.
 */
const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function signSession(secret: string, ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const payload = `v1.${Date.now() + ttlMs}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  if ((await hmac(payload, secret)) !== parts[2]) return false;
  const exp = Number(parts[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

export const HUB_COOKIE = "palms_hub";
