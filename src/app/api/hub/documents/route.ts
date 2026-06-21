import { NextResponse } from "next/server";
import { recordDocument } from "@/lib/documents";

/**
 * Persists a document metadata row AFTER the binary has been uploaded
 * client-direct to Blob (see /api/documents-upload). Body is JSON, not the file
 * — so this is never near the 4.5MB serverless body cap.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.url !== "string" || typeof body.name !== "string") {
    return NextResponse.json({ error: "Missing upload metadata." }, { status: 400 });
  }
  const doc = await recordDocument({
    name: body.name,
    category: typeof body.category === "string" ? body.category : "Other",
    url: body.url,
    size: Number(body.size) || 0,
  });
  return NextResponse.json({ ok: true, doc });
}
