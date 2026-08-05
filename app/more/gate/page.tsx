"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, DoorOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";

type RequestType = "add_phone" | "remove_phone" | "changed_phone" | "technical_issue" | "other";

const REQUEST_TYPES: { key: RequestType; label: string }[] = [
  { key: "add_phone", label: "אין לי גישה ב-PalGate - בקשת הצטרפות" },
  { key: "remove_phone", label: "הסרת מספר טלפון ישן" },
  { key: "changed_phone", label: "החלפתי מספר טלפון" },
  { key: "technical_issue", label: "השער לא נפתח / תקלה" },
  { key: "other", label: "בקשה אחרת" },
];

export default function GatePage() {
  const [selected, setSelected] = useState<RequestType | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-serif text-2xl font-bold">שער</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        פתיחת השער נעשית דרך אפליקציית PalGate. הוועד מנהל את רשימת המספרים המורשים בתוך PalGate עצמה.
      </p>

      <a
        href="https://www.pal-es.com/?lang=he"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4" aria-hidden />
          פתיחת אפליקציית PalGate
        </span>
        <ExternalLink className="w-4 h-4" aria-hidden />
      </a>

      <Card className="p-4">
        <p className="font-semibold mb-3">אין גישה, יש תקלה, או שהמספר שלכם השתנה?</p>
        {sent ? (
          <p className="text-sm text-primary font-semibold">הבקשה נשלחה לוועד. תקבלו עדכון בהקדם.</p>
        ) : (
          <div className="space-y-2">
            {REQUEST_TYPES.map((rt) => (
              <button
                key={rt.key}
                onClick={() => setSelected(rt.key)}
                className={`w-full text-start rounded-xl px-3 py-2.5 text-sm border transition-colors ${
                  selected === rt.key
                    ? "border-primary bg-surface-2 font-semibold"
                    : "border-[var(--color-border)]"
                }`}
              >
                {rt.label}
              </button>
            ))}
            <button
              disabled={!selected}
              onClick={() => setSent(true)}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold mt-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              שליחת בקשה לוועד
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
