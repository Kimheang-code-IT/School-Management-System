import { useState, useMemo } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useStockQuery } from '@/hooks';
import { formatCurrency, formatNumber } from '@/utils/formatters';

// Mock sales data structure
type SaleRecord = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  saleDate: string;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  status: 'Completed' | 'Refunded' | 'Pending';
};

const StockReportsPage = () => {
  const { data, isLoading } = useStockQuery();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'products' | 'categories'>('summary');

  // Mock sales data - in real app, this would come from API
  const salesData: SaleRecord[] = useMemo(() => [
    {
      id: '1',
      productId: '101',
      productName: 'Textbook - Mathematics',
      category: 'Books',
      quantity: 2,
      unitPrice: 45.00,
      totalAmount: 90.00,
      customerName: 'John Smith',
      saleDate: '2024-01-15T10:30:00',
      paymentMethod: 'Card',
      status: 'Completed'
    },
    {
      id: '2',
      productId: '102',
      productName: 'Laptop',
      category: 'Electronics',
      quantity: 1,
      unitPrice: 899.99,
      totalAmount: 899.99,
      customerName: 'Sarah Johnson',
      saleDate: '2024-01-15T14:20:00',
      paymentMethod: 'Online',
      status: 'Completed'
    },
    {
      id: '3',
      productId: '103',
      productName: 'College Hoodie',
      category: 'Clothing',
      quantity: 3,
      unitPrice: 35.00,
      totalAmount: 105.00,
      customerName: 'Mike Davis',
      saleDate: '2024-01-14T11:15:00',
      paymentMethod: 'Cash',
      status: 'Completed'
    },
    {
      id: '4',
      productId: '104',
      productName: 'Scientific Calculator',
      category: 'Electronics',
      quantity: 1,
      unitPrice: 25.50,
      totalAmount: 25.50,
      customerName: 'Emily Wilson',
      saleDate: '2024-01-14T16:45:00',
      paymentMethod: 'Card',
      status: 'Completed'
    },
    {
      id: '5',
      productId: '105',
      productName: 'Notebook Set',
      category: 'Stationery',
      quantity: 5,
      unitPrice: 8.00,
      totalAmount: 40.00,
      customerName: 'David Brown',
      saleDate: '2024-01-13T09:30:00',
      paymentMethod: 'Cash',
      status: 'Completed'
    },
    {
      id: '6',
      productId: '101',
      productName: 'Textbook - Mathematics',
      category: 'Books',
      quantity: 1,
      unitPrice: 45.00,
      totalAmount: 45.00,
      customerName: 'Lisa Taylor',
      saleDate: '2024-01-13T15:20:00',
      paymentMethod: 'Online',
      status: 'Refunded'
    }
  ], []);

  // Calculate report metrics
  const reportMetrics = useMemo(() => {
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const now = new Date();
      const diffTime = now.getTime() - saleDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      switch (dateRange) {
        case 'today': return diffDays <= 1;
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    });

    const completedSales = filteredSales.filter(sale => sale.status === 'Completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSales = completedSales.length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Top selling products
    const productSales = completedSales.reduce((acc, sale) => {
      acc[sale.productName] = (acc[sale.productName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(5);

    // Revenue by category
    const categoryRevenue = completedSales.reduce((acc, sale) => {
      acc[sale.category] = (acc[sale.category] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    // Payment method distribution
    const paymentMethods = completedSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalSales,
      averageSale,
      topProducts,
      categoryRevenue,
      paymentMethods,
      filteredSales,
      refunds: filteredSales.filter(sale => sale.status === 'Refunded').length
    };
  }, [salesData, dateRange]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'Category', 'Quantity', 'Unit Price', 'Total Amount', 'Customer', 'Payment Method', 'Status'];
    const csvData = reportMetrics.filteredSales.map(sale => [
      new Date(sale.saleDate).toLocaleDateString(),
      sale.productName,
      sale.category,
      sale.quantity,
      formatCurrency(sale.unitPrice),
      formatCurrency(sale.totalAmount),
      sale.customerName,
      sale.paymentMethod,
      sale.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Inventory Reports" description="Quick health report for campus stock." />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Sales & Inventory Reports" 
        description="Comprehensive sales analytics and inventory health report."
        actions={
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        }
      />

<<<<<<< HEAD
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
=======
      <Callout>
        Complete sales analytics with revenue tracking, product performance, and category insights. Export functionality available for all reports.
      </Callout>

      {/* Date Range Filter */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'all'] as const).map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "outline"}
                  onClick={() => setDateRange(range)}
                  className="capitalize"
                >
                  {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {(['summary', 'sales', 'products', 'categories'] as const).map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  className="capitalize"
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">
                    {formatCurrency(reportMetrics.totalRevenue)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{reportMetrics.totalSales} sales</p>
                </div>
                <div className="text-2xl">💰</div>
>>>>>>> a3c25d8
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
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
=======
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Average Sale</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">
                    {formatCurrency(reportMetrics.averageSale)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">per transaction</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
>>>>>>> a3c25d8
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Items</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">
                    {formatNumber(data.snapshot.totalBooks)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">in inventory</p>
                </div>
                <div className="text-2xl">📦</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {formatNumber(data.snapshot.lowStock)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">items need restock</p>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Transactions */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportMetrics.filteredSales.slice(0, 5).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-sm">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-100">{sale.productName}</div>
                        <div className="text-xs text-slate-400">{sale.customerName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell className="font-medium text-slate-100">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'Completed' 
                          ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50'
                          : sale.status === 'Refunded'
                          ? 'bg-rose-900/50 text-rose-400 border border-rose-800/50'
                          : 'bg-amber-900/50 text-amber-400 border border-amber-800/50'
                      }`}>
                        {sale.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportMetrics.topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-slate-100">{product.name}</TableCell>
                    <TableCell>{formatNumber(product.quantity)}</TableCell>
                    <TableCell className="text-emerald-400">
                      {formatCurrency(product.quantity * (salesData.find(s => s.productName === product.name)?.unitPrice || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportMetrics.categoryRevenue)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, revenue]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium text-slate-100">{category}</TableCell>
                      <TableCell>{formatCurrency(revenue)}</TableCell>
                      <TableCell>
                        {((revenue / reportMetrics.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportMetrics.paymentMethods)
                  .sort(([,a], [,b]) => b - a)
                  .map(([method, revenue]) => (
                    <TableRow key={method}>
                      <TableCell className="font-medium text-slate-100">{method}</TableCell>
                      <TableCell>{formatCurrency(revenue)}</TableCell>
                      <TableCell>
                        {((revenue / reportMetrics.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Valuation */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Top Valued Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Valuation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products
                .map((product) => ({
                  ...product,
                  valuation: product.unitPrice * (product.total_stock || product.quantity || 0),
                  categoryName: data.categories.find((cat) => cat.id === product.categoryId)?.name ?? 'Unknown',
                }))
                .sort((a, b) => b.valuation - a.valuation)
                .slice(0, 8)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-100">{item.name}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{formatNumber(item.total_stock || item.quantity || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium text-emerald-400">
                      {formatCurrency(item.valuation)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReportsPage;