"use client";

import { Wallet, Building2, Smartphone, PiggyBank } from "lucide-react";
import type { Account } from "@workspace/validators";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

interface AccountCardProps {
  account: Account & { id: string };
  onClick?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
}

const ACCOUNT_ICONS = {
  CASH: Wallet,
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  SAVINGS: PiggyBank,
} as const;

export function AccountCard({
  account,
  onClick,
  onEdit,
  onArchive,
  onDelete,
  className = "",
}: AccountCardProps) {
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
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base line-clamp-1">
              {account.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {formatAccountType(account.type)}
            </p>
          </div>
        </div>
        
        {/* Archived Badge */}
        {account.isArchived && (
          <div className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
            Archived
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(account.currentBalance)}
        </div>
      </CardContent>

      {/* Actions */}
      {(onEdit || onArchive || onDelete) && (
        <CardFooter className="gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
          )}
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
            >
              Archive
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

