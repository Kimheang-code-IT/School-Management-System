import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatDate } from '@/utils/formatters';

const StudentsGraduatedPage = () => {
  const { data, isLoading } = useStudentsQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Graduated Students" description="Track alumni onboarding and archive records." />

      <Callout>
        Alumni engagement modules will surface CRM integrations here. For now you can export data and track placement
        outcomes manually.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Alumni Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Graduate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students
                  .filter((student) => student.status === 'graduated')
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.classLevel}</TableCell>
                      <TableCell>{formatDate(student.registeredAt)}</TableCell>
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

export default StudentsGraduatedPage;
