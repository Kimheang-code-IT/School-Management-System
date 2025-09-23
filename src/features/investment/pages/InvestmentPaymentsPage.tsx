import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useInvestmentQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvestmentPaymentsPage = () => {
  const { data, isLoading } = useInvestmentQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Investment Payments" description="Cash movements within the investment pool." />

      <Callout>
        Integration with your preferred ledger will reconcile these transactions automatically once APIs are connected.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((payment) => {
                  const member = data.members.find((item) => item.id === payment.memberId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{member?.fullName ?? 'Unknown'}</TableCell>
                      <TableCell>
                        <span className={payment.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}>
                          {payment.type}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.recordedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentPaymentsPage;
