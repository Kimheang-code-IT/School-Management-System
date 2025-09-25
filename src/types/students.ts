export type StudentStatus = 'active' | 'inactive' | 'graduated';
export type StudentSex = 'male' | 'female' | 'other';
export type StudentSession = 'morning' | 'afternoon' | 'evening';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  sex: StudentSex;
  session: StudentSession;
  location: string;
  socialHandle?: string;
  classLevel: string;
  status: StudentStatus;
  tuitionBalance: number;
  booksBorrowed: number;
  registeredAt: string;
}

export type StudentPaymentStatus = 'cleared' | 'pending' | 'failed';

export interface StudentPayment {
  id: string;
  studentId: string;
  method: string;
  amount: number;
  status: StudentPaymentStatus;
  recordedAt: string;
}

export type StudentClassStatus = 'active' | 'upcoming' | 'completed';

export interface StudentClass {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  studentIds: string[];
  status: StudentClassStatus;
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
