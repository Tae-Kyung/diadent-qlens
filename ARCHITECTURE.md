# ARCHITECTURE — QLens

> 제품의 "어떻게"를 정의합니다. `PRD.md`의 기능을 구현하는 시스템 구조·데이터 모델·핵심 결정입니다.
> Claude Code는 새 모듈을 만들기 전 이 문서를 근거로 삼고, 구조를 바꿔야 할 때는 먼저 이 문서를 갱신합니다.

---

## 1. 시스템 개요

```
 [브라우저/Next.js Client]
      │  (인증 쿠키, 읽기 쿼리는 Supabase JS + RLS)
      ▼
 [Vercel: Next.js App Router]
   ├─ Server Components / Server Actions  ── 읽기 쿼리, 페이지 렌더
   ├─ Route Handlers (/api/*)             ── 업로드 파싱, AI 프록시(키 서버보관)
   └─ (선택) Edge/Node 런타임 분리
      │
      ▼
 [Supabase]
   ├─ Postgres (+ RLS, RPC 함수: 통계/Cpk/이상치)
   ├─ Auth (이메일/매직링크/OAuth)
   ├─ Storage (원본 파일, 조직 스코프 정책)
   └─ (선택) Edge Functions
      │
      ▼
 [Anthropic Claude API]  ── 서버에서만 호출, 키는 Vercel 환경변수
```

### 핵심 결정 (ADR 요약)
- **D1. 분석은 DB 측 RPC(Postgres 함수)로 계산.** 클라이언트/앱에서 통계를 재구현하지 않는다. 일관성·성능·NL2SQL(v2) 확장에 유리.
- **D2. 측정 포인트는 정규화 테이블(`measurement_points`)로 저장.** 제품마다 포인트 수가 다르므로 jsonb 대신 행 단위. SPC 집계·규격 조인이 SQL로 자연스럽다.
- **D3. 비밀(Anthropic 키, service_role 키)은 서버 전용.** 클라이언트 번들·아티팩트에 절대 포함하지 않는다.
- **D4. 멀티테넌시는 `org_id` + RLS로 강제.** 앱 레이어 권한 체크에 의존하지 않는다(RLS가 1차 방어선).
- **D5. 쓰기(업로드 파싱)는 트랜잭션 + service_role 서버 라우트.** 부분 저장 금지.

---

## 2. 데이터 모델 (Postgres)

전체 DDL은 `supabase/migrations/0001_init.sql`로 구현. 아래는 권위 있는 설계 명세.

### 2.1 테이블

```sql
-- 조직(테넌트)
organizations(
  id uuid pk default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',          -- free|pro|enterprise
  created_at timestamptz default now()
)

-- 사용자 프로필 (auth.users 1:1 확장)
profiles(
  id uuid pk references auth.users(id) on delete cascade,
  full_name text,
  default_org_id uuid references organizations(id),
  created_at timestamptz default now()
)

-- 조직-사용자 멤버십 + 역할
memberships(
  id uuid pk default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','analyst','viewer')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
)

-- 제품 (예: Confirm Fit GP)
products(
  id uuid pk default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  code text,
  description text,
  created_at timestamptz default now()
)

-- 제품 사이즈/변형 (예: F1, F2, FX)
product_sizes(
  id uuid pk default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,                          -- "#F1"
  display_order int default 0,
  created_at timestamptz default now()
)

-- 측정 포인트 정의 + 규격 공차 (사이즈별 가변)
spec_points(
  id uuid pk default gen_random_uuid(),
  product_size_id uuid not null references product_sizes(id) on delete cascade,
  point_index int not null,                    -- 0..N (전장은 별도 index 또는 is_length)
  label text not null,                         -- "D0".."D24","전장"
  is_length boolean default false,
  nominal numeric,
  usl numeric,                                 -- upper spec limit (nullable)
  lsl numeric,                                 -- lower spec limit (nullable)
  unit text default 'mm',
  unique(product_size_id, point_index)
)

-- 업로드 배치
batches(
  id uuid pk default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  product_size_id uuid not null references product_sizes(id),
  source_file text,                            -- storage 경로
  instrument text,                             -- "LM-X 100TL\n이미지측정기" (C4 셀, 멀티라인)
  measured_at timestamptz,
  uploaded_by uuid references profiles(id),
  status text not null default 'processing',   -- processing|ready|failed
  row_count int default 0,
  rejected_count int default 0,
  created_at timestamptz default now()
)

-- 샘플(개별 측정 단위)
measurements(
  id uuid pk default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  sample_no int not null,
  length numeric,                              -- 전장 (편의 컬럼)
  is_flagged boolean default false,            -- 이상치 여부(계산 후 갱신)
  created_at timestamptz default now()
)

-- 측정 포인트 값 (정규화)
measurement_points(
  id bigint pk generated always as identity,
  measurement_id uuid not null references measurements(id) on delete cascade,
  point_index int not null,
  value numeric not null
)

-- AI 대화
ai_conversations(
  id uuid pk default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id),
  product_size_id uuid references product_sizes(id),
  title text,
  created_at timestamptz default now()
)
ai_messages(
  id uuid pk default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
)
```

