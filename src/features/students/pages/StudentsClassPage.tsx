import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Trash2, Users, X } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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

type ClassFormState = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: StudentClass['status'];
  studentIds: string[];
};

const StudentsClassPage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [classList, setClassList] = useState<StudentClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | string>('all');
  const [startFilter, setStartFilter] = useState('');
  const [endFilter, setEndFilter] = useState('');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [addStudentSearch, setAddStudentSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<ClassFormState>({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    status: 'active',
    studentIds: [],
  });

  useEffect(() => {
    if (data?.classes) {
      setClassList(data.classes);
    }
  }, [data?.classes]);

  const studentMap = useMemo(() => {
    const entries = (data?.students ?? []).map((student) => [student.id, student] as const);
    return new Map(entries);
  }, [data?.students]);

  const gradeOptions = useMemo(() => {
    const levels = new Set((data?.students ?? []).map((student) => student.classLevel));
    const sorted = Array.from(levels).sort((a, b) => a.localeCompare(b));
    return ['all', ...sorted];
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

  const availableStudents = useMemo(() => {
    if (!selectedClass) {
      return [];
    }

    const assignedIds = new Set(selectedClass.studentIds);
    const term = addStudentSearch.trim().toLowerCase();

    return (data?.students ?? [])
      .filter((student) => !assignedIds.has(student.id))
      .filter((student) => {
        if (!term) {
          return true;
        }

        return (
          student.fullName.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.id.toLowerCase().includes(term) ||
          student.classLevel.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [selectedClass, data?.students, addStudentSearch]);

  const getDaysLeft = (endDate: string) => {
    if (!endDate) {
      return null;
    }

    const classEnd = new Date(endDate);
    classEnd.setHours(0, 0, 0, 0);
    const diff = Math.ceil((classEnd.getTime() - todayAtMidnight().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const resetForm = () => {
    setFormValues({
      id: '',
      name: '',
      startDate: '',
      endDate: '',
      status: 'active',
      studentIds: [],
    });
  };

  const handleToggleForm = () => {
    setShowForm((previous) => {
      const next = !previous;
      if (next) {
        setSelectedClassId(null);
        setIsAddDrawerOpen(false);
        resetForm();
      } else {
        resetForm();
      }
      return next;
    });
  };

  const handleFormFieldChange = (field: keyof ClassFormState, value: string | string[]) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleStudentSelection = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions, (option) => option.value);
    handleFormFieldChange('studentIds', values);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleGradeFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGradeFilter(event.target.value);
  };

  const handleStartFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartFilter(event.target.value);
  };

  const handleEndFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndFilter(event.target.value);
  };

  const handleResetFilters = () => {
    setGradeFilter('all');
    setStartFilter('');
    setEndFilter('');
  };

  const handleAddStudentSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAddStudentSearch(event.target.value);
  };

  const handleOpenAddStudents = (classId?: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setShowForm(false);
    }

    setIsAddDrawerOpen(true);
    setAddStudentSearch('');
  };

  const handleCloseAddStudents = () => {
    setIsAddDrawerOpen(false);
    setAddStudentSearch('');
  };

  const handleAddStudentToClass = (studentId: string) => {
    if (!selectedClassId) {
      return;
    }

    const className = selectedClass?.name ?? 'class';

    setClassList((previous) =>
      previous.map((classItem) => {
        if (classItem.id !== selectedClassId) {
          return classItem;
        }

        if (classItem.studentIds.includes(studentId)) {
          return classItem;
        }

        return {
          ...classItem,
          studentIds: [...classItem.studentIds, studentId],
        };
      }),
    );

    window.alert(`Sweet alert: Student added to ${className}.`);
  };

  const handleCreateClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.id.trim() || !formValues.name.trim()) {
      window.alert('Please provide both an ID and class name before saving.');
      return;
    }

    if (!formValues.startDate || !formValues.endDate) {
      window.alert('Start and end dates are required.');
      return;
    }

    if (new Date(formValues.startDate) > new Date(formValues.endDate)) {
      window.alert('The end date must be later than the start date.');
      return;
    }

    if (classList.some((item) => item.id.toLowerCase() === formValues.id.toLowerCase())) {
      window.alert('A class with this ID already exists. Choose a different identifier.');
      return;
    }

    const newClass: StudentClass = {
      id: formValues.id.trim(),
      name: formValues.name.trim(),
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      status: formValues.status,
      studentIds: formValues.studentIds,
    };

    setClassList((previous) => [...previous, newClass]);
    setSelectedClassId(newClass.id);
    setShowForm(false);
    resetForm();
  };

  const handleDeleteClass = (classId: string) => {
    const matchingClass = classList.find((item) => item.id === classId);
    if (!matchingClass) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${matchingClass.name}?\n\nThis removes the class and unassigns its students. Select �OK� to confirm or �Cancel� to keep it.`,
    );
    if (!confirmed) {
      return;
    }

    setClassList((previous) => previous.filter((item) => item.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
    setIsAddDrawerOpen(false);
  };

  const handleSelectClass = (classId: string) => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    }

    setSelectedClassId((current) => (current === classId ? null : classId));
    setIsAddDrawerOpen(false);
    setAddStudentSearch('');
  };

  const sortedClasses = useMemo(() => {
    return [...classList].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [classList]);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return sortedClasses.filter((item) => {
      const studentCount = item.studentIds.length.toString();
      const matchesText =
        term.length === 0 ||
        item.id.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term) ||
        studentCount.includes(term);

      if (!matchesText) {
        return false;
      }

      const matchesGrade =
        gradeFilter === 'all' ||
        item.studentIds.some((studentId) => studentMap.get(studentId)?.classLevel === gradeFilter);

      if (!matchesGrade) {
        return false;
      }

      const matchesStart = !startFilter || (item.startDate && item.startDate >= startFilter);
      const matchesEnd = !endFilter || (item.endDate && item.endDate <= endFilter);

      return matchesStart && matchesEnd;
    });
  }, [searchTerm, sortedClasses, gradeFilter, startFilter, endFilter, studentMap]);

  const totalClasses = classList.length;
  const totalStudents = data?.students?.length ?? 0;

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <div className="w-full rounded-lg border border-slate-800/60 bg-slate-950/50 px-4 py-3 md:max-w-xs">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Students</p>
                <p className="text-3xl font-semibold text-slate-50">{totalStudents}</p>
                <p className="text-xs text-slate-500">
                  Viewing {filteredClasses.length} of {totalClasses} classes
                </p>
              </div>
              <div className="w-full md:flex-1">
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by class name, ID, status, or headcount"
                  aria-label="Search classes"
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleForm}
                className="w-full whitespace-nowrap md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {showForm ? 'Cancel' : 'Insert class'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="grade-filter">Grade</Label>
                <select
                  id="grade-filter"
                  value={gradeFilter}
                  onChange={handleGradeFilterChange}
                  className="h-10 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {gradeOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-900 text-slate-100">
                      {option === 'all' ? 'All grades' : option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-filter">Start from</Label>
                <Input
                  id="start-filter"
                  type="date"
                  value={startFilter}
                  onChange={handleStartFilterChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-filter">End by</Label>
                <Input
                  id="end-filter"
                  type="date"
                  value={endFilter}
                  onChange={handleEndFilterChange}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" onClick={handleResetFilters} className="w-full">
                  Clear filters
                </Button>
              </div>
            </div>

            {showForm && (
              <Card className="border-slate-800/60 bg-slate-950/40">
                <form onSubmit={handleCreateClass}>
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-200">Add New Class</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="class-id">Class ID</Label>
                      <Input
                        id="class-id"
                        value={formValues.id}
                        onChange={(event) => handleFormFieldChange('id', event.target.value)}
                        placeholder="class-005"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class-name">Class name</Label>
                      <Input
                        id="class-name"
                        value={formValues.name}
                        onChange={(event) => handleFormFieldChange('name', event.target.value)}
                        placeholder="Grade 8 - Robotics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class-start">Start date</Label>
                      <Input
                        id="class-start"
                        type="date"
                        value={formValues.startDate}
                        onChange={(event) => handleFormFieldChange('startDate', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class-end">End date</Label>
                      <Input
                        id="class-end"
                        type="date"
                        value={formValues.endDate}
                        onChange={(event) => handleFormFieldChange('endDate', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class-status">Status</Label>
                      <select
                        id="class-status"
                        value={formValues.status}
                        onChange={(event) => handleFormFieldChange('status', event.target.value)}
                        className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="active">Active</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="class-students">Assign students</Label>
                      <select
                        id="class-students"
                        multiple
                        value={formValues.studentIds}
                        onChange={handleStudentSelection}
                        className="h-32 w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        {(data?.students ?? []).map((student) => (
                          <option key={student.id} value={student.id} className="bg-slate-900 text-slate-100">
                            {student.fullName} - {student.classLevel}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">
                        Hold Ctrl (Windows) or Cmd (macOS) to select multiple students.
                      </p>
                    </div>
                  </CardContent>
                  <CardContent className="flex items-center justify-end gap-3 pt-0">
                    <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                      Reset
                    </Button>
                    <Button type="submit" size="sm">
                      Save class
                    </Button>
                  </CardContent>
                </form>
              </Card>
            )}

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
                                  onClick={() => handleOpenAddStudents(classItem.id)}
                                  aria-label="Add students"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
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

      {selectedClass && !showForm && (
        <Card className="border-brand/40 bg-slate-900/80">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base text-slate-100">{selectedClass.name}</CardTitle>
              <p className="text-sm text-slate-400">
                {selectedClass.studentIds.length} student{selectedClass.studentIds.length === 1 ? '' : 's'}{' | '}
                {formatDate(selectedClass.startDate)} - {formatDate(selectedClass.endDate)}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => handleOpenAddStudents(selectedClass.id)} className="whitespace-nowrap">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add students
            </Button>
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

      {isAddDrawerOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={handleCloseAddStudents} />
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Add students to {selectedClass.name}</h2>
                <p className="text-sm text-slate-400">Only students not already assigned to this class appear here.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleCloseAddStudents} aria-label="Close add student panel">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <Input
                value={addStudentSearch}
                onChange={handleAddStudentSearchChange}
                placeholder="Search students by name, email, or ID"
                aria-label="Search students to add"
                className="w-full"
              />
              <div className="flex-1 space-y-3 overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-slate-400">No matching students available to add.</p>
                ) : (
                  availableStudents.map((student) => (
                    <div key={student.id} className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-100">{student.fullName}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                          <p className="text-xs text-slate-500">{student.classLevel} � {student.status}</p>
                        </div>
                        <Button type="button" size="sm" onClick={() => handleAddStudentToClass(student.id)}>
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsClassPage;




