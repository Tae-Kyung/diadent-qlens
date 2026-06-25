"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const mobileNav = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/upload", label: "업로드", icon: Upload },
  { href: "/ai", label: "AI", icon: MessageSquare },
  { href: "/settings", label: "프로필", icon: User },
];

const desktopNav = [
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/upload", label: "UPLOAD" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/ai", label: "AI ANALYST" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-card border-b border-surface-border">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-clinical-blue flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">Q</span>
              </div>
              <span className="hidden md:block font-heading text-xl font-bold text-clinical-blue tracking-tight">
                DiaDent QLens
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden xl:flex items-center gap-8 h-full">
              {desktopNav.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "font-mono text-xs tracking-wider h-16 flex items-center transition-colors",
                      isActive
                        ? "text-clinical-blue border-b-2 border-clinical-blue font-bold"
                        : "text-muted-foreground hover:text-clinical-blue",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <ThemeToggle />
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-clinical-blue flex items-center justify-center text-white text-xs font-bold">
                QL
              </div>
              <span className="text-sm font-semibold text-foreground hidden sm:block">
                관리자
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Nav Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 xl:hidden bg-card border-t border-surface-border z-50">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive
                  ? "text-clinical-blue font-bold"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-mono">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
