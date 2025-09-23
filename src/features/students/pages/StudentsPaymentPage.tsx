import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/formatters';

const paymentHistory = [
  { id: 'pay-201', student: 'Sophia Martinez', method: 'Credit Card', amount: 450, date: '2025-09-18', status: 'Cleared' },
  { id: 'pay-202', student: 'Noah Kim', method: 'Bank Transfer', amount: 300, date: '2025-09-16', status: 'Pending' },
  { id: 'pay-203', student: 'John Doe', method: 'Cash', amount: 120, date: '2025-09-14', status: 'Cleared' },
  { id: 'pay-204', student: 'Emma Williams', method: 'Credit Card', amount: 250, date: '2025-09-12', status: 'Cleared' },
];

const StudentsPaymentPage = () => {
  return (
    <div className="space-y-6">
      <ModuleHeader title="Student Payments" description="Monitor tuition inflows and reconciliation states." />

      <Callout>
        Finance workflows remain synchronized manually for now. Stripe / Paystack connectors will populate this ledger
        automatically in production deployments.
      </Callout>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.student}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    <span className={payment.status === 'Cleared' ? 'text-emerald-300' : 'text-amber-300'}>
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsPaymentPage;
