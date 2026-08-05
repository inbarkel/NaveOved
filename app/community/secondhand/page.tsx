"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Plus, ShoppingBag, ChevronRight, Check, RotateCcw, Trash2 } from "lucide-react";
import { DEMO_SECONDHAND } from "@/lib/demo-data";
import { loadItems, saveItems } from "@/lib/community-storage";

const STORAGE_KEY = "community_secondhand";

export default function SecondhandPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", contactPhone: "" });
  const [items, setItems] = useState(DEMO_SECONDHAND);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setItems(loadItems(STORAGE_KEY, DEMO_SECONDHAND));
  }, []);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage("כותרת היא שדה חובה");
      return;
    }

    const newItem = {
      id: `s${Date.now()}`,
      title: formData.title,
      body: formData.body,
      contactPhone: formData.contactPhone,
      createdAt: new Date().toISOString(),
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveItems(STORAGE_KEY, updated);
    setMessage("✓ הפריט שלך הועלה לאישור הוועד");
    setFormData({ title: "", body: "", contactPhone: "" });
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

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

  const shouldShowRefreshPrompt = (item: typeof DEMO_SECONDHAND[0]) => {
    const baseDate = new Date(item.lastRenewedAt || item.createdAt);
    return baseDate < sevenDaysAgo && !item.resolvedAt;
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <div>
        <h1 className="font-sans text-2xl font-bold">יד שנייה</h1>
        <p className="text-sm text-muted-foreground mt-1">קנייה ומכירה של פריטים משומשים</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("✓") ? "bg-green-100/50 text-green-700" : "bg-red-100/50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const needsRefresh = shouldShowRefreshPrompt(item);
          return (
            <Card
              key={item.id}
              className={`p-4 ${item.resolvedAt ? "opacity-60" : ""} ${needsRefresh ? "border-yellow-400 dark:border-yellow-600" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-surface-2 p-2 shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.body}</p>
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="text-sm text-primary font-semibold mt-2 inline-block">
                      {item.contactPhone}
                    </a>
                  )}
                </div>
              </div>

              {needsRefresh && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
                  עברו 7 ימים - עדיין זמין?
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
                  {item.resolvedAt ? "נמכר" : "סימנו נמכר"}
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
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוסף פריט
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddItem} className="bg-surface rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">שם הפריט</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="למשל: אופני ילדים"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תיאור</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="מצב, גודל, מחיר..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">טלפון</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="050-1234567"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90">
              שלח לאישור
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 text-primary border border-primary rounded-lg font-semibold hover:bg-primary/10"
            >
              ביטול
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center">⏳ הפריט שלך יופיע כאן כשהוועד יאישור</p>
        </form>
      )}
    </div>
  );
}
