"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  CreateTransactionSchema,
  type TransactionType,
} from "@workspace/validators";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useState } from "react";
import { ArrowRight, Wallet, CheckCircle2 } from "lucide-react";

type TransactionFormData = z.input<typeof CreateTransactionSchema>;

interface TransactionFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
];

export function TransactionForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const router = useRouter();
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();


  // Filter categories based on transaction type
  const getCategoriesByType = (type: TransactionType) => {
      if (!categories) return [];
      if (type === "INCOME") return categories.filter(c => c.type === "INCOME");
      // For expense, we might want NEEDS, WANTS, SAVINGS
      if (type === "EXPENSE") return categories.filter(c => ["NEEDS", "WANTS", "SAVINGS"].includes(c.type));
      return [];
  };
  
  // Default date to today if creating
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type: defaultValues?.type || "EXPENSE",
      amount: defaultValues?.amount, // undefined initially
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(), 
      description: defaultValues?.description || "",
      accountId: defaultValues?.accountId || "",
      categoryId: defaultValues?.categoryId || "",
      toAccountId: defaultValues?.toAccountId || "",
      grossAmount: defaultValues?.grossAmount,
      deductions: defaultValues?.deductions,
      isRecurring: defaultValues?.isRecurring ?? false,
    },
  });

  const selectedType = watch("type");
  const selectedAccountId = watch("accountId");
  const selectedToAccountId = watch("toAccountId");
  const selectedCategoryId = watch("categoryId");
  const amount = watch("amount");
  const grossAmount = watch("grossAmount");
  const deductions = watch("deductions");

  // Auto-calculate Net Pay in Advanced Mode
  const calculatedNet = (grossAmount || 0) - (deductions || 0);

  const activeCategories = getCategoriesByType(selectedType);
  const activeAccounts = accounts?.filter(a => !a.isArchived) || [];

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      console.error("Failed to submit transaction:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Type Selector */}
      <div className="flex p-1 bg-muted rounded-xl">
        {TRANSACTION_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => {
                setValue("type", type.value);
                setValue("categoryId", ""); // Reset category on type change
                setValue("toAccountId", ""); // Reset toAccount
            }}
            className={`
              flex-1 py-2 text-sm font-medium rounded-lg transition-all
              ${
                selectedType === type.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Amount
          </label>
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
               K
             </span>
             <input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-rose-500 mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
           <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Date
          </label>
           <input
            id="date"
            type="date"
            {...register("date", { valueAsDate: true })}
            defaultValue={today}
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.date && (
            <p className="text-sm text-rose-500 mt-1">{errors.date.message as string}</p>
          )}
        </div>
      </div>

      {/* Advanced Income Mode Toggle */}
      {selectedType === "INCOME" && (
        <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="advancedMode" 
                checked={isAdvancedMode} 
                onChange={(e) => setIsAdvancedMode(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="advancedMode" className="text-sm font-medium text-foreground">
                Advanced Mode (Gross Pay & Deductions)
            </label>
        </div>
      )}

      {/* Advanced Income Fields */}
      {selectedType === "INCOME" && isAdvancedMode && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-medium text-muted-foreground">Gross Amount</label>
                    <input 
                        type="number" 
                        {...register("grossAmount", { valueAsNumber: true })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 text-sm"
                        placeholder="0.00" 
                    />
                    {errors.grossAmount && <p className="text-xs text-rose-500">{errors.grossAmount.message}</p>}
                 </div>
                 <div>
                    <label className="text-xs font-medium text-muted-foreground">Deductions</label>
                    <input 
                        type="number" 
                        {...register("deductions", { valueAsNumber: true })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 text-sm"
                        placeholder="0.00" 
                    />
                 </div>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="text-sm font-medium">Calculated Net Pay:</span>
                    <span className={`text-lg font-bold ${calculatedNet < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        K {calculatedNet.toFixed(2)}
                    </span>
               </div>
          </div>
      )}

      {/* Accounts Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FROM Account (or Main Account) */}
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">
                {selectedType === "TRANSFER" ? "From Account" : "Account"}
            </label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {activeAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No accounts found.</p>
                )}
                {activeAccounts.map((account) => (
                    <button
                        key={account.id}
                        type="button"
                        onClick={() => setValue("accountId", account.id)}
                        className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                            selectedAccountId === account.id
                             ? "border-primary bg-primary/5 ring-1 ring-primary"
                             : "border-border/50 hover:border-border bg-card/50"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div className="text-left flex-1 truncate">
                            <div className="text-sm font-medium truncate">{account.name}</div>
                            <div className="text-xs text-muted-foreground">K {account.currentBalance.toFixed(2)}</div>
                        </div>
                        {selectedAccountId === account.id && <CheckCircle2 className="w-4 h-4 text-primary ml-2" />}
                    </button>
                ))}
            </div>
            {errors.accountId && <p className="text-sm text-rose-500 mt-1">{errors.accountId.message}</p>}
        </div>

        {/* TO Account (Transfer Only) */}
        {selectedType === "TRANSFER" && (
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">To Account</label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                     {activeAccounts.filter(a => a.id !== selectedAccountId).map((account) => (
                        <button
                            key={account.id}
                            type="button"
                            onClick={() => setValue("toAccountId", account.id)}
                            className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                                selectedToAccountId === account.id
                                 ? "border-primary bg-primary/5 ring-1 ring-primary"
                                 : "border-border/50 hover:border-border bg-card/50"
                            }`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary">
                                <Wallet className="w-4 h-4" />
                            </div>
                           <div className="text-left flex-1 truncate">
                                <div className="text-sm font-medium truncate">{account.name}</div>
                            </div>
                             {selectedToAccountId === account.id && <CheckCircle2 className="w-4 h-4 text-primary ml-2" />}
                        </button>
                    ))}
                </div>
                 {errors.toAccountId && <p className="text-sm text-rose-500 mt-1">{errors.toAccountId.message}</p>}
            </div>
        )}
        
        {/* Category Selection (Income/Expense Only) */}
         {selectedType !== "TRANSFER" && (
            <div>
                 <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                 <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {activeCategories?.length === 0 && (
                        <div className="col-span-2 text-sm text-muted-foreground p-2 border border-dashed rounded-lg text-center">
                            No categories found for {selectedType.toLowerCase()}.
                        </div>
                    )}
                    {activeCategories?.map((category) => (
                         <button
                            key={category.id}
                            type="button"
                            onClick={() => setValue("categoryId", category.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                                selectedCategoryId === category.id
                                 ? "border-primary bg-primary/5 ring-1 ring-primary"
                                 : "border-border/50 hover:border-border bg-card/50"
                            }`}
                        >
                             <div className="text-xl mb-1">
                                 {/* We assume category has icon, but for now just use emoji or first letter if simple string */}
                                 {/* Ideally we use an Icon component mapping, but for quick implementation: */}
                                 <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }}></div> 
                             </div>
                             <div className="text-xs font-medium truncate w-full">{category.name}</div>
                        </button>
                    ))}
                 </div>
                 {errors.categoryId && <p className="text-sm text-rose-500 mt-1">{errors.categoryId.message}</p>}
            </div>
         )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <input 
            id="description"
            type="text"
            {...register("description")}
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="What was this for?"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-border/50">
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
              Saving...
            </span>
          ) : (
            mode === "create" ? "Add Transaction" : "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
