"use client";

import { motion } from "framer-motion";

export interface ProgressBarProps {
  registered: number;
  minRequired: number;
  maxCapacity?: number | null;
}

/**
 * מדד "יתקיים בוודאות" — פותר את חוסר הוודאות של "האם החוג הזה יתקיים".
 * הרעיון נשמר מהדמו המקורי, מלובש בשפה העיצובית החדשה.
 */
export function ProgressBar({ registered, minRequired, maxCapacity }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((registered / minRequired) * 100));
  const missing = Math.max(0, minRequired - registered);
  const isFull = Boolean(maxCapacity && registered >= maxCapacity);

  return (
    <div>
      <div className="w-full h-2.5 rounded-full overflow-hidden bg-[var(--color-surface-2)]">
        <motion.div
          className={`h-full rounded-full ${missing > 0 ? "bg-primary" : "bg-accent"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        {isFull ? (
          <span className="font-semibold text-urgent">
            המקומות אזלו ({registered}/{maxCapacity})
          </span>
        ) : missing > 0 ? (
          <>
            נרשמו <span className="font-semibold text-primary">{registered}</span> מתוך מינימום{" "}
            {minRequired}
            {maxCapacity ? ` (עד ${maxCapacity})` : ""} — חסרים{" "}
            <span className="font-semibold text-accent">{missing}</span>!
          </>
        ) : (
          <span className="font-semibold text-accent">
            🎉 עברנו את המינימום — יתקיים בוודאות!{maxCapacity ? ` (${registered}/${maxCapacity})` : ""}
          </span>
        )}
      </p>
    </div>
  );
}
