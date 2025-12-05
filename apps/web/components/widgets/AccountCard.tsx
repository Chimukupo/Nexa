"use client";

import { Wallet, Building2, Smartphone, PiggyBank, MoreVertical } from "lucide-react";
import type { Account } from "@workspace/validators";

interface AccountCardProps {
  account: Account & { id: string };
  onClick?: () => void;
  onAction?: () => void;
  className?: string;
}

const ACCOUNT_ICONS = {
  CASH: Wallet,
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  SAVINGS: PiggyBank,
};

export function AccountCard({ account, onClick, onAction, className = "" }: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type] || Wallet;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatAccountType = (type: string) => {
    return type.toLowerCase().replace("_", " ");
  };

  return (
    <div
      className={`group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:shadow-lg transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Account Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="w-8 h-8 rounded-lg hover:bg-surface/50 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Account Name & Type */}
      <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
        {account.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 capitalize">
        {formatAccountType(account.type)}
      </p>

      {/* Balance */}
      <p className="text-2xl font-bold text-foreground">
        {formatCurrency(account.currentBalance)}
      </p>

      {/* Archived Badge */}
      {account.isArchived && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
          Archived
        </div>
      )}
    </div>
  );
}

