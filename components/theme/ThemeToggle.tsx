"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // נמנעים מ-mismatch בהידרציה: לפני שה-hook מסתנכרן עם ה-DOM, לא מציגים אייקון תלוי-ערכה.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- דפוס mount-detection מתועד של next-themes, לא ניתן להחליף ב-lazy state כי הערך תלוי בדפדפן בלבד.
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="החלפת מצב תצוגה בהיר/כהה"
      className="p-2 rounded-full hover:bg-surface-2 transition-colors"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5" aria-hidden />
      ) : (
        <Moon className="w-5 h-5" aria-hidden />
      )}
    </button>
  );
}
