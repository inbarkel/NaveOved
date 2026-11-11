import Link from "next/link";
import { QUICK_ACTIONS } from "@/lib/demo-data";
import { getIcon } from "@/lib/icons";

const TONES: Record<string, string> = {
  "מספרי טלפון": "var(--rota-water)",
  חירום: "var(--rota-vermilion)",
  וואטסאפ: "var(--rota-field)",
  "הצעות והצבעות": "var(--rota-violet)",
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {QUICK_ACTIONS.map((action) => {
        const Icon = getIcon(action.iconKey);
        const tone = TONES[action.label] ?? "var(--rota-water)";
        const isEmergency = action.label === "חירום";
        return (
          <Link
            key={action.label}
            href={action.href}
            className={`press contrast-surface flex min-h-[56px] items-center gap-3 rounded-2xl border bg-surface px-3 py-2.5 hover:bg-surface-2 ${
              isEmergency ? "border-urgent" : "border-[var(--color-border)]"
            }`}
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className={`text-sm font-bold leading-tight ${isEmergency ? "text-urgent" : ""}`}>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
