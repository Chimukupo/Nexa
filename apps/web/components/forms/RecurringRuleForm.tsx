"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRecurringRuleSchema, type RecurringRuleInput, type RecurringRule } from "@workspace/validators";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { Loader2 } from "lucide-react";

interface RecurringRuleFormProps {
  defaultValues?: Partial<RecurringRule>;
  onSubmit: (data: RecurringRuleInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function RecurringRuleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RecurringRuleFormProps) {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateRecurringRuleSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amount: defaultValues?.amount || 0,
      type: defaultValues?.type || "INCOME",
      dayOfMonth: defaultValues?.dayOfMonth || 1,
      accountId: defaultValues?.accountId || "",
      categoryId: defaultValues?.categoryId || "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const selectedType = watch("type");
  const activeAccounts = accounts?.filter((a) => !a.isArchived) || [];
  const filteredCategories = categories?.filter((c) => {
    if (selectedType === "INCOME") return c.type === "INCOME";
    return c.type === "NEEDS" || c.type === "WANTS" || c.type === "SAVINGS";
  }) || [];

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          placeholder="e.g., Monthly Salary"
          {...register("name")}
          className="bg-card"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue("type", value as "INCOME" | "EXPENSE")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            K
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
            className="pl-8 bg-card"
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Day of Month */}
      <div className="space-y-2">
        <Label htmlFor="dayOfMonth">Day of Month</Label>
        <Select
          value={watch("dayOfMonth")?.toString()}
          onValueChange={(value) => setValue("dayOfMonth", parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {dayOptions.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of the month
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dayOfMonth && (
          <p className="text-sm text-destructive">{errors.dayOfMonth.message}</p>
        )}
      </div>

      {/* Account */}
      <div className="space-y-2">
        <Label htmlFor="accountId">Account</Label>
        <Select
          value={watch("accountId")}
          onValueChange={(value) => setValue("accountId", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {activeAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id!}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountId && (
          <p className="text-sm text-destructive">{errors.accountId.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={watch("categoryId")}
          onValueChange={(value) => setValue("categoryId", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id!}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Rule" : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}
