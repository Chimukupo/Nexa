"use client";

import React, { useMemo, useState } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { BudgetProgressBar } from "@/components/widgets/BudgetProgressBar";
import { BudgetTracker } from "@/components/widgets/BudgetTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PiggyBank, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { getCurrentMonthRange } from "@/lib/utils/monthlyCalculations";
import { calculate50_30_20Split } from "@/lib/utils/fiftyThirtyTwenty";
import { checkBudgetThresholds, getAlertColor, getAlertMessage } from "@/lib/utils/budgetAlerts";
import { format } from "date-fns";

export default function BudgetPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"all" | "NEEDS" | "WANTS" | "SAVINGS">("all");

  const { data: categories } = useCategories();
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);

  // Fetch current month transactions
  const { data: transactions, isLoading } = useTransactions({
    startDate: currentMonthRange.startDate,
    endDate: currentMonthRange.endDate,
  });

  // Calculate monthly income
  const monthlyIncome = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate 50/30/20 split
  const budgetSplit = useMemo(
    () => calculate50_30_20Split(monthlyIncome),
    [monthlyIncome]
  );

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    if (!transactions) return new Map<string, number>();

    const spending = new Map<string, number>();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const categoryId = t.categoryId || "uncategorized";
        spending.set(categoryId, (spending.get(categoryId) || 0) + t.amount);
      });

    return spending;
  }, [transactions]);

  // Calculate spending by type
  const spendingByType = useMemo(() => {
    if (!categories || !transactions) {
      return { NEEDS: 0, WANTS: 0, SAVINGS: 0 };
    }

    const spending = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };

    transactions
      .filter((t) => t.type === "EXPENSE" && t.categoryId)
      .forEach((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        if (category && category.type in spending) {
          spending[category.type as keyof typeof spending] += t.amount;
        }
      });

    return spending;
  }, [categories, transactions]);

  // Generate budget alerts
  const alerts = useMemo(() => {
    if (!categories) return [];
    return checkBudgetThresholds(
      categories.map((c) => ({
        id: c.id!,
        name: c.name,
        color: c.color,
        monthlyBudgetCap: c.monthlyBudgetCap,
      })),
      spendingByCategory
    );
  }, [categories, spendingByCategory]);

  // Filter categories for display
  const displayCategories = useMemo(() => {
    if (!categories) return [];

    let filtered = categories.filter((c) => c.monthlyBudgetCap && c.monthlyBudgetCap > 0);

    if (activeTab !== "all") {
      filtered = filtered.filter((c) => c.type === activeTab);
    }

    return filtered;
  }, [categories, activeTab]);

  // Prepare data for BudgetTracker
  const trackerData = useMemo(() => {
    if (!categories) return [];

    return categories
      .filter((c) => c.monthlyBudgetCap && c.monthlyBudgetCap > 0)
      .map((c) => ({
        id: c.id!,
        name: c.name,
        color: c.color,
        budgeted: c.monthlyBudgetCap!,
        spent: spendingByCategory.get(c.id!) || 0,
      }));
  }, [categories, spendingByCategory]);

  const totalBudget = useMemo(
    () => trackerData.reduce((sum, c) => sum + c.budgeted, 0),
    [trackerData]
  );

  const totalSpent = useMemo(
    () => trackerData.reduce((sum, c) => sum + c.spent, 0),
    [trackerData]
  );

  const currentMonth = format(new Date(), "MMMM yyyy");

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground mt-1">
            Track your spending and manage your budget for {currentMonth}
          </p>
        </div>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const colors = getAlertColor(alert.severity);
            return (
              <div
                key={alert.categoryId}
                className={`flex items-center gap-3 p-4 rounded-lg border ${colors.bg}`}
              >
                <AlertCircle className={`w-5 h-5 ${colors.icon}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {getAlertMessage(alert)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{monthlyIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total income this month
            </p>
          </CardContent>
        </Card>

        {/* Total Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Allocated across {trackerData.length} categories
            </p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% of budget` : "No budget set"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Tracker Widget */}
      <BudgetTracker categories={trackerData} totalBudget={totalBudget} />

      {/* 50/30/20 Split */}
      {monthlyIncome > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>50/30/20 Budget Breakdown</CardTitle>
            <CardDescription>
              Recommended allocation based on your monthly income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BudgetProgressBar
              categoryName="Needs (50%)"
              categoryColor="#10b981"
              budgeted={budgetSplit.needs}
              spent={spendingByType.NEEDS}
            />
            <BudgetProgressBar
              categoryName="Wants (30%)"
              categoryColor="#f59e0b"
              budgeted={budgetSplit.wants}
              spent={spendingByType.WANTS}
            />
            <BudgetProgressBar
              categoryName="Savings (20%)"
              categoryColor="#3b82f6"
              budgeted={budgetSplit.savings}
              spent={spendingByType.SAVINGS}
            />
          </CardContent>
        </Card>
      )}

      {/* Category Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            Track spending against your budget for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Buttons */}
          <div className="flex gap-1 bg-muted/50 rounded-full p-1 w-fit mb-6">
            {(["all", "NEEDS", "WANTS", "SAVINGS"] as const).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "All" : tab === "NEEDS" ? "Needs" : tab === "WANTS" ? "Wants" : "Savings"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading budget data...
              </div>
            ) : displayCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories with budgets set</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Go to Categories to set monthly budget caps
                </p>
              </div>
            ) : (
              displayCategories.map((category) => (
                <BudgetProgressBar
                  key={category.id}
                  categoryName={category.name}
                  categoryColor={category.color}
                  budgeted={category.monthlyBudgetCap!}
                  spent={spendingByCategory.get(category.id!) || 0}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
