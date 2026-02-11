"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { Transaction } from "@workspace/validators";

interface IncomeExpenseChartProps {
  transactions: (Transaction & { id: string })[];
  currency?: string;
  isLoading?: boolean;
}

export function IncomeExpenseChart({
  transactions,
  currency = "K",
  isLoading = false,
}: IncomeExpenseChartProps) {
  // Helper to normalize Firestore Timestamps to Date
  const normalizeDate = (date: unknown): Date => {
    if (!date) return new Date();
    // Handle Firestore Timestamp
    if (typeof date === "object" && date !== null && "toDate" in date && typeof (date as { toDate: () => Date }).toDate === "function") {
      return (date as { toDate: () => Date }).toDate();
    }
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? new Date() : date;
    }
    const parsed = new Date(date as string | number);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Calculate monthly income and expenses for last 12 months
  const chartData = useMemo(() => {
    const months: {
      month: string;
      monthLabel: string;
      income: number;
      expenses: number;
    }[] = [];

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // Filter transactions for this month
      const monthTransactions = transactions.filter((t) => {
        const txDate = normalizeDate(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      // Calculate totals
      const income = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: format(date, "yyyy-MM"),
        monthLabel: format(date, "MMM"),
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
      });
    }

    return months;
  }, [transactions]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalIncome = chartData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = chartData.reduce((sum, m) => sum + m.expenses, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
    };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === "income")?.value || 0;
      const expenses = payload.find((p: any) => p.dataKey === "expenses")?.value || 0;
      const net = income - expenses;

      return (
        <div className="bg-white border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs">Income</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                {currency}
                {income.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">Expenses</span>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {currency}
                {expenses.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-1 mt-1 border-t">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium">Net</span>
                <span
                  className={`text-sm font-bold ${
                    net >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {net >= 0 ? "+" : ""}
                  {currency}
                  {net.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            Income vs Expenses
            <span className="text-muted-foreground/50 text-xs">ⓘ</span>
          </CardTitle>
          <div className="flex items-baseline gap-4 mt-2">
            <div>
              <span className="text-sm text-muted-foreground">Net Savings</span>
              <p
                className={`text-xl font-bold ${
                  totals.netSavings >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {totals.netSavings >= 0 ? "+" : ""}
                {currency}
                {totals.netSavings.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Savings Rate</span>
              <p className="text-xl font-bold">
                {totals.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 20 }}
                iconType="circle"
              />
              <Bar
                dataKey="income"
                fill="url(#incomeGradient)"
                radius={[4, 4, 0, 0]}
                name="Income"
              />
              <Bar
                dataKey="expenses"
                fill="url(#expenseGradient)"
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
