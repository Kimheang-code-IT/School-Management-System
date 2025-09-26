import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStockQuery } from '@/hooks';
import type { StockCategory, StockProduct } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const TAX_RATE = 0.0825;

type PaymentMethod = 'cash' | 'card' | 'online';
type PosMode = 'new' | 'view' | 'edit';
type OrderMessage = { type: 'success' | 'error'; text: string } | null;

type MenuCategory = StockCategory & { count: number };

type CartItem = {
  product: StockProduct;
  quantity: number;
  lineTotal: number;
};

const paymentOptions: Array<{ id: PaymentMethod; label: string }> = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'online', label: 'Online' },
];

const modeOptions: Array<{ id: PosMode; label: string }> = [
  { id: 'new', label: 'New Order' },
  { id: 'view', label: 'View Order' },
  { id: 'edit', label: 'Edit Order' },
];

const buildMenuCategories = (categories: StockCategory[] | undefined, products: StockProduct[]): MenuCategory[] => {
  const countsByCategory = products.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.categoryId] = (accumulator[product.categoryId] ?? 0) + 1;
    return accumulator;
  }, {});

  const derived = (categories ?? []).map((category) => ({
    ...category,
    count: countsByCategory[category.id] ?? 0,
  }));

  const totalProducts = products.length;
  return [
    { id: 'all', name: 'All', description: 'Every product', count: totalProducts },
    ...derived,
  ].filter((entry) => entry.id === 'all' || entry.count > 0);
};

const buildSampleCart = (products: StockProduct[]): Record<string, number> => {
  if (!products.length) {
    return {};
  }

  const selections = products.slice(0, 3);
  return selections.reduce<Record<string, number>>((accumulator, product, index) => {
    const available = Math.max(product.quantity, 0);
    if (available === 0) {
      return accumulator;
    }

    const quantity = Math.min(index === 0 ? 2 : 1, available);
    if (quantity > 0) {
      accumulator[product.id] = quantity;
    }
    return accumulator;
  }, {});
};

