import { memo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { InvestmentTimelinePoint, StockTimelinePoint, StudentTimelinePoint } from '@/types';

interface ChartsPanelProps {
  studentTimeline: StudentTimelinePoint[] | undefined;
  stockTimeline: StockTimelinePoint[] | undefined;
  investmentTimeline: InvestmentTimelinePoint[] | undefined;
  isLoading: boolean;
}

const chartSkeleton = (
  <div className="grid h-48 place-items-center">
    <Skeleton className="h-32 w-32" />
  </div>
);

const ChartsPanelComponent = ({ studentTimeline, stockTimeline, investmentTimeline, isLoading }: ChartsPanelProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Total Books Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {isLoading || !stockTimeline ? (
            chartSkeleton
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgb(30 41 59)' }}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <Line type="monotone" dataKey="totalBooks" stroke="#60a5fa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Total Students Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {isLoading || !studentTimeline ? (
            chartSkeleton
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgb(30 41 59)' }}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <Line type="monotone" dataKey="total" stroke="#f472b6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Monthly Income vs Outcome</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {isLoading || !investmentTimeline ? (
            chartSkeleton
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investmentTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgb(30 41 59)' }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="income" fill="#34d399" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outcome" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Profit / Loss Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {isLoading || !investmentTimeline ? (
            chartSkeleton
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investmentTimeline}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgb(30 41 59)' }}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#60a5fa" fill="url(#profitGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const ChartsPanel = memo(ChartsPanelComponent);
