"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BarChart3, Database, FlaskConical, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  sizes: any[];
  sizeStats: Record<string, { batchCount: number; sampleCount: number; latestBatch: string }>;
  totalBatches: number;
  totalSamples: number;
  totalRejected: number;
}

export function DashboardContent({ sizes, sizeStats, totalBatches, totalSamples, totalRejected }: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            {t.dashboard.title}
          </h2>
          <p className="text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
        </div>
        {sizes.length > 0 && (
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 bg-clinical-blue text-white px-6 py-3 rounded-lg font-heading font-semibold text-sm clinical-shadow hover:brightness-110 active:scale-95 transition-all"
          >
            <Upload className="h-4 w-4" />
            {t.dashboard.newUpload}
          </Link>
        )}
      </div>

      {sizes.length === 0 ? (
        <Card className="border-surface-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-2xl flex items-center justify-center">
              <FlaskConical className="h-8 w-8 text-clinical-blue" />
            </div>
            <p className="text-muted-foreground mb-2">{t.dashboard.noProducts}</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 mt-2 bg-clinical-blue text-white px-6 py-3 rounded-lg font-heading font-semibold text-sm clinical-shadow hover:brightness-110 active:scale-95 transition-all"
            >
              <Upload className="h-4 w-4" />
              {t.dashboard.newUpload}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              icon={<FlaskConical className="h-6 w-6" />}
              iconBg="bg-clinical-blue/10 text-clinical-blue"
              label={t.dashboard.sizes}
              value={sizes.length.toString()}
              detail={sizes[0]?.diadent_products?.name}
            />
            <SummaryCard
              icon={<Database className="h-6 w-6" />}
              iconBg="bg-teal-action/10 text-teal-action"
              label={t.dashboard.totalBatches}
              value={totalBatches.toString()}
              badge={totalBatches > 0 ? t.dashboard.active : undefined}
            />
            <SummaryCard
              icon={<BarChart3 className="h-6 w-6" />}
              iconBg="bg-diagnostic-yellow/10 text-diagnostic-yellow"
              label={t.dashboard.totalSamples}
              value={totalSamples.toLocaleString()}
            />
            <SummaryCard
              icon={<AlertTriangle className="h-6 w-6" />}
              iconBg="bg-destructive/10 text-destructive"
              label={t.dashboard.rejectedRows}
              value={totalRejected.toString()}
              detail={totalSamples > 0 ? `${((totalRejected / totalSamples) * 100).toFixed(1)}%` : undefined}
            />
          </div>

          <Card className="border-surface-border overflow-hidden">
            <CardHeader className="border-b border-surface-border bg-card">
              <CardTitle className="font-heading text-lg text-clinical-blue">
                {t.dashboard.sizeAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-secondary/50">
                      <th className="text-left py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.size}</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.batches}</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.samples}</th>
                      <th className="text-left py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.recentUpload}</th>
                      <th className="text-right py-3 px-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size: any) => {
                      const stats = sizeStats[size.id];
                      return (
                        <tr key={size.id} className="border-b border-surface-border hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-6">
                            <Link href={`/dashboard/${size.id}`} className="font-semibold text-clinical-blue hover:underline">
                              #{size.name}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">{stats?.batchCount || 0}</td>
                          <td className="py-4 px-6 text-right font-mono font-medium">{stats?.sampleCount?.toLocaleString() || 0}</td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {stats?.latestBatch ? new Date(stats.latestBatch).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {stats && stats.sampleCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-action/10 px-2.5 py-1 text-[10px] font-mono font-bold text-teal-action uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-action" />
                                {t.dashboard.analysisReady}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                {t.dashboard.noData}
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

          <div>
            <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t.dashboard.detailAnalysis}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {sizes.map((size: any) => {
                const stats = sizeStats[size.id];
                return (
                  <Link key={size.id} href={`/dashboard/${size.id}`}>
                    <Card className="border-surface-border hover:border-clinical-blue hover:clinical-shadow transition-all cursor-pointer group">
                      <CardContent className="py-5 px-5">
                        <p className="font-heading font-bold text-xl text-clinical-blue group-hover:text-primary transition-colors">
                          #{size.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          {stats
                            ? `${stats.sampleCount.toLocaleString()} ${t.dashboard.samples.toLowerCase()} · ${stats.batchCount} ${t.dashboard.batches.toLowerCase()}`
                            : t.dashboard.noData}
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

function SummaryCard({ icon, iconBg, label, value, detail, badge }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; detail?: string; badge?: string;
}) {
  return (
    <Card className="border-surface-border hover:clinical-shadow transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
          {badge && <span className="font-mono text-[10px] font-bold text-teal-action bg-teal-action/10 px-2 py-1 rounded">{badge}</span>}
        </div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="font-heading text-3xl font-bold text-clinical-blue mt-1">{value}</p>
        {detail && <p className="text-muted-foreground text-sm mt-2">{detail}</p>}
      </CardContent>
    </Card>
  );
}
