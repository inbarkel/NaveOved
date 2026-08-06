"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";

interface CommitteeRequest {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  response: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<CommitteeRequest["status"], string> = {
  open: "התקבלה",
  in_progress: "בטיפול",
  resolved: "טופלה",
};

const STATUS_STYLES: Record<CommitteeRequest["status"], string> = {
  open: "bg-surface-2 text-muted-foreground",
  in_progress: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  resolved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

export default function CommitteeRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<CommitteeRequest[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    setIsLoadingList(true);
    if (!supabase) {
      const stored = localStorage.getItem("committee_requests");
      setRequests(stored ? JSON.parse(stored) : []);
      setIsLoadingList(false);
      return;
    }
    const { data, error } = await supabase
      .from("committee_requests")
      .select("id, subject, message, status, response, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading requests:", error);
    } else {
      setRequests(data || []);
    }
    setIsLoadingList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      setFeedback("❌ נא למלא נושא ותוכן");
      return;
    }

    setIsSending(true);
    setFeedback("");

    try {
      if (!supabase) {
        const stored = localStorage.getItem("committee_requests");
        const existing: CommitteeRequest[] = stored ? JSON.parse(stored) : [];
        const newRequest: CommitteeRequest = {
          id: Date.now().toString(),
          subject: subject.trim(),
          message: message.trim(),
          status: "open",
          response: null,
          created_at: new Date().toISOString(),
        };
        const updated = [newRequest, ...existing];
        localStorage.setItem("committee_requests", JSON.stringify(updated));
        setRequests(updated);
      } else {
        const { error } = await supabase.from("committee_requests").insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
        });
        if (error) throw error;
        await loadRequests();
      }
      setSubject("");
      setMessage("");
      setFeedback("✓ הפנייה נשלחה לוועד");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      console.error("Error sending request:", err);
      setFeedback("❌ שגיאה בשליחת הפנייה");
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-sans text-2xl font-bold">פניות לועד</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        שליחת פנייה או בקשה ישירות לוועד. תוכלו לעקוב אחרי הסטטוס כאן.
      </p>

      <Card className="p-4 space-y-3">
        {feedback && (
          <div className={`p-3 rounded-lg text-sm ${feedback.includes("✓") ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}>
            {feedback}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">נושא</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="למשל: תאורה ברחוב לא עובדת"
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תוכן הפנייה</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="פרטו כאן את הבקשה או התקלה..."
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden />
            {isSending ? "שולח..." : "שליחה לוועד"}
          </button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">הפניות שלי</h2>
        {isLoadingList ? (
          <p className="text-sm text-muted-foreground">טוען...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">עדיין לא שלחת פניות לוועד.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Card key={req.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{req.subject}</p>
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${STATUS_STYLES[req.status]}`}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{req.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {req.response && (
                  <div className="bg-primary/10 rounded-xl p-3 mt-2">
                    <p className="text-xs font-semibold text-primary mb-1">תגובת הוועד</p>
                    <p className="text-sm">{req.response}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
