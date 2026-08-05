"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Plus, Phone, ChevronRight, Check, X } from "lucide-react";
import { loadItems, saveItems } from "@/lib/community-storage";
import { getIcon } from "@/lib/icons";
import { useIsCommittee } from "@/lib/use-committee-role";

const STORAGE_KEY = "community_businesses";

const CATEGORIES = [
  { value: "food", label: "מזון ומאפים", iconKey: "food" },
  { value: "beauty", label: "בריאות ויופי", iconKey: "beauty" },
  { value: "services", label: "שירותים ותיקונים", iconKey: "services" },
  { value: "education", label: "חינוך והדרכה", iconKey: "education" },
  { value: "home", label: "בית וגינה", iconKey: "home" },
  { value: "other", label: "אחר", iconKey: "store" },
];

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || "אחר";
}

function categoryIconKey(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.iconKey || "store";
}

interface Business {
  id: number;
  name: string;
  description: string;
  phone: string;
  category: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
}

const DEMO_BUSINESSES: Business[] = [
  { id: 1, name: "דיירות יוחנה", description: "יוחנה מייצרת ממרמלדים ודבש טבעי", phone: "050-123-4567", category: "food", status: "approved", createdAt: "2026-07-01T00:00:00" },
  { id: 2, name: "אריזה כחולה", description: "שירותי אריזה וקבלנות למשפחה", phone: "050-234-5678", category: "services", status: "approved", createdAt: "2026-07-02T00:00:00" },
  { id: 3, name: "ספרות וספרים", description: "קנייה ומכירה של ספרים משומשים", phone: "050-345-6789", category: "education", status: "approved", createdAt: "2026-07-03T00:00:00" },
];

export default function BusinessesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", phone: "", category: CATEGORIES[0].value });
  const [businesses, setBusinesses] = useState<Business[]>(DEMO_BUSINESSES);
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { isCommittee: isAdmin } = useIsCommittee();

  useEffect(() => {
    setBusinesses(loadItems(STORAGE_KEY, DEMO_BUSINESSES));
  }, []);

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage("שם העסק הוא שדה חובה");
      return;
    }

    const isDuplicate = businesses.some(
      (b) => b.status !== "rejected" && b.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setMessage("❌ עסק בשם הזה כבר קיים או ממתין לאישור");
      return;
    }

    const updated: Business[] = [
      ...businesses,
      { id: Date.now(), ...formData, status: "pending", createdAt: new Date().toISOString() },
    ];
    setBusinesses(updated);
    saveItems(STORAGE_KEY, updated);
    setMessage("✓ העסק שלך הועלה לאישור הוועד");
    setFormData({ name: "", description: "", phone: "", category: CATEGORIES[0].value });
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const approveBusiness = (id: number) => {
    const updated = businesses.map((b) => (b.id === id ? { ...b, status: "approved" as const } : b));
    setBusinesses(updated);
    saveItems(STORAGE_KEY, updated);
  };

  const rejectBusiness = (id: number) => {
    const updated = businesses.map((b) => (b.id === id ? { ...b, status: "rejected" as const } : b));
    setBusinesses(updated);
    saveItems(STORAGE_KEY, updated);
  };

  const approvedBusinesses = businesses.filter(
    (b) => b.status === "approved" && (!categoryFilter || b.category === categoryFilter)
  );
  const pendingBusinesses = businesses.filter((b) => b.status === "pending");

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <div>
        <h1 className="font-sans text-2xl font-bold">עסקים מקומיים</h1>
        <p className="text-sm text-muted-foreground mt-1">עסקים של תושבים המושב</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("✓") ? "bg-green-100/50 text-green-700" : "bg-red-100/50 text-red-700"}`}>
          {message}
        </div>
      )}

      {isAdmin && pendingBusinesses.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">ממתינים לאישור ({pendingBusinesses.length})</h2>
          {pendingBusinesses.map((business) => (
            <Card key={business.id} className="p-4 border-amber-300 dark:border-amber-700">
              <p className="font-semibold">{business.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{categoryLabel(business.category)}</p>
              <p className="text-sm text-muted-foreground mt-1">{business.description}</p>
              {business.phone && <p className="text-sm text-primary font-semibold mt-1">{business.phone}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => approveBusiness(business.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  אשר
                </button>
                <button
                  onClick={() => rejectBusiness(business.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  דחה
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
            categoryFilter === null
              ? "bg-primary text-primary-foreground border-primary"
              : "border-[var(--color-border)] text-muted-foreground"
          }`}
        >
          הכול
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
              categoryFilter === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-[var(--color-border)] text-muted-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {approvedBusinesses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">אין עסקים בקטגוריה זו כרגע</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {approvedBusinesses.map((business) => {
            const Icon = getIcon(categoryIconKey(business.category));
            return (
              <Card key={business.id} className="p-3 flex flex-col items-center text-center gap-1">
                <div className="rounded-xl bg-surface-2 p-2.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{business.name}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{categoryLabel(business.category)}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{business.description}</p>
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="text-xs text-primary font-semibold mt-1 inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {business.phone}
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוסף עסק
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddBusiness} className="bg-surface rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">שם העסק</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="שם העסק"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">קטגוריה</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תיאור</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="מה אתה עושה?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">טלפון</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="050-123-4567"
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
          <p className="text-xs text-muted-foreground text-center">⏳ העסק שלך יופיע כאן כשהוועד יאשר</p>
        </form>
      )}
    </div>
  );
}
