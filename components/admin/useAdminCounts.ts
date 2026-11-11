"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export interface AdminCounts {
  pendingResidents: number | null;
  openRequests: number | null;
  residents: number | null;
  announcements: number | null;
}

const EMPTY: AdminCounts = { pendingResidents: null, openRequests: null, residents: null, announcements: null };

async function count(table: string, filter?: (q: any) => any): Promise<number | null> {
  if (!supabase) return null;
  try {
    let q: any = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count: c, error } = await q;
    if (error) return null;
    return c ?? 0;
  } catch {
    return null;
  }
}

/** מספרים לסקירת הניהול. כל מספר נטען לבד; אם טבלה לא זמינה מוצג "—" ולא נשבר כלום. */
export function useAdminCounts() {
  const [counts, setCounts] = useState<AdminCounts>(EMPTY);

  const refresh = useCallback(async () => {
    const [pendingResidents, openRequests, residents, announcements] = await Promise.all([
      count("profiles", (q) => q.eq("status", "pending")),
      count("committee_requests", (q) => q.neq("status", "resolved")),
      count("profiles", (q) => q.eq("status", "active")),
      count("announcements"),
    ]);
    setCounts({ pendingResidents, openRequests, residents, announcements });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, refresh };
}
