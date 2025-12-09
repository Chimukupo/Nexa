/**
 * 50/30/20 Budget Rule Calculator
 * 
 * Implements the popular budgeting rule where:
 * - 50% of income goes to Needs
 * - 30% of income goes to Wants
 * - 20% of income goes to Savings
 */

export interface BudgetSplit {
  needs: number;      // 50% of income
  wants: number;      // 30% of income
  savings: number;    // 20% of income
  total: number;      // Total income
}

/**
 * Calculate 50/30/20 budget split from monthly income
 */
export function calculate50_30_20Split(monthlyIncome: number): BudgetSplit {
  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
    total: monthlyIncome,
  };
}

/**
 * Distribute budget amount evenly across categories
 */
export function distributeBudgetEvenly(
  totalAmount: number,
  categoryIds: string[]
): Map<string, number> {
  if (categoryIds.length === 0) {
    return new Map();
  }

  const amountPerCategory = totalAmount / categoryIds.length;
  const distribution = new Map<string, number>();

  categoryIds.forEach((id) => {
    distribution.set(id, amountPerCategory);
  });

  return distribution;
}

/**
 * Apply 50/30/20 split to user's categories
 */
export function apply50_30_20ToCategories(
  monthlyIncome: number,
  categories: { id: string; type: string }[]
): Map<string, number> {
  const split = calculate50_30_20Split(monthlyIncome);
  const distribution = new Map<string, number>();

  // Group categories by type
  const needsCategories = categories.filter((c) => c.type === "NEEDS");
  const wantsCategories = categories.filter((c) => c.type === "WANTS");
  const savingsCategories = categories.filter((c) => c.type === "SAVINGS");

  // Distribute budget evenly within each type
  const needsDist = distributeBudgetEvenly(split.needs, needsCategories.map((c) => c.id));
  const wantsDist = distributeBudgetEvenly(split.wants, wantsCategories.map((c) => c.id));
  const savingsDist = distributeBudgetEvenly(split.savings, savingsCategories.map((c) => c.id));

  // Combine all distributions
  needsDist.forEach((amount, id) => distribution.set(id, amount));
  wantsDist.forEach((amount, id) => distribution.set(id, amount));
  savingsDist.forEach((amount, id) => distribution.set(id, amount));

  return distribution;
}

/**
 * Get budget allocation summary by category type
 */
export function getBudgetSummaryByType(
  allocations: Map<string, number>,
  categories: { id: string; type: string }[]
): {
  needs: number;
  wants: number;
  savings: number;
  total: number;
} {
  let needs = 0;
  let wants = 0;
  let savings = 0;

  allocations.forEach((amount, categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    switch (category.type) {
      case "NEEDS":
        needs += amount;
        break;
      case "WANTS":
        wants += amount;
        break;
      case "SAVINGS":
        savings += amount;
        break;
    }
  });

  return {
    needs,
    wants,
    savings,
    total: needs + wants + savings,
  };
}
