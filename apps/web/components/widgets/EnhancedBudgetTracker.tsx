"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  budgeted: number;
  spent: number;
}

interface EnhancedBudgetTrackerProps {
  categories: BudgetCategory[];
  currency?: string;
  isLoading?: boolean;
}

type ViewMode = "totals" | "percent";

export function EnhancedBudgetTracker({
  categories,
  currency = "K",
  isLoading = false,
}: EnhancedBudgetTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("totals");

  const totalBudget = useMemo(
    () => categories.reduce((sum, c) => sum + c.budgeted, 0),
    [categories]
  );

  const totalSpent = useMemo(
    () => categories.reduce((sum, c) => sum + c.spent, 0),
    [categories]
  );

  // Calculate percentages for each category
  const categoriesWithPercentage = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      percentage: totalBudget > 0 ? (cat.budgeted / totalBudget) * 100 : 0,
      spentPercentage: cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0,
    }));
  }, [categories, totalBudget]);

  // Build segmented progress bar data
  const segments = useMemo(() => {
    let offset = 0;
    return categoriesWithPercentage.map((cat) => {
      const segment = {
        ...cat,
        offset,
        width: cat.percentage,
      };
      offset += cat.percentage;
      return segment;
    });
  }, [categoriesWithPercentage]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          Budget Tracker
          <span className="text-muted-foreground/50 text-xs">ⓘ</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Manage Budgets</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1 bg-muted/50 rounded-full p-1">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                viewMode === "totals"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("totals")}
            >
              Totals
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                viewMode === "percent"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("percent")}
            >
              Percent
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Budget Display */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight">
              {currency}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">
              Live budget across all categories
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-muted-foreground">
              {currency}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-muted-foreground ml-1">spent so far</span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="h-6 flex rounded-full overflow-hidden bg-muted/30">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="h-full transition-all relative"
              style={{
                width: `${segment.width}%`,
                backgroundColor: segment.color,
              }}
            >
              {/* Spent indicator overlay */}
              <div
                className="absolute inset-y-0 left-0 bg-white/30"
                style={{ width: `${Math.min(segment.spentPercentage, 100)}%` }}
              />
            </div>
          ))}
        </div>

        {/* Category List */}
        <div className="space-y-3 pt-2">
          {categoriesWithPercentage.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {viewMode === "totals" 
                    ? `${currency}${category.budgeted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `${category.percentage.toFixed(0)}%`
                  }
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {category.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
