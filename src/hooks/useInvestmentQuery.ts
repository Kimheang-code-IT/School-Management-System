import { useQuery } from '@tanstack/react-query';

import { useInvestmentStore } from '@/stores';

const fetchInvestment = async () => {
  const state = useInvestmentStore.getState();
  await new Promise((resolve) => setTimeout(resolve, 190));
  return {
    members: state.members,
    payments: state.payments,
    summary: state.summary,
    timeline: state.timeline,
  };
};

export const useInvestmentQuery = () =>
  useQuery({
    queryKey: ['investment'],
    queryFn: fetchInvestment,
  });
