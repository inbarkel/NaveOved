import type { Announcement } from "@/lib/demo-data";

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "לפני פחות משעה";
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  return days === 1 ? "אתמול" : `לפני ${days} ימים`;
}

function formatIsraelTime(iso: string) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));
}

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  const sorted = [...announcements].sort((a, b) => Number(b.urgent) - Number(a.urgent));

  return (
    <ul className="contrast-surface divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-surface">
      {sorted.map((a) => (
        <li
          key={a.id}
          className={`px-4 py-3.5 ${a.urgent ? "bg-[color-mix(in_srgb,var(--color-urgent)_7%,var(--color-surface))]" : ""}`}
        >
          <div className="flex items-center gap-2">
            {a.urgent && (
              <span className="rounded-md bg-urgent px-1.5 py-0.5 text-xs font-bold text-urgent-foreground">דחוף</span>
            )}
            <h3 className={`font-bold leading-snug ${a.urgent ? "text-urgent" : ""}`}>{a.title}</h3>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{a.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelative(a.createdAt)} · {formatIsraelTime(a.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
