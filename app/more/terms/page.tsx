'use client';

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <Link href="/more" className="flex items-center gap-2 text-primary mb-6 hover:opacity-80">
        <ChevronRight className="w-4 h-4 rotate-180" />
        חזרה
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">תנאי שימוש</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">1. הגבלת אחריות</h2>
          <p className="text-foreground/90">
            האתר הזה מסופק "כמו שהוא" ללא כל אחריות. מטעם זה, אנו לא נושאים בכל אחריות אישית לנזקים, הפסדים, או כל תוצאה של שימוש באתר זה.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">2. אי-אחריות על תוכן</h2>
          <p className="text-foreground/90">
            התוכן באתר זה כולל מידע המסופק על ידי תושבים וגורמים שונים. אנו לא מאשרים או מעידים על דיוק, שלמות, או תקינות התוכן.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">3. הגבלת התביעות</h2>
          <p className="text-foreground/90">
            בשום פנים ואופן לא ניתן לתבוע אותנו אישית על נזקים, הפסדים, או כל טענה הנובעת מהשימוש או אי-השימוש באתר זה או בתוכנו.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">4. שימוש אחראי</h2>
          <p className="text-foreground/90">
            המשתמשים מסכימים להשתמש באתר זה בצורה אחראית ובהתאם לכל חוק ותקנון.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">5. שינויים בתנאים</h2>
          <p className="text-foreground/90">
            אנו שומרים לעצמנו את הזכות לשנות את התנאים האלה בכל עת. המשך השימוש באתר מהווה הסכמה לתנאים המעודכנים.
          </p>
        </section>
      </div>
    </div>
  );
}
