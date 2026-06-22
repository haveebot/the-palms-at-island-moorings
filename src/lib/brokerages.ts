import "server-only";
import { putDoc, listDocs, getDoc } from "./store";
import type { BrokerageMeta } from "./brokerages-shared";

const COL = "brokerages";

export async function listBrokerageMeta(): Promise<BrokerageMeta[]> {
  return listDocs<BrokerageMeta>(COL);
}

export async function getBrokerageMeta(id: string): Promise<BrokerageMeta | null> {
  return getDoc<BrokerageMeta>(COL, id);
}

/** Create or update the firm-level metadata for a brokerage (keyed by slug). */
export async function upsertBrokerageMeta(
  id: string,
  name: string,
  fields: { stage?: string; primaryContactId?: string; notes?: string; tags?: string[] },
): Promise<BrokerageMeta> {
  const existing = await getDoc<BrokerageMeta>(COL, id);
  const meta: BrokerageMeta = {
    id,
    name,
    stage: fields.stage ?? existing?.stage ?? "prospect",
    primaryContactId: fields.primaryContactId !== undefined ? fields.primaryContactId || undefined : existing?.primaryContactId,
    notes: fields.notes !== undefined ? fields.notes || undefined : existing?.notes,
    tags: fields.tags ?? existing?.tags ?? [],
    updatedAt: new Date().toISOString(),
  };
  await putDoc(COL, id, meta);
  return meta;
}
