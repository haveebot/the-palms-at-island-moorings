import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, HUB_COOKIE } from "@/lib/hub-session";

/**
 * Domain split + hub auth (Next 16 "proxy" convention).
 *
 *   thepalmsatislandmoorings.com  → public marketing only (hub pages 404)
 *   thepalms.dev                  → the operator hub (login → app)
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

  const isHubPage = pathname === "/hub" || pathname.startsWith("/hub/");
  const isHubApi = pathname.startsWith("/api/hub/");
  const loginOpen =
    pathname === "/hub/login" ||
    pathname === "/api/hub/login" ||
    pathname === "/api/hub/logout";

  // Public marketing domain: keep the hub PAGES off it.
  if (isMarketing && (isHubPage || pathname === "/ops")) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Auth check (lazy — only computed when we actually need it).
  const needsAuth = (isHubPage || isHubApi) && !loginOpen;
  let authed = false;
  if (needsAuth || (isHub && pathname === "/")) {
    const secret = process.env.HUB_SESSION_SECRET || "";
    authed = !!secret && (await verifySession(req.cookies.get(HUB_COOKIE)?.value, secret));
  }

  // Hub domain root → dashboard if authed, else login.
  if (isHub && pathname === "/") {
    return authed
      ? NextResponse.rewrite(new URL("/hub", req.url))
      : NextResponse.redirect(new URL("/hub/login", req.url));
  }

  if (needsAuth && !authed) {
    if (isHubApi) return new NextResponse("Unauthorized", { status: 401 });
    return NextResponse.redirect(new URL("/hub/login", req.url));
  }

  return NextResponse.next();
}
