'use client';

import Image from "next/image";
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-surface/95 backdrop-blur border-b border-[var(--color-border)]">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Image src="/images/logo.png" alt="לוגו פוריה נווה עובד" width={32} height={32} className="rounded-full" />
        <span className="font-sans font-bold text-lg">פוריה נווה עובד</span>
      </Link>
      <div className="flex items-center gap-1">
        {isCommittee && (
          <Link href="/admin" aria-label="ניהול" className="p-2 rounded-full hover:bg-surface-2 transition-colors" title="ניהול">
            <Shield className="w-5 h-5" aria-hidden />
          </Link>
        )}
        {user && (
          <button
            onClick={handleLogout}
            aria-label="התנתק"
            className="p-2 rounded-full hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground"
            title="התנתק"
          >
            <LogOut className="w-5 h-5" aria-hidden />
          </button>
        )}
        <ThemeToggle />
        <AccessibilityToggle />
      </div>
    </header>
  );
}
