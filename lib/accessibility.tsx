"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AccessibilityState {
  largeText: boolean;
  highContrast: boolean;
  setLargeText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

const STORAGE_KEY = "neve-oved-a11y";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- קריאה חד-פעמית מ-localStorage בעת mount, לא ניתן לדעת מראש ב-SSR.
      if (typeof saved.largeText === "boolean") setLargeText(saved.largeText);
      if (typeof saved.highContrast === "boolean") setHighContrast(saved.highContrast);
    } catch {
      // אין העדפה שמורה — ממשיכים עם ברירת המחדל
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-a11y-large-text", String(largeText));
    document.documentElement.setAttribute("data-a11y-contrast", String(highContrast));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ largeText, highContrast }));
  }, [largeText, highContrast]);

  return (
    <AccessibilityContext.Provider value={{ largeText, highContrast, setLargeText, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
