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

    const { error: insertError } = await supabase
      .from("diadent_organizations")
      .insert({ name: orgName });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // 프로필에 기본 조직 설정
    const { data: orgs } = await supabase
      .from("diadent_memberships")
      .select("org_id")
      .limit(1)
      .single();

    if (orgs) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("diadent_profiles")
          .update({ default_org_id: orgs.org_id })
          .eq("id", user.id);
      }
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
