export interface InvestmentMember {
  id: string;
  fullName: string;
  joinedAt: string;
  totalContribution: number;
  active: boolean;
}

export interface InvestmentPayment {
  id: string;
  memberId: string;
  amount: number;
  type: 'income' | 'outcome';
  recordedAt: string;
}

export interface InvestmentSummary {
  income: number;
  outcome: number;
  profit: number;
}

export interface InvestmentTimelinePoint {
  month: string;
  income: number;
  outcome: number;
  profit: number;
}
