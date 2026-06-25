import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

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

  const sizeStats: Record<string, { batchCount: number; sampleCount: number; latestBatch: string }> = {};
  if (batches) {
    for (const b of batches) {
      const prev = sizeStats[b.product_size_id] || { batchCount: 0, sampleCount: 0, latestBatch: "" };
      prev.batchCount++;
      prev.sampleCount += b.row_count;
      if (!prev.latestBatch || b.created_at > prev.latestBatch) {
        prev.latestBatch = b.created_at;
      }
      sizeStats[b.product_size_id] = prev;
    }
  }

  return (
    <DashboardContent
      sizes={(sizes || []) as any[]}
      sizeStats={sizeStats}
      totalBatches={batches?.length || 0}
      totalSamples={batches?.reduce((sum, b) => sum + b.row_count, 0) || 0}
      totalRejected={batches?.reduce((sum, b) => sum + b.rejected_count, 0) || 0}
    />
  );
}
