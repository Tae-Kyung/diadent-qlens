"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Globe } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/types";

const STORAGE_KEY = "qlens-locale";

export function LandingControls({ onLocaleChange }: { onLocaleChange?: (locale: Locale) => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  function handleLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    setOpen(false);
    onLocaleChange?.(l);
  }

  if (!mounted) return <div className="flex gap-1 w-[72px]" />;

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setTheme(nextTheme)}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-clinical-blue transition-colors"
        title={`Theme: ${theme}`}
      >
        <ThemeIcon className="h-[18px] w-[18px]" />
      </button>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-clinical-blue transition-colors"
          title="Language"
        >
          <Globe className="h-[18px] w-[18px]" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 z-50 bg-card border border-surface-border rounded-xl shadow-lg py-1 min-w-[140px]">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLocale(l.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    locale === l.code
                      ? "text-clinical-blue font-semibold bg-clinical-blue/5"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
