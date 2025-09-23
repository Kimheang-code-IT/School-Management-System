import { create } from 'zustand';

import type { Student, StudentSummary, StudentTimelinePoint } from '@/types';
import { studentSummary, studentTimeline, students } from '@/data/students';

interface StudentsState {
  students: Student[];
  summary: StudentSummary;
  timeline: StudentTimelinePoint[];
}

export const useStudentsStore = create<StudentsState>(() => ({
  students,
  summary: studentSummary,
  timeline: studentTimeline,
}));
