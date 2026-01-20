"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useInitializeCategories } from "@/lib/hooks/useInitializeCategories";
import { calculateNetWorth } from "@/lib/utils/netWorth";
import { calculateMonthlyIncome, calculateMonthlyExpenses, getCurrentMonthRange, getPreviousMonthRange } from "@/lib/utils/monthlyCalculations";
import { subMonths } from "date-fns";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

// Widgets
import { TotalBalanceCard } from "@/components/widgets/TotalBalanceCard";
import { EnhancedBudgetTracker } from "@/components/widgets/EnhancedBudgetTracker";
import { SpendingChart } from "@/components/widgets/SpendingChart";
import { RecentActivity } from "@/components/widgets/RecentActivity";
import { ExpenseDonutChart } from "@/components/widgets/ExpenseDonutChart";
import { IncomeExpenseChart } from "@/components/widgets/IncomeExpenseChart";

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: categories } = useCategories();

  // Initialize default categories for new users
  useInitializeCategories();

  // Fetch current month's transactions
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const previousMonthRange = useMemo(() => getPreviousMonthRange(), []);
  
  const { data: currentMonthTransactions, isLoading: isLoadingCurrentTransactions } = useTransactions({
    startDate: currentMonthRange.startDate,
    endDate: currentMonthRange.endDate,
  });

  const { data: previousMonthTransactions } = useTransactions({
    startDate: previousMonthRange.startDate,
    endDate: previousMonthRange.endDate,
  });

  // Fetch last 12 months for income/expense chart
  const last12MonthsStart = useMemo(() => subMonths(new Date(), 12), []);
  const { data: yearTransactions } = useTransactions({
    startDate: last12MonthsStart,
    endDate: new Date(),
  });

  const previousMonthBalance = useMemo(() => {
    const prevIncome = calculateMonthlyIncome(previousMonthTransactions || []);
    const prevExpenses = calculateMonthlyExpenses(previousMonthTransactions || []);
    return prevIncome - prevExpenses;
  }, [previousMonthTransactions]);

  const activeAccounts = accounts?.filter((a) => !a.isArchived) || [];
  const hasAccounts = activeAccounts.length > 0;

  // Prepare budget tracker data
  const budgetCategories = useMemo(() => {
    if (!categories || !currentMonthTransactions) return [];
    
    const spendingByCategory = new Map<string, number>();
    currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const catId = t.categoryId || "uncategorized";
        spendingByCategory.set(catId, (spendingByCategory.get(catId) || 0) + t.amount);
      });

    return categories
      .filter((c) => c.monthlyBudgetCap && c.monthlyBudgetCap > 0)
      .map((c) => ({
        id: c.id!,
        name: c.name,
        color: c.color,
        budgeted: c.monthlyBudgetCap!,
        spent: spendingByCategory.get(c.id!) || 0,
      }));
  }, [categories, currentMonthTransactions]);

  // Currency symbol
  const currencySymbol = profile?.currency === "ZMW" ? "K" : profile?.currency || "K";

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.displayName || user?.displayName || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
      </div>

      {/* Top Row: Balance + Budget Tracker */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TotalBalanceCard
          accounts={accounts || []}
          currency={currencySymbol}
          previousMonthBalance={previousMonthBalance > 0 ? previousMonthBalance : undefined}
          isLoading={isLoadingAccounts}
        />
        <EnhancedBudgetTracker
          categories={budgetCategories}
          currency={currencySymbol}
          isLoading={isLoadingCurrentTransactions}
        />
      </div>

      {/* Spending Chart */}
      <SpendingChart
        transactions={currentMonthTransactions || []}
        previousMonthTransactions={previousMonthTransactions || []}
        currency={currencySymbol}
        isLoading={isLoadingCurrentTransactions}
      />

      {/* Charts Row: Expense Breakdown + Income vs Expense */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseDonutChart
          transactions={currentMonthTransactions || []}
          categories={categories || []}
          currency={currencySymbol}
          isLoading={isLoadingCurrentTransactions}
        />
        <IncomeExpenseChart
          transactions={yearTransactions || []}
          currency={currencySymbol}
          isLoading={isLoadingCurrentTransactions}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        transactions={currentMonthTransactions || []}
        categories={categories || []}
        currency={currencySymbol}
        limit={10}
        isLoading={isLoadingCurrentTransactions}
      />

      {/* Empty State CTA */}
      {!isLoadingAccounts && !hasAccounts && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="mb-2">No accounts found</CardTitle>
            <CardDescription className="mb-6 max-w-sm">
              Create your first account to start tracking your finances and get insights into your spending.
            </CardDescription>
            <Button asChild>
              <Link href="/accounts">
                Create Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
