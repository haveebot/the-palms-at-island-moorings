import "server-only";
import { putDoc, listDocs, deleteDoc } from "./store";
import type { Campaign } from "./campaigns-shared";

export type { Campaign };

const COL = "campaigns";

export async function listCampaigns(): Promise<Campaign[]> {
  const all = await listDocs<Campaign>(COL);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createCampaign(input: Partial<Campaign>): Promise<Campaign> {
  const id = `cmp_${Math.random().toString(36).slice(2, 10)}`;
  const c: Campaign = {
    id,
    name: (input.name || "").trim() || "Untitled campaign",
    channel: input.channel || "Other",
    status: input.status || "planned",
    notes: (input.notes || "").trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await putDoc(COL, id, c);
  return c;
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(COL, id);
}
