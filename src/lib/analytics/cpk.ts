/**
 * 공정능력 지수 참조 구현.
 * Cp = (USL - LSL) / (6σ)
 * Cpk = min(USL - μ, μ - LSL) / (3σ)
 * 규격 없으면 null. n<2 또는 σ=0 → null.
 */

export interface CpkResult {
  cp: number | null;
  cpk: number | null;
}

export function calcCpk(
  mean: number | null,
  std: number | null,
  usl: number | null,
  lsl: number | null,
): CpkResult {
  if (mean === null || std === null || std === 0) {
    return { cp: null, cpk: null };
  }

  let cp: number | null = null;
  let cpk: number | null = null;

  if (usl !== null && lsl !== null) {
    cp = (usl - lsl) / (6 * std);
    cpk = Math.min(usl - mean, mean - lsl) / (3 * std);
  } else if (usl !== null) {
    cpk = (usl - mean) / (3 * std);
  } else if (lsl !== null) {
    cpk = (mean - lsl) / (3 * std);
  }

  return { cp, cpk };
}
