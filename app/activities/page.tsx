"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DEMO_CLUBS, type ClubEvent } from "@/lib/demo-data";
import { getIcon } from "@/lib/icons";
import { Clock, MapPin, X, Plus } from "lucide-react";
import {
  applyOverride,
  getDeletedActivityIds,
  getCustomActivities,
  addCustomActivity,
  getEffectiveDeadline,
} from "@/lib/activity-overrides";
import { useIsCommittee } from "@/lib/use-committee-role";

const AGE_RANGES = [
  { min: 0, max: 3, label: "0-3" },
  { min: 4, max: 6, label: "4-6" },
  { min: 7, max: 10, label: "7-10" },
  { min: 11, max: 15, label: "11-15" },
  { min: 16, max: 21, label: "16-21" },
  { min: 22, max: 40, label: "22-40" },
  { min: 41, max: 59, label: "41-59" },
  { min: 60, max: null, label: "60+" },
];

const EMPTY_NEW_ACTIVITY = {
  title: "",
  description: "",
  location: "",
  price: "",
  eventDateStr: "",
  instructorName: "",
  instructorPhone: "",
};

export default function ActivitiesPage() {
  const [scope, setScope] = useState<"internal" | "external">("internal");
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<ClubEvent[]>([]);
  const { isCommittee: isAdmin } = useIsCommittee();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newActivity, setNewActivity] = useState(EMPTY_NEW_ACTIVITY);

  useEffect(() => {
    setDeletedIds(getDeletedActivityIds());
    setCustomActivities(getCustomActivities());
  }, []);

  const now = new Date();

  const activities = [...DEMO_CLUBS.filter((e) => e.kind === "פעילות"), ...customActivities]
    .filter((event) => {
      if (deletedIds.includes(event.id)) return false;
      if (Boolean(event.isExternal) !== (scope === "external")) return false;
      // הסתרת פעילויות שעברו (אלא אם הן cancelled/postponed - אלו נשמרות עבור אדמינים)
      if (event.eventDate) {
        const eventDate = new Date(event.eventDate);
        if (eventDate < now && event.status === "active") {
          return false; // הסתרת פעילויות שעברו שהיו active
        }
      }
      if (scope === "external") return true;
      if (!ageFilter) return true;
      const range = AGE_RANGES.find((r) => r.label === ageFilter);
      if (!range) return true;
      return (event.ageMinYears ?? 0) <= range.min && (range.max === null || (event.ageMaxYears ?? 100) >= range.max);
    })
    .map((event) => applyOverride(event));

  const handleCreateExternalActivity = () => {
    if (!newActivity.title.trim() || !newActivity.eventDateStr) {
      alert("נא למלא לפחות שם ותאריך");
      return;
    }
    const event: ClubEvent = {
      id: `custom-${Date.now()}`,
      kind: "פעילות",
      title: newActivity.title,
      description: newActivity.description,
      iconKey: "map",
      price: newActivity.price || "כניסה חופשית",
      daysOfWeek: [],
      time: new Date(newActivity.eventDateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      location: newActivity.location,
      instructorName: newActivity.instructorName,
      instructorPhone: newActivity.instructorPhone,
      registered: 0,
      minRequired: 0,
      eventDate: new Date(newActivity.eventDateStr).toISOString(),
      status: "active",
      isExternal: true,
    };
    addCustomActivity(event);
    setCustomActivities(getCustomActivities());
    setNewActivity(EMPTY_NEW_ACTIVITY);
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">פעילויות</h1>
      <p className="text-sm text-muted-foreground">פעילויות שוטפות מהשנה</p>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setScope("internal")}
          className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
            scope === "internal"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-[var(--color-border)] text-muted-foreground"
          }`}
        >
          פעילויות במושב
        </button>
        <button
          onClick={() => setScope("external")}
          className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
            scope === "external"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-[var(--color-border)] text-muted-foreground"
          }`}
        >
          פעילויות מחוץ למושב
        </button>
      </div>

      {scope === "internal" && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setAgeFilter(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
              ageFilter === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-[var(--color-border)] text-muted-foreground"
            }`}
          >
            הכול
          </button>
          {AGE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setAgeFilter(range.label)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                ageFilter === range.label
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-[var(--color-border)] text-muted-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {scope === "external" && (
        <p className="text-xs text-muted-foreground">
          פעילויות שמתקיימות מחוץ למושב ומומלצות ע&quot;י הוועד - למידע בלבד, ללא הרשמה או תשלום דרך האפליקציה.
        </p>
      )}

      {scope === "external" && isAdmin && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary text-primary py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוספת פעילות מחוץ למושב
        </button>
      )}

      {activities.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {scope === "internal" ? "אין פעילויות כרגע" : "אין פעילויות מחוץ למושב כרגע"}
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((event) => {
            const Icon = getIcon(event.iconKey);
            const ageLabel = event.ageMinYears
              ? event.ageMaxYears
                ? `גילאי ${event.ageMinYears}–${event.ageMaxYears}`
                : `גיל ${event.ageMinYears}+`
              : null;
            const effectiveDeadline = event.isExternal ? null : getEffectiveDeadline(event);
            const registrationClosed = effectiveDeadline ? new Date() > effectiveDeadline : false;
            return (
              <div key={event.id} className="space-y-2">
                <Link href={`/activities/${event.id}`} className="block">
                  <Card className="p-4 active:scale-[0.99] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
                        <Icon className="w-6 h-6 text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-sans font-bold">{event.title}</p>
                          {event.status === "cancelled" && (
                            <span className="text-[11px] font-semibold rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-red-700 dark:text-red-300">
                              בוטל
                            </span>
                          )}
                          {event.status === "postponed" && (
                            <span className="text-[11px] font-semibold rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-green-700 dark:text-green-300">
                              נדחה
                              {event.rescheduledTo && (
                                <>
                                  {" · "}
                                  {new Date(event.rescheduledTo).toLocaleDateString("he-IL", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </>
                              )}
                            </span>
                          )}
                          {ageLabel && (
                            <span className="text-[11px] font-semibold rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">
                              {ageLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                          {event.eventDate ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" aria-hidden />
                              {new Date(event.eventDate).toLocaleDateString("he-IL", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              · {event.time}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" aria-hidden />
                              {event.daysOfWeek.join(", ")} · {event.time}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" aria-hidden />
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-secondary mt-1.5">{event.price}</p>
                        {effectiveDeadline && (
                          <p className={`text-xs font-semibold mt-1 ${registrationClosed ? "text-urgent" : "text-muted-foreground"}`}>
                            {registrationClosed
                              ? "ההרשמה נסגרה"
                              : `ניתן להירשם עד ${effectiveDeadline.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}`}
                          </p>
                        )}
                        {!event.isExternal && (
                          <div className="mt-3">
                            <ProgressBar
                              registered={event.registered}
                              minRequired={event.minRequired}
                              maxCapacity={event.maxCapacity}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
                {!event.isExternal && (
                  registrationClosed ? (
                    <button disabled className="w-full bg-surface-2 text-muted-foreground py-2 rounded-lg font-semibold cursor-not-allowed">
                      ההרשמה נסגרה
                    </button>
                  ) : (
                    <Link
                      href={`/activities/${event.id}`}
                      className="block w-full text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
                    >
                      להירשם
                    </Link>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create External Activity Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-sans text-xl font-bold">פעילות מחוץ למושב</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">שם הפעילות</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">תיאור</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">תאריך ושעה</label>
                <input
                  type="datetime-local"
                  value={newActivity.eventDateStr}
                  onChange={(e) => setNewActivity({ ...newActivity, eventDateStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">מיקום</label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">מחיר (תצוגה)</label>
                <input
                  type="text"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
                  placeholder='לדוגמה: "כניסה חופשית" או "50 ₪ לאדם"'
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">מארגן</label>
                <input
                  type="text"
                  value={newActivity.instructorName}
                  onChange={(e) => setNewActivity({ ...newActivity, instructorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">טלפון ליצירת קשר</label>
                <input
                  type="text"
                  value={newActivity.instructorPhone}
                  onChange={(e) => setNewActivity({ ...newActivity, instructorPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleCreateExternalActivity}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
            >
              פרסום
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
