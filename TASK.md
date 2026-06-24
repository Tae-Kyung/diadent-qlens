# TASK — QLens 개발 절차 & 체크리스트

> 개발의 "순서"입니다. Claude Code는 **위에서부터** 미완료(`[ ]`) 항목을 하나씩 처리하고, 완료 시 `[x]`로 바꾼 뒤 커밋합니다.
> 각 작업은 `PRD.md`의 기능 ID(F-x)와 `ARCHITECTURE.md`를 근거로 합니다. 작업 단위는 "한 번에 검증 가능한 크기"로 유지하세요.
> 규칙: 한 작업 = 한(또는 소수) 커밋. 완료 조건(AC)을 만족하지 못하면 체크하지 않습니다.
> 테이블명 접두사: `diadent_`

범례: `AC` = 완료 조건(Acceptance Criteria). 막히면 `PROMPT.md`의 "정지·질문 규칙"을 따른다.

---

## Phase 0 — 부트스트랩 & 기반
- [x] **0.1 프로젝트 생성**: Next.js(App Router, TS) + Tailwind + ESLint/Prettier. — AC: `npm run dev` 기동, 기본 페이지 렌더.
- [x] **0.2 shadcn/ui 초기화**, 기본 토큰/테마(라이트·다크). — AC: Button/Card/Input 사용 가능.
- [x] **0.3 Supabase 프로젝트 연결**: `lib/supabase/{server,client,admin}.ts`, `.env.example`. — AC: 서버 컴포넌트에서 헬스 쿼리 성공.
- [x] **0.4 품질 도구**: Vitest, Prettier. — AC: typecheck+lint+test 통과. (Playwright·CI는 Phase 9)
- [x] **0.5 CLAUDE.md 확인**: 명령어·규약이 실제와 일치하도록 갱신. — AC: 문서의 명령이 모두 동작.

## Phase 1 — 데이터 모델 & RLS (ARCHITECTURE §2)
- [x] **1.1 초기 마이그레이션** `0001_init.sql`: 전 테이블(`diadent_` 접두사 11개)·인덱스 생성. — AC: 원격 Supabase 적용 성공.
- [x] **1.2 RLS 정책** `0002_rls.sql`: `auth_org_ids()` 헬퍼 + 전 테이블 정책 + 조직 생성 트리거 + 프로필 자동 생성 트리거. — AC: 11개 테이블 모두 RLS=true 확인.
- [ ] **1.3 테넌트 격리 테스트**: 2개 조직 시드로 교차 접근 0행 확인. — AC: 통합 테스트 통과.
- [x] **1.4 데모 시드** `scripts/seed.ts`: sample.xlsx 파싱 → 1조직, 1제품, 5사이즈, 289측정, 7514포인트. — AC: DB 삽입 성공, D0 평균 xlsx와 일치 확인.

## Phase 2 — 인증 & 온보딩 (F-1)
- [x] **2.1 로그인/콜백**: 매직링크 + Google OAuth UI + callback 라우트. — AC: 코드 구현 완료.
- [x] **2.2 조직 온보딩**: 최초 로그인 시 조직 생성 UI, owner 멤버십 자동 부여. — AC: 코드 구현 완료.
- [x] **2.3 라우트 보호**: middleware + (app) layout에서 미인증 리다이렉트. — AC: 코드 구현 완료.
- [ ] **2.4 멤버 관리/초대** (F-1.4, v1). — AC: 초대→수락→역할 부여.

## Phase 3 — 마스터 데이터 (F-2)
- [x] **3.1 제품 CRUD** (admin+). — AC: 생성/삭제 UI 구현.
- [x] **3.2 사이즈 CRUD** + 정렬. — AC: 제품 하위 사이즈 관리 UI 구현.
- [x] **3.3 측정 포인트·규격 입력**: 포인트 라벨/순서 + nominal/USL/LSL + 기본 26포인트 자동 생성. — AC: UI 구현.
- [ ] **3.4 규격 CSV 일괄 등록**. — AC: 업로드로 다수 포인트 규격 일괄 반영.

