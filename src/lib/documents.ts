import "server-only";
import { put, del } from "@vercel/blob";
import { putDoc, listDocs, getDoc, deleteDoc } from "./store";
import type { DocRecord } from "./documents-shared";

const COL = "documents";

export async function listDocuments(): Promise<DocRecord[]> {
  const all = await listDocs<DocRecord>(COL);
  return all.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function createDocument(file: File, category: string): Promise<DocRecord> {
  const id = `doc_${Math.random().toString(36).slice(2, 10)}`;
  // Actual file lives under docfiles/ so it never collides with the JSON records.
  const blob = await put(`docfiles/${id}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  const rec: DocRecord = {
    id,
    name: file.name,
    category: category || "Other",
    url: blob.url,
    size: file.size,
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
