import { useQuery } from '@tanstack/react-query';

import { useEmployeesStore } from '@/stores';

const fetchEmployees = async () => {
  const state = useEmployeesStore.getState();
  await new Promise((resolve) => setTimeout(resolve, 180));
  return {
    employees: state.employees,
    attendance: state.attendance,
    schedules: state.schedules,
  };
};

export const useEmployeesQuery = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });
