"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useI18n();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t.onboarding.noAuth);
      setLoading(false);
      return;
    }

    // 1. 조직 생성 (트리거가 자동으로 owner 멤버십 생성)
    const { data: org, error: insertError } = await supabase
      .from("diadent_organizations")
      .insert({ name: orgName })
      .select("id")
      .single();

    if (insertError || !org) {
      setError(insertError?.message || t.onboarding.createFailed);
      setLoading(false);
      return;
    }

    // 2. 프로필에 기본 조직 설정
    const { error: profileError } = await supabase
      .from("diadent_profiles")
      .update({ default_org_id: org.id })
      .eq("id", user.id);

    if (profileError) {
      // 프로필이 아직 없으면 (트리거 지연 등) 에러 로그만 남김
      // 업로드 페이지에서 멤버십 fallback으로 orgId를 가져올 수 있음
      console.error("프로필 업데이트 실패:", profileError.message);
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t.onboarding.title}</CardTitle>
          <CardDescription>{t.onboarding.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder={t.onboarding.orgNamePlaceholder}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.onboarding.creating : t.onboarding.create}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
