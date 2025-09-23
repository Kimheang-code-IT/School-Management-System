import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useInvestmentQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvestmentMembersPage = () => {
  const { data, isLoading } = useInvestmentQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Investment Members" description="Community investors contributing to the fund." />

      <Callout>
        Member onboarding workflows will connect to KYC/AML services. The current roster is static mock data for layout
        validation.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Member List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.fullName}</TableCell>
                    <TableCell>{formatDate(member.joinedAt)}</TableCell>
                    <TableCell>
                      <span className={member.active ? 'text-emerald-300' : 'text-slate-500'}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(member.totalContribution)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentMembersPage;
