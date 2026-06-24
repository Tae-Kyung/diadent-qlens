"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인 정보를 불러올 수 없습니다.");
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
      setError(insertError?.message || "조직 생성 실패");
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
          <CardTitle>조직 생성</CardTitle>
          <CardDescription>QLens를 시작하려면 조직을 만드세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="조직 이름 (예: 다이아덴트)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "생성 중..." : "조직 생성"}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
