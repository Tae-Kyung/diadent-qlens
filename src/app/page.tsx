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
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground mb-8 backdrop-blur">
            제조 품질관리를 위한 데이터 분석 플랫폼
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            측정 데이터를
            <br />
            <span className="text-blue-600">한눈에 분석</span>하다
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            이미지측정기에서 내보낸 Excel 파일을 업로드하면,
            제품 형상 복원 · 공정능력(Cp/Cpk) · 이상치 검출까지 자동으로 완료됩니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-base px-8 h-12">
                무료로 시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 문제 제기 ── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이런 고민, 하고 계시지 않나요?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                emoji: "📊",
                title: "Excel에 쌓이기만 하는 측정 데이터",
                desc: "매일 측정하지만, 분석은 수작업. 추세를 놓치고 있진 않은지 불안합니다.",
              },
              {
                emoji: "🔍",
                title: "이상치를 눈으로 찾는 비효율",
                desc: "수백 개 샘플에서 불량을 일일이 확인하느라 시간이 낭비됩니다.",
              },
              {
                emoji: "📋",
                title: "보고서 작성에 반나절",
                desc: "차트 만들고, 수치 정리하고, 판정 내리는 데 본업보다 시간이 걸립니다.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border bg-background p-6 space-y-3"
              >
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              QLens가 해결합니다
            </h2>
            <p className="mt-3 text-muted-foreground">
              Excel 업로드 한 번으로, 분석부터 보고서까지
            </p>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <Feature
              icon={<Upload className="h-6 w-6" />}
              title="Excel 업로드 → 자동 분석"
              desc="측정장비가 내보낸 .xlsx 파일을 그대로 올리세요. 제품·사이즈·측정 포인트를 자동으로 인식하고, 제품 등록부터 데이터 저장까지 한 번에 처리합니다."
            />
            <Feature
              icon={<Target className="h-6 w-6" />}
              title="형상 프로파일 복원"
              desc="측정 포인트 평균값으로 실제 제품 단면 형상을 시각화합니다. ±3σ 산포 밴드로 공정 변동을 직관적으로 확인할 수 있습니다."
            />
            <Feature
              icon={<TrendingUp className="h-6 w-6" />}
              title="공정능력 자동 판정"
              desc="규격(USL/LSL)을 등록하면 포인트별 Cp·Cpk를 자동 계산합니다. 1.33 미만이면 경고로 표시해 즉시 조치할 수 있습니다."
            />
            <Feature
              icon={<Shield className="h-6 w-6" />}
              title="이상치 자동 검출"
              desc="규격 이탈(OOS)과 통계 이탈(±4σ)을 자동으로 찾아 사유와 이탈 정도(σ)를 함께 보여줍니다. 불량 원인 추적이 빨라집니다."
            />
            <Feature
              icon={<MessageSquare className="h-6 w-6" />}
              title="AI 분석가에게 질문"
              desc="'팁 직경이 가장 불안정한 사이즈는?' 같은 질문을 한국어로 하면, 실제 통계 데이터를 근거로 답변합니다."
            />
            <Feature
              icon={<FileCheck className="h-6 w-6" />}
              title="원클릭 보고서"
              desc="대시보드 화면을 PDF로 바로 내보낼 수 있습니다. 차트·통계·판정이 포함된 보고서를 별도 작업 없이 공유하세요."
            />
          </div>
        </div>
      </section>

      {/* ── 분석 사례 ── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              실제 분석 사례
            </h2>
            <p className="mt-3 text-muted-foreground">
              치과재료(거타퍼차 콘) 측정 데이터 289개 샘플 분석 결과
            </p>
          </div>

          {/* KPI 예시 */}
          <div className="mt-12 grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[
              { label: "분석 사이즈", value: "5종", sub: "F1 · F2 · F3 · FX · FXL" },
              { label: "총 샘플", value: "289", sub: "33+68+68+60+60개" },
              { label: "측정 포인트", value: "7,514", sub: "26포인트 × 289샘플" },
              { label: "분석 소요", value: "< 3초", sub: "업로드부터 대시보드까지" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border bg-background p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{kpi.value}</p>
                <p className="text-sm font-medium mt-1">{kpi.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* 분석 결과 테이블 */}
          <div className="mt-12 rounded-xl border bg-background overflow-hidden">
            <div className="border-b bg-muted/50 px-6 py-3">
              <h3 className="font-semibold text-sm">Confirm Fit GP #F1 — 포인트별 분석 (발췌)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left bg-muted/30">
                    <th className="px-4 py-2.5">포인트</th>
                    <th className="px-4 py-2.5 font-mono text-right">평균 (mm)</th>
                    <th className="px-4 py-2.5 font-mono text-right">σ</th>
                    <th className="px-4 py-2.5 font-mono text-right">범위</th>
                    <th className="px-4 py-2.5 text-right">해석</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { point: "D0 (팁)", mean: "0.2286", std: "0.0169", range: "0.199~0.279", note: "가장 미세한 포인트, 산포 주의", color: "text-amber-600" },
                    { point: "D12 (중간)", mean: "0.8852", std: "0.0148", range: "0.860~0.921", note: "안정적 공정", color: "text-green-600" },
                    { point: "D24 (상단)", mean: "1.0865", std: "0.0344", range: "1.005~1.150", note: "산포 가장 큼, 관리 필요", color: "text-red-600" },
                    { point: "전장", mean: "29.320", std: "0.0950", range: "29.13~29.55", note: "관리한계 내 안정", color: "text-green-600" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2.5 font-medium">{row.point}</td>
                      <td className="px-4 py-2.5 font-mono text-right">{row.mean}</td>
                      <td className="px-4 py-2.5 font-mono text-right">{row.std}</td>
                      <td className="px-4 py-2.5 font-mono text-right text-muted-foreground">{row.range}</td>
                      <td className={`px-4 py-2.5 text-right text-xs font-medium ${row.color}`}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI 분석 예시 */}
          <div className="mt-12 rounded-xl border bg-background p-6">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              AI 분석가 대화 예시
            </h3>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm max-w-md">
                  팁 직경(D0)이 가장 불안정한 사이즈는?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-3 text-sm max-w-lg leading-relaxed">
                  F1 사이즈의 D0(팁 직경)이 σ=0.0169mm로 상대적으로 가장 큰 변동을 보입니다.
                  CV(변동계수)는 7.39%로, 다른 사이즈(F2: 6.12%, F3: 4.89%)에 비해 높습니다.
                  <br /><br />
                  특히 샘플 #22의 D0=0.206mm와 샘플 #4의 D0=0.279mm 사이 범위가 넓어,
                  <strong> 팁 성형 공정의 안정성 점검</strong>을 권장합니다.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm max-w-md">
                  전체적인 품질 수준을 평가해줘
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-3 text-sm max-w-lg leading-relaxed">
                  전체 5개 사이즈의 품질 수준을 요약하면:
                  <br /><br />
                  <strong>전장(길이)</strong>: 모든 사이즈에서 σ &lt; 0.1mm로 매우 안정적입니다.
                  <br />
                  <strong>직경(D0~D24)</strong>: 중간 포인트(D8~D16)는 안정적이나,
                  팁(D0)과 상단(D22~D24)에서 산포가 커지는 경향이 있습니다.
                  <br /><br />
                  규격(USL/LSL)을 등록하시면 Cpk 기반의 정량적 판정이 가능합니다.
                </div>
              </div>
            </div>
          </div>

          {/* 인사이트 카드 */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "팁(D0) 산포 경고",
                desc: "F1 사이즈 D0의 변동계수가 7.39%로 가장 높음. 팁 성형 공정 점검 권장.",
                tag: "이상치 검출",
              },
              {
                icon: "📐",
                title: "상단부 테이퍼 편차",
                desc: "D22~D24 구간에서 σ가 0.03mm 이상으로 증가. 상단 절삭 균일성 확인 필요.",
                tag: "형상 분석",
              },
              {
                icon: "✅",
                title: "전장 안정성 확인",
                desc: "전 사이즈 전장 σ < 0.1mm, 관리한계(±3σ) 이내. 길이 공정은 안정 상태.",
                tag: "관리도",
              },
            ].map((insight, i) => (
              <div key={i} className="rounded-xl border bg-background p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{insight.icon}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {insight.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-sm">{insight.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 사용 방법 ── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            3단계로 시작하세요
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Excel 업로드",
                desc: "측정장비에서 내보낸 .xlsx 파일을 선택하면 제품·사이즈가 자동으로 등록됩니다.",
                icon: <Upload className="h-5 w-5" />,
              },
              {
                step: "2",
                title: "대시보드 확인",
                desc: "형상 프로파일, 히스토그램, 관리도, KPI 카드로 품질 현황을 한눈에 파악합니다.",
                icon: <BarChart3 className="h-5 w-5" />,
              },
              {
                step: "3",
                title: "규격 등록 (옵션)",
                desc: "CSV로 규격을 일괄 등록하면 Cpk·합격률이 활성화됩니다. 없어도 기본 분석은 가능합니다.",
                icon: <Zap className="h-5 w-5" />,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {item.icon}
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 대상 고객 ── */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이런 분들을 위해 만들었습니다
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              "매일 측정 데이터를 Excel로 관리하는 QC 담당자",
              "공정능력 보고서를 수작업으로 만드는 품질 팀장",
              "현장 품질 현황을 빠르게 파악하고 싶은 경영진",
              "이미지측정기(LM-X 등) 데이터를 활용하고 싶은 제조 SME",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            측정 데이터, 더 이상 방치하지 마세요
          </h2>
          <p className="mt-4 text-blue-100 max-w-lg mx-auto">
            Excel 파일 하나면 충분합니다. 지금 바로 업로드하고 품질 인사이트를 확인하세요.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 text-base px-8 h-12"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            QLens — 측정 데이터 품질 분석 플랫폼
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Diadent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
