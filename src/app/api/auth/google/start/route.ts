import { NextResponse } from "next/server";
import { authUrl, oauthConfigured } from "@/lib/google-oauth";

export async function GET(req: Request) {
  if (!oauthConfigured()) {
    return NextResponse.redirect(new URL("/hub/login?e=sso-off", req.url));
  }
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authUrl(state, redirectUri));
  // Short-lived CSRF state, checked on callback.
  res.cookies.set("palms_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
