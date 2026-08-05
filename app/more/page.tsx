import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/lib/icons";
import { ChevronLeft } from "lucide-react";

const ROWS = [
  { label: "הגדרות אישיות", sub: "עדכון פרטיך, ילדים, והעדפות", iconKey: "settings", href: "/more/settings" },
  { label: "מידע שימושי", sub: "פינוי אשפה, מקלטים, גנים, בריאות ועוד", iconKey: "info", href: "/more/info" },
  { label: "מפה", sub: "מפת המושב ורחובות", iconKey: "map", href: "/more/map" },
  { label: "שער", sub: "פתיחה דרך PalGate ודיווח תקלות", iconKey: "gate", href: "/more/gate" },
  { label: "לתושבים חדשים", sub: "שער, תא דואר ואישור תושבות — במקום אחד", iconKey: "users", href: "/more/new-residents" },
  { label: "אודות המושב", sub: "היסטוריה ונתונים", iconKey: "landmark", href: "/more/about" },
  { label: "תנאי שימוש", sub: "התנאים והכללים", iconKey: "scroll", href: "/more/terms" },
  { label: "נגישות", sub: "הצהרת נגישות", iconKey: "accessibility", href: "/more/accessibility" },
  { label: "פרטיות", sub: "מדיניות הפרטיות", iconKey: "lock", href: "/more/privacy" },
];

export default function MorePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">עוד</h1>

      <div className="space-y-2.5">
        {ROWS.map((row) => {
          const Icon = getIcon(row.iconKey);
          return (
            <Link key={row.label} href={row.href} className="block">
              <Card className="p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
                <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.sub}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
