"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
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
  const { t } = useI18n();
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
    if (profile?.default_org_id) {
      setOrgId(profile.default_org_id);
      return;
    }
    // default_org_id가 없으면 멤버십에서 첫 번째 조직을 가져옴
    const { data: membership } = await supabase
      .from("diadent_memberships")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (membership?.org_id) setOrgId(membership.org_id);
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
    if (!file) return;
    if (!orgId) {
      setError(t.upload.noOrg);
      return;
    }
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
      setError(data.error || t.upload.uploadFailed);
    }
    setUploading(false);
  }

  const totalSamples = previews.reduce((s, p) => s + p.sampleCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          {t.upload.title}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t.upload.subtitle}
        </p>
      </div>

      {/* 파일 선택 */}
      <Card className="border-surface-border">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-5">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 bg-clinical-blue/10 rounded-2xl flex items-center justify-center">
              <Upload className="h-8 w-8 text-clinical-blue" />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileRef.current?.click()}
              className="border-clinical-blue text-clinical-blue hover:bg-clinical-blue hover:text-white transition-all"
            >
              <Upload className="h-5 w-5 mr-2" />
              {t.upload.selectFile}
            </Button>
            {file && (
              <p className="text-sm font-mono text-clinical-blue">{file.name}</p>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-md">
              {t.upload.autoDetect}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 프리뷰 */}
      {previews.length > 0 && !result && (
        <Card className="border-surface-border overflow-hidden">
          <CardHeader className="border-b border-surface-border">
            <CardTitle className="font-heading text-lg text-clinical-blue flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-diagnostic-yellow" />
              {t.upload.analysisResult}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="rounded-xl bg-secondary p-4 text-sm space-y-1">
              <p><strong className="text-clinical-blue">{t.upload.product}:</strong> {previews[0]?.productName}</p>
              <p><strong className="text-clinical-blue">{t.upload.size}:</strong> {previews.map((p) => p.sizeName).join(", ")} ({previews.length}개)</p>
              <p><strong className="text-clinical-blue">{t.upload.totalSamples}:</strong> {totalSamples}개</p>
              <p><strong className="text-clinical-blue">{t.upload.points}:</strong> {previews[0]?.pointCount}개/샘플</p>
              {previews[0]?.instrument && (
                <p><strong className="text-clinical-blue">{t.upload.equipment}:</strong> {previews[0].instrument}</p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="pb-3 pr-4 text-left font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.upload.size}</th>
                    <th className="pb-3 pr-4 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.upload.sampleCount}</th>
                    <th className="pb-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.upload.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {previews.map((p, i) => (
                    <tr key={i} className="border-b border-surface-border">
                      <td className="py-3 pr-4 font-mono font-semibold text-clinical-blue">#{p.sizeName}</td>
                      <td className="py-3 pr-4 text-right font-mono">{p.sampleCount}개</td>
                      <td className="py-3 text-right font-mono">{p.pointCount}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAutoUpload}
                disabled={uploading}
                size="lg"
                className="bg-clinical-blue hover:brightness-110 text-white"
              >
                {uploading ? t.upload.processing : t.upload.uploadBtn.replace("{count}", String(totalSamples))}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 결과 */}
      {result && (
        <Card className="border-surface-border border-teal-action/30">
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2 text-teal-action">
              <CheckCircle className="h-5 w-5" />
              <span className="font-heading font-semibold">{t.upload.uploadComplete}</span>
            </div>
            {result.batches.map((b, i) => (
              <p key={i} className="text-sm">
                <span className="font-mono font-semibold text-clinical-blue">#{b.sizeName}</span>: {b.rowCount}{t.upload.saved}
                {b.rejectedCount > 0 && <span className="text-muted-foreground"> ({b.rejectedCount}{t.upload.excluded})</span>}
                {b.autoCreated && <span className="text-teal-action ml-2 font-mono text-xs">{t.upload.newCreated}</span>}
              </p>
            ))}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-clinical-blue hover:brightness-110 text-white"
              >
                {t.upload.goToDashboard}
              </Button>
              <Button
                variant="outline"
                className="border-surface-border"
                onClick={() => {
                  setFile(null);
                  setPreviews([]);
                  setResult(null);
                }}
              >
                {t.upload.additionalUpload}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30">
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
