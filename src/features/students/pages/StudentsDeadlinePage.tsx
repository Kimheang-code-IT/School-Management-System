import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const calculateDaysLeft = (dueDate: Date) => {
  const diff = dueDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const StudentsDeadlinePage = () => {
  const { data, isLoading } = useStudentsQuery();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <ModuleHeader title="Deadlines & Compliance" description="Track outstanding items that need intervention." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const deadlines = data.students
    .filter((student) => student.tuitionBalance > 0)
    .map((student, index) => {
      const dueDate = new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000);
      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        amount: student.tuitionBalance,
        dueDate,
        daysLeft: calculateDaysLeft(dueDate),
      };
    });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Deadlines & Compliance"
        description="Stay ahead of upcoming tuition and documentation deadlines."
      />

      <Callout>
        Automatic reminders and SMS triggers will be surfaced here in the next iteration. Configure notification cadence
        centrally once backend services are connected.
      </Callout>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Upcoming Tuition Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((item) => (
                <TableRow key={item.id} className={item.daysLeft <= 3 ? 'bg-rose-500/5' : undefined}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{item.fullName}</span>
                      <span className="text-xs text-slate-500">{item.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-400">{item.daysLeft} days left</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsDeadlinePage;
