import "server-only";

/**
 * Google "Sign in with Google" for the hub — authorization-code flow. Sign-in is
 * restricted to verified @thepalms.dev accounts (an Internal consent screen
 * already limits it to the Workspace; we re-check here, plus an optional
 * HUB_ALLOWED_EMAILS allowlist). Gated entirely on GOOGLE_OAUTH_CLIENT_ID/SECRET.
 */
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const ALLOWED_DOMAIN = "thepalms.dev";

export function oauthConfigured(): boolean {
  return !!process.env.GOOGLE_OAUTH_CLIENT_ID && !!process.env.GOOGLE_OAUTH_CLIENT_SECRET;
}

export function authUrl(state: string, redirectUri: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    hd: ALLOWED_DOMAIN, // hint Google toward thepalms.dev accounts
    prompt: "select_account",
    access_type: "online",
  });
  return `${GOOGLE_AUTH}?${p.toString()}`;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<string | null> {
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.id_token ?? null;
}

type IdClaims = { email?: string; email_verified?: boolean | string; hd?: string; aud?: string; iss?: string };

/**
 * The id_token comes straight from Google's token endpoint over TLS (server-to-
 * server, authenticated with our client secret), so decoding the claims — rather
 * than re-verifying the JWT signature — is sufficient here. We still validate
 * issuer, audience, and verified-email + domain.
 */
export function decodeIdToken(idToken: string): IdClaims | null {
  try {
    const b64 = idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4))) as IdClaims;
  } catch {
    return null;
  }
}

/** Returns the lowercased email if allowed to sign in, else null. */
export function emailAllowed(claims: IdClaims | null): string | null {
  if (!claims?.email) return null;
  if (claims.email_verified !== true && claims.email_verified !== "true") return null;
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") return null;
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && claims.aud !== process.env.GOOGLE_OAUTH_CLIENT_ID) return null;

  const email = claims.email.toLowerCase();
  const allow = (process.env.HUB_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length > 0) return allow.includes(email) ? email : null;
  return email.endsWith(`@${ALLOWED_DOMAIN}`) ? email : null;
}
