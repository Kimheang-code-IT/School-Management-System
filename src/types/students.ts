export type StudentStatus = 'active' | 'inactive' | 'graduated';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  classLevel: string;
  status: StudentStatus;
  tuitionBalance: number;
  booksBorrowed: number;
  registeredAt: string;
}

export interface StudentSummary {
  total: number;
  active: number;
  graduated: number;
  overdue: number;
}

export interface StudentTimelinePoint {
  month: string;
  total: number;
}
