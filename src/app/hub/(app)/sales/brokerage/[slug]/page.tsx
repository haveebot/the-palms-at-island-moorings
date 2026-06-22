import { notFound } from "next/navigation";
import { listContacts } from "@/lib/contacts";
import { getBrokerageMeta } from "@/lib/brokerages";
import { broadcastReady } from "@/lib/broadcasts";
import { brokerageSlug } from "@/lib/brokerages-shared";
import { BrokerageDetail } from "@/components/BrokerageDetail";

export const dynamic = "force-dynamic";

export default async function BrokeragePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contacts = await listContacts();
  const agents = contacts.filter((c) => c.company && brokerageSlug(c.company) === slug);
  if (agents.length === 0) notFound();
  const name = agents[0].company!;
  const meta = await getBrokerageMeta(slug);
  return <BrokerageDetail slug={slug} name={name} agents={agents} meta={meta} canSend={broadcastReady()} />;
}
