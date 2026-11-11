"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEMO_CLUBS, type ClubEvent } from "@/lib/demo-data";
import { applyOverride, getCustomActivities, getDeletedActivityIds } from "@/lib/activity-overrides";

/**
 * לוח התורנות: השבוע של המושב כרשת. כל יום הוא עמודה, כל דבר שקורה בו הוא תא צבעוני.
 * בוחרים יום ורואים מה בו. זו הדרך המהירה ביותר לענות על "מה קורה היום?".
 */

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

type Kind = "trash" | "garden" | "club" | "activity";

interface Entry {
  kind: Kind;
  title: string;
  time?: string;
  href?: string;
  cancelled?: boolean;
}

const KIND_COLOR: Record<Kind, string> = {
  trash: "var(--rota-sky)",
  garden: "var(--rota-field)",
  club: "var(--rota-water)",
  activity: "var(--rota-violet)",
};

const KIND_LABEL: Record<Kind, string> = {
  trash: "אשפה",
  garden: "גזם",
  club: "חוגים",
  activity: "פעילויות",
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildEntries(date: Date, events: ClubEvent[]): Entry[] {
  const dow = date.getDay();
  const out: Entry[] = [];

  if ([0, 2, 4].includes(dow)) out.push({ kind: "trash", title: "פינוי אשפה" });
  if ([1, 4].includes(dow)) out.push({ kind: "garden", title: "פינוי גזם" });

  for (const e of events) {
    if (e.kind === "חוג") {
      if (!e.daysOfWeek.includes(DAY_NAMES[dow])) continue;
      if (e.startDate && startOfDay(date) < startOfDay(new Date(e.startDate))) continue;
      if (e.endDate && startOfDay(date) > startOfDay(new Date(e.endDate))) continue;
      if (e.status === "cancelled") continue;
      out.push({ kind: "club", title: e.title, time: e.time, href: `/clubs/${e.id}` });
    } else if (e.eventDate && sameDay(new Date(e.eventDate), date)) {
      out.push({
        kind: "activity",
        title: e.title,
        time: e.time,
        href: `/activities/${e.id}`,
        cancelled: e.status === "cancelled",
      });
    }
  }
  return out;
}

export function WeekRota() {
  const [today, setToday] = useState<Date | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setSelected(now.getDay());
    const deleted = getDeletedActivityIds();
    const all = [...DEMO_CLUBS, ...getCustomActivities()]
      .filter((e) => !deleted.includes(e.id))
      .map((e) => applyOverride(e));
    setEvents(all);
  }, []);

  const days = useMemo(() => {
    if (!today) return [];
    const sunday = startOfDay(today);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return { date: d, entries: buildEntries(d, events) };
    });
  }, [today, events]);

  if (!today) {
    return <div className="h-64 rounded-2xl border border-[var(--color-border)] bg-surface" aria-hidden />;
  }

  const current = days[selected];
  const isToday = (d: Date) => sameDay(d, today);

  return (
    <section aria-labelledby="week-heading" className="rounded-2xl border border-[var(--color-border)] bg-surface">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4">
        <h2 id="week-heading" className="text-lg font-extrabold">
          השבוע במושב
        </h2>
      </div>

      <div role="tablist" aria-label="ימות השבוע" className="mt-3 grid grid-cols-7 border-y border-[var(--color-border)]">
        {days.map(({ date, entries }, i) => {
          const active = i === selected;
          const todayCol = isToday(date);
          const kinds = Array.from(new Set(entries.map((e) => e.kind)));
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              aria-label={`יום ${DAY_NAMES[i]}, ${date.getDate()} בחודש${entries.length ? `, ${entries.length} פריטים` : ""}`}
              onClick={() => setSelected(i)}
              className={`flex flex-col items-center gap-1.5 px-1 py-3 transition-colors border-s border-[var(--color-border)] first:border-s-0 ${
                active ? "bg-surface-2" : "hover:bg-surface-2/60"
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground">{DAY_SHORT[i]}</span>
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-base font-bold ${
                  todayCol ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {date.getDate()}
              </span>
              <span className="flex h-3 items-center gap-0.5" aria-hidden>
                {kinds.map((k) => (
                  <span key={k} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: KIND_COLOR[k] }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" key={selected} className="swap px-4 py-3" aria-live="polite">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          {isToday(current.date) ? "היום, " : ""}יום {DAY_NAMES[selected]}
        </p>
        {current.entries.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">אין כלום ביומן ביום הזה.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {current.entries.map((e, idx) => {
              const inner = (
                <>
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px]" style={{ background: KIND_COLOR[e.kind] }} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-semibold leading-snug ${e.cancelled ? "text-muted-foreground line-through" : ""}`}>
                      {e.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {KIND_LABEL[e.kind]}
                      {e.cancelled ? " · בוטל" : ""}
                    </span>
                  </span>
                  {e.time && <bdi dir="ltr" className="shrink-0 text-sm font-medium text-muted-foreground">{e.time}</bdi>}
                </>
              );
              return (
                <li key={idx}>
                  {e.href ? (
                    <Link href={e.href} className="flex items-start gap-3 py-2.5 hover:bg-surface-2/50">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 py-2.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
