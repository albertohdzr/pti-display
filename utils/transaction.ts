// utils/transactions.ts
import { Timestamp } from "firebase-admin/firestore";

import { admindb } from "@/lib/firebaseAdmin";
import {
  CategoryStats,
  TransactionPeriodStats,
  TransactionStats,
} from "@/types/finance";
import { NotificationService } from "@/services/notifications";
import { NotificationPriority, NotificationType } from "@/types/notifications";

export interface StatsUpdateResult {
  metrics: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    income: number;
    expenses: number;
    averageAmount: number;
    byCategory: Record<string, CategoryStats>;
    byPeriod: {
      today: TransactionPeriodStats;
      thisMonth: TransactionPeriodStats;
      thisYear: TransactionPeriodStats;
    };
    trends: {
      dailyVolume: Record<string, number>; // Últimos 30 días
      monthlyVolume: Record<string, number>; // Últimos 12 meses
      peakDays: {
        date: string;
        count: number;
      }[];
      categoryTrends: Record<
        string,
        {
          trend: number; // Porcentaje de cambio
          previousPeriod: number;
          currentPeriod: number;
        }
      >;
    };
  };
  financials: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  };
}

function isTimestamp(date: unknown): date is Timestamp {
  return date instanceof Timestamp;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function updateStatsInTransaction(
  t: FirebaseFirestore.Transaction,
  teamId: string,
  eventId: string | null,
  transaction: any,
  isApproved: boolean,
  previousStatus?: string,
) {
  const now = new Date();
  const teamRef = admindb.collection("teams").doc(teamId);
  const teamDoc = await t.get(teamRef);
  const teamData = teamDoc.data()!;

  const updates = calculateStatsUpdates(
    teamData,
    transaction,
    isApproved,
    previousStatus,
    now,
  );

  t.update(teamRef, {
    finances: updates.financials,
    transactionStats: updates.metrics,
  });

  if (eventId) {
    const eventRef = teamRef.collection("fundraisingEvents").doc(eventId);
    const eventDoc = await t.get(eventRef);

    if (eventDoc.exists) {
      const eventData = eventDoc.data()!;
      const eventUpdates = calculateEventUpdates(
        eventData,
        transaction,
        isApproved,
        previousStatus,
        now,
      );

      t.update(eventRef, eventUpdates);
    }
  }
}

function calculateStatsUpdates(
  teamData: any,
  transaction: any,
  isApproved: boolean,
  previousStatus?: string,
  now: Date = new Date(),
): StatsUpdateResult {
  const currentStats = teamData.transactionStats || {
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

  const updates: StatsUpdateResult = {
    metrics: { ...currentStats },
    financials: {
      totalIncome: teamData.finances?.totalIncome || 0,
      totalExpenses: teamData.finances?.totalExpenses || 0,
      balance: teamData.finances?.balance || 0,
    },
  };

  // Actualizar contadores básicos
  updates.metrics.total++;

  if (isApproved) {
    updates.metrics.approved++;
    if (previousStatus === "PENDING_APPROVAL") {
      updates.metrics.pending = Math.max(0, updates.metrics.pending - 1);
    }

    // Actualizar métricas financieras
    if (transaction.type === "INCOME") {
      updates.financials.totalIncome += transaction.amount;
      updates.metrics.income++;
    } else {
      updates.financials.totalExpenses += transaction.amount;
      updates.metrics.expenses++;
    }
    updates.financials.balance =
      updates.financials.totalIncome - updates.financials.totalExpenses;
  } else if (transaction.status === "REJECTED") {
    updates.metrics.rejected++;
    if (previousStatus === "PENDING_APPROVAL") {
      updates.metrics.pending = Math.max(0, updates.metrics.pending - 1);
    }
  } else if (transaction.status === "PENDING_APPROVAL") {
    updates.metrics.pending++;
  }

  // Actualizar categorías
  const category = transaction.category;

  if (!updates.metrics.byCategory[category]) {
    updates.metrics.byCategory[category] = {
      count: 0,
      total: 0,
      average: 0,
      lastTransaction: new Date(),
      trend: 0,
    };
  }

  const categoryStats = updates.metrics.byCategory[category];

  categoryStats.count++;
  if (isApproved) {
    categoryStats.total += transaction.amount;
    categoryStats.average = categoryStats.total / categoryStats.count;
  }
  categoryStats.lastTransaction = now;

  // Actualizar estadísticas por período
  const transactionDate = (() => {
    if (transaction.date instanceof Date) {
      return transaction.date;
    }
    if (isTimestamp(transaction.date)) {
      return transaction.date.toDate();
    }
    if (typeof transaction.date === "string") {
      return new Date(transaction.date);
    }

    return new Date(); // fallback
  })();

  if (isSameDay(transactionDate, now)) {
    updatePeriodStats(updates.metrics.byPeriod.today, transaction, isApproved);
  }
  if (isSameMonth(transactionDate, now)) {
    updatePeriodStats(
      updates.metrics.byPeriod.thisMonth,
      transaction,
      isApproved,
    );
  }
  if (isSameYear(transactionDate, now)) {
    updatePeriodStats(
      updates.metrics.byPeriod.thisYear,
      transaction,
      isApproved,
    );
  }

  // Actualizar tendencias
  const dateKey = formatDate(transactionDate);

  updates.metrics.trends.dailyVolume[dateKey] =
    (updates.metrics.trends.dailyVolume[dateKey] || 0) + 1;

  const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;

  updates.metrics.trends.monthlyVolume[monthKey] =
    (updates.metrics.trends.monthlyVolume[monthKey] || 0) + 1;

  // Mantener solo los últimos 30 días y 12 meses
  const sortedDays = Object.entries(updates.metrics.trends.dailyVolume)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30);

  updates.metrics.trends.dailyVolume = Object.fromEntries(sortedDays);

  const sortedMonths = Object.entries(updates.metrics.trends.monthlyVolume)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12);

  updates.metrics.trends.monthlyVolume = Object.fromEntries(sortedMonths);

  // Actualizar días pico
  updates.metrics.trends.peakDays = Object.entries(
    updates.metrics.trends.dailyVolume,
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([date, count]) => ({ date, count }));

  // Calcular tendencias por categoría
  Object.entries(updates.metrics.byCategory).forEach(([cat, stats]) => {
    const previousMonth =
      updates.metrics.byPeriod.thisMonth.byCategory[cat]?.total || 0;
    const currentMonth = stats.total;

    updates.metrics.trends.categoryTrends[cat] = {
      trend: previousMonth
        ? ((currentMonth - previousMonth) / previousMonth) * 100
        : 0,
      previousPeriod: previousMonth,
      currentPeriod: currentMonth,
    };
  });

  return updates;
}

