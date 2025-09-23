import type {
  InvestmentMember,
  InvestmentPayment,
  InvestmentSummary,
  InvestmentTimelinePoint,
  RecentActivityItem,
} from '@/types';

export const investmentMembers: InvestmentMember[] = [
  { id: 'mem-001', fullName: 'Lisa Ray', joinedAt: '2022-03-01', totalContribution: 12500, active: true },
  { id: 'mem-002', fullName: 'Daniel Green', joinedAt: '2021-07-15', totalContribution: 9800, active: true },
  { id: 'mem-003', fullName: 'Fatima Noor', joinedAt: '2023-05-10', totalContribution: 6800, active: true },
  { id: 'mem-004', fullName: 'Robert Miles', joinedAt: '2020-11-22', totalContribution: 15400, active: false },
];

export const investmentPayments: InvestmentPayment[] = [
  { id: 'pay-001', memberId: 'mem-001', amount: 3200, type: 'income', recordedAt: '2025-09-01' },
  { id: 'pay-002', memberId: 'mem-002', amount: 1800, type: 'income', recordedAt: '2025-09-03' },
  { id: 'pay-003', memberId: 'mem-003', amount: 950, type: 'income', recordedAt: '2025-09-05' },
  { id: 'pay-004', memberId: 'mem-004', amount: 2100, type: 'outcome', recordedAt: '2025-09-08' },
];

export const investmentSummary: InvestmentSummary = {
  income: investmentPayments.filter((payment) => payment.type === 'income').reduce((sum, payment) => sum + payment.amount, 0),
  outcome: investmentPayments.filter((payment) => payment.type === 'outcome').reduce((sum, payment) => sum + payment.amount, 0),
  profit: investmentPayments.reduce((sum, payment) => sum + (payment.type === 'income' ? payment.amount : -payment.amount), 0),
};

export const investmentTimeline: InvestmentTimelinePoint[] = [
  { month: 'Jan', income: 5200, outcome: 2100, profit: 3100 },
  { month: 'Feb', income: 4600, outcome: 1800, profit: 2800 },
  { month: 'Mar', income: 5800, outcome: 2200, profit: 3600 },
  { month: 'Apr', income: 6100, outcome: 1900, profit: 4200 },
  { month: 'May', income: 6400, outcome: 2400, profit: 4000 },
  { month: 'Jun', income: 5900, outcome: 2100, profit: 3800 },
  { month: 'Jul', income: 6300, outcome: 2500, profit: 3800 },
  { month: 'Aug', income: 6700, outcome: 2700, profit: 4000 },
  { month: 'Sep', income: 7100, outcome: 2600, profit: 4500 },
  { month: 'Oct', income: 6800, outcome: 2400, profit: 4400 },
  { month: 'Nov', income: 6500, outcome: 2300, profit: 4200 },
  { month: 'Dec', income: 7200, outcome: 2800, profit: 4400 },
];

export const investmentActivities: RecentActivityItem[] = [
  {
    id: 'activity-301',
    source: 'investment',
    message: 'Investment return of ,500 recorded for September',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'activity-302',
    source: 'investment',
    message: "New investment member 'Fatima Noor' added",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
