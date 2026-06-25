"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { buildDigest } from "@/lib/ai/digest";
import { descriptiveStats } from "@/lib/analytics/stats";
import { calcCpk } from "@/lib/analytics/cpk";
import type { PointStats } from "@/lib/types";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "팁 직경(D0)이 가장 불안정한 사이즈는?",
  "전장의 공정능력은 어떤 수준인가요?",
  "이상치가 가장 많은 포인트는?",
  "전체적인 품질 수준을 평가해주세요.",
];

export default function AiPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadContext() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("diadent_profiles")
      .select("default_org_id")
      .eq("id", user.id)
      .single();
    if (!profile?.default_org_id) return;

    // 최근 배치들의 통계를 컨텍스트로 수집
    const { data: batches } = await supabase
      .from("diadent_batches")
      .select("id, product_size_id, row_count, diadent_product_sizes(name, diadent_products(name))")
      .eq("org_id", profile.default_org_id)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!batches || batches.length === 0) {
      setContext("현재 분석할 데이터가 없습니다.");
      return;
    }

    const allDigests: string[] = [];

    for (const batch of batches) {
      const { data: measurements } = await supabase
        .from("diadent_measurements")
        .select("id, sample_no")
        .eq("batch_id", batch.id);

      if (!measurements || measurements.length === 0) continue;

      const mIds = measurements.map((m) => m.id);
      const { data: points } = await supabase
        .from("diadent_measurement_points")
        .select("measurement_id, point_index, value")
        .in("measurement_id", mIds);

      if (!points) continue;

      const { data: specs } = await supabase
        .from("diadent_spec_points")
        .select("*")
        .eq("product_size_id", batch.product_size_id)
        .order("point_index");

      // 포인트별 집계
      const pointMap = new Map<number, number[]>();
      for (const p of points) {
        if (!pointMap.has(p.point_index)) pointMap.set(p.point_index, []);
        pointMap.get(p.point_index)!.push(Number(p.value));
      }

      const specMap = new Map<number, { label?: string; usl?: number | null; lsl?: number | null; nominal?: number | null }>();
      if (specs) for (const s of specs) specMap.set(s.point_index, s);

      const pointStats: PointStats[] = [];
      for (const [pi, vals] of pointMap) {
        const stat = descriptiveStats(vals);
        const spec = specMap.get(pi);
        const { cp, cpk } = calcCpk(
          stat.mean,
          stat.std,
          spec?.usl ?? null,
          spec?.lsl ?? null,
        );
        pointStats.push({
          point_index: pi,
          label: spec?.label || `P${pi}`,
          n: stat.n,
          mean: stat.mean ?? 0,
          std: stat.std ?? 0,
          min: stat.min ?? 0,
          max: stat.max ?? 0,
          nominal: spec?.nominal ?? null,
          usl: spec?.usl ?? null,
          lsl: spec?.lsl ?? null,
          cp,
          cpk,
          oos_count: 0,
        });
      }

      const sizeName = (batch as any).diadent_product_sizes?.name || "";
      const productName = (batch as any).diadent_product_sizes?.diadent_products?.name || "";

      allDigests.push(
        buildDigest({
          productName,
          sizeName,
          sampleCount: measurements.length,
          pointStats,
          anomalyCount: 0,
        }),
      );
    }

    setContext(allDigests.join("\n\n---\n\n"));

    // 대화 생성
    const { data: conv } = await supabase
      .from("diadent_ai_conversations")
      .insert({
        org_id: profile.default_org_id,
        user_id: user.id,
        title: "새 대화",
      })
      .select("id")
      .single();

    if (conv) setConversationId(conv.id);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadContext(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(text?: string) {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context,
          conversationId,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.error || "응답 오류" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "네트워크 오류가 발생했습니다." },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          AI 분석가
        </h2>
        <p className="text-muted-foreground mt-1">
          측정 데이터에 대해 자연어로 질문하고 인사이트를 얻으세요.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden border-surface-border">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex-1 overflow-auto space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4 py-12">
                <div className="w-12 h-12 mx-auto bg-clinical-blue/10 rounded-2xl flex items-center justify-center">
                  <Send className="h-6 w-6 text-clinical-blue" />
                </div>
                <p className="text-center text-muted-foreground text-sm">
                  측정 데이터에 대해 질문해보세요.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {EXAMPLE_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(q)}
                      className="border-surface-border text-muted-foreground hover:text-clinical-blue hover:border-clinical-blue transition-colors"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap bg-clinical-blue text-white">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-xl px-5 py-4 text-sm bg-secondary text-foreground prose-ai">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-blue animate-pulse" />
                    분석 중...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 pt-4 border-t border-surface-border mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              className="border-surface-border"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-clinical-blue hover:brightness-110 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
