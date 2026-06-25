"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/onboarding");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        // 조직이 있으면 대시보드로, 없으면 온보딩으로
        const { data: profile } = await supabase
          .from("diadent_profiles")
          .select("default_org_id")
          .eq("id", data.user.id)
          .single();

        if (profile?.default_org_id) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">QLens</CardTitle>
          <CardDescription>측정 데이터 품질 분석 플랫폼</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    mode === "login"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  로그인
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    mode === "signup"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => { setMode("signup"); setError(""); }}
                >
                  회원가입
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "처리 중..."
                    : mode === "login"
                      ? "로그인"
                      : "회원가입"}
                </Button>
              </form>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
