/**
 * Budget Alert System
 * 
 * Monitors budget thresholds and generates alerts when spending
 * approaches or exceeds budget limits.
 */

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  severity: "warning" | "critical" | "overspent";
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
}

/**
 * Check budget thresholds and generate alerts
 * 
 * Thresholds:
 * - Warning: 75-89% spent
 * - Critical: 90-99% spent
 * - Overspent: ≥100% spent
 */
export function checkBudgetThresholds(
  categories: { id: string; name: string; color: string; monthlyBudgetCap?: number }[],
  spending: Map<string, number>
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  categories.forEach((category) => {
    // Skip categories without budget caps
    if (!category.monthlyBudgetCap || category.monthlyBudgetCap <= 0) {
      return;
    }

    const spent = spending.get(category.id) || 0;
    const budget = category.monthlyBudgetCap;
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;

    // Only generate alerts if spending is >= 75%
    if (percentage >= 75) {
      let severity: "warning" | "critical" | "overspent";

      if (percentage >= 100) {
        severity = "overspent";
      } else if (percentage >= 90) {
        severity = "critical";
      } else {
        severity = "warning";
      }

      alerts.push({
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        severity,
        spent,
        budget,
        percentage,
        remaining,
      });
    }
  });

  // Sort by severity (overspent first, then critical, then warning)
  // Then by percentage (highest first)
  return alerts.sort((a, b) => {
    const severityOrder = { overspent: 0, critical: 1, warning: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.percentage - a.percentage;
  });
}

/**
 * Get alert color based on severity
 */
export function getAlertColor(severity: "warning" | "critical" | "overspent"): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case "warning":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        icon: "text-yellow-600 dark:text-yellow-500",
      };
    case "critical":
      return {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        icon: "text-orange-600 dark:text-orange-500",
      };
    case "overspent":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        icon: "text-red-600 dark:text-red-500",
      };
  }
}

/**
 * Get alert message based on severity
 */
export function getAlertMessage(alert: BudgetAlert): string {
  const { categoryName, percentage, remaining, severity } = alert;
  
  if (severity === "overspent") {
    const overage = Math.abs(remaining);
    return `${categoryName} is over budget by K${overage.toFixed(2)}`;
  }
  
  if (severity === "critical") {
    return `${categoryName} is ${percentage.toFixed(0)}% spent - only K${remaining.toFixed(2)} remaining`;
  }
  
  return `${categoryName} is ${percentage.toFixed(0)}% spent`;
}
