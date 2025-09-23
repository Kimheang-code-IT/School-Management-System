import { useMemo } from 'react';

import { useInvestmentQuery, useStockQuery, useStudentsQuery } from '@/hooks';
import type { MetricCardConfig } from '@/types';

export const useDashboardMetrics = () => {
  const studentsQuery = useStudentsQuery();
  const stockQuery = useStockQuery();
  const investmentQuery = useInvestmentQuery();

  const metrics = useMemo<MetricCardConfig[]>(() => {
    const totalBooks = stockQuery.data?.snapshot.totalBooks ?? 0;
    const totalStudents = studentsQuery.data?.summary.total ?? 0;
    const income = investmentQuery.data?.summary.income ?? 0;
    const outcome = investmentQuery.data?.summary.outcome ?? 0;

    return [
      {
        id: 'books',
        label: 'Total Books',
        value: totalBooks,
        icon: 'library',
        format: 'number',
      },
      {
        id: 'students',
        label: 'Total Students',
        value: totalStudents,
        icon: 'users',
        format: 'number',
      },
      {
        id: 'income',
        label: 'Income',
        value: income,
        delta: 12.5,
        icon: 'trending-up',
        format: 'currency',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        value: outcome,
        delta: -4.2,
        icon: 'trending-down',
        format: 'currency',
      },
    ];
  }, [investmentQuery.data?.summary, stockQuery.data?.snapshot, studentsQuery.data?.summary]);

  const isLoading = studentsQuery.isLoading || stockQuery.isLoading || investmentQuery.isLoading;
  const isError = Boolean(studentsQuery.error ?? stockQuery.error ?? investmentQuery.error);

  return {
    metrics,
    isLoading,
    isError,
    refetchAll: () => {
      studentsQuery.refetch();
      stockQuery.refetch();
      investmentQuery.refetch();
    },
  };
};
