import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e: any) {
    return NextResponse.json({ error: "Admin client error: " + e.message }, { status: 500 });
  }

  // admin.rpc로 트리거 충돌 없이 조직 + 멤버십 + 프로필을 한번에 생성
  const { data: org, error: orgError } = await admin.rpc("create_org_for_user", {
    org_name: name.trim(),
    p_user_id: user.id,
  });

  if (orgError) {
    console.error("create_org_for_user error:", orgError);
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  return NextResponse.json({ id: org });
}
