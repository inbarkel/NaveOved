import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Announcement } from "@/lib/demo-data";

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "לפני פחות משעה";
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  return `לפני ${days} ימים`;
}

function formatIsraelTime(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  }).format(date);
}

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  const urgent = announcements.filter((a) => a.urgent);
  const regular = announcements.filter((a) => !a.urgent);

  return (
    <div className="space-y-4">
      {urgent.length > 0 && (
        <div className="space-y-3">
          {urgent.map((a) => (
            <Card key={a.id} className="border-urgent/40 bg-[color-mix(in_srgb,var(--color-urgent)_8%,var(--color-surface))] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-urgent mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="font-sans font-bold text-urgent">{a.title}</p>
                  <p className="text-sm mt-1 text-foreground/90">{a.body}</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                    <p>{formatRelative(a.createdAt)}</p>
                    <p className="text-xs opacity-75">{formatIsraelTime(a.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {regular.map((a) => (
          <Card key={a.id} className="p-4">
            <p className="font-sans font-bold">{a.title}</p>
            <p className="text-sm mt-1 text-foreground/90">{a.body}</p>
            <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
              <p>{formatRelative(a.createdAt)}</p>
              <p className="text-xs opacity-75">{formatIsraelTime(a.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
