"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Megaphone, Activity, BookOpen, Users, MoreHorizontal, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "בית", icon: Home },
  { href: "/town-board", label: "לוח היישוב", icon: Megaphone },
  { href: "/activities", label: "פעילויות", icon: Activity },
  { href: "/clubs", label: "חוגים", icon: BookOpen },
  { href: "/community", label: "קהילה", icon: Users },
  { href: "/more", label: "עוד", icon: MoreHorizontal },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label="ניווט ראשי"
    >
      <ul className="grid grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideRail() {
  const pathname = usePathname();
  return (
    <nav
      className="hidden md:flex flex-col w-20 shrink-0 border-e border-[var(--color-border)] bg-surface py-6 items-center gap-2 sticky top-0 h-screen overflow-y-auto"
      aria-label="ניווט ראשי"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center gap-1 w-16 py-3 rounded-2xl text-[11px] font-medium transition-colors ${
              active ? "text-primary bg-surface-2" : "text-muted-foreground hover:bg-surface-2"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
