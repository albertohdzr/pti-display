// utils/chart-helpers.ts
import { Transaction } from "@/types/finance";

interface ChartDataPoint {
  x: string;
  y: number;
}

export function processTransactionsForChart(
  transactions: Transaction[],
): ChartDataPoint[] {
  // Agrupar transacciones por fecha
  const groupedByDate = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += transaction.amount;

      return acc;
    },
    {} as Record<string, number>,
  );

  // Ordenar por fecha y convertir a formato de gráfico
  return Object.entries(groupedByDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, amount]) => ({
      x: date,
      y: amount,
    }));
}

export function processCategoriesForChart(
  categories: Record<string, { planned: number; actual: number }>,
): ChartDataPoint[] {
  return Object.entries(categories).map(([category, values]) => ({
    x: category,
    y: values.actual,
  }));
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Si es el mismo día
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Si es el mismo mes y año
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString(
      undefined,
      {
        month: "long",
        year: "numeric",
      },
    )}`;
  }

  // Si es el mismo año
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  // Diferentes años
  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
