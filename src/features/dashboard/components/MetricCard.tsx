import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, TrendingDown, TrendingUp, UsersRound } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MetricCardConfig } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const iconMap: Record<string, LucideIcon> = {
  library: BookOpen,
  users: UsersRound,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
};

interface MetricCardProps {
  metric: MetricCardConfig;
  isLoading?: boolean;
}

const MetricCardComponent = ({ metric, isLoading }: MetricCardProps) => {
  const Icon = iconMap[metric.icon] ?? BookOpen;

  const formattedValue = metric.format === 'currency' ? formatCurrency(metric.value) : formatNumber(metric.value);

  return (
    <Card className="border-slate-800/80 bg-slate-900/70">
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle className="text-base font-medium text-slate-400">{metric.label}</CardTitle>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand-foreground">
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="space-y-1">
            <p className="text-3xl font-semibold text-slate-100">{formattedValue}</p>
            {metric.delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-sm',
                  metric.delta >= 0 ? 'text-emerald-400' : 'text-rose-400',
                )}
              >
                {metric.delta >= 0 ? '?' : '?'} {Math.abs(metric.delta).toFixed(1)}%
                <span className="text-xs text-slate-500">vs last month</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);
