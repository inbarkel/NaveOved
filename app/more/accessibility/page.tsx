'use client';

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <Link href="/more" className="flex items-center gap-2 text-primary mb-6 hover:opacity-80">
        <ChevronRight className="w-4 h-4 rotate-180" />
        חזרה
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">הצהרת נגישות</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">התחייבותנו לנגישות</h2>
          <p className="text-foreground/90">
            אנו מחויבים להפוך את האתר הזה נגיש לכל, כולל אנשים עם מוגבלויות.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">תכונות נגישות</h2>
          <ul className="text-foreground/90 space-y-2">
            <li>• תאימות עם קוראי מסך</li>
            <li>• ניווט באמצעות מקלדת</li>
            <li>• אפשרות טקסט גדול</li>
            <li>• ניגודיות גבוהה</li>
            <li>• כתובות alt לתמונות</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">דיווח על בעיות נגישות</h2>
          <p className="text-foreground/90">
            אם נתקלת בבעיות נגישות באתר זה, אנא צור קשר עם הועד כדי לדווח על הבעיה.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">תקנים</h2>
          <p className="text-foreground/90">
            אנו משתדלים להיות תואמים ל-WCAG 2.1 ברמה AA.
          </p>
        </section>
      </div>
    </div>
  );
}
