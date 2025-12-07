import type { Transaction } from "@workspace/validators";

/**
 * Calculate total income for a given month
 */
export function calculateMonthlyIncome(
  transactions: (Transaction & { id: string })[]
): number {
  return transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses for a given month
 */
export function calculateMonthlyExpenses(
  transactions: (Transaction & { id: string })[]
): number {
  return transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get the start and end dates for the current month
 */
export function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Get the start and end dates for the previous month
 */
export function getPreviousMonthRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
}
