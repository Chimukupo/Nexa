"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { calculateNetWorth } from "@/lib/utils/netWorth";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();

  const totalBalance = calculateNetWorth(accounts || []);
  const activeAccounts = accounts?.filter((a) => !a.isArchived) || [];
  const hasAccounts = activeAccounts.length > 0;

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {profile?.displayName || user?.displayName || "User"}!
          </CardTitle>
          <CardDescription>
            Here's what's happening with your finances today.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Snapshot Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAccounts ? (
              <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {profile?.currency || "ZMW"} {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeAccounts.length} active {activeAccounts.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Income Card */}
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {profile?.currency || "ZMW"} 0.00
            </div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
              Coming in Phase 4
            </p>
          </CardContent>
        </Card>

        {/* Monthly Expenses Card */}
        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {profile?.currency || "ZMW"} 0.00
            </div>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">
              Coming in Phase 4
            </p>
          </CardContent>
        </Card>
      </div>

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
