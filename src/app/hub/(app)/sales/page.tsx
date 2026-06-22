import { listContacts } from "@/lib/contacts";
import { listBroadcasts, broadcastReady } from "@/lib/broadcasts";
import { SalesBoard } from "@/components/SalesBoard";

export const dynamic = "force-dynamic";

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ brokerage?: string }> }) {
  const [{ brokerage }, contacts, broadcasts] = await Promise.all([searchParams, listContacts(), listBroadcasts()]);
  return <SalesBoard contacts={contacts} broadcasts={broadcasts} canSend={broadcastReady()} initialBrokerage={brokerage || ""} />;
}
