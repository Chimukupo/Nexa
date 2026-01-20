"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { CreateSavingsGoalSchema, type SavingsGoalInput } from "@workspace/validators";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { differenceInMonths } from "date-fns";
import { Calendar, DollarSign, Target } from "lucide-react";

interface SavingsGoalFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<SavingsGoalInput>;
  onSubmit: (data: SavingsGoalInput) => Promise<void>;
  onCancel?: () => void;
}

export function SavingsGoalForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: SavingsGoalFormProps) {
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateSavingsGoalSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      targetAmount: defaultValues?.targetAmount || 0,
      currentAmount: defaultValues?.currentAmount || 0,
      targetDate: defaultValues?.targetDate || new Date(),
      accountId: defaultValues?.accountId || "",
      description: defaultValues?.description || "",
    },
  });

  const targetAmount = watch("targetAmount");
  const currentAmount = watch("currentAmount");
  const targetDate = watch("targetDate");

  // Calculate monthly requirement
  const monthlyRequirement = useMemo(() => {
    if (!targetAmount || !targetDate) return 0;

    const remaining = targetAmount - (currentAmount || 0);
    if (remaining <= 0) return 0;

    const monthsLeft = differenceInMonths(new Date(targetDate), new Date());
    return monthsLeft > 0 ? remaining / monthsLeft : remaining;
  }, [targetAmount, currentAmount, targetDate]);

  const handleFormSubmit = async (data: SavingsGoalInput) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      console.error("Failed to submit savings goal:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Goal Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Goal Name
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="e.g., Vacation Fund, New Car, Emergency Fund"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {errors.name && (
          <p className="text-sm text-rose-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Target Amount */}
      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-foreground mb-2">
          Target Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground">
            K
          </span>
          <input
            id="targetAmount"
            type="number"
            step="0.01"
            {...register("targetAmount", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full pl-14 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {errors.targetAmount && (
          <p className="text-sm text-rose-500 mt-1">{errors.targetAmount.message}</p>
        )}
      </div>

      {/* Target Date */}
      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium text-foreground mb-2">
          Target Date
        </label>
        <DatePicker
          date={targetDate}
          onDateChange={(date) => setValue("targetDate", date || new Date())}
          minDate={new Date()}
          placeholder="Pick a target date"
        />
        {errors.targetDate && (
          <p className="text-sm text-rose-500 mt-1">{errors.targetDate.message as string}</p>
        )}
      </div>

      {/* Linked Account */}
      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-foreground mb-2">
          Linked Account
        </label>
        <Select
          value={watch("accountId")}
          onValueChange={(value) => setValue("accountId", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account to link" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id!}>
                {account.name} - K{account.currentBalance.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountId && (
          <p className="text-sm text-rose-500 mt-1">{errors.accountId.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Contributions will be deducted from this account
        </p>
      </div>

      {/* Description (Optional) */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Why are you saving for this goal?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
        {errors.description && (
          <p className="text-sm text-rose-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Monthly Requirement Calculation */}
      {monthlyRequirement > 0 && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Monthly Savings Requirement
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You need to save <strong>K{monthlyRequirement.toFixed(2)}/month</strong> to reach this goal on time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
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
            mode === "create" ? "Create Goal" : "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
