import { Fragment, useCallback, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FileText, Info, X } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import type { Student } from '@/types';
import { formatDate } from '@/utils/formatters';

type GraduationOutcome = {
  result: 'pass' | 'fail';
  gpa: number;
  scores: Array<{ subject: string; score: number }>;
};

type ResultFilter = 'all' | 'pass' | 'fail';

const graduationOutcomes: Record<string, GraduationOutcome> = {
  'stu-003': {
    result: 'pass',
    gpa: 3.92,
    scores: [
      { subject: 'Mathematics', score: 96 },
      { subject: 'Physics', score: 93 },
      { subject: 'Literature', score: 88 },
      { subject: 'Computer Science', score: 97 },
    ],
  },
};

const StudentsGraduatedPage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [registeredFrom, setRegisteredFrom] = useState('');
  const [registeredTo, setRegisteredTo] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const resolveStudentResult = useCallback((student: Student): GraduationOutcome['result'] => {
    const outcome = graduationOutcomes[student.id];
    return outcome?.result ?? (student.status === 'graduated' ? 'pass' : 'fail');
  }, []);

  const graduatedStudents = useMemo(() => {
    if (!data?.students) {
      return [] as Student[];
    }

    return data.students.filter((student) => student.status === 'graduated');
  }, [data]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const fromDate = registeredFrom ? new Date(`${registeredFrom}T00:00:00`) : null;
    const toDate = registeredTo ? new Date(`${registeredTo}T23:59:59`) : null;

    return graduatedStudents.filter((student) => {
      const outcome = graduationOutcomes[student.id];
      const studentResult = resolveStudentResult(student);
      const formattedDate = formatDate(student.registeredAt);

      if (normalizedQuery) {
        const searchFields = [
          student.id,
          student.fullName,
          student.email,
          student.phone,
          student.socialHandle ?? '',
          student.classLevel,
          formattedDate,
          student.status,
          studentResult,
          outcome?.gpa?.toString() ?? '',
        ]
          .join(' ')
          .toLowerCase();

        if (!searchFields.includes(normalizedQuery)) {
          return false;
        }
      }

      if (resultFilter !== 'all' && studentResult !== resultFilter) {
        return false;
      }

      if (fromDate || toDate) {
        const registerDate = new Date(`${student.registeredAt}T00:00:00`);

        if (!Number.isNaN(registerDate.getTime())) {
          if (fromDate && registerDate < fromDate) {
            return false;
          }

          if (toDate && registerDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [graduatedStudents, registeredFrom, registeredTo, resolveStudentResult, resultFilter, searchTerm]);

  const handleGenerateCertificate = useCallback(
    (student: Student) => {
      setGeneratingId(student.id);

      window.setTimeout(() => {
        const outcome = graduationOutcomes[student.id];
        const result = resolveStudentResult(student);
        const certificateContent = `Certificate of Graduation\n\nThis certifies that ${student.fullName} (ID: ${
          student.id
        }) has successfully completed the ${student.classLevel} program.\n\nOverall Result: ${
          result === 'fail' ? 'Fail' : 'Pass'
        }${outcome ? `\nGPA: ${outcome.gpa.toFixed(2)}` : ''}\nIssued on: ${new Date().toLocaleDateString()}.`;
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
    },
    [resolveStudentResult],
  );

  const handleShowResults = useCallback((student: Student) => {
    setDetailStudent(student);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailStudent(null);
  }, []);

  const detailOutcome = detailStudent ? graduationOutcomes[detailStudent.id] : null;

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
            <div className="flex flex-col gap-4">
              <CardTitle className="text-base text-slate-200">Alumni Roster</CardTitle>
              <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-4">
                <div className="flex min-w-[240px] flex-1 items-center gap-2">
                  <Label htmlFor="graduates-search" className="shrink-0 text-xs font-medium text-slate-300">
                    Search
                  </Label>
                  <Input
                    id="graduates-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search ..."
                    className="flex-1"
                  />
                </div>
                <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
                  <Label htmlFor="graduates-result" className="shrink-0 text-xs font-medium text-slate-300">
                    Filter result
                  </Label>
                  <select
                    id="graduates-result"
                    value={resultFilter}
                    onChange={(event) => setResultFilter(event.target.value as ResultFilter)}
                    className="h-10 flex-1 rounded-md border border-slate-800/60 bg-slate-900/60 px-3 text-sm text-slate-100 shadow-sm transition focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                  >
                    <option value="all">All results</option>
                    <option value="pass">Pass only</option>
                    <option value="fail">Fail only</option>
                  </select>
                </div>
                <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
                  <Label htmlFor="graduates-from" className="shrink-0 text-xs font-medium text-slate-300">
                    Registered from
                  </Label>
                  <Input
                    id="graduates-from"
                    type="date"
                    value={registeredFrom}
                    max={registeredTo || undefined}
                    onChange={(event) => setRegisteredFrom(event.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
                  <Label htmlFor="graduates-to" className="shrink-0 text-xs font-medium text-slate-300">
                    Registered to
                  </Label>
                  <Input
                    id="graduates-to"
                    type="date"
                    value={registeredTo}
                    min={registeredFrom || undefined}
                    onChange={(event) => setRegisteredTo(event.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Register Dateline</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-400">
                      No graduates match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const result = resolveStudentResult(student);
                    const isPass = result === 'pass';

                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{student.fullName}</span>
                            <span className="text-xs text-slate-400">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.classLevel}</TableCell>
                        <TableCell>{formatDate(student.registeredAt)}</TableCell>
                        <TableCell>
                          <Badge variant={isPass ? 'success' : 'danger'}>{isPass ? 'Pass' : 'Fail'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 px-0"
                              onClick={() => handleGenerateCertificate(student)}
                              isLoading={generatingId === student.id}
                              aria-label={`Generate certificate for ${student.fullName}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 px-0"
                              onClick={() => handleShowResults(student)}
                              aria-label={`View graduation results for ${student.fullName}`}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Transition appear show={detailStudent !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseDetail}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg rounded-xl border border-slate-800/70 bg-slate-900/95 p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-100">Graduation summary</Dialog.Title>
                      {detailStudent && (
                        <Dialog.Description className="mt-1 text-sm text-slate-400">
                          Performance breakdown for {detailStudent.fullName}.
                        </Dialog.Description>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0 text-slate-400 hover:text-slate-200"
                      onClick={handleCloseDetail}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {detailStudent && detailOutcome ? (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/70 p-3">
                          <div>
                            <p className="text-sm text-slate-400">Overall Result</p>
                            <p className="text-base font-semibold text-slate-100">
                              {detailOutcome.result === 'pass' ? 'Pass' : 'Fail'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">GPA</p>
                            <p className="text-2xl font-bold text-brand">{detailOutcome.gpa.toFixed(2)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-300">Score Breakdown</p>
                          <div className="mt-2 grid gap-2">
                            {detailOutcome.scores.map((score) => (
                              <div
                                key={score.subject}
                                className="flex items-center justify-between rounded-md border border-slate-800/50 bg-slate-900/60 px-3 py-2 text-sm"
                              >
                                <span className="text-slate-300">{score.subject}</span>
                                <span className="font-semibold text-slate-100">{score.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-md border border-slate-800/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                          Registered on {formatDate(detailStudent.registeredAt)} | Contact {detailStudent.phone} | Program{' '}
                          {detailStudent.classLevel}
                        </div>
                      </>
                    ) : (
                      <Callout>No score data is available for this student yet.</Callout>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default StudentsGraduatedPage;
