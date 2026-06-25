export type Locale = "ko" | "en" | "zh" | "ru" | "fr";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ru", label: "Русский" },
  { code: "fr", label: "Français" },
];

export const DEFAULT_LOCALE: Locale = "ko";