const StockPosPage = () => {
  const { data, isLoading } = useStockQuery();

  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const categories = useMemo(() => buildMenuCategories(data?.categories, products), [data?.categories, products]);
  const sampleCart = useMemo(() => buildSampleCart(products), [products]);

  const [mode, setMode] = useState<PosMode>('new');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cartState, setCartState] = useState<Record<string, number>>({});
  const [discountPercent, setDiscountPercent] = useState<string>('0.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cardReference, setCardReference] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<OrderMessage>(null);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCardPayment = paymentMethod === 'card';

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products;
    }

    return products.filter((product) => product.categoryId === activeCategory);
  }, [activeCategory, products]);

  const cartItems = useMemo<CartItem[]>(() => {
    return Object.entries(cartState)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId);
        if (!product || quantity <= 0) {
          return null;
        }

        return {
          product,
          quantity,
          lineTotal: quantity * product.unitPrice,
        } satisfies CartItem;
      })
      .filter((entry): entry is CartItem => Boolean(entry));
  }, [cartState, products]);

  const subtotal = cartItems.reduce((accumulator, item) => accumulator + item.lineTotal, 0);
  const parsedDiscount = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
  const discountAmount = subtotal * (parsedDiscount / 100);
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = Math.max(subtotal + taxAmount - discountAmount, 0);
  const totalItems = cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);
  const isOrderEmpty = cartItems.length === 0;

  const resetOrder = useCallback(() => {
    setCartState({});
    setDiscountPercent('0.00');
    setPaymentMethod('cash');
    setCardReference('');
  }, []);

  useEffect(() => {
    setOrderMessage(null);
  }, [mode]);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!products.length) {
      resetOrder();
      return;
    }

    if (mode === 'new') {
      resetOrder();
      return;
    }

    setCartState(sampleCart);
    setDiscountPercent('0.00');
    setPaymentMethod('cash');
    setCardReference('');
  }, [mode, products.length, resetOrder, sampleCart]);

  useEffect(() => {
    if (!isCardPayment) {
      setCardReference('');
    }
  }, [isCardPayment]);

  const handleModeChange = (nextMode: PosMode) => {
    setMode(nextMode);
  };

  const handleAddToCart = (product: StockProduct) => {
    if (isViewMode) {
      return;
    }

    let nextMessage: OrderMessage | undefined;
    setCartState((previous) => {
      const current = previous[product.id] ?? 0;
      if (current >= product.quantity) {
        nextMessage = {
          type: 'error',
          text: `Only ${product.quantity} of ${product.name} available.`,
        };
        return previous;
      }

      nextMessage = null;
      return { ...previous, [product.id]: current + 1 };
    });

    if (nextMessage !== undefined) {
      setOrderMessage(nextMessage);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (isViewMode) {
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setCartState((previous) => {
      const next = { ...previous };

      if (!Number.isFinite(quantity) || quantity <= 0) {
        delete next[productId];
        return next;
      }

      const clamped = Math.min(quantity, product.quantity);
      if (clamped <= 0) {
        delete next[productId];
        return next;
      }

      next[productId] = clamped;
      return next;
    });
  };

  const handleStepQuantity = (productId: string, delta: number) => {
    if (isViewMode) {
      return;
    }

    const current = cartState[productId] ?? 0;
    handleUpdateQuantity(productId, current + delta);
  };

  const handleRemoveFromCart = (productId: string) => {
    if (isViewMode) {
      return;
    }

    setCartState((previous) => {
      const next = { ...previous };
      delete next[productId];
      return next;
    });
  };

  const handleDiscountChange = (value: string) => {
    if (isViewMode) {
      return;
    }

    const sanitized = value.replace(/[^0-9.]/g, '');
    setDiscountPercent(sanitized);
  };

  const handlePaymentSelection = (method: PaymentMethod) => {
    if (isViewMode) {
      return;
    }

    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    if (isViewMode) {
      return;
    }

    if (!cartItems.length) {
      setOrderMessage({ type: 'error', text: 'Add at least one item to the cart.' });
      return;
    }

    if (isCardPayment && !cardReference.trim()) {
      setOrderMessage({ type: 'error', text: 'Enter a card reference to continue.' });
      return;
    }

    setIsPlacingOrder(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setOrderMessage({
      type: 'success',
      text: mode === 'edit'
        ? 'Order updated successfully.'
        : `Order placed successfully (${totalItems} item${totalItems === 1 ? '' : 's'}).`,
    });
    resetOrder();
    setMode('new');
    setIsPlacingOrder(false);
  };

  const showBackLink = mode !== 'new';
  const orderButtonLabel = isEditMode ? 'Update Order' : 'Place Order';

  return (
    <div className="space-y-6">      

      <div className="flex flex-wrap gap-2">
        {modeOptions.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={mode === option.id ? 'primary' : 'outline'}
            onClick={() => handleModeChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {orderMessage && (
        <div
          className={cn(
            'rounded-md border px-3 py-2 text-sm',
            orderMessage.type === 'error'
              ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
              : 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200',
          )}
        >
          {orderMessage.text}
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
          <Card className="flex h-[520px] flex-col border-slate-800/80 bg-slate-900/70">
            <CardHeader className="border-b border-slate-800/70 py-3">
              <CardTitle className="text-base text-slate-200">Menu</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        'relative whitespace-nowrap rounded-full px-3 py-1 text-sm transition',
                        isActive
                          ? 'bg-brand/10 font-semibold text-brand-foreground'
                          : 'text-slate-400 hover:text-slate-200',
                      )}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                      <span className="ml-1 text-xs text-slate-500">({category.count})</span>
                      {isActive && <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded bg-brand" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="grid h-full gap-4 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full rounded-md border border-dashed border-slate-800/70 bg-slate-950/60 px-4 py-10 text-center text-sm text-slate-400">
                      No products available for this category yet.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const placeholderUrl = `https://via.placeholder.com/200x120/1e3a8a/ffffff?text=${encodeURIComponent(
                        product.name,
                      )}`;
                      const isDisabled = isViewMode || product.quantity === 0;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleAddToCart(product)}
                          className={cn(
                            'flex h-full flex-col overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/60 text-left transition',
                            isDisabled
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:-translate-y-0.5 hover:border-brand',
                          )}
                        >
                          <img src={placeholderUrl} alt={product.name} className="h-28 w-full object-cover" />
                          <div className="flex flex-1 flex-col gap-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-100">{product.name}</p>
                              <span className="text-sm font-semibold text-brand-foreground">
                                {formatCurrency(product.unitPrice)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{product.quantity} in stock</p>
                            {!isViewMode && (
                              <span className="mt-auto text-xs font-medium text-brand-foreground">Tap to add</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-[520px] flex-col border-slate-800/80 bg-slate-900/70">
            <CardHeader className="border-b border-slate-800/70 py-3">
              <div className="flex items-center gap-2">
                <button type="button" className="rounded-md bg-slate-800/80 px-3 py-1 text-sm font-semibold text-slate-200" disabled>
                  Order Item
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5 p-6 text-sm">
              {isOrderEmpty ? (
                <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-800/80 bg-slate-950/60 text-slate-500">
                  No items in cart
                </div>
              ) : (
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start justify-between gap-3 border-b border-slate-800/50 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{item.product.name}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(item.product.unitPrice)} each</p>
                      </div>
                      {isViewMode ? (
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                          <span>{item.quantity}</span>
                          <span>{formatCurrency(item.lineTotal)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-slate-200 hover:border-brand"
                            onClick={() => handleStepQuantity(item.product.id, -1)}
                            disabled={isViewMode || item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-slate-100">{item.quantity}</span>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-slate-200 hover:border-brand"
                            onClick={() => handleStepQuantity(item.product.id, 1)}
                            disabled={isViewMode || item.quantity >= item.product.quantity}
                          >
                            +
                          </button>
                          <span className="w-20 text-right font-semibold text-slate-100">
                            {formatCurrency(item.lineTotal)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs text-rose-300 hover:text-rose-200"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-md border border-slate-800/80 bg-slate-950/40 p-4 text-xs uppercase tracking-wide text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Sub Total</span>
                  <span className="text-sm text-slate-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax {(TAX_RATE * 100).toFixed(2)}%</span>
                  <span className="text-sm text-slate-200">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500">
                  <span>Discount (%)</span>
                  <Input
                    value={discountPercent}
                    onChange={(event) => handleDiscountChange(event.target.value)}
                    inputMode="decimal"
                    className="h-9 w-20 text-right"
                    disabled={isViewMode}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-sm font-semibold text-slate-100">
                  <span>Total Price</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wide text-slate-500">Payment Method</Label>
                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={paymentMethod === option.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePaymentSelection(option.id)}
                      disabled={isViewMode}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {isCardPayment && !isViewMode && (
                  <Input
                    value={cardReference}
                    onChange={(event) => setCardReference(event.target.value)}
                    placeholder="Enter card reference"
                    className="h-9"
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!isViewMode && (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  isLoading={isPlacingOrder}
                  disabled={isOrderEmpty}
                >
                  {orderButtonLabel}
                </Button>
              )}
              {!isViewMode && (
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={resetOrder} disabled={isOrderEmpty}>
                  Clear Cart
                </Button>
              )}
              {showBackLink && (
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setMode('new')}>
                  Back to Orders
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockPosPage;
