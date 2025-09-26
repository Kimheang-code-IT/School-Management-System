import { useMemo, useState } from 'react';
import { FileSpreadsheet, PencilLine, PlusCircle } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  purpose: 'Tuition' | 'Books' | 'Upgrade';
  method: 'Credit Card' | 'Bank Transfer' | 'Cash';
  amount: number;
  date: string;
  status: 'Cleared' | 'Pending' | 'Failed';
}

const seedPayments: PaymentRecord[] = [
  {
    id: 'pay-301',
    studentId: 'stu-001',
    studentName: 'John Doe',
    studentEmail: 'john.doe@school.io',
    studentPhone: '555-0101',
    purpose: 'Tuition',
    method: 'Credit Card',
    amount: 480,
    date: '2025-09-18',
    status: 'Cleared',
  },
  {
    id: 'pay-302',
    studentId: 'stu-005',
    studentName: 'Noah Kim',
    studentEmail: 'noah.kim@school.io',
    studentPhone: '555-0105',
    purpose: 'Upgrade',
    method: 'Bank Transfer',
    amount: 300,
    date: '2025-09-16',
    status: 'Pending',
  },
  {
    id: 'pay-303',
    studentId: 'stu-006',
    studentName: 'Emma Williams',
    studentEmail: 'emma.williams@school.io',
    studentPhone: '555-0106',
    purpose: 'Books',
    method: 'Cash',
    amount: 120,
    date: '2025-09-14',
    status: 'Cleared',
  },
  {
    id: 'pay-304',
    studentId: 'stu-004',
    studentName: 'Sophia Martinez',
    studentEmail: 'sophia.martinez@school.io',
    studentPhone: '555-0104',
    purpose: 'Tuition',
    method: 'Credit Card',
    amount: 450,
    date: '2025-09-12',
    status: 'Cleared',
  },
];

const StudentsPaymentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentRecord['method']>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const payments = useMemo(() => seedPayments, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        payment.studentName.toLowerCase().includes(term) ||
        payment.studentEmail.toLowerCase().includes(term) ||
        payment.studentPhone.toLowerCase().includes(term) ||
        payment.purpose.toLowerCase().includes(term);

      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      const matchesStart = !startDateFilter || payment.date >= startDateFilter;
      const matchesEnd = !endDateFilter || payment.date <= endDateFilter;

      return matchesSearch && matchesMethod && matchesStart && matchesEnd;
    });
  }, [payments, searchTerm, methodFilter, startDateFilter, endDateFilter]);

  const totalCollected = filteredPayments
    .filter((payment) => payment.status === 'Cleared')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = filteredPayments
    .filter((payment) => payment.status === 'Pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleAddPayment = () => {
    window.alert('Sweet alert: Payment capture flow coming soon.');
  };

  const handleUpdatePayment = (paymentId: string) => {
    window.alert(`Sweet alert: Update flow for ${paymentId} is coming soon.`);
  };

  const handleGenerateInvoice = (payment: PaymentRecord) => {
    const invoiceNumber = `INV-${payment.id.toUpperCase()}`;
    const invoiceSummary = `Invoice ${invoiceNumber}\n\nStudent: ${payment.studentName}\nEmail: ${payment.studentEmail}\nPhone: ${payment.studentPhone}\nPurpose: ${payment.purpose}\nMethod: ${payment.method}\nDate: ${formatDate(payment.date)}\nAmount: ${formatCurrency(payment.amount)}\nStatus: ${payment.status}`;
    window.alert(`Invoice generated:\n\n${invoiceSummary}`);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader title="Student Payments" description="Monitor tuition inflows and reconciliation states." />

      <Callout>
        Finance workflows remain synchronized manually for now. Stripe / Paystack connectors will populate this ledger
        automatically in production deployments.
      </Callout>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base text-slate-200">Recent Payments</CardTitle>
            <p className="text-sm text-slate-400">
              View cleared and pending receipts, filter by method, and trigger invoices.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddPayment} className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add payment
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Filtered payments</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{filteredPayments.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Cleared total</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pending balance</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-4">
            <div className="flex min-w-[260px] flex-1 items-center gap-2">
              <Label htmlFor="payments-search" className="shrink-0 text-xs font-medium text-slate-300">
                Search
              </Label>
              <Input
                id="payments-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by student, email, purpose, or phone"
                aria-label="Search payments"
                className="flex-1"
              />
            </div>
            <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
              <Label htmlFor="method-filter" className="shrink-0 text-xs font-medium text-slate-300">
                Method
              </Label>
              <select
                id="method-filter"
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value as typeof methodFilter)}
                className="h-10 flex-1 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">All methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
              <Label htmlFor="start-date" className="shrink-0 text-xs font-medium text-slate-300">
                Start date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDateFilter}
                max={endDateFilter || undefined}
                onChange={(event) => setStartDateFilter(event.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex min-w-[200px] items-center gap-2 lg:w-[220px]">
              <Label htmlFor="end-date" className="shrink-0 text-xs font-medium text-slate-300">
                End date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDateFilter}
                min={startDateFilter || undefined}
                onChange={(event) => setEndDateFilter(event.target.value)}
                className="flex-1"
              />
            </div>

          </div>
          <div className="rounded-lg border border-slate-800/60 bg-slate-950/40">
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-400">
                        No payments match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-100">{payment.studentName}</span>
                            <span className="text-xs text-slate-500">{payment.studentEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300">{payment.studentPhone}</TableCell>
                        <TableCell className="text-sm text-slate-300">{payment.purpose}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <span className={
                            payment.status === 'Cleared'
                              ? 'text-emerald-300'
                              : payment.status === 'Pending'
                              ? 'text-amber-300'
                              : 'text-rose-300'
                          }>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdatePayment(payment.id)}
                              aria-label={`Update payment ${payment.id}`}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleGenerateInvoice(payment)}
                              aria-label={`Generate invoice for ${payment.studentName}`}
                            >
                              <FileSpreadsheet className="h-4 w-4 text-sky-300" />
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
    </div>
  );
};

export default StudentsPaymentPage;
