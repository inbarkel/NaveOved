import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`contrast-surface rounded-3xl border border-[var(--color-border)] bg-surface shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}
