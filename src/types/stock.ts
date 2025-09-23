export interface StockCategory {
  id: string;
  name: string;
  description?: string;
}

export interface StockProduct {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number;
  updatedAt: string;
}

export interface StockSnapshot {
  totalBooks: number;
  lowStock: number;
  categories: number;
}

export interface StockTimelinePoint {
  month: string;
  totalBooks: number;
}
