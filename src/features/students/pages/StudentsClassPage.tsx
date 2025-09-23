import { useMemo } from 'react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatNumber } from '@/utils/formatters';

const StudentsClassPage = () => {
  const { data, isLoading } = useStudentsQuery();

  const classBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    data?.students.forEach((student) => {
      map.set(student.classLevel, (map.get(student.classLevel) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([classLevel, count]) => ({ classLevel, count }));
  }, [data?.students]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Class Management"
        description="Current enrollment by cohort with capacity monitoring."
      />

      <Callout>
        Timetabling automation and section conflict detection are scheduled for the next milestone. Today's view surfaces
        enrolment counts per class to steer resource planning.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Cohort Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Capacity Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classBreakdown.map((cohort) => {
                  const utilization = Math.min(100, (cohort.count / 32) * 100);
                  return (
                    <TableRow key={cohort.classLevel}>
                      <TableCell>{cohort.classLevel}</TableCell>
                      <TableCell>{formatNumber(cohort.count)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full rounded-full bg-slate-800/80">
                            <div
                              className="h-2 rounded-full bg-brand"
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{utilization.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentsClassPage;
