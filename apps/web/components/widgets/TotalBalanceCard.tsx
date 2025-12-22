"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Account } from "@workspace/validators";

interface TotalBalanceCardProps {
  accounts: (Account & { id: string })[];
  currency?: string;
  previousMonthBalance?: number;
  isLoading?: boolean;
}

export function TotalBalanceCard({
  accounts,
  currency = "K",
  previousMonthBalance,
  isLoading = false,
}: TotalBalanceCardProps) {
  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.isArchived),
    [accounts]
  );

  const totalBalance = useMemo(
    () => activeAccounts.reduce((sum, a) => sum + a.currentBalance, 0),
    [activeAccounts]
  );

  // Calculate percentage for each account
  const accountsWithPercentage = useMemo(() => {
    return activeAccounts.map((account) => ({
      ...account,
      percentage:
        totalBalance > 0
          ? Math.round((account.currentBalance / totalBalance) * 100)
          : 0,
    }));
  }, [activeAccounts, totalBalance]);

  // Calculate change from last month
  const changeFromLastMonth = useMemo(() => {
    if (previousMonthBalance === undefined) return null;
    return totalBalance - previousMonthBalance;
  }, [totalBalance, previousMonthBalance]);

  const changePercentage = useMemo(() => {
    if (previousMonthBalance === undefined || previousMonthBalance === 0)
      return null;
    return ((totalBalance - previousMonthBalance) / previousMonthBalance) * 100;
  }, [totalBalance, previousMonthBalance]);

  // Account type colors
  const getAccountColor = (type: string) => {
    switch (type) {
      case "BANK":
        return "bg-blue-500";
      case "CASH":
        return "bg-emerald-500";
      case "MOBILE_MONEY":
        return "bg-purple-500";
      case "SAVINGS":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted/50 mb-2" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          Total Balance
          <span className="text-muted-foreground/50 text-xs">ⓘ</span>
        </CardTitle>
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
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div>
          <div className="text-3xl font-bold tracking-tight">
            {currency}
            {totalBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {changeFromLastMonth !== null && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-sm font-medium ${changeFromLastMonth >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {currency}
                {Math.abs(changeFromLastMonth).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {changeFromLastMonth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className="text-sm text-muted-foreground">
                from Last Month
              </span>
            </div>
          )}
        </div>

        {/* Account Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Account
            <span className="text-muted-foreground/50">ⓘ</span>
          </div>

          {accountsWithPercentage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts yet</p>
          ) : (
            <div className="space-y-2">
              {accountsWithPercentage.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getAccountColor(account.type)}`}
                    />
                    <span className="text-sm font-medium">{account.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {account.percentage}%
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {currency}
                    {account.currentBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" className="flex-1">
            + Record
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Transfer</DropdownMenuItem>
              <DropdownMenuItem>New Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
