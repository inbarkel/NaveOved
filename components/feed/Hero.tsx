import Image from "next/image";

/**
 * הבאנר כולל כבר את הכותרת והלוגו בתוך התמונה עצמה, לכן אין כאן שכבת טקסט נוספת.
 * התנועה: זום איטי מאוד על הנוף, ועננים שנוסעים בשמיים. הכול ב-CSS, רק transform,
 * ונעצר כשהמשתמש ביקש פחות תנועה.
 */
export function Hero() {
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-[var(--color-border)] md:aspect-[3/1]">
      <Image
        src="/images/banner.png"
        alt="נוף פוריה נווה עובד והר תבור"
        fill
        priority
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="hero-img object-cover"
      />
      <div className="hero-sky" aria-hidden />
    </div>
  );
}
