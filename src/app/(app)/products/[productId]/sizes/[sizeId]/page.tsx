"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { SpecPoint, ProductSize } from "@/lib/types";
import { ArrowLeft, Save, Plus, Trash2, Upload, Download } from "lucide-react";

export default function SizeSpecPage() {
  const { productId, sizeId } = useParams<{ productId: string; sizeId: string }>();
  const supabase = createClient();
  const [size, setSize] = useState<ProductSize | null>(null);
  const [specs, setSpecs] = useState<SpecPoint[]>([]);
  const [saving, setSaving] = useState(false);
  const [csvMsg, setCsvMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    const { data: s } = await supabase
      .from("diadent_product_sizes")
      .select("*")
      .eq("id", sizeId)
      .single();
    if (s) setSize(s as ProductSize);

    const { data: sp } = await supabase
      .from("diadent_spec_points")
      .select("*")
      .eq("product_size_id", sizeId)
      .order("point_index");
    if (sp) setSpecs(sp as SpecPoint[]);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [sizeId]);

  function addDefaultPoints() {
    const labels = [
      ...Array.from({ length: 25 }, (_, i) => `D${i}`),
      "전장",
    ];
    const newSpecs: SpecPoint[] = labels.map((label, i) => ({
      id: `new-${i}`,
      product_size_id: sizeId,
      point_index: i,
      label,
      is_length: label === "전장",
      nominal: null,
      usl: null,
      lsl: null,
      unit: "mm",
    }));
    setSpecs(newSpecs);
  }

  function updateSpec(index: number, field: keyof SpecPoint, value: string) {
    setSpecs((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, [field]: value === "" ? null : Number(value) }
          : s,
      ),
    );
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  // ── CSV 업로드 ──
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvMsg("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setCsvMsg("CSV에서 유효한 행을 찾지 못했습니다.");
        return;
      }
      setSpecs(parsed);
      setCsvMsg(`${parsed.length}개 포인트를 불러왔습니다. 확인 후 '규격 저장'을 눌러주세요.`);
    };
    reader.readAsText(file);
    // 같은 파일 재선택 허용
    e.target.value = "";
  }

  function parseCsv(text: string): SpecPoint[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];

    // 헤더 파싱 (유연하게)
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const labelIdx = header.findIndex((h) => ["label", "라벨", "포인트", "point"].includes(h));
    const nomIdx = header.findIndex((h) => ["nominal", "nom", "기준값", "기준"].includes(h));
    const uslIdx = header.findIndex((h) => ["usl", "상한", "upper"].includes(h));
    const lslIdx = header.findIndex((h) => ["lsl", "하한", "lower"].includes(h));

    if (labelIdx === -1) return [];

    const result: SpecPoint[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const label = cols[labelIdx];
      if (!label) continue;

      const nominal = nomIdx >= 0 && cols[nomIdx] ? Number(cols[nomIdx]) : null;
      const usl = uslIdx >= 0 && cols[uslIdx] ? Number(cols[uslIdx]) : null;
      const lsl = lslIdx >= 0 && cols[lslIdx] ? Number(cols[lslIdx]) : null;

      result.push({
        id: `csv-${i}`,
        product_size_id: sizeId,
        point_index: result.length,
        label,
        is_length: label === "전장" || label.toLowerCase().includes("length"),
        nominal: nominal !== null && !isNaN(nominal) ? nominal : null,
        usl: usl !== null && !isNaN(usl) ? usl : null,
        lsl: lsl !== null && !isNaN(lsl) ? lsl : null,
        unit: "mm",
      });
    }
    return result;
  }

  // ── CSV 템플릿 다운로드 ──
  function downloadTemplate() {
    const labels = specs.length > 0
      ? specs.map((s) => s.label)
      : [...Array.from({ length: 25 }, (_, i) => `D${i}`), "전장"];

    const rows = [
      "label,nominal,usl,lsl",
      ...labels.map((l) => `${l},,,`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spec_${size?.name || "template"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── 현재 규격을 CSV로 내보내기 ──
  function exportCsv() {
    const rows = [
      "label,nominal,usl,lsl",
      ...specs.map((s) =>
        `${s.label},${s.nominal ?? ""},${s.usl ?? ""},${s.lsl ?? ""}`
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spec_${size?.name || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── 샘플 CSV 다운로드 ──
  function downloadSample() {
    const sample = `label,nominal,usl,lsl
D0,0.23,0.28,0.18
D1,0.28,0.33,0.23
D2,0.35,0.40,0.30
D3,0.43,0.48,0.38
D4,0.48,0.53,0.43
D5,0.54,0.59,0.49
D6,0.60,0.65,0.55
D7,0.65,0.70,0.60
D8,0.70,0.75,0.65
D9,0.74,0.79,0.69
D10,0.79,0.84,0.74
D11,0.84,0.89,0.79
D12,0.89,0.94,0.84
D13,0.92,0.97,0.87
D14,0.95,1.00,0.90
D15,0.98,1.03,0.93
D16,1.00,1.05,0.95
D17,1.01,1.06,0.96
D18,1.01,1.06,0.96
D19,1.02,1.07,0.97
D20,1.02,1.08,0.97
D21,1.03,1.09,0.98
D22,1.05,1.11,1.00
D23,1.07,1.13,1.02
D24,1.09,1.15,1.03
전장,29.32,29.60,29.00`;
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spec_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    setSaving(true);
    await supabase.from("diadent_spec_points").delete().eq("product_size_id", sizeId);

    const rows = specs.map((s, i) => ({
      product_size_id: sizeId,
      point_index: i,
      label: s.label,
      is_length: s.is_length,
      nominal: s.nominal,
      usl: s.usl,
      lsl: s.lsl,
      unit: s.unit,
    }));

    await supabase.from("diadent_spec_points").insert(rows);
    setSaving(false);
    setCsvMsg("");
    loadData();
  }

  if (!size) return <p>로딩 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/products/${productId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">#{size.name} 규격 설정</h1>
      </div>

      {/* CSV 업로드/다운로드 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV로 일괄 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            CSV 파일로 규격을 한번에 등록할 수 있습니다.
            형식: <code className="bg-muted px-1 rounded">label,nominal,usl,lsl</code>
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              CSV 업로드
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              빈 템플릿
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-4 w-4 mr-1" />
              샘플 CSV (F1 예시)
            </Button>
            {specs.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-1" />
                현재 규격 내보내기
              </Button>
            )}
          </div>
          {csvMsg && (
            <p className="text-sm text-blue-600">{csvMsg}</p>
          )}
        </CardContent>
      </Card>

      {specs.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              규격 포인트가 없습니다.
            </p>
            <Button onClick={addDefaultPoints}>
              <Plus className="h-4 w-4 mr-1" />
              기본 포인트 생성 (D0~D24 + 전장)
            </Button>
          </CardContent>
        </Card>
      )}

      {specs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              측정 포인트 ({specs.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-2 w-12">#</th>
                    <th className="pb-2 pr-2 w-24">라벨</th>
                    <th className="pb-2 pr-2 w-28">Nominal</th>
                    <th className="pb-2 pr-2 w-28">USL</th>
                    <th className="pb-2 pr-2 w-28">LSL</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1 pr-2 text-muted-foreground font-mono">
                        {s.point_index}
                      </td>
                      <td className="py-1 pr-2 font-mono">{s.label}</td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="any"
                          placeholder="-"
                          className="h-8 font-mono"
                          value={s.nominal ?? ""}
                          onChange={(e) => updateSpec(i, "nominal", e.target.value)}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="any"
                          placeholder="-"
                          className="h-8 font-mono"
                          value={s.usl ?? ""}
                          onChange={(e) => updateSpec(i, "usl", e.target.value)}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="any"
                          placeholder="-"
                          className="h-8 font-mono"
                          value={s.lsl ?? ""}
                          onChange={(e) => updateSpec(i, "lsl", e.target.value)}
                        />
                      </td>
                      <td className="py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpec(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "저장 중..." : "규격 저장"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
