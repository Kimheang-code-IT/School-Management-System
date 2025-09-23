import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEmployeesQuery } from '@/hooks';

const EmployeeSchedulePage = () => {
  const { data, isLoading } = useEmployeesQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Scheduling" description="Weekly shift allocations." />

      <Callout>
        Calendar sync and shift bidding automations are in development. The current layout simply maps mock schedules.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.schedules.map((schedule) => {
                  const employee = data.employees.find((item) => item.id === schedule.employeeId);
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>{employee?.fullName ?? 'Unknown'}</TableCell>
                      <TableCell>{schedule.day}</TableCell>
                      <TableCell>{schedule.shift}</TableCell>
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

export default EmployeeSchedulePage;
