"use client";

import { useState } from "react";
import { Plus, Filter, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";
import type { z } from "zod";
import { CreateTransactionSchema, TransactionType } from "@workspace/validators";

type TransactionFormData = z.input<typeof CreateTransactionSchema>;

type FormState =
  | { mode: "create" }
  | { mode: "edit"; transactionId: string }
  | null;

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<TransactionType | "ALL">("ALL");
  const { data: transactions, isLoading } = useTransactions({
    type: filterType === "ALL" ? undefined : filterType,
  });
  
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [formState, setFormState] = useState<FormState>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const activeTransaction =
    formState && formState.mode === "edit" && transactions
      ? transactions.find((t) => t.id === formState.transactionId)
      : undefined;

  const handleSubmitForm = async (data: TransactionFormData) => {
    try {
      // Ensure isRecurring has a value (default to false if undefined)
      const transactionData = {
        ...data,
        isRecurring: data.isRecurring ?? false,
      };
      
      if (formState?.mode === "edit" && formState.transactionId) {
        await updateTransaction.mutateAsync({ id: formState.transactionId, data: transactionData });
        toast.success("Transaction updated successfully");
      } else {
        await createTransaction.mutateAsync(transactionData);
        toast.success("Transaction added successfully");
      }
      setFormState(null);
    } catch (error) {
      console.error("Failed to save transaction", error);
      toast.error("Failed to save transaction. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteTransaction.mutateAsync(transactionToDelete);
      toast.success("Transaction deleted successfully");
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Failed to delete transaction", error);
      toast.error("Failed to delete transaction. Please try again.");
    }
  };

  const getCategoryName = (id: string) => {
      return categories?.find(c => c.id === id)?.name || "Uncategorized";
  };
  
  const getAccountName = (id: string) => {
      return accounts?.find(a => a.id === id)?.name || "Unknown Account";
  };

  const getTransactionIcon = (type: TransactionType) => {
      if (type === "INCOME") return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      if (type === "EXPENSE") return <ArrowUpRight className="w-5 h-5 text-rose-500" />;
      return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Track your income and expenses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setFormState({ mode: "create" })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Filter Tabs */}
        <Tabs value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | "ALL")}>
          <TabsList className="bg-card p-1 rounded-xl shadow-sm border">
            <TabsTrigger 
                value="ALL" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
                All
            </TabsTrigger>
            <TabsTrigger 
                value="INCOME" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
                Income
            </TabsTrigger>
            <TabsTrigger 
                value="EXPENSE" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
                Expense
            </TabsTrigger>
            <TabsTrigger 
                value="TRANSFER" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
                Transfer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Transactions List */}
        <Card className="rounded-2xl overflow-hidden shadow-sm">
           <CardContent className="p-0">
            {isLoading ? (
                 <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
            ) : transactions?.length === 0 ? (
                 <div className="p-16 text-center">
                     <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                         <Filter className="w-8 h-8 text-muted-foreground/50" />
                     </div>
                     <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
                     <p className="text-muted-foreground mt-1 mb-6">
                         Get started by adding your first transaction.
                     </p>
                     <Button onClick={() => setFormState({ mode: "create" })}>
                         Create Transaction
                     </Button>
                 </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Date</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Description</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Category</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Account</th>
                                <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                <th className="px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {transactions?.map((txn) => (
                                <tr key={txn.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="py-4 px-6 text-sm text-foreground whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(txn.type)}
                                            {format(txn.date, "MMM d, yyyy")}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-foreground font-medium">
                                        {txn.description || "No description"}
                                        {txn.isRecurring && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Recurring</span>}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground">
                                        {txn.categoryId ? getCategoryName(txn.categoryId) : "-"}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground">
                                        {getAccountName(txn.accountId)}
                                        {txn.type === "TRANSFER" && txn.toAccountId && (
                                            <span className="flex items-center gap-1 text-xs mt-0.5">
                                                <ArrowRight className="w-3 h-3" /> {getAccountName(txn.toAccountId)}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`py-4 px-6 text-sm font-bold text-right ${
                                        txn.type === "INCOME" ? "text-emerald-600" : 
                                        txn.type === "EXPENSE" ? "text-rose-600" : "text-foreground"
                                    }`}>
                                        {txn.type === "EXPENSE" ? "-" : "+"} 
                                        K {txn.amount.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                            <button 
                                                onClick={() => setFormState({ mode: "edit", transactionId: txn.id })}
                                                className="text-xs font-medium text-muted-foreground hover:text-primary"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                  setTransactionToDelete(txn.id);
                                                  setDeleteDialogOpen(true);
                                                }}
                                                className="text-xs font-medium text-muted-foreground hover:text-rose-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </CardContent>
        </Card>

        {/* Modal */}
        {formState && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl p-6 md:p-8 max-w-lg w-full border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                {formState.mode === "create" ? "Add Transaction" : "Edit Transaction"}
              </h2>
              <TransactionForm
                mode={formState.mode}
                defaultValues={
                  formState.mode === "edit" && activeTransaction
                    ? {
                        ...activeTransaction,
                        date: activeTransaction.date, // Hook handles Date object
                      }
                    : undefined
                }
                onSubmit={handleSubmitForm}
                onCancel={() => setFormState(null)}
              />
            </div>
          </div>
        )}
    </div>
  );
}
