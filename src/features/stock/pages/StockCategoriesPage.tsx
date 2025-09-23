import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStockQuery } from '@/hooks';

const StockCategoriesPage = () => {
  const { data, isLoading } = useStockQuery();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Stock Categories"
        description="Organize inventory families for better forecasting."
        actions={<Button variant="secondary">Add category</Button>}
      />

      <Callout>
        Category management currently runs client-side. Connect to your ERP or accounting stack to persist changes
        centrally.
      </Callout>

      {isLoading || !data ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Defined Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-slate-100">{category.name}</TableCell>
                    <TableCell>{category.description ?? '—'}</TableCell>
                    <TableCell>
                      {data.products.filter((product) => product.categoryId === category.id).length}
                    </TableCell>
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

export default StockCategoriesPage;
