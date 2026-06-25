import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { AlertTriangle, BarChart3, Database, FlaskConical } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("diadent_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_org_id) {
    redirect("/onboarding");
  }

  const orgId = profile.default_org_id;

  const { data: sizes } = await supabase
    .from("diadent_product_sizes")
    .select(`
      id, name, display_order,
      diadent_products!inner(id, name, org_id)
    `)
    .eq("diadent_products.org_id", orgId)
    .order("display_order");

  const { data: batches } = await supabase
    .from("diadent_batches")
    .select("id, product_size_id, row_count, rejected_count, status, created_at")
    .eq("org_id", orgId)
    .eq("status", "ready");

  const sizeMap = new Map<string, { batchCount: number; sampleCount: number; latestBatch: string }>();
  if (batches) {
    for (const b of batches) {
      const prev = sizeMap.get(b.product_size_id) || { batchCount: 0, sampleCount: 0, latestBatch: "" };
      prev.batchCount++;
      prev.sampleCount += b.row_count;
      if (!prev.latestBatch || b.created_at > prev.latestBatch) {
        prev.latestBatch = b.created_at;
      }
      sizeMap.set(b.product_size_id, prev);
    }
  }

  const totalBatches = batches?.length || 0;
  const totalSamples = batches?.reduce((sum, b) => sum + b.row_count, 0) || 0;
  const totalRejected = batches?.reduce((sum, b) => sum + b.rejected_count, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Clinical Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            실시간 품질 분석 및 데이터 모니터링
          </p>
        </div>
        {sizes && sizes.length > 0 && (
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 bg-clinical-blue text-white px-6 py-3 rounded-lg font-heading font-semibold text-sm clinical-shadow hover:brightness-110 active:scale-95 transition-all"
          >
            <Upload className="h-4 w-4" />
            새 데이터 업로드
          </Link>
        )}
      </div>

      {!sizes || sizes.length === 0 ? (
        <Card className="border-surface-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-2xl flex items-center justify-center">
              <FlaskConical className="h-8 w-8 text-clinical-blue" />
            </div>
            <p className="text-muted-foreground mb-2">등록된 제품이 없습니다.</p>
            <Link
              href="/products"
              className="text-clinical-blue font-semibold hover:underline"
            >
              제품을 먼저 등록하세요 →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              icon={<FlaskConical className="h-6 w-6" />}
              iconBg="bg-blue-50 text-clinical-blue"
              label="사이즈"
              value={sizes.length.toString()}
              detail={`${(sizes[0] as any).diadent_products?.name}`}
            />
            <SummaryCard
              icon={<Database className="h-6 w-6" />}
              iconBg="bg-teal-50 text-teal-action"
              label="총 배치"
              value={totalBatches.toString()}
              badge={totalBatches > 0 ? "ACTIVE" : undefined}
            />
            <SummaryCard
              icon={<BarChart3 className="h-6 w-6" />}
              iconBg="bg-amber-50 text-diagnostic-yellow"
              label="총 샘플"
              value={totalSamples.toLocaleString()}
            />
            <SummaryCard
              icon={<AlertTriangle className="h-6 w-6" />}
              iconBg="bg-red-50 text-destructive"
              label="제외된 행"
              value={totalRejected.toString()}
              detail={totalSamples > 0 ? `${((totalRejected / totalSamples) * 100).toFixed(1)}%` : undefined}
            />
          </div>

          {/* Size Analysis Table */}
          <Card className="border-surface-border overflow-hidden">
            <CardHeader className="border-b border-surface-border bg-card">
              <CardTitle className="font-heading text-lg text-clinical-blue">
                사이즈별 분석 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-secondary/50">
                      <th className="text-left py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">사이즈</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">배치</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">샘플</th>
                      <th className="text-left py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">최근 업로드</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size: any) => {
                      const stats = sizeMap.get(size.id);
                      return (
                        <tr key={size.id} className="border-b border-surface-border hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-6">
                            <Link
                              href={`/dashboard/${size.id}`}
                              className="font-semibold text-clinical-blue hover:underline"
                            >
                              #{size.name}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {stats?.batchCount || 0}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {stats?.sampleCount?.toLocaleString() || 0}
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {stats?.latestBatch
                              ? new Date(stats.latestBatch).toLocaleDateString("ko-KR")
                              : "-"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {stats && stats.sampleCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-action/10 px-2.5 py-1 text-[10px] font-mono font-bold text-teal-action uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-action" />
                                분석 가능
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                데이터 없음
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Size Quick Access Cards */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              사이즈별 상세 분석
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {sizes.map((size: any) => {
                const stats = sizeMap.get(size.id);
                return (
                  <Link key={size.id} href={`/dashboard/${size.id}`}>
                    <Card className="border-surface-border hover:border-clinical-blue hover:clinical-shadow transition-all cursor-pointer group">
                      <CardContent className="py-5 px-5">
                        <p className="font-heading font-bold text-xl text-clinical-blue group-hover:text-primary transition-colors">
                          #{size.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          {stats
                            ? `${stats.sampleCount.toLocaleString()} samples · ${stats.batchCount} batches`
                            : "No data"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  detail,
  badge,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  detail?: string;
  badge?: string;
}) {
  return (
    <Card className="border-surface-border hover:clinical-shadow transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            {icon}
          </div>
          {badge && (
            <span className="font-mono text-[10px] font-bold text-teal-action bg-teal-action/10 px-2 py-1 rounded">
              {badge}
            </span>
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="font-heading text-3xl font-bold text-clinical-blue mt-1">
          {value}
        </p>
        {detail && (
          <p className="text-muted-foreground text-sm mt-2">{detail}</p>
        )}
      </CardContent>
    </Card>
  );
}
