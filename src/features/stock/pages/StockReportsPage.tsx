import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStockQuery } from '@/hooks';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const StockReportsPage = () => {
  const { data, isLoading } = useStockQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader title="Inventory Reports" description="Quick health report for campus stock." />

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <>
          <Card className="border-slate-800/80 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Items</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(data.snapshot.totalBooks)}</p>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Low Stock Items</p>
                <p className="mt-2 text-2xl font-semibold text-amber-300">{formatNumber(data.snapshot.lowStock)}</p>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Categories</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(data.snapshot.categories)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Top Valued Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Valuation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products
                    .map((product) => ({
                      ...product,
                      valuation: product.unitPrice * product.quantity,
                      categoryName: data.categories.find((cat) => cat.id === product.categoryId)?.name ?? '�',
                    }))
                    .sort((a, b) => b.valuation - a.valuation)
                    .slice(0, 5)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.categoryName}</TableCell>
                        <TableCell>{formatNumber(item.quantity)}</TableCell>
                        <TableCell>{formatCurrency(item.valuation)}</TableCell>
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

export default StockReportsPage;
