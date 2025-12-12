"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import type { Transaction } from "@workspace/validators";

type TimeRange = "7days" | "30days" | "3months";

interface SpendingChartProps {
  transactions: (Transaction & { id: string })[];
  previousMonthTransactions?: (Transaction & { id: string })[];
  currency?: string;
  isLoading?: boolean;
}

export function SpendingChart({
  transactions,
  previousMonthTransactions = [],
  currency = "K",
  isLoading = false,
}: SpendingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");

  // Calculate daily spending totals
  const chartData = useMemo(() => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    // Group transactions by day
    const dailySpending = new Map<string, number>();
    const previousDailySpending = new Map<string, number>();
    
    // Process current month transactions
    transactions.forEach((t) => {
      if (t.type === "EXPENSE" && t.date) {
        const transactionDate = new Date(t.date);
        const dayKey = format(transactionDate, "yyyy-MM-dd");
        dailySpending.set(dayKey, (dailySpending.get(dayKey) || 0) + t.amount);
      }
    });

    // Process previous month transactions
    previousMonthTransactions.forEach((t) => {
      if (t.type === "EXPENSE" && t.date) {
        const transactionDate = new Date(t.date);
        const dayKey = format(transactionDate, "yyyy-MM-dd");
        previousDailySpending.set(dayKey, (previousDailySpending.get(dayKey) || 0) + t.amount);
      }
    });

    // Build cumulative spending
    let cumulativeThis = 0;
    let cumulativeLast = 0;
    
    const data = dateRange.map((date, index) => {
      const dayKey = format(date, "yyyy-MM-dd");
      const dayLabel = format(date, "d");
      
      cumulativeThis += dailySpending.get(dayKey) || 0;
      cumulativeLast += previousDailySpending.get(dayKey) || 0;
      
      return {
        day: `Day ${dayLabel}`,
        date: format(date, "MMM d"),
        thisMonth: Math.round(cumulativeThis * 100) / 100,
        lastMonth: Math.round(cumulativeLast * 100) / 100,
      };
    });

    console.log("SpendingChart data:", {
      transactionCount: transactions.length,
      expenseCount: transactions.filter(t => t.type === "EXPENSE").length,
      dateRange: `${format(startDate, "MMM d")} - ${format(today, "MMM d")}`,
      dataPoints: data.length,
      sampleData: data.slice(0, 3),
      finalTotal: cumulativeThis,
    });

    return data;
  }, [transactions, previousMonthTransactions, timeRange]);

  // Calculate totals
  const totalSpending = useMemo(() => {
    return transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const previousTotalSpending = useMemo(() => {
    return previousMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [previousMonthTransactions]);

  const changePercentage = useMemo(() => {
    if (previousTotalSpending === 0) return 0;
    return ((totalSpending - previousTotalSpending) / previousTotalSpending) * 100;
  }, [totalSpending, previousTotalSpending]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            Spending
            <span className="text-muted-foreground/50 text-xs">ⓘ</span>
          </CardTitle>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">
              {currency}{totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-medium ${changePercentage >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(2)}%
            </span>
            <span className="text-sm text-muted-foreground">from Last Month</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex rounded-lg border bg-muted/50 p-1">
            {(['7days', '30days', '3months'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setTimeRange(range)}
              >
                {range === '7days' ? '7 days' : range === '30days' ? '30 days' : '3 months'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                labelFormatter={(label) => chartData.find(d => d.day === label)?.date || label}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                wrapperStyle={{ paddingBottom: 20 }}
              />
              <Area
                type="monotone"
                dataKey="thisMonth"
                stroke="#10B981"
                fill="url(#spendingGradient)"
                strokeWidth={2}
                name="This Month"
                dot={false}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="lastMonth"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Last Month"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
