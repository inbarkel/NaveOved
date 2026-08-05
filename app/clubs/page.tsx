"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DEMO_CLUBS } from "@/lib/demo-data";
import { getIcon } from "@/lib/icons";
import { Clock, MapPin, X } from "lucide-react";
import { applyOverride, getDeletedActivityIds, getEffectiveDeadline } from "@/lib/activity-overrides";

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
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [names, setNames] = useState("");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    setDeletedIds(getDeletedActivityIds());
  }, []);

  const now = new Date();

  const clubs = DEMO_CLUBS.filter((event) => {
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

  const currentClub = clubs.find(c => c.id === selectedClub);

  const handleRegister = () => {
    if (!names.trim()) {
      alert("אנא הזן את שמות המשתתפים");
      return;
    }
    setRegistered(true);
    setTimeout(() => {
      setSelectedClub(null);
      setParticipants(1);
      setNames("");
      setRegistered(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="font-sans text-2xl font-bold">חוגים</h1>
      <p className="text-sm text-muted-foreground">קדם-הרשמה לשנה הבאה</p>

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
                <button
                  onClick={() => setSelectedClub(event.id)}
                  disabled={registrationClosed}
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors disabled:bg-surface-2 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {registrationClosed ? "ההרשמה נסגרה" : "להירשם"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {selectedClub && currentClub && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 animate-slide-up">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-sans text-xl font-bold">הרשמה ל{currentClub.title}</h2>
              <button
                onClick={() => setSelectedClub(null)}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Registration Info */}
            {!registered ? (
              <div className="space-y-4">
                <div className="bg-surface-2 rounded-2xl p-4 space-y-2">
                  <p className="font-semibold text-sm">💳 סוג התשלום</p>
                  <p className="text-sm text-muted-foreground">
                    {currentClub.kind === "חוג"
                      ? "הוראת קבע חודשית מתחילת החוג עד הסוף (עד יולי 2027)"
                      : "תשלום חד פעמי"}
                  </p>
                </div>

                <div className="bg-surface-2 rounded-2xl p-4 space-y-2">
                  <p className="font-semibold text-sm">💰 סכום</p>
                  {currentClub.priceAmount ? (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {currentClub.priceAmount} ₪ × {participants} {participants === 1 ? "משתתף" : "משתתפים"}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {currentClub.priceAmount * participants} ₪
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-primary">{currentClub.price}</p>
                  )}
                </div>

                <div className="bg-primary/10 rounded-2xl p-4 space-y-2">
                  <p className="font-semibold text-sm">📍 מקום</p>
                  <p className="text-sm">{currentClub.location}</p>
                </div>

                {/* Participants */}
                <div className="space-y-3 bg-surface-2 rounded-2xl p-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">👥 כמה משתתפים?</label>
                    <select
                      value={participants}
                      onChange={(e) => setParticipants(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "אדם" : "אנשים"}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">📝 שמות המשתתפים</label>
                    <textarea
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      placeholder="שם אחד בכל שורה&#10;למשל:&#10;רונית כהן&#10;דני כהן"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
                >
                  המשך לתשלום
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <p className="text-lg font-bold text-primary">✓ נרשמת בהצלחה!</p>
                <p className="text-sm text-muted-foreground">ההרשמה שלך אושרה. תקבלו הודעת אישור בדוא"ל.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
