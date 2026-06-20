import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, HUB_COOKIE } from "@/lib/hub-session";

/**
 * Domain split + hub auth (Next 16 "proxy" convention).
 *
 *   thepalmsatislandmoorings.com  → public marketing only (hub paths 404)
 *   thepalms.dev                  → the operator hub (login → leads)
 *   *.vercel.app / localhost      → both reachable (for testing); hub still gated
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|og|robots.txt).*)"],
};

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  const isMarketing = host.includes("thepalmsatislandmoorings.com");
  const isHub = host === "thepalms.dev" || host.endsWith(".thepalms.dev");

  // Public marketing domain: keep the hub off it.
  if (isMarketing) {
    if (pathname === "/hub" || pathname.startsWith("/hub/") || pathname === "/ops") {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next();
  }

  const loginOpen =
    pathname === "/hub/login" ||
    pathname === "/api/hub/login" ||
    pathname === "/api/hub/logout";

  const secret = process.env.HUB_SESSION_SECRET || "";
  const authed = !!secret && (await verifySession(req.cookies.get(HUB_COOKIE)?.value, secret));

  // Root of the hub domain → dashboard if authed, else the login landing.
  if (isHub && pathname === "/") {
    return authed
      ? NextResponse.rewrite(new URL("/hub", req.url))
      : NextResponse.redirect(new URL("/hub/login", req.url));
  }

  // Gate the hub everywhere it can be reached.
  if ((pathname === "/hub" || pathname.startsWith("/hub/")) && !loginOpen && !authed) {
    return NextResponse.redirect(new URL("/hub/login", req.url));
  }

  return NextResponse.next();
}
