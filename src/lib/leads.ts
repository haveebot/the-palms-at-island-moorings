import "server-only";
import { putDoc, listDocs, getDoc } from "./store";
import type { RegisterInterestInput, Lead, LeadStage } from "./leads-shared";

const COL = "leads";

export type SavedLead = { id: string; receivedAt: string };

/** Public site capture → a new lead at stage "new". */
export async function persistRegisterInterest(
  input: RegisterInterestInput,
): Promise<SavedLead> {
  const id = `pal_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const lead: Lead = {
    id,
    receivedAt: now,
    updatedAt: now,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
    source: "website",
    stage: "new",
    activity: [{ at: now, text: "Registered interest via the website." }],
  };
  await putDoc(COL, id, lead);
  return { id, receivedAt: now };
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await listDocs<Lead>(COL);
  return leads.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function getLead(id: string): Promise<Lead | null> {
  return getDoc<Lead>(COL, id);
}

export type LeadUpdate = {
  stage?: LeadStage;
  assignee?: string;
  unitId?: string | null;
  note?: string; // appended to activity
};

export async function updateLead(id: string, update: LeadUpdate): Promise<Lead | null> {
  const lead = await getDoc<Lead>(COL, id);
  if (!lead) return null;
  const now = new Date().toISOString();
  const activity = [...(lead.activity || [])];

  if (update.stage && update.stage !== lead.stage) {
    activity.unshift({ at: now, text: `Stage → ${update.stage}.` });
    lead.stage = update.stage;
  }
  if (update.assignee !== undefined && update.assignee !== lead.assignee) {
    activity.unshift({ at: now, text: `Assigned to ${update.assignee || "—"}.` });
    lead.assignee = update.assignee || undefined;
  }
  if (update.unitId !== undefined) {
    lead.unitId = update.unitId || undefined;
    activity.unshift({ at: now, text: update.unitId ? `Linked to a residence.` : `Unlinked residence.` });
  }
  if (update.note && update.note.trim()) {
    activity.unshift({ at: now, text: update.note.trim() });
  }

  lead.activity = activity;
  lead.updatedAt = now;
  await putDoc(COL, id, lead);
  return lead;
}
