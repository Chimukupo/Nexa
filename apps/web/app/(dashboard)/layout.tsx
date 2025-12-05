"use client";

import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();
  
  const loading = authLoading || (!!user && profileLoading);

  React.useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!profileLoading && !profile?.onboardingCompleted) {
        router.push("/onboarding");
      }
    }
  }, [user, authLoading, profile, profileLoading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Temporary Header for Navigation */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Nexa</h1>
          <nav className="flex gap-4">
            <a href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary">
              Overview
            </a>
            <a href="/dashboard/settings" className="text-sm font-medium text-gray-700 hover:text-primary">
              Settings
            </a>
          </nav>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

