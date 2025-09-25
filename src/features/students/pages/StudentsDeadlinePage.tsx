import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStudentsQuery } from '@/hooks';
import { formatDate } from '@/utils/formatters';

type DeadlineItem = {
  id: string;
  fullName: string;
  email: string;
  sex: string;
  amount: number;
  dueDate: string;
};

const calculateDaysLeft = (dueDate: string | Date) => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const diff = due.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getUrgencyMeta = (daysLeft: number) => {
  if (daysLeft <= 2) {
    return {
      label: 'Critical',
      className:
        'rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300',
    };
  }

  if (daysLeft <= 5) {
    return {
      label: 'High',
      className:
        'rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300',
    };
  }

  return {
    label: 'Upcoming',
    className:
      'rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300',
  };
};

const StudentsDeadlinePage = () => {
  const { data, isLoading } = useStudentsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [deadlineItems, setDeadlineItems] = useState<DeadlineItem[]>([]);
  const [selectedContinuationId, setSelectedContinuationId] = useState<string | null>(null);
  const [continuationDate, setContinuationDate] = useState('');
  const [continuationNotes, setContinuationNotes] = useState('');

  const computedDeadlineItems = useMemo<DeadlineItem[]>(() => {
    if (!data) {
      return [];
    }

    return data.students
      .filter((student) => student.tuitionBalance > 0)
      .map((student, index) => {
        const dueDate = new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000);
        return {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          sex: student.sex,
          amount: student.tuitionBalance,
          dueDate: dueDate.toISOString(),
        };
      });
  }, [data]);

  useEffect(() => {
    setDeadlineItems(computedDeadlineItems);
  }, [computedDeadlineItems]);

  const normalizedDeadlines = useMemo(() => {
    return deadlineItems.map((item) => ({
      ...item,
      daysLeft: calculateDaysLeft(item.dueDate),
    }));
  }, [deadlineItems]);

  const filteredDeadlines = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return normalizedDeadlines
      .filter((item) => {
        if (term.length === 0) {
          return true;
        }

        return (
          item.fullName.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term) ||
          item.sex.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [normalizedDeadlines, searchTerm]);

  const totalDeadlines = normalizedDeadlines.length;
  const criticalDeadlines = normalizedDeadlines.filter((item) => item.daysLeft <= 3).length;
  const nextDue = filteredDeadlines[0]?.dueDate ?? null;

  const selectedContinuation = useMemo(() => {
    if (!selectedContinuationId) {
      return null;
    }

    return normalizedDeadlines.find((item) => item.id === selectedContinuationId) ?? null;
  }, [normalizedDeadlines, selectedContinuationId]);

  useEffect(() => {
    if (selectedContinuation) {
      setContinuationDate(selectedContinuation.dueDate.slice(0, 10));
      setContinuationNotes('');
    }
  }, [selectedContinuationId, selectedContinuation]);

  const handleDeleteDeadline = (id: string, studentName: string) => {
    const confirmed = window.confirm(`Remove ${studentName} from the deadline list?`);
    if (!confirmed) {
      return;
    }

    setDeadlineItems((previous) => previous.filter((item) => item.id !== id));
    if (selectedContinuationId === id) {
      setSelectedContinuationId(null);
      setContinuationDate('');
      setContinuationNotes('');
    }

    window.alert(`Sweet alert: Deadline for ${studentName} removed.`);
  };

  const handleOpenContinuationForm = (id: string) => {
    setSelectedContinuationId(id);
  };

  const handleCloseContinuationForm = () => {
    setSelectedContinuationId(null);
    setContinuationDate('');
    setContinuationNotes('');
  };

  const handleContinuationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedContinuationId || !continuationDate) {
      window.alert('Pick a new continuation date before saving.');
      return;
    }

    setDeadlineItems((previous) =>
      previous.map((item) =>
        item.id === selectedContinuationId
          ? { ...item, dueDate: new Date(continuationDate).toISOString() }
          : item,
      ),
    );

    const studentName = selectedContinuation?.fullName ?? 'student';
    window.alert(`Sweet alert: Continuation recorded for ${studentName}.`);
    handleCloseContinuationForm();
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <ModuleHeader title="Deadlines & Compliance" description="Track outstanding items that need intervention." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Deadlines</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{totalDeadlines}</p>
            </div>
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Critical</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{criticalDeadlines}</p>
            </div>
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Next Due</p>
              <p className="mt-2 text-sm font-medium text-slate-100">
                {nextDue ? formatDate(nextDue) : 'No upcoming deadlines'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by student name, email, or sex"
              aria-label="Search deadlines"
              className="w-full sm:max-w-sm"
            />
          </div>

          <div className="rounded-lg border border-slate-800/60 bg-slate-950/40">
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeadlines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-400">
                        No deadlines match your search. Try a different student or filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeadlines.map((item) => {
                      const urgency = getUrgencyMeta(item.daysLeft);

                      return (
                        <TableRow key={item.id} className={item.daysLeft <= 2 ? 'bg-rose-500/5' : undefined}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-100">{item.fullName}</span>
                              <span className="text-xs text-slate-500">{item.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-sm text-slate-300">{item.sex}</TableCell>
                          <TableCell>{formatDate(item.dueDate)}</TableCell>
                          <TableCell>
                            <span className={urgency.className}>{urgency.label}</span>
                            <p className="mt-1 text-xs text-slate-500">{item.daysLeft} days left</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenContinuationForm(item.id)}
                                aria-label={`Continue studies for ${item.fullName}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteDeadline(item.id, item.fullName)}
                                aria-label={`Delete deadline for ${item.fullName}`}
                              >
                                <Trash2 className="h-4 w-4 text-rose-300" />
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

      {selectedContinuation && (
        <Card className="border-brand/40 bg-slate-900/70">
          <form onSubmit={handleContinuationSubmit}>
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Continue studies for {selectedContinuation.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="continuation-date">
                    New due date
                  </label>
                  <Input
                    id="continuation-date"
                    type="date"
                    value={continuationDate}
                    onChange={(event) => setContinuationDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="continuation-notes">
                    Notes
                  </label>
                  <Textarea
                    id="continuation-notes"
                    value={continuationNotes}
                    onChange={(event) => setContinuationNotes(event.target.value)}
                    placeholder="Add context for the continuation decision."
                    className="h-24"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={handleCloseContinuationForm}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save continuation
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
};

export default StudentsDeadlinePage;





