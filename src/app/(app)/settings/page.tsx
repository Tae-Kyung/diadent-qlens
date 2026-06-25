"use client";

import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Building2,
  Mail,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("diadent_profiles")
        .select("default_org_id")
        .eq("id", user.id)
        .single();

      if (profile?.default_org_id) {
        const { data: org } = await supabase
          .from("diadent_orgs")
          .select("name")
          .eq("id", profile.default_org_id)
          .single();
        if (org) setOrgName(org.name);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          프로필 & 설정
        </h1>
        <p className="text-muted-foreground mt-1">
          사용자 정보 및 시스템 환경을 관리합니다.
        </p>
      </div>

      {/* Profile & Version Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2">
          <Card className="border-surface-border overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-20 h-20 rounded-full bg-clinical-blue flex items-center justify-center text-white text-2xl font-heading font-bold shrink-0">
                QL
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-clinical-blue">
                    DiaDent QLens
                  </h2>
                  <p className="font-mono text-xs text-teal-action">
                    Quality Analysis System
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      이메일
                    </label>
                    <p className="font-mono text-xs text-foreground">
                      {email || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      조직
                    </label>
                    <p className="font-mono text-xs text-foreground">
                      {orgName || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version Card */}
        <Card className="border-surface-border bg-secondary">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-3">
                <Shield className="h-8 w-8 text-clinical-blue" />
                <span className="font-mono text-[10px] font-bold text-teal-action bg-teal-action/10 px-2 py-1 rounded">
                  STABLE
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold">버전 정보</h3>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                DiaDent QLens
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted-foreground">Current Build</span>
                <span className="font-bold text-clinical-blue">v0.1.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences */}
        <Card className="border-surface-border overflow-hidden">
          <div className="p-4 border-b border-surface-border bg-card flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-clinical-blue" />
            <h3 className="font-heading text-base font-semibold">환경 설정</h3>
          </div>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">조직 관리</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  멤버 관리 및 조직 설정
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">데이터 백업</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  분석 결과 및 원본 데이터 내보내기
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Support & Security */}
        <Card className="border-surface-border overflow-hidden">
          <div className="p-4 border-b border-surface-border bg-card flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-clinical-blue" />
            <h3 className="font-heading text-base font-semibold">지원 및 보안</h3>
          </div>
          <div className="divide-y divide-surface-border">
            <SettingsLink
              icon={<HelpCircle className="h-5 w-5" />}
              title="도움말"
              subtitle="사용 가이드 및 FAQ"
            />
            <SettingsLink
              icon={<Shield className="h-5 w-5" />}
              title="개인정보 보호"
              subtitle="데이터 처리 및 보안 정책"
            />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-accent p-2 rounded-lg group-hover:bg-destructive group-hover:text-white transition-colors">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-destructive">로그아웃</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    현재 세션을 종료합니다
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsLink({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-all group">
      <div className="flex items-center gap-4">
        <div className="bg-accent p-2 rounded-lg group-hover:bg-clinical-blue group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">{title}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
