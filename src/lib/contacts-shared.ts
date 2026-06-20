/**
 * Sales contacts — the outbound channel database (the Palms analog of Sage's
 * rep-agency roster): agents/brokers who bring buyers, referral partners, and
 * direct buyer prospects. SHARED types (client-safe).
 */
export type ContactType = "agent" | "partner" | "prospect";

export const CONTACT_TYPES: { key: ContactType; label: string }[] = [
  { key: "agent", label: "Agent / Broker" },
  { key: "partner", label: "Referral partner" },
  { key: "prospect", label: "Buyer prospect" },
];

export type ContactStatus = "new" | "active" | "engaged" | "do-not-contact";

export const CONTACT_STATUSES: { key: ContactStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "active", label: "Active" },
  { key: "engaged", label: "Engaged" },
  { key: "do-not-contact", label: "Do not contact" },
];

export const MARKETS = ["Coastal Bend", "Houston", "Austin", "San Antonio", "Dallas", "Other"];
export const TAG_SUGGESTIONS = ["luxury", "marina/boat", "waterfront", "investment/STR", "second-home"];

export type Contact = {
  id: string;
  type: ContactType;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string; // brokerage / firm
  market?: string;
  tags: string[];
  status: ContactStatus;
  notes?: string;
  source?: string;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactInput = {
  type: ContactType;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  market?: string;
  tags?: string[] | string;
  status?: ContactStatus;
  notes?: string;
};

export type Broadcast = {
  id: string;
  subject: string;
  body: string;
  segment: string; // human-readable segment description
  recipientCount: number;
  status: "draft" | "sent";
  createdAt: string;
  sentAt?: string;
};
