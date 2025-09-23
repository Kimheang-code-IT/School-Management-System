export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: string;
  salary: number;
  status: EmployeeStatus;
  hiredAt: string;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  day: string;
  shift: string;
}

export interface EmployeeAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'remote';
}
