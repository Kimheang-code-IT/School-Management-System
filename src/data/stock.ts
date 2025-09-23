import type { RecentActivityItem, StockCategory, StockProduct, StockSnapshot, StockTimelinePoint } from '@/types';

export const stockCategories: StockCategory[] = [
  { id: 'cat-001', name: 'Mathematics', description: 'Mathematics curriculum books' },
  { id: 'cat-002', name: 'Science', description: 'Laboratory resources and textbooks' },
  { id: 'cat-003', name: 'Literature', description: 'Novels and reading materials' },
  { id: 'cat-004', name: 'Stationery', description: 'Pens, pencils, and writing materials' },
];

export const stockProducts: StockProduct[] = [
  {
    id: 'prod-001',
    name: 'Algebra Essentials',
    categoryId: 'cat-001',
    quantity: 220,
    reorderPoint: 80,
    unitPrice: 22,
    updatedAt: '2024-09-01',
  },
  {
    id: 'prod-002',
    name: 'Chemistry Lab Kit',
    categoryId: 'cat-002',
    quantity: 54,
    reorderPoint: 30,
    unitPrice: 120,
    updatedAt: '2024-09-03',
  },
  {
    id: 'prod-003',
    name: 'World Literature Anthology',
    categoryId: 'cat-003',
    quantity: 140,
    reorderPoint: 60,
    unitPrice: 35,
    updatedAt: '2024-08-28',
  },
  {
    id: 'prod-004',
    name: 'Graphing Notebook',
    categoryId: 'cat-004',
    quantity: 480,
    reorderPoint: 200,
    unitPrice: 4,
    updatedAt: '2024-09-10',
  },
  {
    id: 'prod-005',
    name: 'Safety Goggles',
    categoryId: 'cat-002',
    quantity: 35,
    reorderPoint: 50,
    unitPrice: 18,
    updatedAt: '2024-08-14',
  },
];

export const stockSnapshot: StockSnapshot = {
  totalBooks: stockProducts.reduce((sum, product) => sum + product.quantity, 0),
  lowStock: stockProducts.filter((product) => product.quantity <= product.reorderPoint).length,
  categories: stockCategories.length,
};

export const stockTimeline: StockTimelinePoint[] = [
  { month: 'Jan', totalBooks: 1080 },
  { month: 'Feb', totalBooks: 1125 },
  { month: 'Mar', totalBooks: 1170 },
  { month: 'Apr', totalBooks: 1195 },
  { month: 'May', totalBooks: 1210 },
  { month: 'Jun', totalBooks: 1255 },
  { month: 'Jul', totalBooks: 1280 },
  { month: 'Aug', totalBooks: 1325 },
  { month: 'Sep', totalBooks: 1350 },
  { month: 'Oct', totalBooks: 1390 },
  { month: 'Nov', totalBooks: 1425 },
  { month: 'Dec', totalBooks: 1455 },
];

export const stockActivities: RecentActivityItem[] = [
  {
    id: 'activity-101',
    source: 'stock',
    message: "Product 'Safety Goggles' low in stock",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'activity-102',
    source: 'stock',
    message: "Inventory audit completed for 'Science' category",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];
