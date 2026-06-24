-- ============================================================
-- QLens · 0001_init.sql
-- 초기 스키마 (테이블 + 인덱스). RLS 정책은 0002_rls.sql 에서 정의.
-- 근거: ARCHITECTURE.md §2 (데이터 모델)
-- 테이블명 접두사: diadent_
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 조직(테넌트) ----------
create table diadent_organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  plan        text not null default 'free' check (plan in ('free','pro','enterprise')),
  created_at  timestamptz not null default now()
);

-- ---------- 사용자 프로필 (auth.users 1:1 확장) ----------
create table diadent_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  default_org_id  uuid references diadent_organizations(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ---------- 조직-사용자 멤버십 + 역할 ----------
create table diadent_memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references diadent_organizations(id) on delete cascade,
  user_id     uuid not null references diadent_profiles(id) on delete cascade,
  role        text not null check (role in ('owner','admin','analyst','viewer')),
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ---------- 제품 ----------
create table diadent_products (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references diadent_organizations(id) on delete cascade,
  name        text not null,
  code        text,
  description text,
  created_at  timestamptz not null default now()
);

-- ---------- 제품 사이즈/변형 ----------
create table diadent_product_sizes (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references diadent_products(id) on delete cascade,
  name          text not null,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- 측정 포인트 정의 + 규격 공차 ----------
create table diadent_spec_points (
  id               uuid primary key default gen_random_uuid(),
  product_size_id  uuid not null references diadent_product_sizes(id) on delete cascade,
  point_index      int not null,
  label            text not null,
  is_length        boolean not null default false,
  nominal          numeric,
  usl              numeric,
  lsl              numeric,
  unit             text not null default 'mm',
  unique (product_size_id, point_index)
);

-- ---------- 업로드 배치 ----------
create table diadent_batches (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references diadent_organizations(id) on delete cascade,
  product_size_id  uuid not null references diadent_product_sizes(id) on delete cascade,
  source_file      text,
  instrument       text,
  measured_at      timestamptz,
  uploaded_by      uuid references diadent_profiles(id) on delete set null,
  status           text not null default 'processing' check (status in ('processing','ready','failed')),
  row_count        int not null default 0,
  rejected_count   int not null default 0,
  created_at       timestamptz not null default now()
);

-- ---------- 샘플(개별 측정 단위) ----------
create table diadent_measurements (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid not null references diadent_batches(id) on delete cascade,
  sample_no   int not null,
  length      numeric,
  is_flagged  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- 측정 포인트 값 (정규화) ----------
create table diadent_measurement_points (
  id              bigint generated always as identity primary key,
  measurement_id  uuid not null references diadent_measurements(id) on delete cascade,
  point_index     int not null,
  value           numeric not null
);

-- ---------- AI 대화 ----------
create table diadent_ai_conversations (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references diadent_organizations(id) on delete cascade,
  user_id          uuid references diadent_profiles(id) on delete set null,
  product_size_id  uuid references diadent_product_sizes(id) on delete set null,
  title            text,
  created_at       timestamptz not null default now()
);

create table diadent_ai_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references diadent_ai_conversations(id) on delete cascade,
  role             text not null check (role in ('user','assistant')),
  content          text not null,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 인덱스
-- ============================================================
create index idx_memberships_user    on diadent_memberships (user_id);
create index idx_memberships_org     on diadent_memberships (org_id);
create index idx_products_org        on diadent_products (org_id);
create index idx_sizes_product       on diadent_product_sizes (product_id);
create index idx_specpoints_size     on diadent_spec_points (product_size_id);
create index idx_batches_lookup      on diadent_batches (org_id, product_size_id, created_at desc);
create index idx_measurements_batch  on diadent_measurements (batch_id);
create index idx_mpoints_measurement on diadent_measurement_points (measurement_id);
create index idx_mpoints_index       on diadent_measurement_points (point_index);
create index idx_ai_conv_org         on diadent_ai_conversations (org_id);
create index idx_ai_msg_conversation on diadent_ai_messages (conversation_id);
