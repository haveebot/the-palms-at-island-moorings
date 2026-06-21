export const DOC_CATEGORIES = ["Design Assets", "Floor Plans", "Price Sheets", "Brochures", "Agreements", "Renderings", "Other"];

export type DocRecord = {
  id: string;
  name: string;
  category: string;
  url: string;
  size: number;
  uploadedAt: string;
};

export function formatBytes(n?: number): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
