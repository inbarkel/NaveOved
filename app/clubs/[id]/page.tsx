import { DEMO_CLUBS } from "@/lib/demo-data";
import { ActivityDetailClient } from "@/components/clubs/ActivityDetailClient";

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseEvent = DEMO_CLUBS.find((e) => e.id === id) || null;

  return <ActivityDetailClient baseEvent={baseEvent} eventId={id} basePath="/clubs" />;
}
