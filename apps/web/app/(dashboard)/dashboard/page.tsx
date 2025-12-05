"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.displayName || user?.displayName || "User"}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-medium text-muted-foreground">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-medium text-muted-foreground">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-500">
             {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-medium text-muted-foreground">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-rose-500">
             {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
      </div>
    </div>
  );
}



