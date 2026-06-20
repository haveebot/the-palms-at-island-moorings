import { listUnits } from "@/lib/units";
import { UnitsBoard } from "@/components/UnitsBoard";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const units = await listUnits();
  return <UnitsBoard units={units} />;
}
