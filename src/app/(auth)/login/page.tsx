"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-clinical-blue flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">Q</span>
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            <span className="text-clinical-blue">DiaDent</span> QLens
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            측정 데이터 품질 분석 플랫폼
          </p>
        </div>

        <Card className="border-surface-border">
          <CardContent className="p-6 space-y-5">
            {/* Mode Toggle */}
            <div className="flex rounded-lg border border-surface-border overflow-hidden">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mode === "login"
                    ? "bg-clinical-blue text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                로그인
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-clinical-blue text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
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
                className="border-surface-border h-11"
              />
              <Input
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="border-surface-border h-11"
              />
              <Button
                type="submit"
                className="w-full h-11 bg-clinical-blue hover:brightness-110 text-white font-semibold"
                disabled={loading}
              >
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

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Diadent Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
