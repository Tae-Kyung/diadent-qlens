"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Locale } from "./types";
import { DEFAULT_LOCALE } from "./types";
import ko from "./dictionaries/ko";
import en from "./dictionaries/en";
import zh from "./dictionaries/zh";
import ru from "./dictionaries/ru";
import fr from "./dictionaries/fr";

type Dictionary = typeof ko;

const dictionaries: Record<Locale, Dictionary> = { ko, en: en as unknown as Dictionary, zh: zh as unknown as Dictionary, ru: ru as unknown as Dictionary, fr: fr as unknown as Dictionary };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: ko,
});

const STORAGE_KEY = "qlens-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && dictionaries[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
