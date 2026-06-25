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

  const admin = createAdminClient();

  // 1. 조직 생성
  const { data: org, error: orgError } = await admin
    .from("diadent_organizations")
    .insert({ name: name.trim() })
    .select("id")
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: orgError?.message || "Failed to create org" }, { status: 500 });
  }

  // 2. 멤버십 생성 (owner)
  const { error: memberError } = await admin
    .from("diadent_memberships")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  if (memberError) {
    // rollback org
    await admin.from("diadent_organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // 3. 프로필에 default_org_id 설정
  await admin
    .from("diadent_profiles")
    .upsert({ id: user.id, default_org_id: org.id }, { onConflict: "id" });

  return NextResponse.json({ id: org.id });
}
