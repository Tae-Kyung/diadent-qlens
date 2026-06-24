import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키를 사용하는 관리자 클라이언트.
 * 서버 전용 — 클라이언트 번들에 포함 금지.
 * 사용 전 반드시 요청자의 org 멤버십·역할을 코드로 검증할 것.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
