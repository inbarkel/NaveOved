import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const FACTS = [
  { label: "נוסד", value: "1949, בידי עולים מצפון אפריקה" },
  { label: "שיוך מנהלי", value: "מועצה אזורית עמק הירדן" },
  { label: "מיקום", value: "רכס פוריה, מול הכנרת והר תבור" },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-serif text-2xl font-bold">אודות המושב</h1>
      <p className="text-sm leading-relaxed text-foreground/90">
        פוריה נווה עובד הוא יישוב קהילתי הממוקם על רכס פוריה, סמוך לטבריה, עם נוף לכנרת ולהר תבור. היישוב הוקם ב-1949
        בידי עולים מצפון אפריקה ושייך למועצה האזורית עמק הירדן.
      </p>

      <div className="space-y-2.5">
        {FACTS.map((f) => (
          <Card key={f.label} className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{f.label}</span>
            <span className="font-semibold text-sm">{f.value}</span>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        פרטים נוספים (מספר תושבים, שטח וכו׳) יעודכנו על ידי הוועד.
      </p>
    </div>
  );
}
