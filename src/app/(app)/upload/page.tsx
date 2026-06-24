"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface SheetPreview {
  productName: string;
  sizeName: string;
  sampleCount: number;
  pointCount: number;
  instrument: string | null;
}

export default function UploadPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [orgId, setOrgId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<SheetPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ batches: Array<{ sizeName: string; rowCount: number; rejectedCount: number; autoCreated: boolean }> } | null>(null);
  const [error, setError] = useState("");

  async function loadOrg() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("diadent_profiles")
      .select("default_org_id")
      .eq("id", user.id)
      .single();
    if (profile?.default_org_id) setOrgId(profile.default_org_id);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOrg(); }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");

    const { parseXlsx } = await import("@/lib/ingest/parse");
    const buffer = await f.arrayBuffer();
    const sheets = parseXlsx(buffer);

    setPreviews(
      sheets.map((s) => ({
        productName: s.productName,
        sizeName: s.sizeName,
        sampleCount: s.samples.length,
        pointCount: s.pointLabels.length,
        instrument: s.instrument,
      })),
    );
  }

  async function handleAutoUpload() {
    if (!file || !orgId) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("orgId", orgId);
    formData.append("mode", "auto");

    const res = await fetch("/api/ingest", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      setResult(data);
    } else {
      setError(data.error || "업로드 실패");
    }
    setUploading(false);
  }

  const totalSamples = previews.reduce((s, p) => s + p.sampleCount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">데이터 업로드</h1>

      {/* 파일 선택 */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-5 w-5 mr-2" />
              Excel 파일 선택 (.xlsx)
            </Button>
            {file && (
              <p className="text-sm text-muted-foreground">{file.name}</p>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-md">
              파일에서 제품명·사이즈·측정 포인트를 자동으로 인식합니다.
              제품이 처음이면 자동 등록됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 프리뷰 */}
      {previews.length > 0 && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              파일 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p><strong>제품:</strong> {previews[0]?.productName}</p>
              <p><strong>사이즈:</strong> {previews.map((p) => p.sizeName).join(", ")} ({previews.length}개)</p>
              <p><strong>총 샘플:</strong> {totalSamples}개</p>
              <p><strong>포인트:</strong> {previews[0]?.pointCount}개/샘플</p>
              {previews[0]?.instrument && (
                <p><strong>장비:</strong> {previews[0].instrument}</p>
              )}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4">사이즈</th>
                  <th className="pb-2 pr-4 text-right">샘플 수</th>
                  <th className="pb-2 text-right">포인트</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 pr-4 font-mono font-medium">#{p.sizeName}</td>
                    <td className="py-2 pr-4 text-right">{p.sampleCount}개</td>
                    <td className="py-2 text-right">{p.pointCount}개</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <Button onClick={handleAutoUpload} disabled={uploading} size="lg">
                {uploading ? "처리 중..." : `업로드 (${totalSamples}개 샘플)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 결과 */}
      {result && (
        <Card>
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">업로드 완료</span>
            </div>
            {result.batches.map((b, i) => (
              <p key={i} className="text-sm">
                <span className="font-mono font-medium">#{b.sizeName}</span>: {b.rowCount}개 샘플 저장
                {b.rejectedCount > 0 && <span className="text-muted-foreground"> ({b.rejectedCount}개 제외)</span>}
                {b.autoCreated && <span className="text-blue-500 ml-2">새로 생성됨</span>}
              </p>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => router.push("/dashboard")}>
                대시보드로 이동
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreviews([]);
                  setResult(null);
                }}
              >
                추가 업로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
