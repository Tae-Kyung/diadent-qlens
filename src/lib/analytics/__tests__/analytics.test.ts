import { describe, it, expect } from "vitest";
import { descriptiveStats } from "../stats";
import { calcCpk } from "../cpk";
import { detectAnomalies } from "../anomaly";

describe("descriptiveStats", () => {
  it("빈 배열 → 전부 null", () => {
    const r = descriptiveStats([]);
    expect(r.n).toBe(0);
    expect(r.mean).toBeNull();
    expect(r.std).toBeNull();
  });

  it("단일값 → std null (n<2)", () => {
    const r = descriptiveStats([5]);
    expect(r.n).toBe(1);
    expect(r.mean).toBe(5);
    expect(r.std).toBeNull();
  });

  it("정상 계산", () => {
    const r = descriptiveStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(r.n).toBe(8);
    expect(r.mean).toBeCloseTo(5, 9);
    expect(r.std).toBeCloseTo(2, 0); // 표본표준편차 ≈ 2.138
    expect(r.min).toBe(2);
    expect(r.max).toBe(9);
    expect(r.range).toBe(7);
  });

  it("동일값 → std=0", () => {
    const r = descriptiveStats([3, 3, 3]);
    expect(r.std).toBe(0);
  });
});

describe("calcCpk", () => {
  it("규격 없으면 null", () => {
    const r = calcCpk(5, 1, null, null);
    expect(r.cp).toBeNull();
    expect(r.cpk).toBeNull();
  });

  it("std=0 → null", () => {
    const r = calcCpk(5, 0, 10, 0);
    expect(r.cp).toBeNull();
    expect(r.cpk).toBeNull();
  });

  it("mean null → null", () => {
    const r = calcCpk(null, 1, 10, 0);
    expect(r.cpk).toBeNull();
  });

  it("양쪽 규격 정상 계산", () => {
    // USL=10, LSL=0, mean=5, std=1
    // Cp = (10-0)/(6*1) = 1.667
    // Cpk = min(10-5, 5-0)/(3*1) = 5/3 = 1.667
    const r = calcCpk(5, 1, 10, 0);
    expect(r.cp).toBeCloseTo(10 / 6, 9);
    expect(r.cpk).toBeCloseTo(5 / 3, 9);
  });

  it("편향 Cpk", () => {
    // USL=10, LSL=0, mean=8, std=1
    // Cpk = min(10-8, 8-0)/3 = min(2,8)/3 = 2/3
    const r = calcCpk(8, 1, 10, 0);
    expect(r.cpk).toBeCloseTo(2 / 3, 9);
  });

  it("USL만 있을 때", () => {
    const r = calcCpk(5, 1, 10, null);
    expect(r.cp).toBeNull();
    expect(r.cpk).toBeCloseTo(5 / 3, 9);
  });
});

describe("detectAnomalies", () => {
  const stats = [
    { pointIndex: 0, mean: 5, std: 1, usl: 8, lsl: 2 },
    { pointIndex: 1, mean: 10, std: 2, usl: null, lsl: null },
  ];

  it("정상 범위 내 → 이상치 없음", () => {
    const samples = [{ sampleNo: 1, values: [5, 10] }];
    expect(detectAnomalies(samples, stats)).toHaveLength(0);
  });

  it("USL 초과 검출", () => {
    const samples = [{ sampleNo: 1, values: [9, 10] }];
    const a = detectAnomalies(samples, stats);
    expect(a).toHaveLength(1);
    expect(a[0].reason).toContain("USL");
  });

  it("LSL 미만 검출", () => {
    const samples = [{ sampleNo: 1, values: [1, 10] }];
    const a = detectAnomalies(samples, stats);
    expect(a).toHaveLength(1);
    expect(a[0].reason).toContain("LSL");
  });

  it("통계 이탈 검출 (±4σ)", () => {
    // pointIndex 1: mean=10, std=2, no spec → 4σ=8 → 10+8.1=18.1 이탈
    const samples = [{ sampleNo: 1, values: [5, 18.1] }];
    const a = detectAnomalies(samples, stats);
    expect(a).toHaveLength(1);
    expect(a[0].reason).toContain("4σ");
  });

  it("std=0이면 통계 이탈 검출 안 함", () => {
    const zeroStats = [{ pointIndex: 0, mean: 5, std: 0, usl: null, lsl: null }];
    const samples = [{ sampleNo: 1, values: [100] }];
    expect(detectAnomalies(samples, zeroStats)).toHaveLength(0);
  });
});
