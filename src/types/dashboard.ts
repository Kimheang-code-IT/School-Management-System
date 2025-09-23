export interface MetricCardConfig {
  id: string;
  label: string;
  value: number;
  delta?: number;
  icon: string;
  format?: 'currency' | 'number';
}

export interface RecentActivityItem {
  id: string;
  source: 'students' | 'stock' | 'employees' | 'investment';
  message: string;
  timestamp: string;
}
