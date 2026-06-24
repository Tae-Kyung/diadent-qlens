import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(request: Request) {
  // 1. 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "미인증" }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  const { message, context, conversationId } = await request.json();

  if (!message || !context) {
    return NextResponse.json({ error: "message와 context가 필요합니다" }, { status: 400 });
  }

  // 2. Anthropic API 호출 (키 서버 보관)
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: `당신은 제조 품질관리(QC) 전문 AI 분석가입니다.
아래 통계 요약을 바탕으로 한국어로 답변하세요.
숫자를 인용할 때는 소수점 4자리까지 표기하세요.
데이터에 근거하지 않은 추측은 하지 마세요.

${context}`,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      await response.text();
      return NextResponse.json(
        { error: `Anthropic API 오류: ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const reply =
      data.content?.[0]?.text || "답변을 생성할 수 없습니다.";

    // 3. 대화 이력 저장 (conversationId가 있으면)
    if (conversationId) {
      await supabase.from("diadent_ai_messages").insert([
        { conversation_id: conversationId, role: "user", content: message },
        { conversation_id: conversationId, role: "assistant", content: reply },
      ]);
    }

    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `AI 호출 실패: ${msg}` },
      { status: 500 },
    );
  }
}
