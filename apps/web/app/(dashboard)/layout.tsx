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
    <div className="relative min-h-screen bg-slate-950 text-foreground">
      {/* Soft gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),_transparent_55%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <span className="text-sm font-semibold">N</span>
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                Nexa
              </span>
            </div>
            <nav className="flex gap-4 text-sm font-medium">
              <a
                href="/dashboard"
                className="rounded-full border border-transparent bg-background/40 px-4 py-2 text-foreground shadow-sm shadow-black/10 backdrop-blur hover:border-primary/40 hover:bg-background/80"
              >
                Overview
              </a>
              <a
                href="/dashboard/settings"
                className="rounded-full border border-border/40 bg-background/30 px-4 py-2 text-muted-foreground shadow-sm shadow-black/5 backdrop-blur hover:text-foreground"
              >
                Settings
              </a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

