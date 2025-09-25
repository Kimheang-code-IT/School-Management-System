import type { ChangeEvent } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { PencilLine, Trash2 } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import type { StudentPayment, StudentPaymentStatus, StudentSession } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  graduated: 'default',
};

const paymentStatusLabel: Record<StudentPaymentStatus, string> = {
  cleared: 'Cleared',
  pending: 'Pending',
  failed: 'Failed',
};

const paymentStatusTone: Record<StudentPaymentStatus, string> = {
  cleared: 'text-emerald-300',
  pending: 'text-amber-300',
  failed: 'text-rose-300',
};

const sessionLabel: Record<StudentSession, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const emptySummary = { total: 0, active: 0, graduated: 0, overdue: 0 };

const StudentsOverviewPage = () => {
  const { data } = useStudentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'graduated'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const students = data?.students ?? [];
  const summary = data?.summary ?? emptySummary;
  const payments = data?.payments ?? [];

  const paymentsByStudent = useMemo(() => {
    const grouped = payments.reduce<Record<string, StudentPayment[]>>((accumulator, payment) => {
      if (!accumulator[payment.studentId]) {
        accumulator[payment.studentId] = [];
      }
      accumulator[payment.studentId].push(payment);
      return accumulator;
    }, {});

    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
    });

    return grouped;
  }, [payments]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      if (archivedIds.includes(student.id)) {
        return false;
      }

      const matchesSearch =
        normalizedSearch.length === 0 ||
        student.fullName.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        student.phone.toLowerCase().includes(normalizedSearch) ||
        student.sex.toLowerCase().includes(normalizedSearch) ||
        student.session.toLowerCase().includes(normalizedSearch) ||
        student.location.toLowerCase().includes(normalizedSearch) ||
        student.id.toLowerCase().includes(normalizedSearch) ||
        student.classLevel.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesStartDate = !startDate || student.registeredAt >= startDate;
      const matchesEndDate = !endDate || student.registeredAt <= endDate;

      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [archivedIds, students, searchTerm, statusFilter, startDate, endDate]);

  const activeExpandedId = useMemo(() => {
    if (!expandedStudentId) {
      return null;
    }

    return filteredStudents.some((student) => student.id === expandedStudentId) ? expandedStudentId : null;
  }, [expandedStudentId, filteredStudents]);

  const totalBooksBorrowed = useMemo(() => {
    return filteredStudents.reduce((total, student) => total + student.booksBorrowed, 0);
  }, [filteredStudents]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as typeof statusFilter);
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleBalanceToggle = (studentId: string) => {
    setExpandedStudentId((current) => (current === studentId ? null : studentId));
  };

  const handleArchiveStudent = (studentId: string, studentName: string) => {
    const confirmed = window.confirm(`Archive ${studentName}? This hides the record from the overview list.`);
    if (!confirmed) {
      return;
    }

    setArchivedIds((current) => (current.includes(studentId) ? current : [...current, studentId]));
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
    }

    window.alert(`Sweet alert: ${studentName} archived from the overview.`);
  };

  const handleUpdateStudent = (studentName: string) => {
    window.alert(`Sweet alert: Updates for ${studentName} are coming soon.`);
  };

  if (!data) {
    return (
      <div className="space-y-4">
        <ModuleHeader title="Student Overview" description="Centralized insights for student population health." />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Student Overview"
        description="Centralized insights for student population health."
      />

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-4 pt-4 pb-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
            <p className="mt-1 font-semibold !text-[14px] leading-tight text-slate-100">{formatNumber(summary.total)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-4 pt-4 pb-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active</p>
            <p className="mt-1 font-semibold !text-[14px] leading-tight text-emerald-300">{formatNumber(summary.active)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-4 pt-4 pb-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Graduated</p>
            <p className="mt-1 font-semibold !text-[14px] leading-tight text-slate-100">{formatNumber(summary.graduated)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-4 pt-4 pb-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Open Balances</p>
            <p className="mt-1 font-semibold !text-[14px] leading-tight text-rose-300">{formatNumber(summary.overdue)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Student Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, ID, email, or class"
                aria-label="Search students"
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="status-filter">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="h-10 w-48 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="start-date">
                  Registered from
                </label>
                <Input id="start-date" type="date" value={startDate} onChange={handleStartDateChange} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="end-date">
                  Registered to
                </label>
                <Input id="end-date" type="date" value={endDate} onChange={handleEndDateChange} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/60 bg-slate-950/40">
            <div className="max-h-[520px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-[110px]">ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Register Date</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="py-10 text-center text-sm text-slate-400">
                        No students match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const isExpanded = activeExpandedId === student.id;
                      const studentPayments = paymentsByStudent[student.id] ?? [];
                      const hasBooks = student.booksBorrowed > 0;

                      return (
                        <Fragment key={student.id}>
                          <TableRow>
                            <TableCell className="font-mono text-xs text-slate-400">{student.id}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-100">{student.fullName}</span>
                                <span className="text-xs text-slate-500">{student.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize text-sm text-slate-300">{student.sex}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-400">{student.phone}</TableCell>
                            <TableCell>{student.classLevel}</TableCell>
                            <TableCell className="capitalize text-sm text-slate-300">{sessionLabel[student.session]}</TableCell>
                            <TableCell className="text-sm text-slate-300">{student.location}</TableCell>
                            <TableCell>{formatDate(student.registeredAt)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatNumber(student.booksBorrowed)}</span>
                                <span className="text-xs text-slate-500">{hasBooks ? 'Has books' : 'No books'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBalanceToggle(student.id)}
                                className="px-0 text-brand hover:text-brand/80"
                              >
                                {formatCurrency(student.tuitionBalance)}
                                <span className="text-xs text-slate-400">{isExpanded ? 'Hide' : 'View'}</span>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariant[student.status] ?? 'default'} className="capitalize">
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStudent(student.fullName)}
                                  aria-label={`Update ${student.fullName}`}
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveStudent(student.id, student.fullName)}
                                  aria-label={`Delete ${student.fullName}`}
                                >
                                  <Trash2 className="h-4 w-4 text-rose-300" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${student.id}-payments`} className="bg-slate-950/60">
                              <TableCell colSpan={12} className="p-6">
                                <div className="space-y-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Payment history
                                  </p>
                                  {studentPayments.length === 0 ? (
                                    <p className="text-sm text-slate-400">No payments recorded yet.</p>
                                  ) : (
                                    <div className="grid gap-3 md:grid-cols-2">
                                      {studentPayments.map((payment) => (
                                        <div
                                          key={payment.id}
                                          className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-3"
                                        >
                                          <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{payment.method}</span>
                                            <span>{formatDate(payment.recordedAt)}</span>
                                          </div>
                                          <div className="mt-2 flex items-baseline justify-between">
                                            <span className="text-sm font-medium text-slate-100">
                                              {formatCurrency(payment.amount)}
                                            </span>
                                            <span className={`${paymentStatusTone[payment.status]} text-xs font-medium`}>
                                              {paymentStatusLabel[payment.status]}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                  <TableRow className="bg-slate-900/80">
                    <TableCell colSpan={8} className="text-sm font-medium text-slate-300">
                      Totals
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">{formatNumber(totalBooksBorrowed)}</span>
                        <span className="text-xs text-slate-500">
                          {totalBooksBorrowed > 0 ? 'Borrowed across visible students' : 'No books in current view'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsOverviewPage;




