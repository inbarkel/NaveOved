'use client';

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <Link href="/more" className="flex items-center gap-2 text-primary mb-6 hover:opacity-80">
        <ChevronRight className="w-4 h-4 rotate-180" />
        חזרה
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">מדיניות הפרטיות</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">איסוף מידע</h2>
          <p className="text-foreground/90">
            אנו אוספים מידע שאתה מספק ישירות, כגון שם, טלפון, וכתובת אימייל, למטרות תקשורת וטיפול בבקשות שלך.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">השימוש במידע</h2>
          <p className="text-foreground/90">
            המידע שלך משמש לשם:
          </p>
          <ul className="text-foreground/90 space-y-2 mt-2">
            <li>• תקשורת עם תושבים</li>
            <li>• טיפול בחוגים ופעילויות</li>
            <li>• שמירה וביטחון אתר</li>
            <li>• שיפור השירות</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">שיתוף מידע</h2>
          <p className="text-foreground/90">
            אנו לא משתפים את המידע שלך עם צדדים שלישיים ללא הסכמתך.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">אבטחה</h2>
          <p className="text-foreground/90">
            אנו משתדלים להגן על המידע שלך עם אמצעי אבטחה סבירים.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">זכויותיך</h2>
          <p className="text-foreground/90">
            יש לך זכות לגשת ולתקן את המידע האישי שלך. צור קשר עם הועד לבקשות כאלה.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">שינויים במדיניות</h2>
          <p className="text-foreground/90">
            אנו עשויים לעדכן מדיניות זו. השימוש המתמשך באתר מהווה הסכמה לשינויים.
          </p>
        </section>
      </div>
    </div>
  );
}
