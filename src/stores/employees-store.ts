import { create } from 'zustand';

import type { Employee, EmployeeAttendanceRecord, EmployeeSchedule } from '@/types';
import { attendance, employees, schedules } from '@/data/employees';

interface EmployeesState {
  employees: Employee[];
  attendance: EmployeeAttendanceRecord[];
  schedules: EmployeeSchedule[];
}

export const useEmployeesStore = create<EmployeesState>(() => ({
  employees,
  attendance,
  schedules,
}));
