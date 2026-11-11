"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getIcon } from "@/lib/icons";

interface Row {
  label: string;
  sub: string;
  iconKey: string;
  href: string;
}

interface Group {
  title: string;
  rows: Row[];
  requiresLogin?: boolean;
}

const GROUPS: Group[] = [
  {
    title: "החשבון שלי",
    requiresLogin: true,
    rows: [
      { label: "הגדרות אישיות", sub: "פרטים, ילדים והעדפות", iconKey: "settings", href: "/more/settings" },
      { label: "פנייה לוועד", sub: "שליחת בקשה ומעקב אחרי תשובות", iconKey: "requests", href: "/more/requests" },
    ],
  },
  {
    title: "במושב",
    rows: [
      { label: "שער", sub: "פתיחה דרך PalGate ודיווח על תקלה", iconKey: "gate", href: "/more/gate" },
      { label: "מפה", sub: "המושב והרחובות", iconKey: "map", href: "/more/map" },
      { label: "מידע שימושי", sub: "מקלטים, גנים, בריאות ועוד", iconKey: "info", href: "/more/info" },
      { label: "לתושבים חדשים", sub: "שער, תא דואר ואישור תושבות", iconKey: "users", href: "/more/new-residents" },
      { label: "על המושב", sub: "היסטוריה ונתונים", iconKey: "landmark", href: "/more/about" },
    ],
  },
  {
    title: "מידע משפטי",
    rows: [
      { label: "נגישות", sub: "הצהרת נגישות", iconKey: "accessibility", href: "/more/accessibility" },
      { label: "פרטיות", sub: "מדיניות הפרטיות", iconKey: "lock", href: "/more/privacy" },
      { label: "תנאי שימוש", sub: "התנאים והכללים", iconKey: "scroll", href: "/more/terms" },
    ],
  },
];

export default function MorePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-7 px-4 py-6">
      <h1 className="text-2xl font-extrabold">עוד</h1>

      {GROUPS.filter((g) => !g.requiresLogin || user).map((group) => (
        <section key={group.title} aria-labelledby={`g-${group.title}`}>
          <h2 id={`g-${group.title}`} className="mb-2 text-sm font-bold text-muted-foreground">
            {group.title}
          </h2>
          <ul className="contrast-surface divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-surface">
            {group.rows.map((row) => {
              const Icon = getIcon(row.iconKey);
              return (
                <li key={row.href}>
                  <Link href={row.href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-snug">{row.label}</span>
                      <span className="block text-sm text-muted-foreground">{row.sub}</span>
                    </span>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
