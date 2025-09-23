import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChartsPanel } from '@/features/dashboard/components/ChartsPanel';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { RecentActivityTable } from '@/features/dashboard/components/RecentActivityTable';
import { useInvestmentQuery, useRecentActivityQuery, useStockQuery, useStudentsQuery } from '@/hooks';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const DashboardPage = () => {
  const { metrics, isLoading: metricsLoading, refetchAll } = useDashboardMetrics();
  const { data: studentsData, isLoading: studentsLoading } = useStudentsQuery();
  const { data: stockData, isLoading: stockLoading } = useStockQuery();
  const { data: investmentData, isLoading: investmentLoading } = useInvestmentQuery();
  const { data: activityData, isLoading: activityLoading } = useRecentActivityQuery();

  const timelineLoading = studentsLoading || stockLoading || investmentLoading;

  const highlightCards = useMemo(
    () => (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} isLoading={metricsLoading} />
        ))}
      </div>
    ),
    [metrics, metricsLoading],
  );

  const studentSummary = studentsData?.summary;
  const stockSnapshot = stockData?.snapshot;
  const investmentSummary = investmentData?.summary;
  const membersCount = investmentData?.members.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Executive Snapshot</h2>
            <p className="text-sm text-slate-400">Monitor live performance across students, stock, employees, and investments.</p>
          </div>
          <Button variant="secondary" onClick={refetchAll} className="flex items-center gap-2">
            Refresh Data
          </Button>
        </div>
        {highlightCards}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Tracking</h3>
          {timelineLoading && <Skeleton className="h-4 w-32" />}
        </div>
        <ChartsPanel
          studentTimeline={studentsData?.timeline}
          stockTimeline={stockData?.timeline}
          investmentTimeline={investmentData?.timeline}
          isLoading={timelineLoading}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Summarize</h3>
        <RecentActivityTable activities={activityData} isLoading={activityLoading} />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Data Health</h3>
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Quick Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-500">Students</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{formatNumber(studentSummary?.total ?? 0)}</p>
              <p className="text-xs text-slate-500">{formatNumber(studentSummary?.active ?? 0)} active · {formatNumber(studentSummary?.overdue ?? 0)} overdue</p>
            </div>
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{formatNumber(stockSnapshot?.totalBooks ?? 0)}</p>
              <p className="text-xs text-slate-500">{formatNumber(stockSnapshot?.lowStock ?? 0)} products below threshold</p>
            </div>
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-500">Investments</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{formatCurrency(investmentSummary?.profit ?? 0)}</p>
              <p className="text-xs text-slate-500">{formatNumber(membersCount)} contributing members</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
