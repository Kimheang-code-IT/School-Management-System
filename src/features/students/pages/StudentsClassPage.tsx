import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Trash2, Users } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import type { Student, StudentClass } from '@/types';
import { formatDate } from '@/utils/formatters';

const todayAtMidnight = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const StudentsClassPage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [classList, setClassList] = useState<StudentClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (data?.classes) {
      setClassList(data.classes);
    }
  }, [data?.classes]);

  const studentMap = useMemo(() => {
    const entries = (data?.students ?? []).map((student) => [student.id, student] as const);
    return new Map(entries);
  }, [data?.students]);

  const selectedClass = useMemo(() => classList.find((item) => item.id === selectedClassId) ?? null, [
    classList,
    selectedClassId,
  ]);

  const selectedStudents: Student[] = useMemo(() => {
    if (!selectedClass) {
      return [];
    }

    return selectedClass.studentIds
      .map((studentId) => studentMap.get(studentId))
      .filter((student): student is Student => Boolean(student));
  }, [selectedClass, studentMap]);

  const getDaysLeft = (endDate: string) => {
    if (!endDate) {
      return null;
    }

    const classEnd = new Date(endDate);
    classEnd.setHours(0, 0, 0, 0);
    const diff = Math.ceil((classEnd.getTime() - todayAtMidnight().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleDeleteClass = (classId: string) => {
    const matchingClass = classList.find((item) => item.id === classId);
    if (!matchingClass) {
      return;
    }

    const confirmed = window.confirm(`Remove ${matchingClass.name}?`);
    if (!confirmed) {
      return;
    }

    setClassList((previous) => previous.filter((item) => item.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClassId((current) => (current === classId ? null : classId));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const sortedClasses = useMemo(() => {
    return [...classList].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [classList]);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return sortedClasses;
    }

    return sortedClasses.filter((item) => {
      const studentCount = item.studentIds.length.toString();
      return (
        item.id.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term) ||
        studentCount.includes(term)
      );
    });
  }, [searchTerm, sortedClasses]);

  const totalClasses = classList.length;

  return (
    <div className="space-y-6">
      <ModuleHeader title="Class Management" description="Current enrollment by cohort with capacity monitoring." />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-200">Cohort Distribution</CardTitle>
            <p className="text-sm text-slate-400">
              Review class coverage, filter by keywords, and inspect assigned students in a single view.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full rounded-lg border border-slate-800/60 bg-slate-950/50 px-4 py-3 md:max-w-xs">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Classes</p>
                <p className="text-3xl font-semibold text-slate-50">{totalClasses}</p>
                <p className="text-xs text-slate-500">
                  Showing {filteredClasses.length} {filteredClasses.length === 1 ? 'result' : 'results'}
                </p>
              </div>
              <div className="w-full md:max-w-sm">
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by class name, ID, status, or headcount"
                  aria-label="Search classes"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-800/60 bg-slate-950/30">
              <div className="max-h-[420px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                    <TableRow>
                      <TableHead className="w-[120px]">ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Day Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-400">
                          No classes match your search. Adjust the filters to see more results.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((classItem) => {
                        const daysLeft = getDaysLeft(classItem.endDate);
                        const studentCount = classItem.studentIds.length;

                        return (
                          <TableRow key={classItem.id}>
                            <TableCell>{classItem.id}</TableCell>
                            <TableCell>{classItem.name}</TableCell>
                            <TableCell>{studentCount}</TableCell>
                            <TableCell>{formatDate(classItem.startDate)}</TableCell>
                            <TableCell>{formatDate(classItem.endDate)}</TableCell>
                            <TableCell>
                              {typeof daysLeft === 'number' ? (
                                <span className={daysLeft < 0 ? 'text-rose-400' : 'text-slate-200'}>{daysLeft}</span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="capitalize">{classItem.status}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSelectClass(classItem.id)}
                                  aria-label="View students"
                                  className={selectedClassId === classItem.id ? 'bg-slate-800/60' : undefined}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteClass(classItem.id)}
                                  aria-label="Delete class"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && (
        <Card className="border-brand/40 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">{selectedClass.name}</CardTitle>
            <p className="text-sm text-slate-400">
              {selectedClass.studentIds.length} student{selectedClass.studentIds.length === 1 ? '' : 's'}{' | '}
              {formatDate(selectedClass.startDate)} - {formatDate(selectedClass.endDate)}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-slate-400">
                      No students are currently assigned to this class.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.classLevel}</TableCell>
                      <TableCell className="capitalize">{student.status}</TableCell>
                      <TableCell>{formatDate(student.registeredAt)}</TableCell>
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

export default StudentsClassPage;
