import Image from "next/image";

/**
 * הבאנר כולל כבר את הכותרת והלוגו בתוך התמונה עצמה, לכן אין כאן שכבת טקסט נוספת.
 * התמונה (3:1) מוצגת כמסגרת בתוך רשת העמוד, באותה פינה ובאותו קו כמו שאר הבלוקים.
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
        className="object-cover"
      />
    </div>
  );
}
