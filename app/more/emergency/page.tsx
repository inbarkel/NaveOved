import Link from "next/link";
import { ChevronRight, AlertCircle, Phone } from "lucide-react";

export default function EmergencyPage() {
  const emergencyNumbers = [
    // משדרות
    { name: "משטרה", phone: "100", icon: "🚨", group: "משדרות" },
    { name: "אמבולנס", phone: "101", icon: "🚑", group: "משדרות" },
    { name: "מכבי אש", phone: "102", icon: "🚒", group: "משדרות" },
    // בית חולים
    { name: "דלפק קבלה (מיון כללי)", phone: "04-6652886", icon: "🏥", group: "בית חולים צפון (פוריה)" },
    { name: "דלפק קבלה (חלופי)", phone: "04-6652889", icon: "🏥", group: "בית חולים צפון (פוריה)" },
    { name: "מוקד מיון יולדות", phone: "04-6652920", icon: "👶", group: "בית חולים צפון (פוריה)" },
    // קב"ט המועצה
    { name: "קב״ט - משרד", phone: "04-6757640", icon: "📞", group: "קב״ט המועצה (קובי אלברט)" },
    { name: "קב״ט - סלולרי", phone: "050-6272609", icon: "📞", group: "קב״ט המועצה (קובי אלברט)" },
  ];

  const groupedNumbers = emergencyNumbers.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof emergencyNumbers>);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>

      <div className="bg-urgent/20 border border-urgent rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-6 h-6 text-urgent shrink-0" />
        <div>
          <p className="font-bold text-urgent">חיוני: מספרי חירום</p>
          <p className="text-sm text-urgent/80 mt-1">לחץ על כל מספר להתקשר מיד</p>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(groupedNumbers).map(([group, numbers]) => (
          <div key={group}>
            <h3 className="font-bold text-sm text-muted-foreground mb-2 px-1">{group}</h3>
            <div className="space-y-2">
              {numbers.map((emergency) => (
                <a
                  key={`${emergency.phone}`}
                  href={`tel:${emergency.phone}`}
                  className="block p-4 rounded-xl bg-surface-2 hover:bg-surface-2/80 active:scale-[0.97] transition-transform border border-[var(--color-border)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{emergency.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{emergency.name}</p>
                      <p className="text-lg font-mono font-bold text-primary">{emergency.phone}</p>
                    </div>
                  </div>
                  <Phone className="w-5 h-5 text-primary shrink-0 ml-2" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-2 rounded-2xl p-4 space-y-2 text-sm">
        <p className="font-bold">💡 זכור:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>המספרים 100, 101, 102 עובדים מכל טלפון ללא צורך בקידומת</li>
          <li>בית חולים צפון הוא הבית החולים הקרוב ביותר למושב</li>
          <li>קב״ט המועצה עוזר בתקלות ביטחוניות ובעיות מנהליות</li>
        </ul>
      </div>
    </div>
  );
}