### 2.2 인덱스
- `measurement_points(measurement_id)`, `measurement_points(point_index)`
- `measurements(batch_id)`
- `batches(org_id, product_size_id, created_at desc)`
- `memberships(user_id)`, `memberships(org_id)`

### 2.3 RLS 정책 (원칙)
- 모든 비즈니스 테이블에 `enable row level security`.
- 접근 가능 조직 집합 헬퍼:
  ```sql
  create function auth_org_ids() returns setof uuid
  language sql stable security definer set search_path = public as $$
    select org_id from memberships where user_id = auth.uid()
  $$;
  ```
- `organizations`: `id in (select auth_org_ids())` 읽기. 생성은 인증 사용자 허용 + 트리거로 생성자에게 owner 멤버십 부여.
- `products/product_sizes/spec_points/batches/measurements/measurement_points/ai_*`: 직간접 `org_id` 가 `auth_org_ids()`에 포함될 때만 select. 자식 테이블은 부모 조인으로 검증.
- 쓰기 권한은 역할 기준: `viewer`는 읽기만, `analyst`는 배치/측정 생성, `admin`은 마스터 데이터, `owner`는 조직/멤버십.
- **테넌트 격리 테스트**가 RLS의 합격 기준이다(다른 org 데이터 0행 반환).

---

## 3. 핵심 RPC (Postgres 함수)

> 분석 계산의 단일 진실 공급원. 앱은 결과만 소비한다.

- `batch_point_stats(p_batch_id uuid)` → 포인트별 `{point_index,label,n,mean,std,min,max,nominal,usl,lsl,cp,cpk,oos_count}`
  - `Cp = (USL-LSL)/(6*std)`, `Cpk = min((USL-mean),(mean-LSL))/(3*std)` (USL/LSL 존재 시에만; 없으면 null).
  - `std`는 표본표준편차. n<2 또는 std=0 가드(0 division 금지 → null).
- `batch_profile(p_batch_id uuid)` → 형상 복원용 포인트별 mean/±3σ 배열.
- `batch_anomalies(p_batch_id uuid, k numeric default 4)` → 통계 이탈(±kσ) + 규격 이탈 샘플 목록(사유·이탈 σ 포함).
- `size_summary(p_product_size_id uuid)` → 최근 배치 또는 사이즈 전체 요약(AI digest 입력).

검증: 동일 데이터에 대해 Postgres RPC 결과 == 앱/테스트의 참조 구현 결과(허용 오차 1e-9).

---

## 4. 애플리케이션 구조 (Next.js)

```
app/
  (marketing)/                 # 공개 랜딩
  (auth)/login, /callback      # Supabase auth
  (app)/
    onboarding/                # 조직 생성
    dashboard/[sizeId]/        # 메인 분석 화면
    products/                  # 마스터 데이터 관리
    upload/                    # 업로드 + 컬럼 매핑
    settings/(org, members)/
  api/
    ingest/route.ts            # 파일 파싱·저장 (Node 런타임, service_role)
    ai/analyst/route.ts        # Claude 프록시 (키 서버보관)
lib/
  supabase/{server,client,admin}.ts
  analytics/{stats,cpk,anomaly}.ts   # 참조 구현 + 단위테스트 대상
  ingest/parse.ts              # xlsx/csv 파서
  ai/digest.ts                 # 통계 → 프롬프트 컨텍스트
components/
  charts/{ConeProfile,TaperBand,Histogram,ControlChart}.tsx
  ...
supabase/
  migrations/*.sql
  seed.sql                     # sample.xlsx 기반 GP 데이터 시드(5사이즈, 26포인트)
```

