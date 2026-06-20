export const CAMPAIGN_CHANNELS = ["Email", "Social", "Paid", "Broker", "PR", "Event", "Other"];
export const CAMPAIGN_STATUSES = ["planned", "active", "paused", "done"];

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  status: string;
  notes?: string;
  createdAt: string;
};
