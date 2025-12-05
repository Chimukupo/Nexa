"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet, Building2, Smartphone, PiggyBank, MoreVertical } from "lucide-react";
import { useAccounts, useCreateAccount } from "@/lib/hooks/useAccounts";
import { AccountForm } from "@/components/forms/AccountForm";
import { Button } from "@workspace/ui/components/button";
import type { z } from "zod";
import { CreateAccountSchema } from "@workspace/validators";

type AccountFormData = z.input<typeof CreateAccountSchema>;

export default function AccountsPage() {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateAccount = async (data: AccountFormData) => {
    await createAccount.mutateAsync(data);
    setShowCreateForm(false);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return <Wallet className="w-5 h-5" />;
      case "BANK":
        return <Building2 className="w-5 h-5" />;
      case "MOBILE_MONEY":
        return <Smartphone className="w-5 h-5" />;
      case "SAVINGS":
        return <PiggyBank className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
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
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Create Account Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface/90 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-border/50 shadow-xl">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Create New Account
              </h2>
              <AccountForm
                mode="create"
                onSubmit={handleCreateAccount}
                onCancel={() => setShowCreateForm(false)}
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
                <div
                  key={account.id}
                  className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/accounts/${account.id}`)}
                >
                  {/* Account Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {getAccountIcon(account.type)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show account actions menu
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-surface/50 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account Name & Type */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {account.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 capitalize">
                    {account.type.toLowerCase().replace("_", " ")}
                  </p>

                  {/* Balance */}
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
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
              onClick={() => setShowCreateForm(true)}
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

