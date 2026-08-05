"use client";

import Link from "next/link";
import { ChevronRight, Check, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DEMO_RENTALS } from "@/lib/demo-data";
import { loadItems, saveItems } from "@/lib/community-storage";

const STORAGE_KEY = "community_rentals";

export default function RentalsPage() {
  const [items, setItems] = useState(DEMO_RENTALS);

  useEffect(() => {
    setItems(loadItems(STORAGE_KEY, DEMO_RENTALS));
  }, []);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const toggleResolved = (id: string) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, resolvedAt: item.resolvedAt ? undefined : new Date().toISOString() }
        : item
    );
    setItems(updated);
    saveItems(STORAGE_KEY, updated);
  };

  const renewItem = (id: string) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, lastRenewedAt: new Date().toISOString() }
        : item
    );
    setItems(updated);
    saveItems(STORAGE_KEY, updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveItems(STORAGE_KEY, updated);
  };

  const shouldShowRefreshPrompt = (item: (typeof DEMO_RENTALS)[number]) => {
    const baseDate = new Date(item.lastRenewedAt || item.createdAt);
    return baseDate < sevenDaysAgo && !item.resolvedAt;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה לקהילה
      </Link>
      <h1 className="font-sans text-2xl font-bold">שכירות</h1>

      <div className="space-y-3">
        {items.map((item) => {
          const needsRefresh = shouldShowRefreshPrompt(item);
          return (
            <Card
              key={item.id}
              className={`p-4 ${item.resolvedAt ? "opacity-60" : ""} ${needsRefresh ? "border-yellow-400 dark:border-yellow-600" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm mt-1 text-foreground/90">{item.body}</p>
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="text-sm text-primary font-semibold mt-2 inline-block">
                      {item.contactPhone}
                    </a>
                  )}
                </div>
              </div>

              {needsRefresh && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
                  עברו 7 ימים מהפוסט - עדיין רלוונטי?
                </div>
              )}

              {item.resolvedAt && (
                <div className="mt-2 text-xs text-green-700 dark:text-green-300 font-semibold">
                  ✓ סימנת כפתור - אנחנו יכולים למחוק
                </div>
              )}

              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => toggleResolved(item.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    item.resolvedAt
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {item.resolvedAt ? "פתור" : "סימנו פתור"}
                </button>

                {needsRefresh && (
                  <button
                    onClick={() => renewItem(item.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    לחדש מודעה
                  </button>
                )}

                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  מחק
                </button>
              </div>
            </Card>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">אין מודעות שכירות כרגע.</p>
        )}
      </div>
    </div>
  );
}
