import { useQuery } from '@tanstack/react-query';

import { useStudentsStore } from '@/stores';

const fetchStudents = async () => {
  const state = useStudentsStore.getState();
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    students: state.students,
    classes: state.classes,
    payments: state.payments,
    summary: state.summary,
    timeline: state.timeline,
  };
};

export const useStudentsQuery = () =>
  useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });
