import { create } from 'zustand';

import type { StockCategory, StockProduct, StockSnapshot, StockTimelinePoint } from '@/types';
import { stockCategories, stockProducts, stockSnapshot, stockTimeline } from '@/data/stock';

interface StockState {
  categories: StockCategory[];
  products: StockProduct[];
  snapshot: StockSnapshot;
  timeline: StockTimelinePoint[];
}

export const useStockStore = create<StockState>(() => ({
  categories: stockCategories,
  products: stockProducts,
  snapshot: stockSnapshot,
  timeline: stockTimeline,
}));
