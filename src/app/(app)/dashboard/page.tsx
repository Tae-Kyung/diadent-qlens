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

  // 사이즈 목록 + 배치 통계
  const { data: sizes } = await supabase
    .from("diadent_product_sizes")
    .select(`
      id, name, display_order,
      diadent_products!inner(id, name, org_id)
    `)
    .eq("diadent_products.org_id", orgId)
    .order("display_order");

  // 전체 배치 통계
  const { data: batches } = await supabase
    .from("diadent_batches")
    .select("id, product_size_id, row_count, rejected_count, status, created_at")
    .eq("org_id", orgId)
    .eq("status", "ready");

  // 사이즈별 요약 계산
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대시보드</h1>
        {sizes && sizes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {(sizes[0] as any).diadent_products?.name}
          </p>
        )}
      </div>

      {!sizes || sizes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>등록된 제품이 없습니다.</p>
            <Link href="/products" className="text-primary underline">
              제품을 먼저 등록하세요
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 전체 KPI */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">사이즈</p>
                    <p className="text-2xl font-bold">{sizes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">총 배치</p>
                    <p className="text-2xl font-bold">{totalBatches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">총 샘플</p>
                    <p className="text-2xl font-bold">{totalSamples.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">제외된 행</p>
                    <p className="text-2xl font-bold">{totalRejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이즈별 요약 테이블 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사이즈별 분석 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4">사이즈</th>
                      <th className="pb-2 pr-4 text-right">배치</th>
                      <th className="pb-2 pr-4 text-right">샘플</th>
                      <th className="pb-2 pr-4">최근 업로드</th>
                      <th className="pb-2 text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size: any) => {
                      const stats = sizeMap.get(size.id);
                      return (
                        <tr key={size.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 pr-4">
                            <Link
                              href={`/dashboard/${size.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              #{size.name}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-right font-mono">
                            {stats?.batchCount || 0}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono">
                            {stats?.sampleCount?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {stats?.latestBatch
                              ? new Date(stats.latestBatch).toLocaleDateString("ko-KR")
                              : "-"}
                          </td>
                          <td className="py-3 text-right">
                            {stats && stats.sampleCount > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                분석 가능
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
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

          {/* 사이즈 카드 (빠른 접근) */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">사이즈별 상세 분석</h2>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {sizes.map((size: any) => {
                const stats = sizeMap.get(size.id);
                return (
                  <Link key={size.id} href={`/dashboard/${size.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="py-4">
                        <p className="font-bold text-lg">#{size.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats
                            ? `${stats.sampleCount}개 샘플 · ${stats.batchCount}개 배치`
                            : "데이터 없음"}
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
