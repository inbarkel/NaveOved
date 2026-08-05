import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ContactsPage() {
  const contacts = {
    "המושב": [
      { name: "מזכירות המושב", phone: "04-6750042" },
      { name: "אבישג - יו״ר הועד", phone: "054-6388485" },
      { name: "עליזה - מנהלת הקהילה", phone: "050-7799947" },
    ],
    "קלניקה": [
      { name: "טיפת חלב", phone: "04-6752043" },
      { name: "מרפאה", phone: "04-6750843" },
    ],
    "מועצה": [
      { name: "קב״ט - משרד", phone: "04-6757640" },
      { name: "קב״ט - סלולרי", phone: "050-6272609" },
    ],
    "בית חולים פוריה": [
      { name: "דלפק קבלה (מיון כללי)", phone: "04-6652886" },
      { name: "דלפק קבלה (חלופי)", phone: "04-6652889" },
      { name: "מוקד מיון יולדות", phone: "04-6652920" },
    ],
    "חירום כללי": [
      { name: "משטרה", phone: "100" },
      { name: "אמבולנס", phone: "101" },
      { name: "מכבי אש", phone: "102" },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-sans text-2xl font-bold">מספרי טלפון חשובים</h1>

      <div className="space-y-6">
        {Object.entries(contacts).map(([category, numbers]) => (
          <div key={category}>
            <h2 className="font-sans font-bold text-sm text-muted-foreground mb-2 px-1">{category}</h2>
            <div className="space-y-2">
              {numbers.map((contact) => (
                <a
                  key={contact.phone}
                  href={`tel:${contact.phone}`}
                  className="block"
                >
                  <Card className="p-3 flex items-center justify-between active:scale-[0.99] transition-transform hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <p className="text-sm text-primary font-mono font-bold">{contact.phone}</p>
                    </div>
                    <Phone className="w-4 h-4 text-primary shrink-0 ml-2" aria-hidden />
                  </Card>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
