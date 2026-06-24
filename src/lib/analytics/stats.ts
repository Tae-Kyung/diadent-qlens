/**
 * 기술통계 참조 구현.
 * CLAUDE.md 분석 정의 준수: 표본표준편차, n<2→null, σ=0→Cp/Cpk null.
 */

export interface DescriptiveStats {
  n: number;
  mean: number | null;
  std: number | null;
  min: number | null;
  max: number | null;
  range: number | null;
}

export function descriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length;

  if (n === 0) {
    return { n: 0, mean: null, std: null, min: null, max: null, range: null };
  }

  if (n === 1) {
    return { n: 1, mean: values[0], std: null, min: values[0], max: values[0], range: 0 };
  }

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // 표본표준편차 (n-1)
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1);
  const std = Math.sqrt(variance);

  return { n, mean, std, min, max, range: max - min };
}
