"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, Contrast, Type, X } from "lucide-react";
import { useAccessibility } from "@/lib/accessibility";

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: typeof Type;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`w-full flex items-center justify-between rounded-2xl p-4 border-2 transition-colors ${
        checked ? "border-primary bg-surface-2" : "border-[var(--color-border)] bg-surface"
      }`}
    >
      <span className="flex items-center gap-3 font-semibold">
        <Icon className="w-5 h-5 text-primary" aria-hidden />
        {label}
      </span>
      <span
        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
          checked ? "bg-primary justify-end" : "bg-[var(--color-border)] justify-start"
        }`}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow" />
      </span>
    </button>
  );
}

export function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { largeText, highContrast, setLargeText, setHighContrast } = useAccessibility();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key to close panel
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface rounded-3xl p-6 shadow-2xl w-80 max-w-[calc(100vw-2rem)]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg font-bold">נגישות</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="סגור"
                className="p-1 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <ToggleRow icon={Type} label="טקסט גדול" checked={largeText} onChange={setLargeText} />
              <ToggleRow icon={Contrast} label="ניגודיות גבוהה" checked={highContrast} onChange={setHighContrast} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="הגדרות נגישות"
        className="p-2 rounded-full hover:bg-surface-2 transition-colors"
      >
        <Accessibility className="w-5 h-5" aria-hidden />
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
