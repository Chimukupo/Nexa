import type { Transaction } from "@workspace/validators";

/**
 * Budget Calculation Utilities
 * 
 * Core functions for budget management including income/expense totals,
 * budget balance calculations, and zero-based budget validation.
 */

/**
 * Calculate total income for a given period
 */
export function calculateTotalIncome(
  transactions: (Transaction & { id: string })[],
  startDate?: Date,
  endDate?: Date
): number {
  return transactions
    .filter((t) => {
      if (t.type !== "INCOME") return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses for a given period
 */
export function calculateTotalExpenses(
  transactions: (Transaction & { id: string })[],
  startDate?: Date,
  endDate?: Date
): number {
  return transactions
    .filter((t) => {
      if (t.type !== "EXPENSE") return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate expenses by category type
 */
export function calculateExpensesByType(
  transactions: (Transaction & { id: string })[],
  categories: { id: string; type: string }[],
  categoryType: "NEEDS" | "WANTS" | "SAVINGS",
  startDate?: Date,
  endDate?: Date
): number {
  const categoryIds = categories
    .filter((c) => c.type === categoryType)
    .map((c) => c.id);

  return transactions
    .filter((t) => {
      if (t.type !== "EXPENSE") return false;
      if (!t.categoryId || !categoryIds.includes(t.categoryId)) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate budget balance (income - expenses)
 */
export function calculateBudgetBalance(totalIncome: number, totalExpenses: number): number {
  return totalIncome - totalExpenses;
}

/**
 * Validate that budget allocations sum to total income (zero-based budgeting)
 */
export function validateZeroBasedBudget(
  allocations: { categoryId: string; amount: number }[],
  totalIncome: number,
  tolerance: number = 0.01 // Allow small rounding differences
): boolean {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  return Math.abs(totalAllocated - totalIncome) <= tolerance;
}

/**
 * Calculate remaining budget for a category
 */
export function calculateRemainingBudget(budgeted: number, spent: number): number {
  return budgeted - spent;
}

/**
 * Calculate budget utilization percentage
 */
export function calculateBudgetPercentage(spent: number, budgeted: number): number {
  if (budgeted === 0) return 0;
  return (spent / budgeted) * 100;
}

/**
 * Determine budget status based on percentage spent
 */
export function getBudgetStatus(
  percentage: number
): "safe" | "warning" | "critical" | "overspent" {
  if (percentage < 75) return "safe";
  if (percentage < 90) return "warning";
  if (percentage < 100) return "critical";
  return "overspent";
}
