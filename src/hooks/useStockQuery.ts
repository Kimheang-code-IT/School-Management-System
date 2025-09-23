import { useQuery } from '@tanstack/react-query';

import { useStockStore } from '@/stores';

const fetchStock = async () => {
  const state = useStockStore.getState();
  await new Promise((resolve) => setTimeout(resolve, 220));
  return {
    categories: state.categories,
    products: state.products,
    snapshot: state.snapshot,
    timeline: state.timeline,
  };
};

export const useStockQuery = () =>
  useQuery({
    queryKey: ['stock'],
    queryFn: fetchStock,
  });
