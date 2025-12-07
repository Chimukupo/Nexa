"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  CreateAccountSchema,
  type AccountType,
} from "@workspace/validators";
import { useRouter } from "next/navigation";
import type { z } from "zod";

type AccountFormData = z.input<typeof CreateAccountSchema>;

interface AccountFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<AccountFormData>;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel?: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: "CASH", label: "Cash", description: "Physical cash on hand" },
  { value: "BANK", label: "Bank Account", description: "Checking or savings account" },
  { value: "MOBILE_MONEY", label: "Mobile Money", description: "Airtel Money, MTN MoMo, etc." },
  { value: "SAVINGS", label: "Savings", description: "Dedicated savings account" },
];

export function AccountForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "BANK",
      currentBalance: defaultValues?.currentBalance ?? 0,
      isArchived: defaultValues?.isArchived ?? false,
      currency: defaultValues?.currency,
    },
  });

  const selectedType = watch("type");

  const handleFormSubmit = async (data: AccountFormData) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      console.error("Failed to submit account:", error);
      // Error handling will be done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Account Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Account Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="e.g., Main Bank Account"
          className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {errors.name && (
          <p className="text-sm text-rose-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Account Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setValue("type", type.value)}
              className={`
                p-4 rounded-xl border transition-all text-left
                ${
                  selectedType === type.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50"
                }
              `}
            >
              <div className="font-medium text-sm text-foreground">{type.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-sm text-rose-500 mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* Initial/Current Balance */}
      <div>
        <label htmlFor="currentBalance" className="block text-sm font-medium text-foreground mb-2">
          {mode === "create" ? "Initial Balance" : "Current Balance"}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            K
          </span>
          <input
            id="currentBalance"
            type="number"
            step="0.01"
            {...register("currentBalance", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {errors.currentBalance && (
          <p className="text-sm text-rose-500 mt-1">{errors.currentBalance.message}</p>
        )}
        {mode === "create" && (
          <p className="text-xs text-muted-foreground mt-1">
            Enter the current balance in this account
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel || (() => router.back())}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </span>
          ) : (
            mode === "create" ? "Create Account" : "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

