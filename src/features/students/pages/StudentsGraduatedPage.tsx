import { useCallback, useMemo, useState } from 'react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import type { Student } from '@/types';
import { formatDate } from '@/utils/formatters';

const StudentsGraduatedPage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const graduatedStudents = useMemo(() => {
    if (!data?.students) {
      return [] as Student[];
    }

    return data.students.filter((student) => student.status === 'graduated');
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return graduatedStudents;
    }

    const normalizedQuery = searchTerm.toLowerCase();

    return graduatedStudents.filter((student) => {
      const formattedDate = formatDate(student.registeredAt);
      const searchFields = [
        student.id,
        student.fullName,
        student.email,
        student.socialHandle ?? '',
        student.classLevel,
        formattedDate,
        student.status,
      ]
        .join(' ')
        .toLowerCase();

      return searchFields.includes(normalizedQuery);
    });
  }, [graduatedStudents, searchTerm]);

  const handleGenerateCertificate = useCallback((student: Student) => {
    setGeneratingId(student.id);

    window.setTimeout(() => {
      const certificateContent = `Certificate of Graduation\n\nThis certifies that ${student.fullName} (ID: ${student.id}) has successfully completed the ${student.classLevel} program.\n\nIssued on: ${new Date().toLocaleDateString()}.`;
      const blob = new Blob([certificateContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.fullName.replace(/\s+/g, '_')}_certificate.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setGeneratingId(null);
    }, 350);
  }, []);

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base text-slate-200">Alumni Roster</CardTitle>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by ID, name, program, or social handle"
                className="w-full md:w-80"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Social Media</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Register Dateline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-400">
                      No graduates match the current search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{student.fullName}</span>
                          <span className="text-xs text-slate-400">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.socialHandle ?? '-'}</TableCell>
                      <TableCell>{student.classLevel}</TableCell>
                      <TableCell>{formatDate(student.registeredAt)}</TableCell>
                      <TableCell>{student.status === 'graduated' ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateCertificate(student)}
                          isLoading={generatingId === student.id}
                        >
                          Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentsGraduatedPage;
