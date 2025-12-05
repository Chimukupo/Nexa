"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.displayName || user?.displayName || "User"}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
             {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
             {profile?.currency || "ZMW"} 0.00
          </p>
        </div>
      </div>
    </div>
  );
}

