"use client";

import { useMemo } from "react";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { getBudgetStatus, calculateBudgetPercentage } from "@/lib/utils/budget";

interface BudgetProgressBarProps {
  categoryName: string;
  categoryColor: string;
  budgeted: number;
  spent: number;
  showDetails?: boolean;
}

export function BudgetProgressBar({
  categoryName,
  categoryColor,
  budgeted,
  spent,
  showDetails = true,
}: BudgetProgressBarProps) {
  const percentage = useMemo(
    () => calculateBudgetPercentage(spent, budgeted),
    [spent, budgeted]
  );

  const status = useMemo(() => getBudgetStatus(percentage), [percentage]);

  const remaining = budgeted - spent;

  // Color scheme based on status
  const colors = useMemo(() => {
    switch (status) {
      case "safe":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-700 dark:text-emerald-400",
          icon: CheckCircle,
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-700 dark:text-yellow-400",
          icon: AlertTriangle,
        };
      case "critical":
      case "overspent":
        return {
          bg: "bg-red-500",
          text: "text-red-700 dark:text-red-400",
          icon: AlertCircle,
        };
    }
  }, [status]);

  const Icon = colors.icon;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="font-medium text-sm">{categoryName}</span>
        </div>
        <div className="flex items-center gap-2">
          {status !== "safe" && (
            <Icon className={`w-4 h-4 ${colors.text}`} />
          )}
          <span className={`text-sm font-medium ${colors.text}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            K{spent.toFixed(2)} of K{budgeted.toFixed(2)}
          </span>
          <span className={remaining < 0 ? "text-red-600 dark:text-red-400" : ""}>
            {remaining >= 0 ? `K${remaining.toFixed(2)} left` : `K${Math.abs(remaining).toFixed(2)} over`}
          </span>
        </div>
      )}
    </div>
  );
}
