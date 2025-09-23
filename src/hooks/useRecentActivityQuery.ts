import { useQuery } from '@tanstack/react-query';

import { recentActivities } from '@/data/activity';

const fetchActivity = async () => {
  await new Promise((resolve) => setTimeout(resolve, 160));
  return recentActivities;
};

export const useRecentActivityQuery = () =>
  useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchActivity,
  });
