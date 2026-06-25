-- ============================================================
-- QLens · 0003_create_org_rpc.sql
-- 조직 생성 RPC: RLS/트리거 충돌 없이 조직+멤버십+프로필을 한번에 처리
-- ============================================================

-- 기존 트리거 제거 (handle_new_org가 auth.uid()를 사용하여 service_role에서 충돌)
DROP TRIGGER IF EXISTS on_org_created ON diadent_organizations;
DROP FUNCTION IF EXISTS handle_new_org();

-- 조직 생성 전용 함수 (service_role에서 호출)
CREATE OR REPLACE FUNCTION public.create_org_for_user(org_name text, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- 1. 조직 생성
  INSERT INTO diadent_organizations (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;

  -- 2. owner 멤버십 생성
  INSERT INTO diadent_memberships (org_id, user_id, role)
  VALUES (new_org_id, p_user_id, 'owner');

  -- 3. 프로필에 default_org_id 설정 (upsert)
  INSERT INTO diadent_profiles (id, default_org_id)
  VALUES (p_user_id, new_org_id)
  ON CONFLICT (id) DO UPDATE SET default_org_id = new_org_id;

  RETURN new_org_id;
END;
$$;
