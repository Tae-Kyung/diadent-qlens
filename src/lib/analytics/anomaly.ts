/**
 * 이상치 검출 참조 구현.
 * 규격 이탈(OOS): value > USL 또는 value < LSL
 * 통계 이탈: |value - mean| > k * σ (기본 k=4)
 */

export interface AnomalyResult {
  sampleNo: number;
  pointIndex: number;
  value: number;
  reason: string;
  deviationSigma: number | null;
}

export function detectAnomalies(
  samples: Array<{ sampleNo: number; values: (number | null)[] }>,
  pointStats: Array<{
    pointIndex: number;
    mean: number | null;
    std: number | null;
    usl: number | null;
    lsl: number | null;
  }>,
  k: number = 4,
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  for (const sample of samples) {
    for (const stat of pointStats) {
      const val = sample.values[stat.pointIndex];
      if (val === null || val === undefined) continue;

      // 규격 이탈 (OOS)
      if (stat.usl !== null && val > stat.usl) {
        const sigma =
          stat.std && stat.std > 0 ? (val - stat.mean!) / stat.std : null;
        anomalies.push({
          sampleNo: sample.sampleNo,
          pointIndex: stat.pointIndex,
          value: val,
          reason: `USL(${stat.usl}) 초과`,
          deviationSigma: sigma,
        });
        continue;
      }

      if (stat.lsl !== null && val < stat.lsl) {
        const sigma =
          stat.std && stat.std > 0 ? (stat.mean! - val) / stat.std : null;
        anomalies.push({
          sampleNo: sample.sampleNo,
          pointIndex: stat.pointIndex,
          value: val,
          reason: `LSL(${stat.lsl}) 미만`,
          deviationSigma: sigma,
        });
        continue;
      }

      // 통계 이탈 (±kσ)
      if (stat.mean !== null && stat.std !== null && stat.std > 0) {
        const deviation = Math.abs(val - stat.mean) / stat.std;
        if (deviation > k) {
          anomalies.push({
            sampleNo: sample.sampleNo,
            pointIndex: stat.pointIndex,
            value: val,
            reason: `±${k}σ 이탈`,
            deviationSigma: deviation,
          });
        }
      }
    }
  }

  return anomalies;
}
