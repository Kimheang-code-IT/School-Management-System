import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  graduated: 'default',
};

const StudentsOverviewPage = () => {
  const { data, isLoading } = useStudentsQuery();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <ModuleHeader title="Student Overview" description="Centralized insights for student population health." />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { students, summary } = data;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Student Overview"
        description="Centralized insights for student population health."
      />

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(summary.total)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatNumber(summary.active)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Graduated</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(summary.graduated)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Open Balances</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{formatNumber(summary.overdue)}</p>
          </div>
        </CardContent>
      </Card>

      <Callout>
        Student analytics tooling is under active development. Upcoming releases will introduce cohort insights,
        attendance risk scoring, and guardian communication traces.
      </Callout>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Student Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tuition Balance</TableHead>
                <TableHead>Books Borrowed</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{student.fullName}</span>
                      <span className="text-xs text-slate-500">{student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.classLevel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[student.status] ?? 'default'} className="capitalize">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(student.tuitionBalance)}</TableCell>
                  <TableCell>{formatNumber(student.booksBorrowed)}</TableCell>
                  <TableCell>{formatDate(student.registeredAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsOverviewPage;
