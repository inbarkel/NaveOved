import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/lib/icons";

interface InfoSection {
  key: string;
  label: string;
  iconKey: string;
  body: string;
  verified: boolean;
}

/**
 * תוכן ראשוני שנאסף בחיפוש ברשת (סבב 6 בתכנון) על סמך מקורות ציבוריים —
 * לא הומצא. פריטים בטיחותיים-קריטיים (מקלטים) שלא נמצא להם מקור מהימן
 * מסומנים "טעון אימות מול הוועד" ולא מוצגים כעובדה סופית.
 */
const SECTIONS: InfoSection[] = [
  {
    key: "trash",
    label: "פינוי אשפה ומיחזור",
    iconKey: "trash",
    body: "לוח הפינוי המדויק (ימים וסוגי פסולת) טעון אימות מול הוועד — יעודכן כאן עם הנתונים הרשמיים.",
    verified: false,
  },
  {
    key: "shelters",
    label: "מקלטים",
    iconKey: "shield",
    body: "לא אותר מידע מהימן על מיקומי המקלטים ביישוב. זהו מידע בטיחותי קריטי — יפורסם רק לאחר אישור הוועד.",
    verified: false,
  },
  {
    key: "parks",
    label: "גנים וגני שעשועים",
    iconKey: "trees",
    body: "בפוריה נווה עובד פועלים גני ילדים לגילאי 3 חודשים עד 6 שנים במסגרת החינוך הממלכתי.",
    verified: true,
  },
  {
    key: "sports",
    label: "מתקני ספורט",
    iconKey: "ball",
    body: "באזור פוריה קיימים מגרשי ספורט (מיני-כדורגל וכדורסל) לצד מגרש כדורגל בדשא.",
    verified: true,
  },
  {
    key: "health",
    label: "בריאות",
    iconKey: "health",
    body: "סניף קופת חולים פועל ביישוב הסמוך פוריה עילית. פרטי מרפאה/טיפת חלב מקומיים מדויקים טעונים אימות מול הוועד.",
    verified: false,
  },
];

export default function InfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-serif text-2xl font-bold">מידע שימושי</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        פוריה נווה עובד הוקמה ב-1949 בידי עולים מצפון אפריקה, שייכת למועצה האזורית עמק הירדן ויושבת על רכס פוריה מול הכנרת והר תבור.
      </p>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const Icon = getIcon(s.iconKey);
          return (
            <Card key={s.key} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-surface-2 p-2 shrink-0">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-sm mt-1 text-foreground/90">{s.body}</p>
                  {!s.verified && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-urgent">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                      טעון אימות מול הוועד
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
