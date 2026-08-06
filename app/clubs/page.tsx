"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DEMO_CLUBS, type ClubEvent } from "@/lib/demo-data";
import { getIcon } from "@/lib/icons";
import { Clock, MapPin, Plus } from "lucide-react";
import { applyOverride, getDeletedActivityIds, getEffectiveDeadline, getCustomActivities } from "@/lib/activity-overrides";
import { useIsCommittee } from "@/lib/use-committee-role";
import { CreateActivityForm } from "@/components/clubs/CreateActivityForm";

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

export default function ClubsPage() {
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [customClubs, setCustomClubs] = useState<ClubEvent[]>([]);
  const [showAddClub, setShowAddClub] = useState(false);
  const { isCommittee: isAdmin } = useIsCommittee();

  useEffect(() => {
    setDeletedIds(getDeletedActivityIds());
    setCustomClubs(getCustomActivities());
  }, []);

  const now = new Date();

  const clubs = [...DEMO_CLUBS, ...customClubs].filter((event) => {
    if (event.kind !== "חוג") return false;
    if (deletedIds.includes(event.id)) return false;
    // הסתרת חוגים שסיימו (אלא אם הם cancelled/postponed - אלו נשמרות עבור אדמינים)
    if (event.endDate) {
      const endDate = new Date(event.endDate);
      if (endDate < now && event.status === "active") {
        return false; // הסתרת חוגים שסיימו שהיו active
      }
    }
    if (!ageFilter) return true;
    const range = AGE_RANGES.find(r => r.label === ageFilter);
    if (!range) return true;
    return (event.ageMinYears ?? 0) <= range.min && (range.max === null || (event.ageMaxYears ?? 100) >= range.max);
  }).map((event) => applyOverride(event));


  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">חוגים</h1>
      <p className="text-sm text-muted-foreground">קדם-הרשמה לשנה הבאה</p>

      {isAdmin && (
        <button
          onClick={() => setShowAddClub(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary text-primary py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוספת חוג חדש
        </button>
      )}

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

      {clubs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">אין חוגים זמינים כרגע</p>
      ) : (
        <div className="space-y-4">
          {clubs.map((event) => {
            const Icon = getIcon(event.iconKey);
            const ageLabel = event.ageMinYears
              ? event.ageMaxYears
                ? `גילאי ${event.ageMinYears}–${event.ageMaxYears}`
                : `גיל ${event.ageMinYears}+`
              : null;
            const effectiveDeadline = getEffectiveDeadline(event);
            const registrationClosed = effectiveDeadline ? new Date() > effectiveDeadline : false;
            return (
              <div key={event.id} className="space-y-2">
                <Link href={`/clubs/${event.id}`} className="block">
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
                          <span className="text-[11px] font-semibold rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">
                            {event.kind}
                          </span>
                          {ageLabel && (
                            <span className="text-[11px] font-semibold rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">
                              {ageLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" aria-hidden />
                            {event.daysOfWeek.join(", ")} · {event.time}
                          </span>
                          {event.startDate && event.endDate && (
                            <span className="flex items-center gap-1 text-[10px]">
                              {new Date(event.startDate).toLocaleDateString("he-IL", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" – "}
                              {new Date(event.endDate).toLocaleDateString("he-IL", {
                                month: "short",
                                day: "numeric",
                              })}
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
                        <div className="mt-3">
                          <ProgressBar
                            registered={event.registered}
                            minRequired={event.minRequired}
                            maxCapacity={event.maxCapacity}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
                {registrationClosed ? (
                  <button disabled className="w-full bg-surface-2 text-muted-foreground py-2 rounded-lg font-semibold cursor-not-allowed">
                    ההרשמה נסגרה
                  </button>
                ) : (
                  <Link
                    href={`/clubs/${event.id}`}
                    className="block w-full text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
                  >
                    להירשם
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddClub && (
        <CreateActivityForm
          defaultKind="חוג"
          onClose={() => setShowAddClub(false)}
          onCreated={() => {
            setCustomClubs(getCustomActivities());
            setShowAddClub(false);
          }}
        />
      )}
    </div>
  );
}
