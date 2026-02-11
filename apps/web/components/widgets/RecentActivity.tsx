"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { format } from "date-fns";
import type { Transaction, Category } from "@workspace/validators";
import Link from "next/link";

interface RecentActivityProps {
  transactions: (Transaction & { id: string })[];
  categories?: (Category & { id: string })[];
  currency?: string;
  limit?: number;
  isLoading?: boolean;
}

export function RecentActivity({
  transactions,
  categories = [],
  currency = "K",
  limit = 5,
  isLoading = false,
}: RecentActivityProps) {
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [transactions, limit]);

  const getCategoryDetails = (categoryId?: string) => {
    if (!categoryId) return { name: "Uncategorized", color: "#6b7280" };
    const category = categories.find((c) => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: "Unknown", color: "#6b7280" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          Recent Activity
          <span className="text-muted-foreground/50 text-xs">ⓘ</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-40 rounded-lg border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              See All
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Filter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">
                    <input type="checkbox" className="rounded border-muted-foreground/30" />
                  </th>
                  <th className="pb-3 font-medium">Payment ID</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => {
                  const categoryDetails = getCategoryDetails(transaction.categoryId);
                  const isExpense = transaction.type === "EXPENSE";
                  
                  return (
                    <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <input type="checkbox" className="rounded border-muted-foreground/30" />
                      </td>
                      <td className="py-3 text-sm font-medium">
                        {transaction.id.slice(0, 10).toUpperCase()}
                      </td>
                      <td className="py-3 text-sm">
                        {transaction.description || "No description"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: categoryDetails.color }}
                          />
                          <span className="text-sm">{categoryDetails.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "dd MMM yyyy")}
                        <span className="ml-2 text-xs">
                          {format(new Date(transaction.date), "h:mm a")}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                          {transaction.type === "EXPENSE" ? "Expense" : transaction.type === "INCOME" ? "Income" : "Transfer"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-sm font-medium ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isExpense ? '-' : '+'}{currency}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2



, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="text-muted-foreground">›</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
