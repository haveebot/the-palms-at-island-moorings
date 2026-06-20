import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Basic-auth gate for the internal /ops surface (Next 16 "proxy" convention,
 * formerly middleware). Credentials come from OPS_USER / OPS_PASSWORD in the
 * Vercel project env. Public site is untouched — matcher is scoped to /ops.
 */
export const config = { matcher: ["/ops/:path*", "/ops"] };

export function proxy(req: NextRequest) {
  const user = process.env.OPS_USER;
  const pass = process.env.OPS_PASSWORD;

  // If creds aren't configured, fail closed (don't expose leads).
  if (user && pass) {
    const header = req.headers.get("authorization");
    if (header?.startsWith("Basic ")) {
      try {
        const decoded = atob(header.slice(6));
        const idx = decoded.indexOf(":");
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        if (u === user && p === pass) return NextResponse.next();
      } catch {
        // fall through to 401
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Palms Ops", charset="UTF-8"' },
  });
}
