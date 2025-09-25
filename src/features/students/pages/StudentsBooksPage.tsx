import { useMemo, useState } from 'react';
import { BookUp2, PencilLine } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatDate } from '@/utils/formatters';

type StudentBookRecord = {
  studentId: string;
  studentName: string;
  grade: string;
  email: string;
  phone: string;
  bookTitle: string;
  acquiredOn: string;
  status: 'Issued' | 'Overdue' | 'Returned';
};

const sampleBooks: StudentBookRecord[] = [
  {
    studentId: 'stu-001',
    studentName: 'John Doe',
    grade: 'Grade 10',
    email: 'john.doe@school.io',
    phone: '555-0101',
    bookTitle: 'Advanced Algebra II',
    acquiredOn: '2025-09-05',
    status: 'Issued',
  },
  {
    studentId: 'stu-005',
    studentName: 'Noah Kim',
    grade: 'Grade 10',
    email: 'noah.kim@school.io',
    phone: '555-0105',
    bookTitle: 'World History - Modern Era',
    acquiredOn: '2025-09-02',
    status: 'Overdue',
  },
  {
    studentId: 'stu-004',
    studentName: 'Sophia Martinez',
    grade: 'Grade 9',
    email: 'sophia.martinez@school.io',
    phone: '555-0104',
    bookTitle: 'Physics Lab Workbook',
    acquiredOn: '2025-08-30',
    status: 'Issued',
  },
  {
    studentId: 'stu-006',
    studentName: 'Emma Williams',
    grade: 'Grade 8',
    email: 'emma.williams@school.io',
    phone: '555-0106',
    bookTitle: 'Creative Writing Handbook',
    acquiredOn: '2025-08-28',
    status: 'Returned',
  },
];

const StudentsBooksPage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookFilter, setBookFilter] = useState<'all' | string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const records = useMemo(() => sampleBooks, []);

  const bookOptions = useMemo(() => {
    const options = new Set(records.map((item) => item.bookTitle));
    return ['all', ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        record.studentName.toLowerCase().includes(term) ||
        record.email.toLowerCase().includes(term) ||
        record.phone.toLowerCase().includes(term) ||
        record.grade.toLowerCase().includes(term);

      const matchesBook = bookFilter === 'all' || record.bookTitle === bookFilter;
      const matchesStart = !startDate || record.acquiredOn >= startDate;
      const matchesEnd = !endDate || record.acquiredOn <= endDate;

      return matchesSearch && matchesBook && matchesStart && matchesEnd;
    });
  }, [records, searchTerm, bookFilter, startDate, endDate]);

  const handleUpdateRecord = (studentId: string) => {
    window.alert(`Sweet alert: Update flow for ${studentId} is coming soon.`);
  };

  const handleBuyBook = (record: StudentBookRecord) => {
    window.alert(`Sweet alert: Generating order for ${record.studentName}\nBook: ${record.bookTitle}\nGrade: ${record.grade}\nContact: ${record.email} / ${record.phone}`);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader title="Books Distribution" description="Track academic resource usage per student." />

      <Callout>
        Integration with the library catalogue will enable barcode scanning and overdue automation. Presently we surface
        the latest issued resources per student.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base text-slate-200">Issued Library Resources</CardTitle>
              <p className="text-sm text-slate-400">Search, filter, and action student book usage.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by student, grade, email, or phone"
                aria-label="Search book assignments"
                className="w-full sm:w-64"
              />
              <select
                value={bookFilter}
                onChange={(event) => setBookFilter(event.target.value as typeof bookFilter)}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand sm:w-48"
              >
                {bookOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-slate-100">
                    {option === 'all' ? 'All books' : option}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="start-date">
                  Start date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="end-date">
                  End date
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-800/60 bg-slate-950/40">
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Buy Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                          No book records match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={`${record.studentId}-${record.bookTitle}`}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-100">{record.studentName}</span>
                              <span className="text-xs text-slate-500">{record.email} / {record.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-300">{record.bookTitle}</TableCell>
                          <TableCell className="text-sm text-slate-300">{record.grade}</TableCell>
                          <TableCell>{formatDate(record.acquiredOn)}</TableCell>
                          <TableCell>
                            <span
                              className={
                                record.status === 'Issued'
                                  ? 'text-emerald-300'
                                  : record.status === 'Overdue'
                                  ? 'text-amber-300'
                                  : 'text-slate-300'
                              }
                            >
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateRecord(record.studentId)}
                                aria-label={`Update record for ${record.studentName}`}
                              >
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleBuyBook(record)}
                                aria-label={`Buy book for ${record.studentName}`}
                              >
                                <BookUp2 className="h-4 w-4 text-sky-300" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentsBooksPage;
