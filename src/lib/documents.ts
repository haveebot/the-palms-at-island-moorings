import "server-only";
import { del } from "@vercel/blob";
import { putDoc, listDocs, getDoc, deleteDoc } from "./store";
import type { DocRecord } from "./documents-shared";

const COL = "documents";

export async function listDocuments(): Promise<DocRecord[]> {
  const all = await listDocs<DocRecord>(COL);
  return all.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/**
 * Records a document whose binary is ALREADY in Blob — uploaded client-direct
 * via `@vercel/blob/client` → /api/documents-upload, which streams the file
 * straight to Blob and bypasses the 4.5MB serverless request-body cap. Here we
 * only persist the metadata row.
 */
export async function recordDocument(input: {
  name: string;
  category: string;
  url: string;
  size: number;
}): Promise<DocRecord> {
  const id = `doc_${Math.random().toString(36).slice(2, 10)}`;
  const rec: DocRecord = {
    id,
    name: input.name,
    category: input.category || "Other",
    url: input.url,
    size: input.size,
    uploadedAt: new Date().toISOString(),
  };
  await putDoc(COL, id, rec);
  return rec;
}

export async function deleteDocument(id: string): Promise<void> {
  const rec = await getDoc<DocRecord>(COL, id);
  if (rec?.url) {
    try {
      await del(rec.url);
    } catch {
      /* ignore */
    }
  }
  await deleteDoc(COL, id);
}
