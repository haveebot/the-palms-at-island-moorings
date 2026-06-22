import { NextResponse } from "next/server";
import { signSession, signSessionFor, HUB_COOKIE } from "@/lib/hub-session";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const secret = process.env.HUB_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Hub isn't configured yet." }, { status: 500 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Password required." }, { status: 401 });
  }

  const withCookie = (token: string) => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(HUB_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  };

  // Per-user sign-in: email + password.
  if (email) {
    const user = await getUserByEmail(email);
    if (user && (await verifyPassword(password, user.passwordHash))) {
      return withCookie(await signSessionFor(secret, user.email));
    }
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  // Fallback: shared team access password (no identity).
  const shared = process.env.HUB_ACCESS_PASSWORD;
  if (shared && password === shared) {
    return withCookie(await signSession(secret));
  }
  return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
}
