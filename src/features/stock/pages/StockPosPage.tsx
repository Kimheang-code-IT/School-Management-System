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

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: string;
};

const StockPosPage = () => {
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
  };

  return (
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
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
};

export default StockPosPage;