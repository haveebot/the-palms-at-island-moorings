/**
 * Residence (unit) types — SHARED (client-safe). The development's inventory:
 * the homes being pre-sold, their status, price, and specs.
 */
export type UnitStatus = "coming-soon" | "available" | "reserved" | "sold";

export const UNIT_STATUSES: { key: UnitStatus; label: string }[] = [
  { key: "coming-soon", label: "Coming soon" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "sold", label: "Sold" },
];

export type Unit = {
  id: string;
  name: string;
  status: UnitStatus;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  description?: string;
  reservedByLeadId?: string;
  /** Marks seeded placeholder rows so they read as samples, not real inventory. */
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UnitInput = {
  name: string;
  status: UnitStatus;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  description?: string;
};

export function formatPrice(n?: number): string {
  if (!n || n <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
