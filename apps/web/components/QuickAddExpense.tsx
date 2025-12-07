"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useCreateTransaction } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

/**
 * Quick Add Expense Component
 * Implements the 3-click rule for rapid expense entry
 * - Click 1: Open modal
 * - Click 2: Select category
 * - Click 3: Confirm amount
 */
export function QuickAddExpense() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createTransaction = useCreateTransaction();

  // Get top 6 expense categories (NEEDS + WANTS)
  const topCategories = categories
    ?.filter((c) => c.type === "NEEDS" || c.type === "WANTS")
    .slice(0, 6) || [];

  // Get default account (first active account)
  const defaultAccount = accounts?.find((a) => !a.isArchived);

  // Keyboard shortcut: Cmd/Ctrl + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        resetForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const resetForm = () => {
    setAmount("");
    setSelectedCategoryId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedCategoryId || !defaultAccount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        amount: amountNum,
        type: "EXPENSE",
        accountId: defaultAccount.id!,
        categoryId: selectedCategoryId,
        date: new Date(),
        description: "",
        isRecurring: false,
      });

      toast.success("Expense added successfully");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  // Auto-focus amount input when modal opens
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById("quick-add-amount");
      input?.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40 group"
        title="Quick Add Expense (Cmd/Ctrl + E)"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Quick Add (⌘E)
        </span>
      </button>

      {/* Quick Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/50 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Quick Add Expense</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label htmlFor="quick-add-amount" className="block text-sm font-medium text-foreground mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                    K
                  </span>
                  <input
                    id="quick-add-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-semibold rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Quick Select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {topCategories.map((category) => {
                    const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id!)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedCategoryId === category.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                          style={{ backgroundColor: category.color }}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                        </div>
                        <p className="text-xs font-medium text-foreground text-center truncate">
                          {category.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Info */}
              {defaultAccount && (
                <p className="text-sm text-muted-foreground text-center">
                  Will be deducted from: <span className="font-medium text-foreground">{defaultAccount.name}</span>
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!amount || !selectedCategoryId || createTransaction.isPending}
              >
                {createTransaction.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  "Add Expense"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Press <kbd className="px-2 py-1 bg-muted rounded text-foreground">Enter</kbd> to submit
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
