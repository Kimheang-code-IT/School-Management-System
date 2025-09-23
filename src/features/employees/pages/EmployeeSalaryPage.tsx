import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEmployeesQuery } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';

const EmployeeSalaryPage = () => {
  const { data, isLoading } = useEmployeesQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Salary Management" description="Payroll visibility with basic metrics." />

      <Callout>
        Payroll exports and statutory deduction calculators are on the roadmap. At present this module surfaces static
        data for demo purposes.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Monthly Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{formatCurrency(employee.salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeSalaryPage;
