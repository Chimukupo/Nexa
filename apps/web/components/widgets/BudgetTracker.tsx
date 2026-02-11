"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PiggyBank } from "lucide-react";

interface CategoryBudget {
  id: string;
  name: string;
  color: string;
  budgeted: number;
  spent: number;
}

interface BudgetTrackerProps {
  categories: CategoryBudget[];
  totalBudget: number;
}

export function BudgetTracker({ categories, totalBudget }: BudgetTrackerProps) {
  // Calculate percentages for segmented bar
  const segments = useMemo(() => {
    if (totalBudget === 0) return [];

    return categories
      .filter((c) => c.budgeted > 0)
      .map((category) => ({
        ...category,
        percentage: (category.budgeted / totalBudget) * 100,
        spentPercentage: (category.spent / category.budgeted) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage); // Largest first
  }, [categories, totalBudget]);

  const totalSpent = useMemo(
    () => categories.reduce((sum, c) => sum + c.spent, 0),
    [categories]
  );

  const overallPercentage = useMemo(
    () => (totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0),
    [totalSpent, totalBudget]
  );

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Budget Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No budget allocations set. Set budgets for your categories to track spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Budget Tracker
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {overallPercentage.toFixed(0)}% Used
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segmented Progress Bar */}
        <div className="relative h-8 bg-muted rounded-full overflow-hidden flex">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="relative h-full flex items-center justify-center transition-all duration-300 hover:opacity-80"
              style={{
                width: `${segment.percentage}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.name}: K${segment.budgeted.toFixed(2)}`}
            >
              {segment.percentage > 10 && (
                <span className="text-xs font-medium text-white mix-blend-difference">
                  {segment.percentage.toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-foreground">{segment.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  K{segment.spent.toFixed(2)} / K{segment.budgeted.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    segment.spentPercentage >= 90
                      ? "text-red-600 dark:text-red-400"
                      : segment.spentPercentage >= 75
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {segment.spentPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-2 border-t flex items-center justify-between font-medium">
          <span>Total Budget</span>
          <span>
            K{totalSpent.toFixed(2)} / K{totalBudget.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
