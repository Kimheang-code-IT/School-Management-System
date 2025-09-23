import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEmployeesQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const statusColor: Record<string, string> = {
  active: 'text-emerald-300',
  on_leave: 'text-amber-300',
  terminated: 'text-rose-300',
};

const EmployeeDirectoryPage = () => {
  const { data, isLoading } = useEmployeesQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Employee Directory" description="Human capital snapshot across departments." />

      <Callout>
        HRIS synchronization and contract management modules are planned. Current data is mock-only to showcase the
        layout structure.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees.map((employee) => {
                  const statusClass = statusColor[employee.status] ?? 'text-slate-300';
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{formatCurrency(employee.salary)}</TableCell>
                      <TableCell>
                        <span className={`capitalize ${statusClass}`}>
                          {employee.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(employee.hiredAt)}</TableCell>
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

export default EmployeeDirectoryPage;
