"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCreateUserProfile, useUserProfile } from "@/lib/hooks/useUserProfile";
import { CurrencyEnum, FiscalProfileEnum } from "@workspace/validators";
import { Check, ChevronRight, Wallet, Briefcase, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

const CURRENCIES = [
  { value: "ZMW", label: "Zambian Kwacha", symbol: "K" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "ZAR", label: "South African Rand", symbol: "R" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "AED", label: "UAE Dirham", symbol: "د.إ" },
];

const FISCAL_TYPES = [
  { 
    value: "SALARIED", 
    label: "Salaried", 
    description: "I receive a regular paycheck.",
    icon: Briefcase 
  },
  { 
    value: "FREELANCE", 
    label: "Freelance / Self-Employed", 
    description: "My income varies or comes from multiple sources.",
    icon: Wallet 
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const createUserProfile = useCreateUserProfile();
  
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState<string>("ZMW");
  const [fiscalType, setFiscalType] = useState<"SALARIED" | "FREELANCE">("SALARIED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user already has a completed profile, redirect to dashboard
    if (userProfile?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [userProfile, router]);

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Basic parsing of enums to match Zod schema expectations
      // In a real app, ensure strict type safety
      const selectedCurrency = CurrencyEnum.parse(currency);
      const selectedFiscalType = FiscalProfileEnum.parse(fiscalType);

      await createUserProfile.mutateAsync({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "User",
        currency: selectedCurrency,
        fiscalType: selectedFiscalType,
        onboardingCompleted: true,
        createdAt: Timestamp.now().toDate(),
        updatedAt: Timestamp.now().toDate(),
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      setIsSubmitting(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm font-medium text-gray-500">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Currency */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Select Currency</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Choose your primary currency for tracking finances.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCurrency(c.value)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all min-h-[100px]",
                  currency === c.value
                    ? "border-primary bg-blue-50 dark:bg-blue-950/30 ring-1 ring-primary"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {currency === c.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-lg font-semibold shadow-sm mb-2">
                  {c.symbol}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{c.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.value}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Fiscal Profile */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employment Type</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">This helps us tailor your financial insights.</p>
          </div>
          
          <div className="grid gap-4">
            {FISCAL_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFiscalType(type.value as "SALARIED" | "FREELANCE")}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                  fiscalType === type.value
                    ? "border-primary bg-blue-50 dark:bg-blue-950/30 ring-1 ring-primary"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  fiscalType === type.value ? "bg-white dark:bg-gray-800 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                )}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                    {fiscalType === type.value && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Complete */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Almost There!</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Review your details to complete setup.</p>
          </div>
          
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-sm">
                  <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Currency</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {CURRENCIES.find(c => c.value === currency)?.label} ({currency})
                  </p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-sm font-medium text-primary">Change</button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-sm">
                  <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employment</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {FISCAL_TYPES.find(t => t.value === fiscalType)?.label}
                  </p>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="text-sm font-medium text-primary">Change</button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Setting up..." : "Complete Setup"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

