import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/lib/icons";

const ROWS = [
  { label: "הגדרות אישיות", sub: "עדכון פרטים, ילדים והעדפות", iconKey: "settings", href: "/more/settings" },
  { label: "מידע שימושי", sub: "פינוי אשפה, מקלטים, גנים, בריאות ועוד", iconKey: "info", href: "/more/info" },
  { label: "מפה", sub: "מפת המושב ורחובות", iconKey: "map", href: "/more/map" },
  { label: "שער", sub: "פתיחה דרך PalGate ודיווח תקלות", iconKey: "gate", href: "/more/gate" },
  { label: "לתושבים חדשים", sub: "שער, תא דואר ואישור תושבות - במקום אחד", iconKey: "users", href: "/more/new-residents" },
  { label: "אודות המושב", sub: "היסטוריה ונתונים", iconKey: "landmark", href: "/more/about" },
  { label: "תנאי שימוש", sub: "התנאים והכללים", iconKey: "scroll", href: "/more/terms" },
  { label: "נגישות", sub: "הצהרת נגישות", iconKey: "accessibility", href: "/more/accessibility" },
  { label: "פרטיות", sub: "מדיניות הפרטיות", iconKey: "lock", href: "/more/privacy" },
];

export default function MorePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">עוד</h1>

      <div className="grid grid-cols-2 gap-3">
        {ROWS.map((row) => {
          const Icon = getIcon(row.iconKey);
          return (
            <Link key={row.label} href={row.href} className="block">
              <Card className="p-3 flex flex-col items-center text-center gap-1 h-full active:scale-[0.99] transition-transform">
                <div className="rounded-xl bg-surface-2 p-2">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <p className="font-semibold text-xs">{row.label}</p>
                <p className="text-[11px] text-muted-foreground">{row.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
