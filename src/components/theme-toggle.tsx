"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "다크" : theme === "light" ? "라이트" : "시스템";

  return (
    <button
      onClick={() => setTheme(next)}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-clinical-blue transition-colors"
      title={`현재: ${label} 모드`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
