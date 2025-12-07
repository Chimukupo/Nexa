"use client";

import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@workspace/ui/components/separator";
import { QuickAddExpense } from "@/components/QuickAddExpense";

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with trigger */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[calc(100vh-4rem)] flex-1">
            {children}
          </div>
        </div>
      </SidebarInset>
      <QuickAddExpense />
    </SidebarProvider>
  );
}