### 4.1 데이터 접근 규칙
- **읽기**: Server Component에서 사용자 쿠키 기반 Supabase 클라이언트(RLS 적용)로 직접 쿼리.
- **민감 쓰기/파싱**: Route Handler에서 `service_role`로 트랜잭션 처리하되, **반드시** 요청자의 org 멤버십·역할을 코드로 재검증한 뒤 수행.
- **AI**: `/api/ai/analyst`만 Anthropic 키 사용. 입력은 `lib/ai/digest.ts`가 만든 통계 요약(원시 PII/대용량 원본은 보내지 않음).

### 4.2 실측 데이터 포맷 (sample.xlsx 기준)

> 파서(`lib/ingest/parse.ts`)의 권위 있는 입력 명세. 시드 고객(다이아덴트) LM-X 100TL 출력 기준.

```
파일: .xlsx (1파일 = 1제품, 시트 = 사이즈)
시트명: "{제품명} #{사이즈명}"  예) "Confirm Fit GP #F1"

레이아웃 (모든 시트 동일):
  Row 1 : (빈 행 — 무시)
  Row 2 : A="검체"  C="측정 장비"  D="No"  E="측정 값"  ← 헤더 탐지 앵커
  Row 3 :                          E="D0" F="D1" ... AC="D24" AD="전장"  ← 포인트 라벨
  Row 4+: A=제품명(4행만) C=장비명(4행만, 멀티라인 "LM-X 100TL\n이미지측정기")
          D=sample_no(정수)  E~AC=D0..D24(numeric, mm)  AD=전장(numeric, mm)
  ──── 데이터 끝 ────
  Row N+1~: 요약 통계행(평균값/Taper/최소값/최대값/관리한계/편차/표준편차/기준값)
            → D열이 정수가 아닌 한국어 문자열 → 파서가 제외

컬럼 고정 위치:
  Col D (4) = sample_no
  Col E~AC (5~29) = D0..D24 직경 (25개)
  Col AD (30) = 전장
  총 측정 포인트 = 26 (직경 25 + 전장 1)

사이즈별 샘플 수 (참고):
  F1=33, F2=75, F3=78, FX=70, FXL=70

주의:
  - 규격(nominal/USL/LSL)은 파일에 미포함 → 별도 마스터데이터 입력(F-2.4)
  - 요약행 판별: D열 값이 정수(int)인 행만 측정 데이터로 취급
  - 인코딩: xlsx 내부 UTF-8이지만 일부 라이브러리에서 한국어 깨짐 가능 → SheetJS(xlsx) 권장
```

### 4.3 업로드 파이프라인
1. 클라이언트가 파일을 Storage(조직 스코프)에 업로드 → 경로 획득.
2. `/api/ingest` 호출: 파일 로드 → 파서가 시트명에서 제품·사이즈 추출, 컬럼 위치 자동 인식 → 매핑(사용자 확정값) 적용.
3. 트랜잭션: `batches` 생성(시트당 1배치) → `measurements`/`measurement_points` 벌크 삽입 → 유효성 리포트(총 행·제외 행·제외 사유).
4. RPC로 이상치 계산 → `measurements.is_flagged`, `batches.status='ready'` 갱신.

---

## 5. 보안 체크 (필수)
- `NEXT_PUBLIC_*` 에는 anon 키와 공개 URL만. `service_role`·`ANTHROPIC_API_KEY`는 비공개 서버 변수.
- 클라이언트 번들에 비밀이 포함됐는지 빌드 후 grep 점검(CI 단계).
- 모든 신규 테이블은 RLS 활성 + 정책 동반 마이그레이션 없이는 머지 금지.
- 파일 업로드: 확장자/크기/시그니처 검증, 파싱 시 수식·매크로 무시.

---

## 6. 환경변수 (.env.example 로 제공)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # 서버 전용
ANTHROPIC_API_KEY=                 # 서버 전용
ANTHROPIC_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_APP_URL=
```