## Phase 4 — 데이터 수집 (F-3)
- [x] **4.1 파서** `lib/ingest/parse.ts`: xlsx 파싱, 시트명→제품·사이즈, 요약행 자동 제외. — AC: `sample.xlsx` 파싱 단위테스트 13개 통과.
- [x] **4.2 업로드 UI**: 파일 선택 + 클라이언트 프리뷰 + 사이즈 매핑. — AC: UI 구현.
- [x] **4.3 컬럼 매핑 확인 UI**: 자동 인식된 시트→사이즈 매핑 테이블. — AC: UI 구현.
- [x] **4.4 `/api/ingest` 트랜잭션 저장**: 시트당 1배치, batch+measurement+points 벌크 삽입, 실패 시 롤백. — AC: API 구현.
- [x] **4.5 배치 삭제**: `/api/ingest` DELETE + 대시보드 삭제 버튼 + 확인. — AC: API+UI 구현.
- [ ] **4.6 (v1) 원본 재처리·다운로드**. — AC: 저장 파일 재파싱 가능.

## Phase 5 — 분석 엔진 (F-4, ARCHITECTURE §3)
- [x] **5.1 참조 구현** `lib/analytics/{stats,cpk,anomaly}.ts` + 단위테스트(엣지: n<2, std=0, 규격 없음). — AC: 테스트 15개 100% 통과.
- [ ] **5.2 RPC** `batch_point_stats`,`batch_profile`,`batch_anomalies`,`size_summary`. — AC: RPC 결과 == 참조구현(오차 1e-9). *(Supabase 연결 후)*
- [ ] **5.3 이상치 → `is_flagged` 갱신** 파이프라인 연결. — AC: 업로드 후 플래그 반영. *(Supabase 연결 후)*

## Phase 6 — 대시보드 & 시각화 (F-5)
- [x] **6.1 차트 컴포넌트**: ConeProfile(±3σ 밴드), Histogram(D0), ControlChart(전장). — AC: 컴포넌트 구현.
- [x] **6.2 대시보드 페이지** `/dashboard/[sizeId]`: 배치 선택 + KPI 카드(D0/D24/전장/Cpk) + 차트 4종 + 포인트별 통계 테이블. — AC: 코드 구현.
- [x] **6.3 불량 스크리닝 목록**(사유·이탈 σ). — AC: 이상치 테이블 구현.
- [ ] **6.4 반응형·다크모드·접근성**(키보드/포커스/명도). — AC: 모바일 폭·키보드 내비 통과.
- [ ] **6.5 (v1) 사이즈/배치 비교·추세 뷰**. — AC: 배치 간 mean/Cpk 추이.

## Phase 7 — AI 분석가 (F-6)
- [x] **7.1 `lib/ai/digest.ts`**: 통계 요약 → 프롬프트 컨텍스트(원본/PII 비전송). — AC: 코드 구현.
- [x] **7.2 `/api/ai/analyst`**: 서버에서만 Anthropic 호출, 키 비노출, 에러 핸들링. — AC: API 구현.
- [x] **7.3 대화 UI + 이력 저장** + 예시 질문 4개. — AC: UI 구현.
- [ ] **7.4 (v1) 레이트 제한·토큰 가드·근거 인용**. — AC: 과다요청 차단.

## Phase 8 — 보고서 (F-7)
- [x] **8.1 대시보드 PDF 내보내기**: `window.print()` 기반 인쇄/PDF. — AC: 내보내기 버튼 구현.
- [ ] **8.2 (v1) 배치 요약 보고서 템플릿**. — AC: 규격·판정 요약 포함 PDF.

## Phase 9 — 품질·하드닝
- [ ] **9.1 업로드→대시보드 E2E**(Playwright). — AC: 핵심 경로 1개 그린.
- [ ] **9.2 보안 점검**: RLS 누락·비밀 노출·파일 검증·OWASP 체크리스트. — AC: 점검표 전 항목 통과.
- [ ] **9.3 국제화**(ko/en) 토글. — AC: 두 언어 전환.
- [ ] **9.4 관측성**: Sentry·로그·핵심 이벤트. — AC: 에러 캡처 확인.
- [ ] **9.5 빈 상태·오류 카피** 정비. — AC: 주요 화면 빈/오류 상태 처리.

## Phase 10 — 배포
- [ ] **10.1 Supabase 프로덕션** 마이그레이션·정책 적용. — AC: 프로드 스키마 동기화.
- [ ] **10.2 Vercel 배포**: 환경변수 설정, 미리보기→프로덕션. — AC: 공개 URL 동작.
- [ ] **10.3 릴리스 검증**: PRD §8 DoD 4항목 확인. — AC: 시드 고객 시나리오 통과.

---

## 산출물 체크 (릴리스 전 최종)
- [ ] 모든 테이블 RLS + 격리 테스트 통과
- [ ] 분석 단위테스트 100% + RPC 일치 검증
- [ ] 업로드 E2E 통과, CI 그린
- [ ] 비밀키 클라이언트 미노출(자동 점검)
- [ ] PRD §8 Definition of Done 충족
