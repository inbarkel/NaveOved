"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ClubEvent } from "@/lib/demo-data";
import { addCustomActivity } from "@/lib/activity-overrides";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const EMPTY_FORM = {
  kind: "פעילות" as "פעילות" | "חוג",
  title: "",
  description: "",
  location: "",
  instructorName: "",
  instructorPhone: "",
  price: "",
  priceAmount: "",
  ageMinYears: "",
  ageMaxYears: "",
  minRequired: "",
  maxCapacity: "",
  eventDateStr: "",
  startDate: "",
  endDate: "",
  time: "",
  daysOfWeek: [] as string[],
};

export function CreateActivityForm({
  defaultKind,
  onClose,
  onCreated,
}: {
  defaultKind: "פעילות" | "חוג";
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, kind: defaultKind });
  const [error, setError] = useState("");

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter((d) => d !== day) : [...f.daysOfWeek, day],
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setError("נא למלא שם");
      return;
    }
    if (form.kind === "פעילות" && !form.eventDateStr) {
      setError("נא למלא תאריך ושעה לפעילות");
      return;
    }
    if (form.kind === "חוג" && (form.daysOfWeek.length === 0 || !form.time)) {
      setError("נא לבחור ימים ושעה לחוג");
      return;
    }

    const event: ClubEvent = {
      id: `custom-${Date.now()}`,
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim(),
      iconKey: form.kind === "חוג" ? "book" : "map",
      price: form.price.trim() || "כניסה חופשית",
      priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined,
      daysOfWeek: form.kind === "חוג" ? form.daysOfWeek : [],
      time: form.kind === "חוג" ? form.time : new Date(form.eventDateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      location: form.location.trim(),
      instructorName: form.instructorName.trim(),
      instructorPhone: form.instructorPhone.trim(),
      registered: 0,
      minRequired: form.minRequired ? Number(form.minRequired) : 0,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
      ageMinYears: form.ageMinYears ? Number(form.ageMinYears) : undefined,
      ageMaxYears: form.ageMaxYears ? Number(form.ageMaxYears) : undefined,
      eventDate: form.kind === "פעילות" ? new Date(form.eventDateStr).toISOString() : undefined,
      startDate: form.kind === "חוג" ? form.startDate || undefined : undefined,
      endDate: form.kind === "חוג" ? form.endDate || undefined : undefined,
      status: "active",
      isExternal: false,
    };
    addCustomActivity(event);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-sans text-xl font-bold">הוספת {form.kind === "חוג" ? "חוג" : "פעילות"} חדשה</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-700">{error}</div>}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY_FORM, kind: "פעילות" })}
            className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
              form.kind === "פעילות" ? "bg-primary text-white border-primary" : "border-[var(--color-border)] text-muted-foreground"
            }`}
          >
            פעילות
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY_FORM, kind: "חוג" })}
            className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
              form.kind === "חוג" ? "bg-primary text-white border-primary" : "border-[var(--color-border)] text-muted-foreground"
            }`}
          >
            חוג
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">שם</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תיאור</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
            />
          </div>

          {form.kind === "פעילות" ? (
            <div>
              <label className="block text-sm font-semibold mb-1">תאריך ושעה</label>
              <input
                type="datetime-local"
                value={form.eventDateStr}
                onChange={(e) => setForm({ ...form, eventDateStr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">ימים</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.daysOfWeek.includes(day)
                          ? "bg-primary text-white border-primary"
                          : "border-[var(--color-border)] text-muted-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">שעה</label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="לדוגמה: 18:00–19:00"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">תאריך התחלה</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">תאריך סיום</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">מיקום</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold mb-1">מחיר (תצוגה)</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder='"כניסה חופשית" או "80 ₪ לחודש"'
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">מחיר לאדם (₪)</label>
              <input
                type="number"
                value={form.priceAmount}
                onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold mb-1">גיל מינימום</label>
              <input
                type="number"
                value={form.ageMinYears}
                onChange={(e) => setForm({ ...form, ageMinYears: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">גיל מקסימום</label>
              <input
                type="number"
                value={form.ageMaxYears}
                onChange={(e) => setForm({ ...form, ageMaxYears: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold mb-1">מינימום משתתפים</label>
              <input
                type="number"
                value={form.minRequired}
                onChange={(e) => setForm({ ...form, minRequired: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">מקסימום משתתפים</label>
              <input
                type="number"
                value={form.maxCapacity}
                onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">איש קשר / מדריך</label>
            <input
              type="text"
              value={form.instructorName}
              onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">טלפון</label>
            <input
              type="text"
              value={form.instructorPhone}
              onChange={(e) => setForm({ ...form, instructorPhone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
        >
          פרסום
        </button>
      </div>
    </div>
  );
}
