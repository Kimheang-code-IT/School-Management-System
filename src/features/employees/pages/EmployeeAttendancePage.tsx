import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEmployeesQuery } from '@/hooks';
import { formatDate } from '@/utils/formatters';

const statusBadge: Record<string, string> = {
  present: 'text-emerald-300',
  absent: 'text-rose-300',
  remote: 'text-indigo-300',
};

const EmployeeAttendancePage = () => {
  const { data, isLoading } = useEmployeesQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Attendance Tracking" description="Daily presence overview for staff." />

      <Callout>
        Attendance currently mirrors fixed mock data. Connect biometric terminals or timesheet apps to automate.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Latest Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.attendance.map((record) => {
                  const employee = data.employees.find((item) => item.id === record.employeeId);
                  const badgeClass = statusBadge[record.status] ?? 'text-slate-300';
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{employee?.fullName ?? 'Unknown'}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <span className={`capitalize ${badgeClass}`}>{record.status}</span>
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

export default EmployeeAttendancePage;
