"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Form Area */}
      <div
        className={`flex w-full flex-col justify-center px-8 lg:px-24 xl:px-32 ${
          isOnboarding ? "max-w-xl mx-auto" : "lg:w-1/2"
        }`}
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Nexa
          </span>
        </div>
        {children}
      </div>

      {/* Right Side - Abstract Background (hidden on onboarding) */}
      {!isOnboarding && (
        <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:block">
          {/* Abstract Wave/Liquid Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-800">
            <div className="absolute -left-24 -top-24 h-[600px] w-[600px] rounded-full bg-blue-400/30 blur-3xl filter" />
            <div className="absolute -right-24 -bottom-24 h-[600px] w-[600px] rounded-full bg-purple-500/30 blur-3xl filter" />
            <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl filter" />
          </div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm text-blue-100">
                &copy; {new Date().getFullYear()} Nexa Finance. All rights reserved.
              </p>
              <p className="mt-2 text-xs text-blue-200">
                Unauthorized use or reproduction of any content or materials from
                this site is prohibited. For more information, visit our Terms of
                Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

