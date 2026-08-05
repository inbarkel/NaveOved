import { DEMO_CLUBS } from "@/lib/demo-data";
import { ActivityDetailClient } from "@/components/clubs/ActivityDetailClient";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseEvent = DEMO_CLUBS.find((e) => e.id === id && e.kind === "פעילות") || null;

  return <ActivityDetailClient baseEvent={baseEvent} eventId={id} basePath="/activities" />;
}
