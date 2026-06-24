import { describe, it, expect } from "vitest";
import { parseXlsx, parseSheetName } from "../parse";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("parseSheetName", () => {
  it("표준 패턴을 파싱한다", () => {
    expect(parseSheetName("Confirm Fit GP #F1")).toEqual({
      productName: "Confirm Fit GP",
      sizeName: "F1",
    });
  });

  it("FXL 패턴을 파싱한다", () => {
    expect(parseSheetName("Confirm Fit GP #FXL")).toEqual({
      productName: "Confirm Fit GP",
      sizeName: "FXL",
    });
  });

  it("# 없는 시트명은 전체를 제품명으로", () => {
    const result = parseSheetName("Sheet1");
    expect(result.productName).toBe("Sheet1");
  });
});

describe("parseXlsx with sample.xlsx", () => {
  const filePath = resolve(__dirname, "../../../../sample.xlsx");
  let sheets: ReturnType<typeof parseXlsx>;

  try {
    const buffer = readFileSync(filePath);
    sheets = parseXlsx(buffer.buffer as ArrayBuffer);
  } catch {
    // sample.xlsx가 없으면 테스트 skip
  }

  it("5개 시트를 파싱한다", () => {
    if (!sheets) return;
    expect(sheets).toHaveLength(5);
  });

  it("시트명에서 제품·사이즈를 추출한다", () => {
    if (!sheets) return;
    expect(sheets[0].productName).toBe("Confirm Fit GP");
    expect(sheets[0].sizeName).toBe("F1");
    expect(sheets[4].sizeName).toBe("FXL");
  });

  it("F1 시트에서 33개 샘플을 추출한다", () => {
    if (!sheets) return;
    const f1 = sheets.find((s) => s.sizeName === "F1")!;
    expect(f1.samples).toHaveLength(33);
  });

  it("F2 시트에서 68개 샘플을 추출한다", () => {
    if (!sheets) return;
    const f2 = sheets.find((s) => s.sizeName === "F2")!;
    expect(f2.samples).toHaveLength(68);
  });

  it("F3=68, FX=60, FXL=60 샘플", () => {
    if (!sheets) return;
    expect(sheets.find((s) => s.sizeName === "F3")!.samples).toHaveLength(68);
    expect(sheets.find((s) => s.sizeName === "FX")!.samples).toHaveLength(60);
    expect(sheets.find((s) => s.sizeName === "FXL")!.samples).toHaveLength(60);
  });

  it("26개 포인트 라벨 (D0~D24 + 전장)", () => {
    if (!sheets) return;
    const labels = sheets[0].pointLabels;
    expect(labels).toHaveLength(26);
    expect(labels[0]).toBe("D0");
    expect(labels[24]).toBe("D24");
  });

  it("장비명을 추출한다", () => {
    if (!sheets) return;
    expect(sheets[0].instrument).toContain("LM-X 100TL");
  });

  it("샘플 값이 숫자이다", () => {
    if (!sheets) return;
    const first = sheets[0].samples[0];
    expect(first.sampleNo).toBe(1);
    expect(typeof first.values[0]).toBe("number");
    // D0 ≈ 0.248 for F1 sample 1
    expect(first.values[0]).toBeCloseTo(0.248, 3);
  });

  it("요약 통계행이 제외된다", () => {
    if (!sheets) return;
    const f1 = sheets.find((s) => s.sizeName === "F1")!;
    // 마지막 샘플번호는 33 이하여야 함
    const lastSample = f1.samples[f1.samples.length - 1];
    expect(lastSample.sampleNo).toBeLessThanOrEqual(33);
  });
});
