import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useInvestmentQuery } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';

const InvestmentTablePage = () => {
  const { data, isLoading } = useInvestmentQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Investment Performance" description="Month-over-month profitability." />

      <Callout>
        Scenario modelling and risk banding will arrive alongside backend analytics. Current view is a read-only mock
        dataset.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Card className="border-slate-800/80 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Profit Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline}>
                  <defs>
                    <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgb(30 41 59)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#34d399" fill="url(#investmentGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.timeline.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell>{formatCurrency(month.income)}</TableCell>
                      <TableCell>{formatCurrency(month.outcome)}</TableCell>
                      <TableCell>{formatCurrency(month.profit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InvestmentTablePage;
