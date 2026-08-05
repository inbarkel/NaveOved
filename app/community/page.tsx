import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/lib/icons";

const TILES = [
  { label: "עסקים מקומיים", iconKey: "store", href: "/community/businesses" },
  { label: "יד שנייה", iconKey: "secondhand", href: "/community/secondhand" },
  { label: "אבידות ומציאות", iconKey: "lostfound", href: "/community/lostfound" },
  { label: "שכירות", iconKey: "land", href: "/community/rentals" },
  { label: "רעיונות והצבעות", iconKey: "idea", href: "/community/ideas" },
  { label: "גלריית קהילה", iconKey: "gallery", href: "/community/gallery" },
];

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">קהילה</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        עסקים, יד שנייה, אבידות ומציאות, שכירות, רעיונות והצבעות וגלריה — כל התוכן שהתושבים בעצמם יוצרים, במקום אחד.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => {
          const Icon = getIcon(tile.iconKey);
          return (
            <Link
              key={tile.label}
              href={tile.href}
              className="rounded-3xl border border-[var(--color-border)] bg-surface shadow-[var(--shadow-soft)] p-4 flex flex-col items-center gap-2 text-center active:scale-[0.97] transition-transform hover:bg-surface-2"
            >
              <div className="rounded-2xl bg-surface-2 p-3">
                <Icon className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <span className="font-semibold text-sm">{tile.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
