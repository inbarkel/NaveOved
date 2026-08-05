import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AccessibilityProvider } from "@/lib/accessibility";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/nav/Header";
import { BottomNav, SideRail } from "@/components/nav/Nav";

const body = Heebo({
  variable: "--font-body",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "פוריה נווה עובד",
  description: "אפליקציית הקהילה של מושב נווה עובד (פוריה)",
  openGraph: {
    title: "פוריה נווה עובד",
    description: "אפליקציית הקהילה של מושב נווה עובד (פוריה)",
    images: ["/images/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8f1e3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a3a2a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={body.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AccessibilityProvider>
              <div className="flex min-h-screen flex-col">
                <div className="flex flex-1">
                  <SideRail />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 pb-20 md:pb-0">{children}</main>
                  </div>
                </div>
                <footer className="bg-surface/50 border-t border-[var(--color-border)] text-center py-3 text-xs text-muted-foreground">
                  <p>© 2026 ענבר קלר. כל הזכויות שמורות.</p>
                </footer>
              </div>
              <BottomNav />
            </AccessibilityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
