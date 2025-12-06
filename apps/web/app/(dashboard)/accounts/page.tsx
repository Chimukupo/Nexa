"use client";

import { useState } from "react";
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
import type { z } from "zod";
import { CreateAccountSchema } from "@workspace/validators";

type AccountFormData = z.input<typeof CreateAccountSchema>;

type FormState =
  | { mode: "create" }
  | { mode: "edit"; accountId: string }
  | null;

export default function AccountsPage() {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const archiveAccount = useArchiveAccount();
  const deleteAccount = useDeleteAccount();

  const [formState, setFormState] = useState<FormState>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeAccount =
    formState && formState.mode === "edit" && accounts
      ? accounts.find((acc) => acc.id === formState.accountId)
      : undefined;

  const handleSubmitForm = async (data: AccountFormData) => {
    setErrorMessage(null);
    try {
      if (formState?.mode === "edit" && formState.accountId) {
        await updateAccount.mutateAsync({ id: formState.accountId, data });
        setStatusMessage("Account updated successfully.");
      } else {
        await createAccount.mutateAsync(data);
        setStatusMessage("Account created successfully.");
      }
      setFormState(null);
    } catch (error: unknown) {
      console.error("Failed to save account:", error);
      setErrorMessage("Something went wrong while saving the account. Please try again.");
    }
  };

  const handleArchiveAccount = async (accountId: string) => {
    setErrorMessage(null);
    try {
      await archiveAccount.mutateAsync(accountId);
      setStatusMessage("Account archived.");
    } catch (error: unknown) {
      console.error("Failed to archive account:", error);
      setErrorMessage("Could not archive the account. Please try again.");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const confirmed = window.confirm(
      "Deleting an account is permanent and cannot be undone. Are you sure you want to continue?",
    );
    if (!confirmed) return;

    setErrorMessage(null);
    try {
      await deleteAccount.mutateAsync(accountId);
      setStatusMessage("Account deleted.");
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      setErrorMessage("Could not delete the account. Please try again.");
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
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface/50 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-surface/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Accounts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your cash, bank accounts, and mobile money
            </p>
          </div>
          <Button
            onClick={() => {
              setFormState({ mode: "create" });
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Inline feedback */}
        {(statusMessage || errorMessage) && (
          <div className="mb-6 space-y-2">
            {statusMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Account Form Modal */}
        {formState && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface/90 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-border/50 shadow-xl">
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

        {/* Total Balance Card */}
        {accounts && accounts.length > 0 && (
          <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
            <h2 className="text-4xl font-bold text-foreground">
              {formatCurrency(
                accounts
                  .filter((acc) => !acc.isArchived)
                  .reduce((sum, acc) => sum + acc.currentBalance, 0)
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Across {accounts.filter((acc) => !acc.isArchived).length} active accounts
            </p>
          </div>
        )}

        {/* Accounts Grid */}
        {accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts
              .filter((account) => !account.isArchived)
              .map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => router.push(`/accounts/${account.id}`)}
                  onEdit={() => {
                    setFormState({ mode: "edit", accountId: account.id });
                    setStatusMessage(null);
                    setErrorMessage(null);
                  }}
                  onArchive={() => handleArchiveAccount(account.id)}
                  onDelete={() => handleDeleteAccount(account.id)}
                />
              ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-surface/50 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No accounts yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first account to start tracking your finances
            </p>
            <Button
              onClick={() => setFormState({ mode: "create" })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

