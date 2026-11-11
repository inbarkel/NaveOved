"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { AdminCounts } from "./useAdminCounts";

type TabId = "overview" | "announcements" | "registrations" | "content" | "committee" | "users" | "requests" | "moderation" | "gate";

function fmt(n: number | null) {
  return n === null ? "—" : String(n);
}

export function OverviewTab({ counts, goTo }: { counts: AdminCounts; goTo: (t: TabId) => void }) {
  const attention: { label: string; tab: TabId; n: number }[] = [];
  if (counts.pendingResidents) {
    attention.push({
      label: counts.pendingResidents === 1 ? "תושב אחד מחכה לאישור" : `${counts.pendingResidents} תושבים מחכים לאישור`,
      tab: "users",
      n: counts.pendingResidents,
    });
  }
  if (counts.openRequests) {
    attention.push({
      label: counts.openRequests === 1 ? "פנייה אחת פתוחה לוועד" : `${counts.openRequests} פניות פתוחות לוועד`,
      tab: "requests",
      n: counts.openRequests,
    });
  }

  const stats = [
    { label: "תושבים פעילים", value: counts.residents, tab: "users" as TabId },
    { label: "ממתינים לאישור", value: counts.pendingResidents, tab: "users" as TabId, warn: !!counts.pendingResidents },
    { label: "פניות פתוחות", value: counts.openRequests, tab: "requests" as TabId, warn: !!counts.openRequests },
    { label: "הודעות שפורסמו", value: counts.announcements, tab: "announcements" as TabId },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="attn">
        <h2 id="attn" className="mb-2 text-lg font-extrabold">מה דורש טיפול</h2>
        {attention.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-surface px-4 py-4 text-sm">
            <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden />
            <span className="font-semibold">הכול מטופל. אין בקשות שמחכות.</span>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-surface">
            {attention.map((a) => (
              <li key={a.tab}>
                <button
                  onClick={() => goTo(a.tab)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-surface-2"
                >
                  <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-accent px-2 text-sm font-bold text-accent-foreground">
                    {a.n}
                  </span>
                  <span className="flex-1 font-semibold">{a.label}</span>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="stats">
        <h2 id="stats" className="mb-2 text-lg font-extrabold">במבט אחד</h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-4">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => goTo(s.tab)}
              className="bg-surface px-4 py-4 text-start transition-colors hover:bg-surface-2"
            >
              <span className={`block text-3xl font-extrabold leading-none ${s.warn ? "text-accent" : ""}`}>{fmt(s.value)}</span>
              <span className="mt-2 block text-sm text-muted-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick">
        <h2 id="quick" className="mb-2 text-lg font-extrabold">פעולות מהירות</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => goTo("announcements")} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
            פרסום הודעה
          </button>
          <button onClick={() => goTo("content")} className="rounded-lg border border-[var(--color-border)] bg-surface px-4 py-2.5 text-sm font-bold hover:bg-surface-2">
            הוספת פעילות או חוג
          </button>
          <button onClick={() => goTo("requests")} className="rounded-lg border border-[var(--color-border)] bg-surface px-4 py-2.5 text-sm font-bold hover:bg-surface-2">
            מענה לפניות
          </button>
        </div>
      </section>
    </div>
  );
}
