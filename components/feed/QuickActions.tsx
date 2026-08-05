import Link from "next/link";
import { QUICK_ACTIONS } from "@/lib/demo-data";
import { getIcon } from "@/lib/icons";

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = getIcon(action.iconKey);
        const isEmergency = action.label === "חירום";
        const baseClass = "contrast-surface flex flex-col items-center gap-1.5 rounded-2xl py-3 shadow-[var(--shadow-soft)] active:scale-[0.97] transition-transform";
        const emergencyClass = isEmergency
          ? "bg-urgent/20 border border-urgent text-urgent"
          : "border border-[var(--color-border)] bg-surface text-primary";

        return (
          <a
            key={action.label}
            href={action.href}
            className={`${baseClass} ${emergencyClass}`}
          >
            <Icon className={`w-5 h-5 ${isEmergency ? 'text-urgent' : 'text-primary'}`} aria-hidden />
            <span className="text-xs font-semibold">{action.label}</span>
          </a>
        );
      })}
    </div>
  );
}
