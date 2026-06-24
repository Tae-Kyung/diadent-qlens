"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConeProfile } from "@/components/charts/cone-profile";
import { Histogram } from "@/components/charts/histogram";
import { ControlChart } from "@/components/charts/control-chart";
import { descriptiveStats } from "@/lib/analytics/stats";
import { calcCpk } from "@/lib/analytics/cpk";
import { detectAnomalies } from "@/lib/analytics/anomaly";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Download, Info } from "lucide-react";
import Link from "next/link";
import type { SpecPoint, Anomaly } from "@/lib/types";

interface PointAnalysis {
  label: string;
  pointIndex: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  n: number;
  cp: number | null;
  cpk: number | null;
  usl: number | null;
  lsl: number | null;
  nominal: number | null;
  values: number[];
}

export default function SizeDashboardPage() {
  const { sizeId } = useParams<{ sizeId: string }>();
  const supabase = createClient();
  const router = useRouter();

  const [sizeName, setSizeName] = useState("");
  const [productName, setProductName] = useState("");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<PointAnalysis[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [lengthData, setLengthData] = useState<{ sampleNo: number; value: number }[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  async function loadData() {
    // 사이즈 정보
    const { data: size } = await supabase
      .from("diadent_product_sizes")
      .select("*, diadent_products(name, org_id)")
      .eq("id", sizeId)
      .single();

    if (size) {
      setSizeName(size.name);
      setProductName((size as any).diadent_products?.name || "");
      setOrgId((size as any).diadent_products?.org_id || null);
    }

    // 배치 목록
    const { data: b } = await supabase
      .from("diadent_batches")
      .select("id, created_at, row_count, status, source_file")
      .eq("product_size_id", sizeId)
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (b && b.length > 0) {
      setBatches(b);
      setBatchId(b[0].id);
    }
  }

  async function analyze(bid: string) {
    // 규격 가져오기
    const { data: specs } = await supabase
      .from("diadent_spec_points")
      .select("*")
      .eq("product_size_id", sizeId)
      .order("point_index");

    // 측정 데이터 가져오기
    const { data: measurements } = await supabase
      .from("diadent_measurements")
      .select("id, sample_no, length")
      .eq("batch_id", bid)
      .order("sample_no");

    if (!measurements || measurements.length === 0) {
      setAnalysis([]);
      return;
    }

    const mIds = measurements.map((m) => m.id);
    const { data: points } = await supabase
      .from("diadent_measurement_points")
      .select("measurement_id, point_index, value")
      .in("measurement_id", mIds);

    if (!points) return;

    // 포인트별로 값 그룹핑
    const pointMap = new Map<number, number[]>();
    for (const p of points) {
      if (!pointMap.has(p.point_index)) pointMap.set(p.point_index, []);
      pointMap.get(p.point_index)!.push(Number(p.value));
    }

    // 포인트별 분석
    const specMap = new Map<number, SpecPoint>();
    if (specs) {
      for (const s of specs) specMap.set(s.point_index, s as SpecPoint);
    }

    const results: PointAnalysis[] = [];
    const allPointIndices = Array.from(pointMap.keys()).sort((a, b) => a - b);

    for (const pi of allPointIndices) {
      const values = pointMap.get(pi)!;
      const stat = descriptiveStats(values);
      const spec = specMap.get(pi);
      const { cp, cpk } = calcCpk(
        stat.mean,
        stat.std,
        spec?.usl ?? null,
        spec?.lsl ?? null,
      );

      results.push({
        label: spec?.label || `P${pi}`,
        pointIndex: pi,
        mean: stat.mean ?? 0,
        std: stat.std ?? 0,
        min: stat.min ?? 0,
        max: stat.max ?? 0,
        n: stat.n,
        cp,
        cpk,
        usl: spec?.usl ?? null,
        lsl: spec?.lsl ?? null,
        nominal: spec?.nominal ?? null,
        values,
      });
    }

    setAnalysis(results);

    // 전장 관리도 데이터
    const ld = measurements
      .filter((m) => m.length != null)
      .map((m) => ({ sampleNo: m.sample_no, value: Number(m.length) }));
    setLengthData(ld);

    // 이상치 검출
    const samplesForAnomaly = measurements.map((m) => {
      const samplePoints = points.filter((p) => p.measurement_id === m.id);
      const vals: (number | null)[] = [];
      for (const pi of allPointIndices) {
        const pt = samplePoints.find((p) => p.point_index === pi);
        vals.push(pt ? Number(pt.value) : null);
      }
      return { sampleNo: m.sample_no, values: vals };
    });

    const anomalyStats = results.map((r) => ({
      pointIndex: allPointIndices.indexOf(r.pointIndex),
      mean: r.mean,
      std: r.std,
      usl: r.usl,
      lsl: r.lsl,
    }));

    const detected = detectAnomalies(samplesForAnomaly, anomalyStats);
    setAnomalies(
      detected.map((a) => ({
        ...a,
        measurement_id: "",
        label: results[a.pointIndex]?.label || `P${a.pointIndex}`,
      })),
    );
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [sizeId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (batchId) analyze(batchId); }, [batchId]);

  async function handleDeleteBatch(bid: string) {
    if (!confirm("이 배치를 삭제하시겠습니까?")) return;
    await fetch("/api/ingest", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: bid, orgId }),
    });
    loadData();
  }

  // 규격 설정 여부
  const hasSpec = analysis.some((a) => a.usl !== null || a.lsl !== null);
  const hasCpk = analysis.some((a) => a.cpk !== null);

  // 합격률 (규격 있는 포인트만)
  const oosCount = anomalies.filter((a) => a.reason.includes("USL") || a.reason.includes("LSL")).length;
  const totalChecks = analysis.filter((a) => a.usl !== null || a.lsl !== null).reduce((sum, a) => sum + a.n, 0);
  const passRate = totalChecks > 0 ? ((totalChecks - oosCount) / totalChecks) * 100 : null;

  // 프로파일 차트 데이터 (전장 제외)
  const profileData = analysis
    .filter((a) => !a.label.includes("전장"))
    .map((a) => ({
      label: a.label,
      mean: a.mean,
      upper3s: a.mean + 3 * a.std,
      lower3s: a.mean - 3 * a.std,
      nominal: a.nominal,
    }));

  // 전장 통계
  const lengthStats = analysis.find((a) => a.label.includes("전장"));
  const lengthMean = lengthStats?.mean ?? 0;
  const lengthStd = lengthStats?.std ?? 0;

  // D0 히스토그램
  const d0 = analysis.find((a) => a.label === "D0");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {productName} #{sizeName}
        </h1>
        {analysis.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto print:hidden"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF 내보내기
          </Button>
        )}
      </div>

      {/* 배치 선택 */}
      {batches.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            value={batchId || ""}
            onChange={(e) => setBatchId(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {new Date(b.created_at).toLocaleDateString("ko-KR")} — {b.row_count}개 샘플
                {b.source_file ? ` (${b.source_file})` : ""}
              </option>
            ))}
          </select>
          {batchId && (
            <Button variant="ghost" size="sm" onClick={() => handleDeleteBatch(batchId)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      )}

      {analysis.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            배치 데이터가 없습니다. 데이터를 업로드해주세요.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI 카드 */}
          <div className={`grid gap-4 ${hasSpec ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
            <KpiCard label="D0 평균" value={d0?.mean} unit="mm" />
            <KpiCard label="D24 평균" value={analysis.find((a) => a.label === "D24")?.mean} unit="mm" />
            <KpiCard label="전장 평균" value={lengthStats?.mean} unit="mm" />
            <KpiCard
              label="최소 Cpk"
              value={
                analysis
                  .filter((a) => a.cpk !== null)
                  .reduce((min, a) => Math.min(min, a.cpk!), Infinity) === Infinity
                  ? null
                  : analysis
                      .filter((a) => a.cpk !== null)
                      .reduce((min, a) => Math.min(min, a.cpk!), Infinity)
              }
              warn
            />
            {hasSpec && (
              <KpiCard
                label="합격률"
                value={passRate}
                unit="%"
                good
              />
            )}
          </div>

          {/* 규격 미설정 안내 (옵션) */}
          {!hasSpec && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  규격(USL/LSL)을 등록하면 Cpk·합격률을 확인할 수 있습니다
                </p>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  현재는 통계 이탈(±4σ) 기준으로만 이상치를 검출합니다.
                </p>
                <Link
                  href={`/products`}
                  className="inline-block mt-2 text-blue-700 dark:text-blue-300 underline hover:no-underline"
                >
                  규격 설정하러 가기 →
                </Link>
              </div>
            </div>
          )}

          {/* 형상 프로파일 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">형상 프로파일 (직경 평균 ± 3σ)</CardTitle>
            </CardHeader>
            <CardContent>
              <ConeProfile data={profileData} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* 팁 직경 히스토그램 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">D0 (팁 직경) 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <Histogram
                  values={d0?.values || []}
                  usl={d0?.usl}
                  lsl={d0?.lsl}
                />
              </CardContent>
            </Card>

            {/* 전장 관리도 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">전장 관리도</CardTitle>
              </CardHeader>
              <CardContent>
                {lengthData.length > 0 ? (
                  <ControlChart
                    data={lengthData}
                    mean={lengthMean}
                    ucl={lengthMean + 3 * lengthStd}
                    lcl={lengthMean - 3 * lengthStd}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">전장 데이터 없음</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 이상치 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                이상치 스크리닝 ({anomalies.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <p className="text-sm text-muted-foreground">이상치가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-4">샘플#</th>
                        <th className="pb-2 pr-4">포인트</th>
                        <th className="pb-2 pr-4 font-mono">측정값</th>
                        <th className="pb-2 pr-4">사유</th>
                        <th className="pb-2 font-mono">이탈 σ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.slice(0, 50).map((a, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-1 pr-4">{a.sampleNo}</td>
                          <td className="py-1 pr-4">{a.label}</td>
                          <td className="py-1 pr-4 font-mono">{a.value.toFixed(4)}</td>
                          <td className="py-1 pr-4 text-destructive">{a.reason}</td>
                          <td className="py-1 font-mono">
                            {a.deviationSigma != null ? a.deviationSigma.toFixed(2) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {anomalies.length > 50 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      ... 외 {anomalies.length - 50}건
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 포인트별 통계 테이블 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">포인트별 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-3">포인트</th>
                      <th className="pb-2 pr-3">n</th>
                      <th className="pb-2 pr-3 font-mono">평균</th>
                      <th className="pb-2 pr-3 font-mono">σ</th>
                      <th className="pb-2 pr-3 font-mono">최소</th>
                      <th className="pb-2 pr-3 font-mono">최대</th>
                      <th className="pb-2 pr-3 font-mono">Cp</th>
                      <th className="pb-2 font-mono">Cpk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.map((a) => (
                      <tr key={a.pointIndex} className="border-b">
                        <td className="py-1 pr-3">{a.label}</td>
                        <td className="py-1 pr-3">{a.n}</td>
                        <td className="py-1 pr-3 font-mono">{a.mean.toFixed(4)}</td>
                        <td className="py-1 pr-3 font-mono">{a.std.toFixed(4)}</td>
                        <td className="py-1 pr-3 font-mono">{a.min.toFixed(4)}</td>
                        <td className="py-1 pr-3 font-mono">{a.max.toFixed(4)}</td>
                        <td className="py-1 pr-3 font-mono">
                          {a.cp != null ? a.cp.toFixed(2) : "-"}
                        </td>
                        <td className="py-1 font-mono">
                          {a.cpk != null ? (
                            <span className={a.cpk < 1.33 ? "text-destructive" : "text-green-600"}>
                              {a.cpk.toFixed(2)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  warn,
  good,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  warn?: boolean;
  good?: boolean;
}) {
  const colorClass = warn && value != null && value < 1.33
    ? "text-destructive"
    : good && value != null && value >= 95
      ? "text-green-600"
      : good && value != null && value < 95
        ? "text-amber-600"
        : "";

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-mono ${colorClass}`}>
          {value != null ? (unit === "%" ? value.toFixed(1) : value.toFixed(4)) : "-"}
          {unit && value != null && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
