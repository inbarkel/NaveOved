"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Phone, Plus, Trash2, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase-client";
import { useIsCommittee } from "@/lib/use-committee-role";

interface Contact {
  id: string;
  category: string;
  name: string;
  phone: string;
  sort_order: number;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: "d1", category: "המושב", name: "מזכירות המושב", phone: "04-6750042", sort_order: 1 },
  { id: "d2", category: "המושב", name: "אבישג - יו״ר הועד", phone: "054-6388485", sort_order: 2 },
  { id: "d3", category: "המושב", name: "עליזה - מנהלת הקהילה", phone: "050-7799947", sort_order: 3 },
  { id: "d4", category: "מכולות", name: "מכולת נווה עובד - דוד", phone: "054-4450372", sort_order: 1 },
  { id: "d5", category: "מכולות", name: "ניני פיצוצייה", phone: "050-8552505", sort_order: 2 },
  { id: "d6", category: "שירותי רפואה", name: "טיפת חלב", phone: "04-6752043", sort_order: 1 },
  { id: "d7", category: "שירותי רפואה", name: "מרפאה", phone: "04-6750843", sort_order: 2 },
  { id: "d8", category: "מועצה", name: "קב״ט - משרד", phone: "04-6757640", sort_order: 1 },
  { id: "d9", category: "מועצה", name: "קב״ט - סלולרי", phone: "050-6272609", sort_order: 2 },
  { id: "d10", category: "בית חולים פוריה", name: "דלפק קבלה (מיון כללי)", phone: "04-6652886", sort_order: 1 },
  { id: "d11", category: "בית חולים פוריה", name: "דלפק קבלה (חלופי)", phone: "04-6652889", sort_order: 2 },
  { id: "d12", category: "בית חולים פוריה", name: "מוקד מיון יולדות", phone: "04-6652920", sort_order: 3 },
  { id: "d13", category: "חירום כללי", name: "משטרה", phone: "100", sort_order: 1 },
  { id: "d14", category: "חירום כללי", name: "אמבולנס", phone: "101", sort_order: 2 },
  { id: "d15", category: "חירום כללי", name: "מכבי אש", phone: "102", sort_order: 3 },
];

const EMPTY_FORM = { category: "", name: "", phone: "" };
const NEW_CATEGORY = "__new__";
const CATEGORY_ORDER = ["המושב", "מכולות", "שירותי רפואה", "בית חולים פוריה", "מועצה", "חירום כללי"];

function compareCategories(a: string, b: string) {
  const ai = CATEGORY_ORDER.indexOf(a);
  const bi = CATEGORY_ORDER.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b, "he");
}

export default function ContactsPage() {
  const { isCommittee: isAdmin } = useIsCommittee();
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("contacts")
      .select("id, category, name, phone, sort_order")
      .order("category")
      .order("sort_order");
    if (error) {
      console.error("Error loading contacts:", error);
    } else if (data) {
      setContacts(data);
    }
    setIsLoading(false);
  };

  const grouped = contacts.reduce<Record<string, Contact[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort(compareCategories);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsNewCategory(categories.length === 0);
    setShowForm(true);
  };

  const openEditForm = (c: Contact) => {
    setEditingId(c.id);
    setForm({ category: c.category, name: c.name, phone: c.phone });
    setIsNewCategory(!categories.includes(c.category));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.name.trim() || !form.phone.trim()) {
      setMessage("❌ נא למלא את כל השדות");
      return;
    }
    if (!supabase) {
      setMessage("❌ צריך חיבור לשרת כדי לשמור");
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase
          .from("contacts")
          .update({ category: form.category.trim(), name: form.name.trim(), phone: form.phone.trim() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contacts").insert({
          category: form.category.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          sort_order: 99,
        });
        if (error) throw error;
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadContacts();
    } catch (err) {
      console.error("Error saving contact:", err);
      setMessage("❌ שגיאה בשמירה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm("למחוק את איש הקשר?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      console.error("Error deleting contact:", error);
      setMessage("❌ שגיאה במחיקה");
      return;
    }
    await loadContacts();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-sans text-2xl font-bold">מספרי טלפון חשובים</h1>

      {message && (
        <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-700">{message}</div>
      )}

      {isAdmin && (
        <button
          onClick={openAddForm}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary text-primary py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוספת איש קשר
        </button>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {categories.map((category) => {
            const numbers = grouped[category];
            return (
            <div key={category}>
              <h2 className="font-sans font-bold text-sm text-muted-foreground mb-2 px-1">{category}</h2>
              <div className="space-y-2">
                {numbers.map((contact) => (
                  <Card key={contact.id} className="p-3 flex items-center justify-between hover:bg-surface-2">
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-sm text-primary font-mono font-bold">{contact.phone}</p>
                      </div>
                    </a>
                    {isAdmin ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditForm(contact)}
                          className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
                          aria-label="עריכה"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          aria-label="מחיקה"
                        >
                          <Trash2 className="w-4 h-4 text-red-700 dark:text-red-300" />
                        </button>
                      </div>
                    ) : (
                      <Phone className="w-4 h-4 text-primary shrink-0 ml-2" aria-hidden />
                    )}
                  </Card>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-sans text-xl font-bold">{editingId ? "עריכת איש קשר" : "הוספת איש קשר"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">קטגוריה</label>
                {!isNewCategory ? (
                  <select
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === NEW_CATEGORY) {
                        setIsNewCategory(true);
                        setForm({ ...form, category: "" });
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                  >
                    <option value="" disabled>
                      בחר קטגוריה
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value={NEW_CATEGORY}>+ קטגוריה חדשה...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="שם הקטגוריה החדשה"
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                    />
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCategory(false);
                          setForm({ ...form, category: "" });
                        }}
                        className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-muted-foreground hover:bg-surface-2 transition-colors"
                      >
                        ביטול
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">שם</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">טלפון</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              שמירה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
