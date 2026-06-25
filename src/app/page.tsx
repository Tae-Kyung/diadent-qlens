import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  BarChart3,
  Shield,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  FileCheck,
  ArrowRight,
  CheckCircle,
  Activity,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ── */}
      <header className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-surface-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-clinical-blue flex items-center justify-center">
              <span className="text-white font-heading font-bold text-base">Q</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-clinical-blue tracking-tight">
                DiaDent
              </span>
              <span className="font-heading text-lg font-semibold text-foreground tracking-tight">
                QLens
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              기능
            </a>
            <a href="#case-study" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              분석 사례
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              사용 방법
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-surface-border text-muted-foreground hover:text-clinical-blue hover:border-clinical-blue hidden sm:inline-flex">
                로그인
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-clinical-blue hover:brightness-110 text-white">
                무료로 시작
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#005696]/[0.03] via-background to-background" />
        <div className="absolute top-16 right-0 w-[600px] h-[600px] bg-clinical-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-action/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-card/80 backdrop-blur px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-teal-action animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">치과 기구 제조 품질관리 플랫폼</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              측정 데이터를
              <br />
              <span className="text-clinical-blue">한눈에 분석</span>하다
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              이미지측정기에서 내보낸 Excel 파일을 업로드하면,
              제품 형상 복원 · 공정능력(Cp/Cpk) · 이상치 검출까지 자동으로 완료됩니다.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-clinical-blue hover:brightness-110 text-white text-base px-8 h-12 clinical-shadow">
                  무료로 시작하기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#case-study">
                <Button variant="outline" size="lg" className="border-surface-border text-muted-foreground hover:text-clinical-blue hover:border-clinical-blue text-base px-8 h-12">
                  분석 사례 보기
                </Button>
              </a>
            </div>

            {/* Trust Signals */}
            <div className="mt-14 flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-action" />
                <span className="text-sm">설치 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-action" />
                <span className="text-sm">3초 만에 분석 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-action" />
                <span className="text-sm">AI 기반 인사이트</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 문제 제기 ── */}
      <section className="border-t border-surface-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Pain Points</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              이런 고민, 하고 계시지 않나요?
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Excel에 쌓이기만 하는 측정 데이터",
                desc: "매일 측정하지만, 분석은 수작업. 추세를 놓치고 있진 않은지 불안합니다.",
              },
              {
                icon: <Target className="h-6 w-6" />,
                title: "이상치를 눈으로 찾는 비효율",
                desc: "수백 개 샘플에서 불량을 일일이 확인하느라 시간이 낭비됩니다.",
              },
              {
                icon: <FileCheck className="h-6 w-6" />,
                title: "보고서 작성에 반나절",
                desc: "차트 만들고, 수치 정리하고, 판정 내리는 데 본업보다 시간이 걸립니다.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-border bg-card p-6 space-y-4 hover:clinical-shadow transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-clinical-blue/10 text-clinical-blue flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-heading font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section id="features" className="border-t border-surface-border scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              QLens가 해결합니다
            </h2>
            <p className="mt-3 text-muted-foreground">
              Excel 업로드 한 번으로, 분석부터 보고서까지
            </p>
          </div>
          <div className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Upload className="h-5 w-5" />}
              color="bg-clinical-blue/10 text-clinical-blue"
              title="Excel 업로드 → 자동 분석"
              desc="측정장비가 내보낸 .xlsx 파일을 그대로 올리세요. 제품·사이즈·측정 포인트를 자동으로 인식합니다."
            />
            <Feature
              icon={<Target className="h-5 w-5" />}
              color="bg-teal-action/10 text-teal-action"
              title="형상 프로파일 복원"
              desc="측정 포인트 평균값으로 실제 제품 단면 형상을 시각화합니다. ±3σ 산포 밴드로 공정 변동을 확인합니다."
            />
            <Feature
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-diagnostic-yellow/10 text-diagnostic-yellow"
              title="공정능력 자동 판정"
              desc="규격(USL/LSL)을 등록하면 포인트별 Cp·Cpk를 자동 계산합니다. 1.33 미만이면 경고로 표시합니다."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              color="bg-destructive/10 text-destructive"
              title="이상치 자동 검출"
              desc="규격 이탈(OOS)과 통계 이탈(±4σ)을 자동으로 찾아 사유와 이탈 정도(σ)를 함께 보여줍니다."
            />
            <Feature
              icon={<MessageSquare className="h-5 w-5" />}
              color="bg-clinical-blue/10 text-clinical-blue"
              title="AI 분석가에게 질문"
              desc="'팁 직경이 가장 불안정한 사이즈는?' 같은 질문을 한국어로 하면, 통계 데이터를 근거로 답변합니다."
            />
            <Feature
              icon={<FileCheck className="h-5 w-5" />}
              color="bg-teal-action/10 text-teal-action"
              title="원클릭 PDF 보고서"
              desc="대시보드 화면을 PDF로 바로 내보낼 수 있습니다. 차트·통계·판정이 포함된 보고서를 즉시 공유하세요."
            />
          </div>
        </div>
      </section>

      {/* ── 분석 사례 ── */}
      <section id="case-study" className="border-t border-surface-border bg-secondary/30 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Case Study</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              실제 분석 사례
            </h2>
            <p className="mt-3 text-muted-foreground">
              치과재료(거타퍼차 콘) 측정 데이터 289개 샘플 분석 결과
            </p>
          </div>

          {/* KPI */}
          <div className="mt-14 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "분석 사이즈", value: "5종", sub: "F1 · F2 · F3 · FX · FXL" },
              { label: "총 샘플", value: "289", sub: "33+68+68+60+60개" },
              { label: "측정 포인트", value: "7,514", sub: "26포인트 × 289샘플" },
              { label: "분석 소요", value: "< 3초", sub: "업로드부터 대시보드까지" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-card p-5 text-center hover:clinical-shadow transition-all">
                <p className="font-heading text-3xl font-bold text-clinical-blue">{kpi.value}</p>
                <p className="text-sm font-semibold mt-1">{kpi.label}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* 분석 테이블 */}
          <div className="mt-10 rounded-xl border border-surface-border bg-card overflow-hidden">
            <div className="border-b border-surface-border bg-card px-6 py-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-clinical-blue" />
              <h3 className="font-heading font-semibold text-sm">Confirm Fit GP #F1 — 포인트별 분석 (발췌)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-secondary/50">
                    <th className="px-6 py-3 text-left font-mono text-xs text-muted-foreground uppercase tracking-wider">포인트</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">평균 (mm)</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">σ</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">범위</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">해석</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { point: "D0 (팁)", mean: "0.2286", std: "0.0169", range: "0.199~0.279", note: "산포 주의", color: "text-diagnostic-yellow" },
                    { point: "D12 (중간)", mean: "0.8852", std: "0.0148", range: "0.860~0.921", note: "안정적 공정", color: "text-teal-action" },
                    { point: "D24 (상단)", mean: "1.0865", std: "0.0344", range: "1.005~1.150", note: "관리 필요", color: "text-destructive" },
                    { point: "전장", mean: "29.320", std: "0.0950", range: "29.13~29.55", note: "관리한계 내 안정", color: "text-teal-action" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3 font-semibold">{row.point}</td>
                      <td className="px-6 py-3 font-mono text-right">{row.mean}</td>
                      <td className="px-6 py-3 font-mono text-right">{row.std}</td>
                      <td className="px-6 py-3 font-mono text-right text-muted-foreground">{row.range}</td>
                      <td className={`px-6 py-3 text-right text-xs font-mono font-bold uppercase ${row.color}`}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Chat Preview */}
          <div className="mt-10 rounded-xl border border-surface-border bg-card overflow-hidden">
            <div className="border-b border-surface-border px-6 py-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-clinical-blue" />
              <h3 className="font-heading font-semibold text-sm">AI 분석가 대화 예시</h3>
            </div>
            <div className="p-6 space-y-4 bg-secondary/20">
              <div className="flex justify-end">
                <div className="rounded-xl bg-clinical-blue text-white px-4 py-3 text-sm max-w-md">
                  팁 직경(D0)이 가장 불안정한 사이즈는?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-xl bg-card border border-surface-border px-5 py-4 text-sm max-w-lg leading-relaxed">
                  F1 사이즈의 D0(팁 직경)이 <strong className="text-clinical-blue">σ=0.0169mm</strong>로 상대적으로 가장 큰 변동을 보입니다.
                  CV(변동계수)는 7.39%로, 다른 사이즈(F2: 6.12%, F3: 4.89%)에 비해 높습니다.
                  <br /><br />
                  특히 샘플 #22의 D0=0.206mm와 샘플 #4의 D0=0.279mm 사이 범위가 넓어,
                  <strong className="text-clinical-blue"> 팁 성형 공정의 안정성 점검</strong>을 권장합니다.
                </div>
              </div>
            </div>
          </div>

          {/* Insight Cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Target className="h-5 w-5 text-diagnostic-yellow" />,
                title: "팁(D0) 산포 경고",
                desc: "F1 사이즈 D0의 변동계수가 7.39%로 가장 높음. 팁 성형 공정 점검 권장.",
                tag: "이상치 검출",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-clinical-blue" />,
                title: "상단부 테이퍼 편차",
                desc: "D22~D24 구간에서 σ가 0.03mm 이상으로 증가. 상단 절삭 균일성 확인 필요.",
                tag: "형상 분석",
              },
              {
                icon: <CheckCircle className="h-5 w-5 text-teal-action" />,
                title: "전장 안정성 확인",
                desc: "전 사이즈 전장 σ < 0.1mm, 관리한계(±3σ) 이내. 길이 공정은 안정 상태.",
                tag: "관리도",
              },
            ].map((insight, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-card p-5 space-y-3 hover:clinical-shadow transition-all">
                <div className="flex items-center justify-between">
                  {insight.icon}
                  <span className="font-mono text-[10px] font-bold text-clinical-blue bg-clinical-blue/10 px-2 py-1 rounded uppercase">
                    {insight.tag}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-sm">{insight.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 사용 방법 ── */}
      <section id="how-it-works" className="border-t border-surface-border scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              3단계로 시작하세요
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3 relative">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-surface-border" />

            {[
              {
                step: "1",
                title: "Excel 업로드",
                desc: "측정장비에서 내보낸 .xlsx 파일을 선택하면 제품·사이즈가 자동으로 등록됩니다.",
                icon: <Upload className="h-6 w-6" />,
              },
              {
                step: "2",
                title: "대시보드 확인",
                desc: "형상 프로파일, 히스토그램, 관리도, KPI 카드로 품질 현황을 한눈에 파악합니다.",
                icon: <BarChart3 className="h-6 w-6" />,
              },
              {
                step: "3",
                title: "규격 등록 (옵션)",
                desc: "규격을 등록하면 Cpk·합격률이 활성화됩니다. 없어도 기본 분석은 가능합니다.",
                icon: <Zap className="h-6 w-6" />,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4 relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-clinical-blue/10 text-clinical-blue relative z-10">
                  {item.icon}
                </div>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clinical-blue text-white font-mono text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 대상 고객 ── */}
      <section className="border-t border-surface-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Who It&apos;s For</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              이런 분들을 위해 만들었습니다
            </h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {[
              "매일 측정 데이터를 Excel로 관리하는 QC 담당자",
              "공정능력 보고서를 수작업으로 만드는 품질 팀장",
              "현장 품질 현황을 빠르게 파악하고 싶은 경영진",
              "이미지측정기(LM-X 등) 데이터를 활용하고 싶은 제조 SME",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-surface-border bg-card p-5 hover:clinical-shadow transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-action/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-teal-action" />
                </div>
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-surface-border relative overflow-hidden">
        <div className="absolute inset-0 bg-clinical-blue" />
        <div className="absolute inset-0 bg-gradient-to-br from-clinical-blue via-clinical-blue to-[#003e6f]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-heading font-bold text-2xl">Q</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
            측정 데이터, 더 이상 방치하지 마세요
          </h2>
          <p className="mt-4 text-white/70 max-w-lg mx-auto">
            Excel 파일 하나면 충분합니다. 지금 바로 업로드하고 품질 인사이트를 확인하세요.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="mt-8 bg-white text-clinical-blue hover:bg-white/90 text-base px-8 h-12 font-semibold clinical-shadow"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-clinical-blue flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">Q</span>
              </div>
              <div>
                <span className="font-heading text-sm font-bold text-clinical-blue">DiaDent</span>
                <span className="font-heading text-sm font-semibold text-foreground ml-1">QLens</span>
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Diadent Group. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <h3 className="font-heading font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
