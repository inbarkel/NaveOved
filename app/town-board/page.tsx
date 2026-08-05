"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DEMO_TOWN_BOARD, type TownBoardItem } from "@/lib/demo-data";
import { Briefcase, Megaphone } from "lucide-react";

const CATEGORIES: { key: TownBoardItem["category"] | "all"; label: string }[] = [
  { key: "all", label: "הכול" },
  { key: "committee_notice", label: "הודעות ועד" },
  { key: "job", label: "דרושים" },
];

const CATEGORY_ICON = {
  job: Briefcase,
  committee_notice: Megaphone,
} as const;

export default function TownBoardPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["key"]>("all");
  const items = filter === "all" ? DEMO_TOWN_BOARD : DEMO_TOWN_BOARD.filter((i) => i.category === filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">לוח היישוב</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
              filter === c.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-[var(--color-border)] text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = CATEGORY_ICON[item.category];
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-surface-2 p-2 shrink-0">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-bold">{item.title}</p>
                  <p className="text-sm mt-1 text-foreground/90">{item.body}</p>
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="text-sm text-primary font-semibold mt-2 inline-block">
                      {item.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">אין פריטים בקטגוריה זו כרגע.</p>}
      </div>
    </div>
  );
}
