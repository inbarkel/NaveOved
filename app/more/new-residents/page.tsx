"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, DoorOpen, Mailbox, UserCheck, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function NewResidentsPage() {
  const [mailboxSent, setMailboxSent] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-serif text-2xl font-bold">לתושבים חדשים</h1>
      <p className="text-sm text-muted-foreground -mt-3">ברוכים הבאים למושב! כל מה שצריך כדי להתארגן, במקום אחד.</p>

      <Link href="/more/gate" className="block">
        <Card className="p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
          <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
            <DoorOpen className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">רישום לשער</p>
            <p className="text-xs text-muted-foreground">בקשת הצטרפות ל-PalGate</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
        </Card>
      </Link>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
            <Mailbox className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <p className="font-semibold">רישום לתא דואר</p>
        </div>
        {mailboxSent ? (
          <p className="text-sm text-primary font-semibold">הבקשה נשלחה לוועד. תקבלו עדכון בהקדם.</p>
        ) : (
          <button
            onClick={() => setMailboxSent(true)}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            שליחת בקשה לתא דואר
          </button>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
            <UserCheck className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <p className="font-semibold">אישור תושבות</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          מצורף קישור לאתר עמק הירדן להנפקת אישור תושב
        </p>
        <a
          href="https://www.j-v.org.il/0-1767770555-%D7%94%D7%A0%D7%A4%D7%A7%D7%AA-%D7%90%D7%99%D7%A9%D7%95%D7%A8-%D7%AA%D7%95%D7%A9%D7%91/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg bg-primary/20 text-primary py-2 text-sm font-semibold hover:bg-primary/30 transition-colors"
        >
          📋 בקשת אישור תושב עמק הירדן
        </a>
      </Card>
    </div>
  );
}
