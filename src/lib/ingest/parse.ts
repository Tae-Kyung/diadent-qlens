import * as XLSX from "xlsx";

/** 파싱된 시트 1개 = 사이즈 1개에 해당 */
export interface ParsedSheet {
  productName: string;
  sizeName: string;
  instrument: string | null;
  pointLabels: string[]; // ["D0","D1",...,"D24","전장"]
  samples: ParsedSample[];
  rejected: RejectedRow[];
}

export interface ParsedSample {
  sampleNo: number;
  values: (number | null)[]; // pointLabels 순서와 1:1
}

export interface RejectedRow {
  row: number;
  reason: string;
}

/**
 * xlsx 파일 버퍼를 파싱하여 시트별 ParsedSheet 배열을 반환.
 * ARCHITECTURE §4.2 명세 준수.
 */
export function parseXlsx(buffer: ArrayBuffer): ParsedSheet[] {
  const wb = XLSX.read(buffer, { type: "array" });
  return wb.SheetNames.map((name) => parseSheet(wb.Sheets[name], name));
}

/** 시트명에서 제품명·사이즈 추출: "Confirm Fit GP #F1" → ["Confirm Fit GP", "F1"] */
export function parseSheetName(name: string): {
  productName: string;
  sizeName: string;
} {
  const match = name.match(/^(.+?)\s*#(\S+)$/);
  if (match) {
    return { productName: match[1].trim(), sizeName: match[2] };
  }
  return { productName: name, sizeName: name };
}

function parseSheet(ws: XLSX.WorkSheet, sheetName: string): ParsedSheet {
  const { productName, sizeName } = parseSheetName(sheetName);
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  // Row 3 (0-indexed row 2): 포인트 라벨 탐지
  const pointLabels: string[] = [];
  const pointColStart = 4; // Col E (0-indexed = 4)
  for (let c = pointColStart; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 2, c })];
    if (cell && typeof cell.v === "string") {
      pointLabels.push(cell.v);
    }
  }

  // 전장 라벨이 없으면 마지막 라벨이 전장인지 확인
  // (실제 데이터에서 마지막 컬럼이 "전장")

  // C4 셀에서 장비명 추출 (0-indexed: r=3, c=2)
  const instrumentCell = ws[XLSX.utils.encode_cell({ r: 3, c: 2 })];
  const instrument = instrumentCell
    ? String(instrumentCell.v).replace(/\n/g, " ").trim()
    : null;

  // Row 4+ (0-indexed row 3+) 에서 데이터 추출
  const samples: ParsedSample[] = [];
  const rejected: RejectedRow[] = [];

  for (let r = 3; r <= range.e.r; r++) {
    const excelRow = r + 1; // 사용자 표시용 1-based
    const sampleCell = ws[XLSX.utils.encode_cell({ r, c: 3 })]; // Col D

    // D열이 정수인 행만 데이터로 취급 (요약 통계행 제외)
    if (!sampleCell || typeof sampleCell.v !== "number") {
      if (sampleCell && sampleCell.v != null) {
        // 요약행이면 무시 (rejected로 기록하지 않음)
        continue;
      }
      continue;
    }

    const sampleNo = sampleCell.v;
    if (!Number.isInteger(sampleNo) || sampleNo < 1) {
      rejected.push({ row: excelRow, reason: "유효하지 않은 샘플번호" });
      continue;
    }

    const values: (number | null)[] = [];
    let hasAnyValue = false;

    for (let ci = 0; ci < pointLabels.length; ci++) {
      const col = pointColStart + ci;
      const valCell = ws[XLSX.utils.encode_cell({ r, c: col })];
      if (valCell && typeof valCell.v === "number") {
        values.push(valCell.v);
        hasAnyValue = true;
      } else {
        values.push(null);
      }
    }

    if (!hasAnyValue) {
      rejected.push({ row: excelRow, reason: "모든 측정값이 비어있음" });
      continue;
    }

    samples.push({ sampleNo, values });
  }

  return {
    productName,
    sizeName,
    instrument,
    pointLabels,
    samples,
    rejected,
  };
}
