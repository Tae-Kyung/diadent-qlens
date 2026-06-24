-- ============================================================
-- QLens · 0002_rls.sql
-- RLS 정책 + auth_org_ids() 헬퍼 + 조직 생성 트리거
-- 테이블명 접두사: diadent_
-- ============================================================

-- ---------- 헬퍼: 현재 사용자가 속한 org_id 집합 ----------
create or replace function public.auth_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select org_id from diadent_memberships where user_id = auth.uid()
$$;

-- ---------- 조직 생성 시 owner 멤버십 자동 부여 트리거 ----------
create or replace function public.handle_new_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into diadent_memberships (org_id, user_id, role)
  values (NEW.id, auth.uid(), 'owner');
  return NEW;
end;
$$;

create trigger on_org_created
  after insert on diadent_organizations
  for each row execute function handle_new_org();

-- ---------- 신규 auth.users → profiles 자동 생성 트리거 ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.diadent_profiles (id, full_name)
  values (NEW.id, coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  return NEW;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- RLS 활성화
-- ============================================================
alter table diadent_organizations      enable row level security;
alter table diadent_profiles           enable row level security;
alter table diadent_memberships        enable row level security;
alter table diadent_products           enable row level security;
alter table diadent_product_sizes      enable row level security;
alter table diadent_spec_points        enable row level security;
alter table diadent_batches            enable row level security;
alter table diadent_measurements       enable row level security;
alter table diadent_measurement_points enable row level security;
alter table diadent_ai_conversations   enable row level security;
alter table diadent_ai_messages        enable row level security;

-- organizations
create policy "org_select" on diadent_organizations for select using (id in (select auth_org_ids()));
create policy "org_insert" on diadent_organizations for insert with check (auth.uid() is not null);
create policy "org_update" on diadent_organizations for update using (id in (select org_id from diadent_memberships where user_id = auth.uid() and role = 'owner'));
create policy "org_delete" on diadent_organizations for delete using (id in (select org_id from diadent_memberships where user_id = auth.uid() and role = 'owner'));

-- profiles
create policy "profiles_select" on diadent_profiles for select using (true);
create policy "profiles_update" on diadent_profiles for update using (id = auth.uid());

-- memberships
create policy "memberships_select" on diadent_memberships for select using (org_id in (select auth_org_ids()));
create policy "memberships_insert" on diadent_memberships for insert with check (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin')));
create policy "memberships_update" on diadent_memberships for update using (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin')));
create policy "memberships_delete" on diadent_memberships for delete using (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role = 'owner'));

-- products
create policy "products_select" on diadent_products for select using (org_id in (select auth_org_ids()));
create policy "products_insert" on diadent_products for insert with check (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin')));
create policy "products_update" on diadent_products for update using (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin')));
create policy "products_delete" on diadent_products for delete using (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin')));

-- product_sizes
create policy "sizes_select" on diadent_product_sizes for select using (product_id in (select id from diadent_products where org_id in (select auth_org_ids())));
create policy "sizes_insert" on diadent_product_sizes for insert with check (product_id in (select p.id from diadent_products p join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));
create policy "sizes_update" on diadent_product_sizes for update using (product_id in (select p.id from diadent_products p join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));
create policy "sizes_delete" on diadent_product_sizes for delete using (product_id in (select p.id from diadent_products p join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));

-- spec_points
create policy "specs_select" on diadent_spec_points for select using (product_size_id in (select ps.id from diadent_product_sizes ps join diadent_products p on p.id = ps.product_id where p.org_id in (select auth_org_ids())));
create policy "specs_insert" on diadent_spec_points for insert with check (product_size_id in (select ps.id from diadent_product_sizes ps join diadent_products p on p.id = ps.product_id join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));
create policy "specs_update" on diadent_spec_points for update using (product_size_id in (select ps.id from diadent_product_sizes ps join diadent_products p on p.id = ps.product_id join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));
create policy "specs_delete" on diadent_spec_points for delete using (product_size_id in (select ps.id from diadent_product_sizes ps join diadent_products p on p.id = ps.product_id join diadent_memberships m on m.org_id = p.org_id where m.user_id = auth.uid() and m.role in ('owner','admin')));

-- batches
create policy "batches_select" on diadent_batches for select using (org_id in (select auth_org_ids()));
create policy "batches_insert" on diadent_batches for insert with check (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst')));
create policy "batches_delete" on diadent_batches for delete using (org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst')));

-- measurements
create policy "measurements_select" on diadent_measurements for select using (batch_id in (select id from diadent_batches where org_id in (select auth_org_ids())));
create policy "measurements_insert" on diadent_measurements for insert with check (batch_id in (select id from diadent_batches where org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst'))));
create policy "measurements_delete" on diadent_measurements for delete using (batch_id in (select id from diadent_batches where org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst'))));

-- measurement_points
create policy "mpoints_select" on diadent_measurement_points for select using (measurement_id in (select m.id from diadent_measurements m join diadent_batches b on b.id = m.batch_id where b.org_id in (select auth_org_ids())));
create policy "mpoints_insert" on diadent_measurement_points for insert with check (measurement_id in (select m.id from diadent_measurements m join diadent_batches b on b.id = m.batch_id where b.org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst'))));
create policy "mpoints_delete" on diadent_measurement_points for delete using (measurement_id in (select m.id from diadent_measurements m join diadent_batches b on b.id = m.batch_id where b.org_id in (select org_id from diadent_memberships where user_id = auth.uid() and role in ('owner','admin','analyst'))));

-- ai_conversations
create policy "ai_conv_select" on diadent_ai_conversations for select using (org_id in (select auth_org_ids()));
create policy "ai_conv_insert" on diadent_ai_conversations for insert with check (org_id in (select auth_org_ids()));
create policy "ai_conv_delete" on diadent_ai_conversations for delete using (org_id in (select auth_org_ids()));

-- ai_messages
create policy "ai_msg_select" on diadent_ai_messages for select using (conversation_id in (select id from diadent_ai_conversations where org_id in (select auth_org_ids())));
create policy "ai_msg_insert" on diadent_ai_messages for insert with check (conversation_id in (select id from diadent_ai_conversations where org_id in (select auth_org_ids())));
create policy "ai_msg_delete" on diadent_ai_messages for delete using (conversation_id in (select id from diadent_ai_conversations where org_id in (select auth_org_ids())));
