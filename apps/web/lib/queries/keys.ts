/**
 * Query Key Factories for TanStack Query
 * 
 * Provides type-safe, hierarchical query keys for cache management
 * and easy invalidation across the application.
 */

/**
 * Transaction Query Keys
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters?: TransactionFilters) =>
    [...transactionKeys.lists(), { filters }] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
} as const;

/**
 * Account Query Keys
 */
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters?: AccountFilters) =>
    [...accountKeys.lists(), { filters }] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
} as const;

/**
 * Category Query Keys
 */
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: CategoryFilters) =>
    [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
} as const;

/**
 * Recurring Rule Query Keys
 */
export const recurringRuleKeys = {
  all: ["recurringRules"] as const,
  lists: () => [...recurringRuleKeys.all, "list"] as const,
  list: (filters?: RecurringRuleFilters) =>
    [...recurringRuleKeys.lists(), { filters }] as const,
  details: () => [...recurringRuleKeys.all, "detail"] as const,
  detail: (id: string) => [...recurringRuleKeys.details(), id] as const,
} as const;

/**
 * User Query Keys
 */
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  settings: () => [...userKeys.all, "settings"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
} as const;

/**
 * Filter Types
 */
export type TransactionFilters = {
  accountId?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  startDate?: Date;
  endDate?: Date;
  userId?: string;
};

export type AccountFilters = {
  type?: "CASH" | "BANK" | "MOBILE_MONEY" | "SAVINGS";
  isArchived?: boolean;
  userId?: string;
};

export type CategoryFilters = {
  type?: "NEEDS" | "WANTS" | "SAVINGS" | "INCOME";
  userId?: string;
};

export type RecurringRuleFilters = {
  type?: "INCOME" | "EXPENSE";
  userId?: string;
};

