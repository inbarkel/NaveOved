'use client';

import Image from "next/image";
import Link from "next/link";
import { Shield, LogOut, LogIn } from "lucide-react";
import { AccessibilityToggle } from "@/components/accessibility/AccessibilityPanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useIsCommittee } from "@/lib/use-committee-role";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, signOut } = useAuth();
  const { isCommittee } = useIsCommittee();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const iconBtn =
    "grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-surface px-4 py-2.5">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/images/logo.png" alt="לוגו פוריה נווה עובד" width={34} height={34} className="rounded-full" />
        <span className="text-lg font-extrabold leading-none tracking-tight">פוריה נווה עובד</span>
      </Link>
      <div className="flex items-center gap-0.5">
        {isCommittee && (
          <Link href="/admin" aria-label="ניהול" className={`${iconBtn} text-primary`} title="ניהול">
            <Shield className="h-5 w-5" aria-hidden />
          </Link>
        )}
        {user ? (
          <button onClick={handleLogout} aria-label="התנתקות" className={iconBtn} title="התנתקות">
            <LogOut className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="התחברות"
            className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            title="התחברות"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            התחברות
          </Link>
        )}
        <ThemeToggle />
        <AccessibilityToggle />
      </div>
    </header>
  );
}
