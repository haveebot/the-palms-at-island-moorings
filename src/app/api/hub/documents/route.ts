import { NextResponse } from "next/server";
import { createDocument } from "@/lib/documents";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }
  const category = String(form?.get("category") || "Other");
  const doc = await createDocument(file, category);
  return NextResponse.json({ ok: true, doc });
}
