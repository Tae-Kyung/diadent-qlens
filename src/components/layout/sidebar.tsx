"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Upload,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

const navItems = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/products", key: "products" as const, icon: Package },
  { href: "/upload", key: "upload" as const, icon: Upload },
  { href: "/ai", key: "ai" as const, icon: MessageSquare },
  { href: "/settings", key: "settings" as const, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[280px] bg-[var(--sidebar)] border-r border-surface-border hidden xl:flex flex-col p-4 gap-2 z-30">
      <div className="mb-4 p-4 bg-secondary rounded-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
          Current System
        </p>
        <p className="font-heading text-lg font-bold text-clinical-blue">
          DiaDent QLens
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-clinical-blue",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{t.nav[key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-surface-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-destructive transition-all"
        >
          <LogOut className="h-5 w-5" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
}
