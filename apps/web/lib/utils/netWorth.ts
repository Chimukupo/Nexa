import type { Account } from "@workspace/validators";

/**
 * Calculate total net worth from accounts
 * Currently only includes assets (account balances)
 * Future: Include debts/liabilities for true net worth calculation
 */
export function calculateNetWorth(accounts: (Account & { id: string })[]): number {
  return accounts
    .filter((account) => !account.isArchived)
    .reduce((total, account) => total + account.currentBalance, 0);
}

/**
 * Calculate total balance by account type
 */
export function calculateBalanceByType(
  accounts: (Account & { id: string })[],
  type: Account["type"]
): number {
  return accounts
    .filter((account) => !account.isArchived && account.type === type)
    .reduce((total, account) => total + account.currentBalance, 0);
}

/**
 * Get account distribution (percentage of total per account type)
 */
export function getAccountDistribution(accounts: (Account & { id: string })[]) {
  const activeAccounts = accounts.filter((account) => !account.isArchived);
  const total = calculateNetWorth(activeAccounts);

  if (total === 0) {
    return [];
  }

  const types = ["CASH", "BANK", "MOBILE_MONEY", "SAVINGS"] as const;
  return types
    .map((type) => {
      const balance = calculateBalanceByType(activeAccounts, type);
      return {
        type,
        balance,
        percentage: (balance / total) * 100,
      };
    })
    .filter((item) => item.balance > 0);
}

