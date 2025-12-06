"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile } from "@/lib/hooks/useUserProfile";
import { CurrencyEnum, FiscalProfileEnum } from "@workspace/validators";
import { LogOut, User as UserIcon, Wallet, Briefcase } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
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
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and profile.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            {isEditing ? (
                 <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="block w-full rounded-lg border-input text-sm focus:border-primary focus:ring-primary font-semibold text-foreground"
                    placeholder="Your Name"
                 />
            ) : (
                <h2 className="text-lg font-semibold text-foreground">{profile?.displayName || user?.displayName || "User"}</h2>
            )}
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Currency</p>
                <p className="text-sm text-muted-foreground">Your primary currency for tracking.</p>
              </div>
            </div>
            {isEditing ? (
              <select 
                className="rounded-lg border-input text-sm focus:border-primary focus:ring-primary"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.value} ({c.symbol})</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-foreground">{profile?.currency}</span>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Employment Type</p>
                <p className="text-sm text-muted-foreground">Used for tailoring insights.</p>
              </div>
            </div>
            {isEditing ? (
              <select 
                className="rounded-lg border-input text-sm focus:border-primary focus:ring-primary"
                value={formData.fiscalType}
                onChange={(e) => setFormData({...formData, fiscalType: e.target.value})}
              >
                {FISCAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-foreground">
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
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
           {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-background border border-border text-foreground hover:bg-muted"
              >
                Cancel
              </button>
           )}
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Account Actions</h3>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        </CardContent>
      </Card>
    </div>
  );
}

