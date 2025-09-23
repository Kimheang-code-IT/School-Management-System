import type { Employee, EmployeeAttendanceRecord, EmployeeSchedule, RecentActivityItem } from '@/types';

export const employees: Employee[] = [
  {
    id: 'emp-001',
    fullName: 'Maya Thompson',
    role: 'Principal',
    department: 'Administration',
    salary: 7800,
    status: 'active',
    hiredAt: '2016-08-01',
  },
  {
    id: 'emp-002',
    fullName: 'Carlos Mendes',
    role: 'Mathematics Teacher',
    department: 'Academics',
    salary: 4200,
    status: 'active',
    hiredAt: '2019-01-12',
  },
  {
    id: 'emp-003',
    fullName: 'Jasmine Lee',
    role: 'Science Teacher',
    department: 'Academics',
    salary: 4400,
    status: 'on_leave',
    hiredAt: '2018-05-19',
  },
  {
    id: 'emp-004',
    fullName: 'Ethan Walker',
    role: 'IT Support',
    department: 'Operations',
    salary: 3600,
    status: 'active',
    hiredAt: '2021-03-05',
  },
  {
    id: 'emp-005',
    fullName: 'Priya Singh',
    role: 'Finance Manager',
    department: 'Finance',
    salary: 5100,
    status: 'active',
    hiredAt: '2017-10-11',
  },
];

export const attendance: EmployeeAttendanceRecord[] = [
  { id: 'att-001', employeeId: 'emp-002', date: '2025-09-20', status: 'present' },
  { id: 'att-002', employeeId: 'emp-003', date: '2025-09-20', status: 'absent' },
  { id: 'att-003', employeeId: 'emp-004', date: '2025-09-20', status: 'remote' },
  { id: 'att-004', employeeId: 'emp-005', date: '2025-09-20', status: 'present' },
];

export const schedules: EmployeeSchedule[] = [
  { id: 'sch-001', employeeId: 'emp-002', day: 'Monday', shift: '08:00 - 15:00' },
  { id: 'sch-002', employeeId: 'emp-002', day: 'Wednesday', shift: '08:00 - 15:00' },
  { id: 'sch-003', employeeId: 'emp-003', day: 'Tuesday', shift: '09:00 - 16:00' },
  { id: 'sch-004', employeeId: 'emp-004', day: 'Thursday', shift: '10:00 - 17:00' },
  { id: 'sch-005', employeeId: 'emp-005', day: 'Monday', shift: '09:00 - 17:00' },
];

export const employeeActivities: RecentActivityItem[] = [
  {
    id: 'activity-201',
    source: 'employees',
    message: "'Jasmine Lee' requested leave approval",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    id: 'activity-202',
    source: 'employees',
    message: "Payroll processed for Finance department",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];
