import { NextResponse } from "next/server";
import { signSession, HUB_COOKIE } from "@/lib/hub-session";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.HUB_ACCESS_PASSWORD;
  const secret = process.env.HUB_SESSION_SECRET;

  if (!expected || !secret) {
    return NextResponse.json({ error: "Hub isn't configured yet." }, { status: 500 });
  }
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(HUB_COOKIE, await signSession(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
