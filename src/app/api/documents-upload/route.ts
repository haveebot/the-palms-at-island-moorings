import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, HUB_COOKIE } from "@/lib/hub-session";

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB / file (Blob itself goes to 5TB)

/**
 * Issues client-upload tokens so the hub can upload LARGE files (plan sets,
 * rendering packs, drone video) straight from the browser to Blob — bypassing
 * the 4.5MB serverless request-body cap entirely.
 *
 * Auth is enforced in onBeforeGenerateToken: a valid hub session cookie is
 * required to mint a token. This route is deliberately NOT under /api/hub/* so
 * the Blob completion callback (server→server, cookieless) isn't 401'd by the
 * proxy; that event is signature-verified by handleUpload, and token issuance
 * is gated by the session check below.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const token = (await cookies()).get(HUB_COOKIE)?.value;
        const secret = process.env.HUB_SESSION_SECRET || "";
        if (!secret || !(await verifySession(token, secret))) {
          throw new Error("Unauthorized");
        }
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_BYTES,
          tokenPayload: clientPayload ?? undefined,
        };
      },
      onUploadCompleted: async () => {
        // The metadata row is persisted client-side once upload() resolves (so
        // it also works on localhost, which Blob's callback can't reach). No-op.
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
