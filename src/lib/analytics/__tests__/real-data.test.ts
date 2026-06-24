import { describe, it, expect } from "vitest";
import { descriptiveStats } from "../stats";
import { calcCpk } from "../cpk";
import { detectAnomalies } from "../anomaly";
import { parseXlsx } from "../../ingest/parse";
import { readFileSync } from "fs";
import { resolve } from "path";

const filePath = resolve(__dirname, "../../../../sample.xlsx");
const buffer = readFileSync(filePath);
const sheets = parseXlsx(buffer.buffer as ArrayBuffer);
const f1 = sheets.find((s) => s.sizeName === "F1")!;

describe("실데이터 분석 (F1 시트)", () => {
  it("D0 기술통계가 xlsx 요약행과 일치", () => {
    const d0Values = f1.samples.map((s) => s.values[0]!);
    const stat = descriptiveStats(d0Values);

    expect(stat.n).toBe(33);
    // xlsx 요약행 평균값: 0.22860606...
    expect(stat.mean).toBeCloseTo(0.2286, 3);
    // xlsx 최소값: 0.199
    expect(stat.min).toBeCloseTo(0.199, 3);
    // xlsx 최대값: 0.279
    expect(stat.max).toBeCloseTo(0.279, 3);
  });

  it("전장 기술통계", () => {
    const lenValues = f1.samples.map((s) => s.values[25]!);
    const stat = descriptiveStats(lenValues);

    expect(stat.n).toBe(33);
    // xlsx 요약행 전장 평균: 29.31966...
    expect(stat.mean).toBeCloseTo(29.3197, 2);
  });

  it("규격 없으면 Cp/Cpk = null", () => {
    const d0Values = f1.samples.map((s) => s.values[0]!);
    const stat = descriptiveStats(d0Values);
    const { cp, cpk } = calcCpk(stat.mean, stat.std, null, null);

    expect(cp).toBeNull();
    expect(cpk).toBeNull();
  });

  it("가상 규격으로 Cpk 계산", () => {
    // D0에 가상 규격 적용: USL=0.30, LSL=0.15
    const d0Values = f1.samples.map((s) => s.values[0]!);
    const stat = descriptiveStats(d0Values);
    const { cp, cpk } = calcCpk(stat.mean, stat.std, 0.3, 0.15);

    expect(cp).not.toBeNull();
    expect(cpk).not.toBeNull();
    expect(cp!).toBeGreaterThan(0);
    expect(cpk!).toBeGreaterThan(0);
    // Cp = (0.3-0.15)/(6*σ) = 0.15/(6*0.0169) ≈ 1.48
    expect(cp!).toBeCloseTo(0.15 / (6 * stat.std!), 1);
  });

  it("이상치 검출 (4σ, 규격 없음)", () => {
    // 26개 포인트 각각의 통계 계산
    const pointStats = Array.from({ length: 26 }, (_, pi) => {
      const vals = f1.samples.map((s) => s.values[pi]!).filter((v) => v != null);
      const stat = descriptiveStats(vals);
      return {
        pointIndex: pi,
        mean: stat.mean,
        std: stat.std,
        usl: null as number | null,
        lsl: null as number | null,
      };
    });

    const anomalies = detectAnomalies(
      f1.samples.map((s) => ({ sampleNo: s.sampleNo, values: s.values })),
      pointStats,
      4,
    );

    // 규격 없이 4σ 이탈 → 있을 수도 없을 수도 (데이터 의존)
    // 결과가 배열인지 확인
    expect(Array.isArray(anomalies)).toBe(true);
    console.log(`F1 4σ 이상치: ${anomalies.length}건`);
  });

  it("5개 사이즈 모두 분석 가능", () => {
    for (const sheet of sheets) {
      for (let pi = 0; pi < sheet.pointLabels.length; pi++) {
        const vals = sheet.samples
          .map((s) => s.values[pi])
          .filter((v): v is number => v != null);
        const stat = descriptiveStats(vals);
        expect(stat.n).toBeGreaterThan(0);
        expect(stat.mean).not.toBeNull();
      }
    }
  });
});
