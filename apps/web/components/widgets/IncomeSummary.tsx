"use client";

import { useMemo } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { getCurrentMonthRange } from "@/lib/utils/monthlyCalculations";

/**
 * Income Summary Widget
 * Displays total monthly income and breakdown by source
 */
export function IncomeSummary() {
  const { data: categories } = useCategories();
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  
  const { data: transactions, isLoading } = useTransactions({
    type: "INCOME",
    startDate: currentMonthRange.startDate,
    endDate: currentMonthRange.endDate,
  });

  // Calculate total income
  const totalIncome = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Group income by category
  const incomeBySource = useMemo(() => {
    if (!transactions || !categories) return [];

    const grouped = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName: categories.find((c) => c.id === categoryId)?.name || "Uncategorized",
          categoryColor: categories.find((c) => c.id === categoryId)?.color || "#6366F1",
          total: 0,
          count: 0,
        };
      }
      acc[categoryId].total += transaction.amount;
      acc[categoryId].count += 1;
      return acc;
    }, {} as Record<string, { categoryId: string; categoryName: string; categoryColor: string; total: number; count: number }>);

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [transactions, categories]);

  const currentMonth = format(new Date(), "MMMM yyyy");

  return (
    <Card className="rounded-2xl overflow-hidden shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Monthly Income
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Income */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              K{totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{currentMonth}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading income data...</div>
        )}

        {/* Income Breakdown by Source */}
        {!isLoading && incomeBySource.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium text-foreground">Income Sources</p>
            <div className="space-y-2">
              {incomeBySource.map((source) => (
                <div key={source.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: source.categoryColor }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {source.categoryName}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    K{source.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && incomeBySource.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No income recorded this month</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first income transaction to see it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
