import "server-only";
import { SITE } from "./site";

/**
 * Signed, unguessable unsubscribe token per contact (HMAC-SHA256 of the id,
 * truncated). Lets a recipient opt out via a public link without auth, and the
 * link can't be forged to unsubscribe someone else. Signed with HUB_SESSION_SECRET.
 */
const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(contactId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`unsub.${contactId}`));
  return b64url(new Uint8Array(sig)).slice(0, 24);
}

export async function verifyUnsub(contactId: string, token: string, secret: string): Promise<boolean> {
  return !!token && token === (await sign(contactId, secret));
}

/** Public unsubscribe URL (on the marketing domain, no auth needed to click). */
export async function unsubUrl(contactId: string, secret: string): Promise<string> {
  const t = await sign(contactId, secret);
  return `https://${SITE.publicDomain}/api/unsubscribe?c=${encodeURIComponent(contactId)}&t=${t}`;
}