function updatePeriodStats(
  periodStats: TransactionPeriodStats,
  transaction: any,
  isApproved: boolean,
) {
  periodStats.total++;

  if (isApproved) {
    if (transaction.type === "INCOME") {
      periodStats.income++;
    } else {
      periodStats.expenses++;
    }
  }

  if (!periodStats.byCategory[transaction.category]) {
    periodStats.byCategory[transaction.category] = {
      count: 0,
      total: 0,
      average: 0,
      lastTransaction: new Date(),
      trend: 0,
    };
  }

  const categoryStats = periodStats.byCategory[transaction.category];

  categoryStats.count++;
  if (isApproved) {
    categoryStats.total += transaction.amount;
    categoryStats.average = categoryStats.total / categoryStats.count;
  }
  categoryStats.lastTransaction = new Date();
}

function calculateEventUpdates(
  eventData: {
    transactionStats?: TransactionStats;
    revenue?: { actual: number; sources: Record<string, number> };
    budget?: { actual: number; categories: Record<string, { actual: number }> };
    metrics?: Record<string, number>;
  },
  transaction: any,
  isApproved: boolean,
  previousStatus?: string,
  now: Date = new Date(),
): Record<string, any> {
  const currentStats: TransactionStats = eventData.transactionStats || {
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

  const updates: Record<string, any> = {
    transactionStats: { ...currentStats },
  };

  // Actualizar contadores básicos
  updates.transactionStats.total++;

  if (isApproved) {
    updates.transactionStats.approved++;
    if (previousStatus === "PENDING_APPROVAL") {
      updates.transactionStats.pending = Math.max(
        0,
        updates.transactionStats.pending - 1,
      );
    }

    // Actualizar métricas financieras del evento
    if (transaction.type === "INCOME") {
      updates["revenue.actual"] =
        (eventData.revenue?.actual || 0) + transaction.amount;
      updates.transactionStats.income++;

      const sourceKey = `revenue.sources.${transaction.category}`;

      updates[sourceKey] =
        (eventData.revenue?.sources?.[transaction.category] || 0) +
        transaction.amount;
    } else {
      updates["budget.actual"] =
        (eventData.budget?.actual || 0) + transaction.amount;
      updates.transactionStats.expenses++;

      const categoryKey = `budget.categories.${transaction.category}.actual`;

      updates[categoryKey] =
        (eventData.budget?.categories?.[transaction.category]?.actual || 0) +
        transaction.amount;
    }

    // Actualizar métricas generales del evento
    const newRevenue =
      (eventData.revenue?.actual || 0) +
      (transaction.type === "INCOME" ? transaction.amount : 0);
    const newExpenses =
      (eventData.budget?.actual || 0) +
      (transaction.type === "EXPENSE" ? transaction.amount : 0);

    updates.metrics = {
      ...eventData.metrics,
      profitMargin:
        newRevenue > 0 ? ((newRevenue - newExpenses) / newRevenue) * 100 : 0,
      roi:
        newExpenses > 0 ? ((newRevenue - newExpenses) / newExpenses) * 100 : 0,
      averageTransactionAmount:
        (updates.transactionStats.approved *
          (eventData.metrics?.averageTransactionAmount || 0) +
          transaction.amount) /
        (updates.transactionStats.approved + 1),
    };
  } else if (transaction.status === "REJECTED") {
    updates.transactionStats.rejected++;
    if (previousStatus === "PENDING_APPROVAL") {
      updates.transactionStats.pending = Math.max(
        0,
        updates.transactionStats.pending - 1,
      );
    }
  } else if (transaction.status === "PENDING_APPROVAL") {
    updates.transactionStats.pending++;
  }

  // Actualizar estadísticas por categoría
  if (!updates.transactionStats.byCategory[transaction.category]) {
    updates.transactionStats.byCategory[transaction.category] = {
      count: 0,
      total: 0,
      average: 0,
      lastTransaction: now,
      trend: 0,
    };
  }

  const categoryStats =
    updates.transactionStats.byCategory[transaction.category];

  categoryStats.count++;
  if (isApproved) {
    categoryStats.total += transaction.amount;
    categoryStats.average = categoryStats.total / categoryStats.count;
  }
  categoryStats.lastTransaction = now;

  // Actualizar estadísticas por período
  const transactionDate =
    transaction.date instanceof Date
      ? transaction.date
      : isTimestamp(transaction.date)
        ? transaction.date.toDate()
        : new Date(transaction.date);

  if (isSameDay(transactionDate, now)) {
    updatePeriodStats(
      updates.transactionStats.byPeriod.today,
      transaction,
      isApproved,
    );
  }
  if (isSameMonth(transactionDate, now)) {
    updatePeriodStats(
      updates.transactionStats.byPeriod.thisMonth,
      transaction,
      isApproved,
    );
  }
  if (isSameYear(transactionDate, now)) {
    updatePeriodStats(
      updates.transactionStats.byPeriod.thisYear,
      transaction,
      isApproved,
    );
  }

  // Actualizar tendencias
  const dateKey = formatDate(transactionDate);

  updates.transactionStats.trends.dailyVolume[dateKey] =
    (updates.transactionStats.trends.dailyVolume[dateKey] || 0) + 1;

  const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;

  updates.transactionStats.trends.monthlyVolume[monthKey] =
    (updates.transactionStats.trends.monthlyVolume[monthKey] || 0) + 1;

  // Mantener histórico limitado
  const sortedDailyVolume = Object.entries(
    updates.transactionStats.trends.dailyVolume,
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30);

  updates.transactionStats.trends.dailyVolume =
    Object.fromEntries(sortedDailyVolume);

  const sortedMonthlyVolume = Object.entries(
    updates.transactionStats.trends.monthlyVolume,
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12);

  updates.transactionStats.trends.monthlyVolume =
    Object.fromEntries(sortedMonthlyVolume);

  // Actualizar días pico
  // Actualizar días pico
  updates.transactionStats.trends.peakDays = Object.entries(
    updates.transactionStats.trends.dailyVolume,
  )
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([date, count]) => ({
      date,
      count: count as number,
    }));

  // Calcular tendencias por categoría
  Object.entries(updates.transactionStats.byCategory).forEach(
    ([cat, stats]) => {
      const typedStats = stats as CategoryStats;
      const previousMonth =
        updates.transactionStats.byPeriod.thisMonth.byCategory[cat]?.total || 0;
      const currentMonth = typedStats.total;

      updates.transactionStats.trends.categoryTrends[cat] = {
        trend: previousMonth
          ? ((currentMonth - previousMonth) / previousMonth) * 100
          : 0,
        previousPeriod: previousMonth,
        currentPeriod: currentMonth,
      };
    },
  );

  return updates;
}

