import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useStockQuery } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';

const posSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  customerName: z.string().min(2, 'Customer name required'),
});

type PosFormValues = z.infer<typeof posSchema>;

const StockPosPage = () => {
  const { data } = useStockQuery();
  const [lastSale, setLastSale] = useState<{ product: string; quantity: number; total: number } | null>(null);

  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const defaultProductId = products.at(0)?.id ?? '';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: { productId: defaultProductId, quantity: 1, customerName: '' },
  });

  const selectedProductId = watch('productId') || defaultProductId;
  const quantityValue = watch('quantity');

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  const onSubmit = async (values: PosFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const product = products.find((item) => item.id === values.productId);
    if (!product) return;
    const total = values.quantity * product.unitPrice;
    setLastSale({ product: product.name, quantity: values.quantity, total });
    reset({ productId: defaultProductId, quantity: 1, customerName: '' });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Point of Sale"
        description="Draft checkout flow for onsite textbook or merchandise sales."
      />

      <Callout>
        Hook this module into your payment provider to accept real transactions. Taxation and receipt templates are queued
        for upcoming sprints.
      </Callout>

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Draft Sale</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productId">Product</Label>
              <select
                id="productId"
                className="h-10 w-full rounded-md border border-slate-800/60 bg-slate-900/60 px-3 text-sm text-slate-100 focus-visible:border-brand focus-visible:outline-none"
                {...register('productId')}
              >
                <option value="" disabled>
                  Select a product
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-sm text-rose-400">{errors.productId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && <p className="text-sm text-rose-400">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" placeholder="Walk-in customer" {...register('customerName')} />
              {errors.customerName && <p className="text-sm text-rose-400">{errors.customerName.message}</p>}
            </div>
            {selectedProduct && (
              <div className="md:col-span-2 rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-wide text-slate-500">Summary</p>
                <p className="mt-2 text-slate-100">
                  {quantityValue || 0} × {selectedProduct.name} ={' '}
                  <span className="font-semibold text-brand-foreground">
                    {formatCurrency((quantityValue || 0) * selectedProduct.unitPrice)}
                  </span>
                </p>
                <p className="text-xs text-slate-500">Current stock: {selectedProduct.quantity}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting} disabled={!products.length}>
              Record sale
            </Button>
          </CardFooter>
        </form>
      </Card>

      {lastSale && (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Last Draft Sale</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            <p>
              {lastSale.quantity} × {lastSale.product} · {formatCurrency(lastSale.total)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockPosPage;
