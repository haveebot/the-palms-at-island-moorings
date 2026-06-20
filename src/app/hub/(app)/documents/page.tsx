import { listDocuments } from "@/lib/documents";
import { DocumentsBoard } from "@/components/DocumentsBoard";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const docs = await listDocuments();
  return <DocumentsBoard docs={docs} />;
}
