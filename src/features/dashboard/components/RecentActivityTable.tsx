import { memo } from 'react';
import { Clock } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { RecentActivityItem } from '@/types';
import { sanitizeHtml } from '@/utils/sanitize';

interface RecentActivityTableProps {
  activities: RecentActivityItem[] | undefined;
  isLoading: boolean;
}

const sourceVariant: Record<RecentActivityItem['source'], { label: string; variant: 'default' | 'success' | 'danger' | 'warning' }> = {
  students: { label: 'Students', variant: 'default' },
  stock: { label: 'Stock', variant: 'warning' },
  employees: { label: 'Employees', variant: 'success' },
  investment: { label: 'Investment', variant: 'danger' },
};

const RecentActivityTableComponent = ({ activities, isLoading }: RecentActivityTableProps) => {
  return (
    <Card className="border-slate-800/80 bg-slate-900/70">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base text-slate-200">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities?.map((activity) => {
                const meta = sourceVariant[activity.source];
                const time = new Date(activity.timestamp).toLocaleString();
                return (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(activity.message) }} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      {time}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentActivityTable = memo(RecentActivityTableComponent);
