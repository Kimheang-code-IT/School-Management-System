import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatNumber } from '@/utils/formatters';

const StudentsBooksPage = () => {
  const { data, isLoading } = useStudentsQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Books Distribution" description="Track academic resource usage per student." />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Borrowed Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Books Borrowed</TableHead>
                  <TableHead>Tuition Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{formatNumber(student.booksBorrowed)}</TableCell>
                    <TableCell>{student.tuitionBalance > 0 ? 'Balance Due' : 'Settled'}</TableCell>
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

export default StudentsBooksPage;
