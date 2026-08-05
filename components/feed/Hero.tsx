import Image from "next/image";

/**
 * הבאנר המקורי כולל כבר כותרת+לוגו "אפויים" בתוך התמונה עצמה —
 * זו הייתה סיבת הבאג (לוגו כפול על הכותרת): קוד הדמו הוסיף עוד לוגו מעליו.
 * כאן אין שכבת לוגו נוספת — רק גרדיאנט עדין לקריאות, כדי שגם תמונה עתידית
 * בלי טקסט מוטמע תיראה טוב בלי לשנות קוד.
 */
export function Hero() {
  return (
    <div className="relative h-48 sm:h-64 w-full overflow-hidden">
      <Image
        src="/images/banner.png"
        alt="נוף פוריה נווה עובד והר תבור"
        fill
        priority
        sizes="100vw"
        className="object-contain"
      />
    </div>
  );
}
