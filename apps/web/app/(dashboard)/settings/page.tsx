"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile } from "@/lib/hooks/useUserProfile";
import { CurrencyEnum, FiscalProfileEnum } from "@workspace/validators";
import { LogOut, User as UserIcon, Wallet, Briefcase } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { value: "ZMW", label: "Zambian Kwacha", symbol: "K" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "ZAR", label: "South African Rand", symbol: "R" },
  { value: "EUR", label: "Euro", symbol: "€" },
];

const FISCAL_TYPES = [
  { value: "SALARIED", label: "Salaried" },
  { value: "FREELANCE", label: "Freelance / Self-Employed" },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleUpdateProfile = async (currency: string, fiscalType: string) => {
    try {
      await updateProfile.mutateAsync({
        currency: CurrencyEnum.parse(currency),
        fiscalType: FiscalProfileEnum.parse(fiscalType),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account preferences and profile.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile?.displayName || user?.displayName || "User"}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Currency</p>
                <p className="text-sm text-gray-500">Your primary currency for tracking.</p>
              </div>
            </div>
            {isEditing ? (
              <select 
                className="rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary"
                defaultValue={profile?.currency || "ZMW"}
                onChange={(e) => handleUpdateProfile(e.target.value, profile?.fiscalType || "SALARIED")}
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.value} ({c.symbol})</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-gray-900">{profile?.currency}</span>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Employment Type</p>
                <p className="text-sm text-gray-500">Used for tailoring insights.</p>
              </div>
            </div>
            {isEditing ? (
              <select 
                className="rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary"
                defaultValue={profile?.fiscalType || "SALARIED"}
                onChange={(e) => handleUpdateProfile(profile?.currency || "ZMW", e.target.value)}
              >
                {FISCAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {FISCAL_TYPES.find(t => t.value === profile?.fiscalType)?.label}
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isEditing 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                : "bg-primary text-white hover:bg-blue-600"
            )}
          >
            {isEditing ? "Done" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

