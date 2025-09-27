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

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: string;
};

const StockPosPage = () => {
<<<<<<< HEAD
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
=======
  const { data } = useStockQuery();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    categories.forEach(category => {
      counts[category.name] = products.filter(p => p.categoryId === category.id).length;
    });
    return counts;
  }, [products, categories]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    const category = categories.find(c => c.name === activeCategory);
    return category ? products.filter(p => p.categoryId === category.id) : [];
  }, [products, categories, activeCategory]);

  // Cart calculations
  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + tax - discountAmount;
    
    return { subtotal, tax, discountAmount, total };
  }, [cart, discount]);

  // Add to cart function
  const addToCart = (product: any) => {
    const categoryName = categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized';
    
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.unitPrice,
        quantity: 1,
        imageUrl: product.imageUrl,
        category: categoryName
      }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  // Process order
  const processOrder = async (paymentMethod: string) => {
    if (cart.length === 0) {
      alert('Please add items to cart before processing order');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset cart and show success
    setCart([]);
    setDiscount(0);
    alert(`Order processed successfully via ${paymentMethod}! Total: ${formatCurrency(cartSummary.total)}`);
>>>>>>> a3c25d8
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
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-slate-900 p-6">
      <ModuleHeader
        title="Point of Sale"
        description="Complete checkout system for onsite sales"
      />

      <Callout>
        Integrated payment system with real-time inventory tracking. Receipt generation and tax calculation included.
      </Callout>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Products */}
        <div className="lg:col-span-2">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-200">Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Category Tabs */}
              <div className="border-b border-slate-700">
                <div className="flex flex-wrap gap-1 px-4 pb-2">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized';
                  const stock = product.total_stock ?? product.quantity ?? 0;
                  
                  return (
                    <div
                      key={product.id}
                      className="bg-slate-800/30 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          {category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          stock > 10 ? 'text-emerald-400 bg-emerald-900/20' : 
                          stock > 0 ? 'text-amber-400 bg-amber-900/20' : 
                          'text-rose-400 bg-rose-900/20'
                        }`}>
                          {stock} in stock
                        </span>
                      </div>
                      
                      <div className="flex justify-center mb-3">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-20 w-20 flex items-center justify-center bg-slate-700/50 rounded-lg">
                            <span className="text-2xl text-slate-400">📦</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-slate-100 text-center mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-slate-400 text-xs text-center mb-3 line-clamp-2">
                        {product.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-400">
                          {formatCurrency(product.unitPrice)}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          disabled={stock === 0}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          {/* Cart Summary */}
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-200">
                Cart {cart.length > 0 && `(${cart.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">🛒</div>
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-4 border-b border-slate-700">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-slate-700/50 rounded-md">
                          <span className="text-lg">📦</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-100 truncate">{item.name}</h4>
                        <p className="text-sm text-slate-400">{formatCurrency(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-slate-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        🗑️
                      </button>
>>>>>>> a3c25d8
                    </div>
                  ))}
                </div>
              )}
<<<<<<< HEAD

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
=======
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-200">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Sub Total:</span>
                <span>{formatCurrency(cartSummary.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-slate-300">
                <span>Tax (10%):</span>
                <span>{formatCurrency(cartSummary.tax)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Discount (%):</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-slate-300">-{formatCurrency(cartSummary.discountAmount)}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-3">
                <div className="flex justify-between text-lg font-bold text-slate-100">
                  <span>Total Price:</span>
                  <span>{formatCurrency(cartSummary.total)}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button 
                  onClick={() => processOrder('Cash')}
                  disabled={cart.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600"
                >
                  Cash
                </Button>
                <Button 
                  onClick={() => processOrder('Card')}
                  disabled={cart.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600"
                >
                  Card
                </Button>
                <Button 
                  onClick={() => processOrder('Online')}
                  disabled={cart.length === 0}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600"
                >
                  Online
                </Button>
              </div>
              
              <Button 
                onClick={() => processOrder('Order')}
                disabled={cart.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600"
                size="lg"
              >
                Complete Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
>>>>>>> a3c25d8
    </div>
  );
};

export default StockPosPage;