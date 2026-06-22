import { NextResponse } from "next/server";
import { exchangeCode, decodeIdToken, emailAllowed } from "@/lib/google-oauth";
import { signSessionFor, HUB_COOKIE } from "@/lib/hub-session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/palms_oauth_state=([^;]+)/)?.[1];
  const fail = (e: string) => NextResponse.redirect(new URL(`/hub/login?e=${e}`, req.url));

  if (!code || !state || !cookieState || state !== cookieState) return fail("state");

  const idToken = await exchangeCode(code, `${url.origin}/api/auth/google/callback`);
  if (!idToken) return fail("exchange");

  const email = emailAllowed(decodeIdToken(idToken));
  if (!email) return fail("denied");

  const secret = process.env.HUB_SESSION_SECRET || "";
  if (!secret) return fail("config");

  const res = NextResponse.redirect(new URL("/hub", req.url));
  res.cookies.set(HUB_COOKIE, await signSessionFor(secret, email), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("palms_oauth_state", "", { path: "/", maxAge: 0 });
  return res;
}
