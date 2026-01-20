"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useArchiveAccount,
  useDeleteAccount,
} from "@/lib/hooks/useAccounts";
import { AccountForm } from "@/components/forms/AccountForm";
import { AccountCard } from "@/components/widgets/AccountCard";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
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
import { CreateAccountSchema } from "@workspace/validators";

type AccountFormData = z.input<typeof CreateAccountSchema>;

type FormState =
  | { mode: "create" }
  | { mode: "edit"; accountId: string }
  | null;

export default function AccountsPage(): React.JSX.Element {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const archiveAccount = useArchiveAccount();
  const deleteAccount = useDeleteAccount();

  const [formState, setFormState] = useState<FormState>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const activeAccount =
    formState && formState.mode === "edit" && accounts
      ? accounts.find((acc) => acc.id === formState.accountId)
      : undefined;

  const handleSubmitForm = async (data: AccountFormData) => {
    try {
      if (formState?.mode === "edit" && formState.accountId) {
        await updateAccount.mutateAsync({ id: formState.accountId, data });
        toast.success("Account updated successfully");
     } else {
        await createAccount.mutateAsync(data);
        toast.success("Account created successfully");
      }
      setFormState(null);
    } catch (error: unknown) {
      console.error("Failed to save account:", error);
      toast.error("Failed to save account. Please try again.");
    }
  };

  const handleArchiveAccount = async (accountId: string) => {
    try {
      await archiveAccount.mutateAsync(accountId);
      toast.success("Account archived successfully");
    } catch (error: unknown) {
      console.error("Failed to archive account:", error);
      toast.error("Failed to archive account. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await deleteAccount.mutateAsync(accountToDelete);
      toast.success("Account deleted successfully");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeAccounts = accounts?.filter((a) => !a.isArchived) || [];
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cash, bank accounts, and mobile money
          </p>
        </div>
        <Button
          onClick={() => setFormState({ mode: "create" })}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {/* Create / Edit Account Form Modal */}
      {formState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full border shadow-xl">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {formState.mode === "create" ? "Create New Account" : "Edit Account"}
            </h2>
            <AccountForm
              mode={formState.mode}
              defaultValues={
                formState.mode === "edit" && activeAccount
                  ? {
                      name: activeAccount.name,
                      type: activeAccount.type,
                      currentBalance: activeAccount.currentBalance,
                      isArchived: activeAccount.isArchived,
                      currency: activeAccount.currency,
                    }
                  : undefined
              }
              onSubmit={handleSubmitForm}
              onCancel={() => setFormState(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting an account is permanent and cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Total Balance Card */}
      {activeAccounts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {activeAccounts.length} active {activeAccounts.length === 1 ? "account" : "accounts"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      {activeAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => setFormState({ mode: "edit", accountId: account.id })}
              onArchive={() => handleArchiveAccount(account.id)}
              onDelete={() => {
                setAccountToDelete(account.id);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="mb-2">No accounts yet</CardTitle>
            <CardDescription className="mb-6 max-w-sm">
              Create your first account to start tracking your finances and managing your money.
            </CardDescription>
            <Button onClick={() => setFormState({ mode: "create" })}>
              Create Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
