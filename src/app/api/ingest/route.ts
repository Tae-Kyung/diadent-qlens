import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { parseXlsx } from "@/lib/ingest/parse";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "미인증" }, { status: 401 });
  }

  // 2. 폼 데이터
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const orgId = formData.get("orgId") as string;
  const mode = formData.get("mode") as string; // "auto" | "manual"
  const sizeMappingRaw = formData.get("sizeMapping") as string;

  if (!file || !orgId) {
    return NextResponse.json({ error: "파일과 orgId가 필요합니다" }, { status: 400 });
  }

  // 3. 멤버십·역할 검증
  const { data: membership } = await supabase
    .from("diadent_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin", "analyst"].includes(membership.role)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  // 4. 파일 파싱
  const buffer = await file.arrayBuffer();
  const sheets = parseXlsx(buffer);

  if (sheets.length === 0) {
    return NextResponse.json({ error: "파싱 가능한 시트가 없습니다" }, { status: 400 });
  }

  const admin = createAdminClient();
  const results: Array<{
    sizeName: string;
    batchId: string;
    rowCount: number;
    rejectedCount: number;
    autoCreated: boolean;
  }> = [];

  // 5. auto 모드: 제품·사이즈·포인트 자동 생성
  if (mode === "auto") {
    const productName = sheets[0].productName;

    // 기존 제품 검색 or 생성
    let productId: string;
    const { data: existingProduct } = await admin
      .from("diadent_products")
      .select("id")
      .eq("org_id", orgId)
      .eq("name", productName)
      .single();

    if (existingProduct) {
      productId = existingProduct.id;
    } else {
      const { data: newProduct, error: prodErr } = await admin
        .from("diadent_products")
        .insert({ org_id: orgId, name: productName })
        .select("id")
        .single();
      if (prodErr || !newProduct) {
        return NextResponse.json({ error: `제품 생성 실패: ${prodErr?.message}` }, { status: 500 });
      }
      productId = newProduct.id;
    }

    // 시트별로 사이즈 → 포인트 → 배치 → 측정 자동 생성
    for (let si = 0; si < sheets.length; si++) {
      const sheet = sheets[si];

      // 기존 사이즈 검색 or 생성
      let sizeId: string;
      const { data: existingSize } = await admin
        .from("diadent_product_sizes")
        .select("id")
        .eq("product_id", productId)
        .eq("name", sheet.sizeName)
        .single();

      if (existingSize) {
        sizeId = existingSize.id;
      } else {
        const { data: newSize, error: sizeErr } = await admin
          .from("diadent_product_sizes")
          .insert({ product_id: productId, name: sheet.sizeName, display_order: si })
          .select("id")
          .single();
        if (sizeErr || !newSize) continue;
        sizeId = newSize.id;

        // 규격 포인트 자동 생성 (라벨만, 규격값은 나중에)
        const specRows = sheet.pointLabels.map((label, i) => ({
          product_size_id: sizeId,
          point_index: i,
          label,
          is_length: label === "전장" || label.includes("전장"),
          unit: "mm",
        }));
        await admin.from("diadent_spec_points").insert(specRows);
      }

      // 배치 + 측정 저장
      const batchResult = await saveBatch(admin, orgId, sizeId, sheet, file.name, user.id);
      if (batchResult) {
        results.push({ ...batchResult, autoCreated: !existingSize });
      }
    }
  } else {
    // 6. manual 모드: 기존 방식 (sizeMapping 필요)
    let sizeMapping: Record<string, string> = {};
    try {
      sizeMapping = JSON.parse(sizeMappingRaw || "{}");
    } catch {
      return NextResponse.json({ error: "sizeMapping 파싱 실패" }, { status: 400 });
    }

    for (const sheet of sheets) {
      const productSizeId = sizeMapping[sheet.sizeName];
      if (!productSizeId) continue;

      const batchResult = await saveBatch(admin, orgId, productSizeId, sheet, file.name, user.id);
      if (batchResult) {
        results.push({ ...batchResult, autoCreated: false });
      }
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "저장된 데이터가 없습니다" }, { status: 400 });
  }

  return NextResponse.json({ success: true, batches: results });
}

// ── 배치 + 측정 + 포인트 저장 공통 함수 ──
async function saveBatch(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
  productSizeId: string,
  sheet: ReturnType<typeof parseXlsx>[number],
  fileName: string,
  userId: string,
) {
  const { data: batch, error: batchErr } = await admin
    .from("diadent_batches")
    .insert({
      org_id: orgId,
      product_size_id: productSizeId,
      source_file: fileName,
      instrument: sheet.instrument,
      uploaded_by: userId,
      status: "processing",
      row_count: sheet.samples.length,
      rejected_count: sheet.rejected.length,
    })
    .select("id")
    .single();

  if (batchErr || !batch) return null;

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
    await admin.from("diadent_batches").delete().eq("id", batch.id);
    return null;
  }

  const pointRows: Array<{ measurement_id: string; point_index: number; value: number }> = [];
  for (const m of measurements) {
    const sample = sheet.samples.find((s) => s.sampleNo === m.sample_no);
    if (!sample) continue;
    for (let pi = 0; pi < sheet.pointLabels.length; pi++) {
      const val = sample.values[pi];
      if (val != null) {
        pointRows.push({ measurement_id: m.id, point_index: pi, value: val });
      }
    }
  }

  // 1000개씩 청크 삽입
  for (let i = 0; i < pointRows.length; i += 1000) {
    const { error: pErr } = await admin
      .from("diadent_measurement_points")
      .insert(pointRows.slice(i, i + 1000));
    if (pErr) {
      await admin.from("diadent_batches").delete().eq("id", batch.id);
      return null;
    }
  }

  await admin.from("diadent_batches").update({ status: "ready" }).eq("id", batch.id);

  return {
    sizeName: sheet.sizeName,
    batchId: batch.id,
    rowCount: sheet.samples.length,
    rejectedCount: sheet.rejected.length,
  };
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "미인증" }, { status: 401 });
  }

  const { batchId, orgId } = await request.json();
  if (!batchId || !orgId) {
    return NextResponse.json({ error: "batchId와 orgId가 필요합니다" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("diadent_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin", "analyst"].includes(membership.role)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("diadent_batches").delete().eq("id", batchId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
