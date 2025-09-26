import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useStockStore } from '@/stores';

const STOCK_QUERY_KEY = ['stock'] as const;

const buildStockPayload = () => {
  const state = useStockStore.getState();
  return {
    categories: state.categories,
    products: state.products,
    snapshot: state.snapshot,
    timeline: state.timeline,
  };
};

const fetchStock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return buildStockPayload();
};

export const useStockQuery = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncQueryCache = () => {
      queryClient.setQueryData(STOCK_QUERY_KEY, buildStockPayload());
    };

    syncQueryCache();

    const unsubscribe = useStockStore.subscribe(() => {
      syncQueryCache();
    });

    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: STOCK_QUERY_KEY,
    queryFn: fetchStock,
  });
};
