import { create } from 'zustand';

import type { Student, StudentClass, StudentPayment, StudentSummary, StudentTimelinePoint } from '@/types';
import { studentClasses, studentPayments, studentSummary, studentTimeline, students } from '@/data/students';

interface StudentsState {
  students: Student[];
  classes: StudentClass[];
  payments: StudentPayment[];
  summary: StudentSummary;
  timeline: StudentTimelinePoint[];
}

export const useStudentsStore = create<StudentsState>(() => ({
  students,
  classes: studentClasses,
  payments: studentPayments,
  summary: studentSummary,
  timeline: studentTimeline,
}));
