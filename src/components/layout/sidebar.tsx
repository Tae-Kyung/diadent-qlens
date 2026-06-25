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

const nav = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/products", label: "제품 관리", icon: Package },
  { href: "/upload", label: "데이터 업로드", icon: Upload },
  { href: "/ai", label: "AI 분석가", icon: MessageSquare },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
        {nav.map(({ href, label, icon: Icon }) => {
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
              <span>{label}</span>
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
          로그아웃
        </button>
      </div>
    </aside>
  );
}