// Funciones auxiliares para notificaciones
async function notifyApprovers(
  notificationService: NotificationService,
  teamId: string,
  transaction: any,
  eventId: string,
) {
  const teamDoc = await admindb.collection("teams").doc(teamId).get();
  const admins =
    teamDoc
      .data()!
      .members?.filter(
        (member: any) => member.role === "Admin" || member.role === "Owner",
      )
      .map((admin: any) => admin.id) || [];

  await notificationService.createNotification(
    teamId,
    NotificationType.TRANSACTION_PENDING,
    {
      title: "Transaction Pending Approval",
      message: `New ${transaction.type.toLowerCase()} transaction of ${transaction.amount} ${transaction.currency} requires approval`,
      priority: NotificationPriority.MEDIUM,
      recipients: admins,
      metadata: {
        entityId: transaction.id,
        entityType: "transaction",
        eventId,
        amount: transaction.amount,
        currency: transaction.currency,
      },
      expiresIn: 60 * 24,
    },
  );
}

async function notifyCreator(
  notificationService: NotificationService,
  teamId: string,
  transaction: any,
  creatorId: string,
) {
  await notificationService.createNotification(
    teamId,
    NotificationType.TRANSACTION_APPROVED,
    {
      title: "Transaction Auto-approved",
      message: `Your ${transaction.type.toLowerCase()} transaction of ${transaction.amount} ${transaction.currency} has been auto-approved`,
      priority: NotificationPriority.LOW,
      recipients: [creatorId],
      metadata: {
        entityId: transaction.id,
        entityType: "transaction",
        eventId: transaction.eventId,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    },
  );
}
export {
  updateStatsInTransaction,
  calculateStatsUpdates,
  calculateEventUpdates,
  notifyApprovers,
  notifyCreator,
};
