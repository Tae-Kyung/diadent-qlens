/**
 * 통계 요약 → AI 프롬프트 컨텍스트 변환.
 * 원본 데이터/PII 미전송. 집계 통계만 포함.
 */

import type { PointStats } from "@/lib/types";

export interface DigestInput {
  productName: string;
  sizeName: string;
  sampleCount: number;
  pointStats: PointStats[];
  anomalyCount: number;
}

export function buildDigest(input: DigestInput): string {
  const { productName, sizeName, sampleCount, pointStats, anomalyCount } = input;

  const lines: string[] = [
    `[분석 데이터 요약]`,
    `제품: ${productName} #${sizeName}`,
    `샘플 수: ${sampleCount}`,
    `이상치 수: ${anomalyCount}`,
    ``,
    `[포인트별 통계]`,
  ];

  for (const p of pointStats) {
    let line = `${p.label}: n=${p.n}, 평균=${p.mean.toFixed(4)}, σ=${p.std.toFixed(4)}, 범위=[${p.min.toFixed(4)}~${p.max.toFixed(4)}]`;
    if (p.cp != null) line += `, Cp=${p.cp.toFixed(2)}`;
    if (p.cpk != null) line += `, Cpk=${p.cpk.toFixed(2)}`;
    if (p.oos_count > 0) line += `, OOS=${p.oos_count}건`;
    lines.push(line);
  }

  return lines.join("\n");
}
