"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { calculateNetWorth } from "@/lib/utils/netWorth";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();

  const totalBalance = calculateNetWorth(accounts || []);
  const activeAccounts = accounts?.filter((a) => !a.isArchived) || [];
  const hasAccounts = activeAccounts.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.displayName || user?.displayName || "User"}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-medium text-muted-foreground">Total Balance</h3>
          {isLoadingAccounts ? (
            <div className="mt-2 h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-foreground">
              {profile?.currency || "ZMW"} {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm opacity-50">
          <h3 className="font-medium text-muted-foreground">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-500">
             {profile?.currency || "ZMW"} 0.00
          </p>
          <p className="text-xs text-muted-foreground mt-1">Coming in Phase 4</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm opacity-50">
          <h3 className="font-medium text-muted-foreground">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-rose-500">
             {profile?.currency || "ZMW"} 0.00
          </p>
          <p className="text-xs text-muted-foreground mt-1">Coming in Phase 4</p>
        </div>
      </div>

      {/* Empty State CTA */}
      {!isLoadingAccounts && !hasAccounts && (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center">
            <h3 className="text-lg font-medium text-foreground">No accounts found</h3>
            <p className="mt-2 text-muted-foreground">Create your first account to start tracking your finances.</p>
            <Link href="/accounts" className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Create Account
            </Link>
        </div>
      )}
    </div>
  );
}



