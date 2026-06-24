/**
 * 시드 스크립트: sample.xlsx를 파싱하여 Supabase에 데모 데이터 삽입.
 * service_role 키로 RLS 바이패스.
 * 실행: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { parseXlsx } from "../src/lib/ingest/parse";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("환경변수 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("=== QLens 시드 시작 ===");

  // 1. 조직 생성
  const { data: org, error: orgErr } = await admin
    .from("diadent_organizations")
    .insert({ name: "다이아덴트", plan: "free" })
    .select("id")
    .single();

  if (orgErr) {
    console.error("조직 생성 실패:", orgErr.message);
    process.exit(1);
  }
  console.log(`조직: ${org.id}`);

  // 2. 제품 생성
  const { data: product, error: prodErr } = await admin
    .from("diadent_products")
    .insert({ org_id: org.id, name: "Confirm Fit GP", code: "CFGP" })
    .select("id")
    .single();

  if (prodErr) {
    console.error("제품 생성 실패:", prodErr.message);
    process.exit(1);
  }
  console.log(`제품: ${product.id}`);

  // 3. sample.xlsx 파싱
  const filePath = resolve(__dirname, "../sample.xlsx");
  const buffer = readFileSync(filePath);
  const sheets = parseXlsx(buffer.buffer as ArrayBuffer);
  console.log(`파싱 완료: ${sheets.length}개 시트`);

  // 4. 시트별 사이즈 + 규격 + 배치 + 측정 데이터 삽입
  for (let si = 0; si < sheets.length; si++) {
    const sheet = sheets[si];
    console.log(`\n--- ${sheet.sizeName} (${sheet.samples.length}개 샘플) ---`);

    // 사이즈 생성
    const { data: size, error: sizeErr } = await admin
      .from("diadent_product_sizes")
      .insert({
        product_id: product.id,
        name: sheet.sizeName,
        display_order: si,
      })
      .select("id")
      .single();

    if (sizeErr || !size) {
      console.error(`사이즈 생성 실패: ${sizeErr?.message}`);
      continue;
    }

    // 규격 포인트 생성 (nominal/USL/LSL은 없으므로 라벨만)
    const specRows = sheet.pointLabels.map((label, i) => ({
      product_size_id: size.id,
      point_index: i,
      label,
      is_length: label === "전장" || label.includes("전장"),
      unit: "mm",
    }));

    const { error: specErr } = await admin
      .from("diadent_spec_points")
      .insert(specRows);

    if (specErr) {
      console.error(`규격 생성 실패: ${specErr.message}`);
    } else {
      console.log(`  규격: ${specRows.length}개 포인트`);
    }

    // 배치 생성
    const { data: batch, error: batchErr } = await admin
      .from("diadent_batches")
      .insert({
        org_id: org.id,
        product_size_id: size.id,
        source_file: "sample.xlsx",
        instrument: sheet.instrument,
        status: "ready",
        row_count: sheet.samples.length,
        rejected_count: sheet.rejected.length,
      })
      .select("id")
      .single();

    if (batchErr || !batch) {
      console.error(`배치 생성 실패: ${batchErr?.message}`);
      continue;
    }

    // 측정 데이터 삽입
    const measurementRows = sheet.samples.map((s) => ({
      batch_id: batch.id,
      sample_no: s.sampleNo,
      length: s.values[sheet.pointLabels.length - 1],
      is_flagged: false,
    }));

    const { data: measurements, error: mErr } = await admin
      .from("diadent_measurements")
      .insert(measurementRows)
      .select("id, sample_no");

    if (mErr || !measurements) {
      console.error(`측정 삽입 실패: ${mErr?.message}`);
      continue;
    }
    console.log(`  측정: ${measurements.length}개 샘플`);

    // 포인트 값 삽입 (청크 단위)
    const pointRows: Array<{
      measurement_id: string;
      point_index: number;
      value: number;
    }> = [];

    for (const m of measurements) {
      const sample = sheet.samples.find((s) => s.sampleNo === m.sample_no);
      if (!sample) continue;

      for (let pi = 0; pi < sheet.pointLabels.length; pi++) {
        const val = sample.values[pi];
        if (val != null) {
          pointRows.push({
            measurement_id: m.id,
            point_index: pi,
            value: val,
          });
        }
      }
    }

    // 1000개씩 청크
    const CHUNK = 1000;
    let inserted = 0;
    for (let i = 0; i < pointRows.length; i += CHUNK) {
      const chunk = pointRows.slice(i, i + CHUNK);
      const { error: pErr } = await admin
        .from("diadent_measurement_points")
        .insert(chunk);
      if (pErr) {
        console.error(`포인트 삽입 실패 (chunk ${i}): ${pErr.message}`);
        break;
      }
      inserted += chunk.length;
    }
    console.log(`  포인트: ${inserted}개 값`);
  }

  console.log("\n=== 시드 완료 ===");
}

seed().catch(console.error);
