import { TransactionStats } from "@/types/finance";

export const DEFAULT_TRANSACTION_STATS: TransactionStats = {
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  income: 0,
  expenses: 0,
  averageAmount: 0,
  byCategory: {},
  byPeriod: {
    today: {
      total: 0,
      income: 0,
      expenses: 0,
      averageAmount: 0,
      byCategory: {},
    },
    thisMonth: {
      total: 0,
      income: 0,
      expenses: 0,
      averageAmount: 0,
      byCategory: {},
    },
    thisYear: {
      total: 0,
      income: 0,
      expenses: 0,
      averageAmount: 0,
      byCategory: {},
    },
  },
  trends: {
    dailyVolume: {},
    monthlyVolume: {},
    peakDays: [],
    categoryTrends: {},
  },
};
