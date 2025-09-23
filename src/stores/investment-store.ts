import { create } from 'zustand';

import type { InvestmentMember, InvestmentPayment, InvestmentSummary, InvestmentTimelinePoint } from '@/types';
import { investmentMembers, investmentPayments, investmentSummary, investmentTimeline } from '@/data/investment';

interface InvestmentState {
  members: InvestmentMember[];
  payments: InvestmentPayment[];
  summary: InvestmentSummary;
  timeline: InvestmentTimelinePoint[];
}

export const useInvestmentStore = create<InvestmentState>(() => ({
  members: investmentMembers,
  payments: investmentPayments,
  summary: investmentSummary,
  timeline: investmentTimeline,
}));
