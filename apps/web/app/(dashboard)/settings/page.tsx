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
  const [formData, setFormData] = useState({
    displayName: "",
    currency: "ZMW",
    fiscalType: "SALARIED"
  });

  // Load initial data when entering edit mode or when profile loads
  const startEditing = () => {
    setFormData({
      displayName: profile?.displayName || user?.displayName || "",
      currency: profile?.currency || "ZMW",
      fiscalType: profile?.fiscalType || "SALARIED"
    });
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    try {
      // Update Firestore Profile
      await updateProfile.mutateAsync({
        displayName: formData.displayName,
        currency: CurrencyEnum.parse(formData.currency),
        fiscalType: FiscalProfileEnum.parse(formData.fiscalType),
      });

      // Update Auth Profile (if name changed)
      if (user && formData.displayName !== user.displayName) {
          const { updateProfile: updateAuthProfile } = await import("firebase/auth");
          await updateAuthProfile(user, { displayName: formData.displayName });
      }

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
          <div className="flex-1">
            {isEditing ? (
                 <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary font-semibold text-gray-900"
                    placeholder="Your Name"
                 />
            ) : (
                <h2 className="text-lg font-semibold text-gray-900">{profile?.displayName || user?.displayName || "User"}</h2>
            )}
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
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
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
                value={formData.fiscalType}
                onChange={(e) => setFormData({...formData, fiscalType: e.target.value})}
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
            onClick={() => isEditing ? handleSave() : startEditing()}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isEditing 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
           {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
           )}
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

