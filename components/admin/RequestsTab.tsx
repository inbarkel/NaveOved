"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";

type Status = "open" | "in_progress" | "resolved";

interface Req {
  id: string;
  user_id?: string;
  name?: string;
  subject: string;
  message: string;
  status: Status;
  response: string | null;
  created_at: string;
}

const LABEL: Record<Status, string> = { open: "חדשה", in_progress: "בטיפול", resolved: "טופלה" };
const CHIP: Record<Status, string> = {
  open: "bg-urgent/10 text-urgent",
  in_progress: "bg-accent/10 text-accent",
  resolved: "bg-secondary/10 text-secondary",
};

type Filter = "all" | Status;

export function RequestsTab({ onMessage, onChanged }: { onMessage: (m: string, t?: "success" | "error") => void; onChanged?: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Status>("in_progress");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      const stored = localStorage.getItem("committee_requests");
      setItems(stored ? JSON.parse(stored) : []);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("committee_requests")
      .select("id, user_id, subject, message, status, response, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      onMessage("לא הצלחנו לטעון את הפניות", "error");
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Req[];
    const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      names = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.full_name]));
    }
    setItems(rows.map((r) => ({ ...r, name: r.user_id ? names[r.user_id] : undefined })));
    setLoading(false);
  }, [onMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (r: Req) => {
    setOpenId(r.id === openId ? null : r.id);
    setReply(r.response ?? "");
    setStatus(r.status === "open" ? "in_progress" : r.status);
  };

  const save = async (r: Req) => {
    setSaving(true);
    try {
      if (!supabase) {
        const next = items.map((x) => (x.id === r.id ? { ...x, response: reply.trim() || null, status } : x));
        localStorage.setItem("committee_requests", JSON.stringify(next));
        setItems(next);
      } else {
        const { error } = await supabase
          .from("committee_requests")
          .update({
            response: reply.trim() || null,
            status,
            responded_by: user?.id,
            responded_at: new Date().toISOString(),
          })
          .eq("id", r.id);
        if (error) throw error;
        await load();
      }
      onMessage("הפנייה עודכנה");
      onChanged?.();
      setOpenId(null);
    } catch (e) {
      onMessage(e instanceof Error ? e.message : "שגיאה בשמירה", "error");
    } finally {
      setSaving(false);
    }
  };

  const shown = items.filter((i) => filter === "all" || i.status === filter);
  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "הכול" },
    { id: "open", label: "חדשות" },
    { id: "in_progress", label: "בטיפול" },
    { id: "resolved", label: "טופלו" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold">פניות תושבים</h2>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-surface p-1" role="group" aria-label="סינון לפי מצב">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">טוען פניות...</p>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-[var(--color-border)] bg-surface py-10 text-center text-muted-foreground">אין פניות בסינון הזה.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-surface">
          {shown.map((r) => (
            <li key={r.id}>
              <button onClick={() => open(r)} className="flex w-full items-start gap-3 px-4 py-3.5 text-start transition-colors hover:bg-surface-2" aria-expanded={openId === r.id}>
                <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${CHIP[r.status]}`}>{LABEL[r.status]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{r.subject}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.name ? `${r.name} · ` : ""}
                    {new Date(r.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                  </span>
                </span>
              </button>
              {openId === r.id && (
                <div className="space-y-3 border-t border-[var(--color-border)] bg-surface-2/50 px-4 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{r.message}</p>
                  <div>
                    <label htmlFor={`reply-${r.id}`} className="mb-1.5 block text-sm font-bold">
                      תשובה לתושב
                    </label>
                    <textarea
                      id={`reply-${r.id}`}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-surface px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      מצב
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                        className="rounded-lg border border-[var(--color-border)] bg-surface px-3 py-2"
                      >
                        <option value="open">חדשה</option>
                        <option value="in_progress">בטיפול</option>
                        <option value="resolved">טופלה</option>
                      </select>
                    </label>
                    <button
                      onClick={() => save(r)}
                      disabled={saving}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "שומר..." : "שמירה ושליחה לתושב"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
