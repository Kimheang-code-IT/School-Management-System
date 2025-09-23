import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStockQuery } from '@/hooks';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

const StockProductsPage = () => {
  const { data, isLoading } = useStockQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Product Catalogue"
        description="Monitor stock levels and plan replenishment."
      />

      <Callout>
        Vendor lead-times and automated purchase orders will wire into this grid in a future release. Until then, rely on
        the low stock indicators below.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.map((product) => {
                  const category = data.categories.find((cat) => cat.id === product.categoryId);
                  const isLow = product.quantity <= product.reorderPoint;
                  return (
                    <TableRow key={product.id} className={isLow ? 'bg-amber-500/10' : undefined}>
                      <TableCell className="font-medium text-slate-100">{product.name}</TableCell>
                      <TableCell>{category?.name ?? '—'}</TableCell>
                      <TableCell>{formatNumber(product.quantity)}</TableCell>
                      <TableCell>{formatNumber(product.reorderPoint)}</TableCell>
                      <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>{formatDate(product.updatedAt)}</TableCell>
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

export default StockProductsPage;
