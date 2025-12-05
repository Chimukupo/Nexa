import { z } from "zod";

/**
 * Shared enums
 */
export const CurrencyEnum = z.enum(["ZMW", "USD", "GBP", "ZAR"]);
export const FiscalProfileEnum = z.enum(["SALARIED", "FREELANCE"]);
export const AccountTypeEnum = z.enum([
  "CASH",
  "BANK",
  "MOBILE_MONEY",
  "SAVINGS",
]);
export const CategoryTypeEnum = z.enum(["NEEDS", "WANTS", "SAVINGS", "INCOME"]);
export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);
export const RecurringRuleTypeEnum = z.enum(["INCOME", "EXPENSE"]);
export const SavingsGoalStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

/**
 * Helpers
 */
const hexColorRegex = /^#(?:[0-9a-fA-F]{6})$/;
const optionalDate = z.coerce.date().optional();

/**
 * User Profile Schema
 */
export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  currency: CurrencyEnum.default("ZMW"),
  fiscalType: FiscalProfileEnum.default("SALARIED"),
  createdAt: optionalDate,
  updatedAt: optionalDate,
  onboardingCompleted: z.boolean().default(false),
});

/**
 * Account Schemas
 */
const AccountBaseSchema = z.object({
  name: z.string().min(1),
  type: AccountTypeEnum,
  currentBalance: z.number().finite(),
  isArchived: z.boolean().default(false),
  currency: CurrencyEnum.optional(),
});

export const CreateAccountSchema = AccountBaseSchema.extend({
  currentBalance: z.number().finite().default(0),
});

export const AccountSchema = AccountBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
});

export const UpdateAccountSchema = CreateAccountSchema.partial();

/**
 * Category Schemas
 */
const CategoryBaseSchema = z.object({
  name: z.string().min(1),
  type: CategoryTypeEnum,
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid 6-digit hex code"),
  icon: z.string().min(1),
  monthlyBudgetCap: z.number().nonnegative().optional(),
});

export const CreateCategorySchema = CategoryBaseSchema;

export const CategorySchema = CategoryBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
});

export const UpdateCategorySchema = CategoryBaseSchema.partial();

/**
 * Transaction Schemas
 */
const TransactionShape = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: TransactionTypeEnum,
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isRecurring: z.boolean().default(false),
  receiptUrl: z.string().url().optional(),
  tags: z.array(z.string().min(1)).optional(),
  grossAmount: z.coerce.number().nonnegative().optional(),
  deductions: z.coerce.number().nonnegative().optional(),
  toAccountId: z.string().optional(),
});

// Refinement function to be applied to transaction schemas
// Handles both full and partial schemas
const transactionRefinements = (
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
) => {
  // Only validate if type is provided (for partial schemas)
  if (data.type === "TRANSFER") {
    if (!data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transfers must include a destination account",
        path: ["toAccountId"],
      });
    } else if (data.toAccountId === data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Destination account must be different from source account",
        path: ["toAccountId"],
      });
    }
  }

  // Only validate if both grossAmount and amount are provided
  if (
    typeof data.grossAmount === "number" &&
    typeof data.amount === "number" &&
    data.grossAmount < data.amount
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Gross amount cannot be less than net amount",
      path: ["grossAmount"],
    });
  }

  if (data.deductions !== undefined && data.grossAmount === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Gross amount is required when specifying deductions",
      path: ["grossAmount"],
    });
  }
};

export const CreateTransactionSchema = TransactionShape.superRefine(
  transactionRefinements,
);

export const TransactionSchema = TransactionShape.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
}).superRefine(transactionRefinements);

export const UpdateTransactionSchema = TransactionShape.partial().superRefine(
  transactionRefinements,
);

/**
 * Recurring Rule Schemas
 */
const RecurringRuleBaseSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: RecurringRuleTypeEnum,
  dayOfMonth: z.number().int().min(1).max(31),
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  isActive: z.boolean().default(true),
  timezone: z.string().optional(),
});

export const CreateRecurringRuleSchema = RecurringRuleBaseSchema;

export const RecurringRuleSchema = RecurringRuleBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  lastRunDate: optionalDate,
  createdAt: optionalDate,
  updatedAt: optionalDate,
});

export const UpdateRecurringRuleSchema = RecurringRuleBaseSchema.partial();

/**
 * Savings Goal Schemas
 */
const SavingsGoalBaseSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().nonnegative().default(0),
  targetDate: z.coerce.date(),
  accountId: z.string().min(1),
  status: SavingsGoalStatusEnum.default("ACTIVE"),
});

export const CreateSavingsGoalSchema = SavingsGoalBaseSchema;

export const SavingsGoalSchema = SavingsGoalBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
});

export const UpdateSavingsGoalSchema = SavingsGoalBaseSchema.partial();

/**
 * Type exports
 */
export type Currency = z.infer<typeof CurrencyEnum>;
export type FiscalProfile = z.infer<typeof FiscalProfileEnum>;
export type AccountType = z.infer<typeof AccountTypeEnum>;
export type CategoryType = z.infer<typeof CategoryTypeEnum>;
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export type RecurringRuleType = z.infer<typeof RecurringRuleTypeEnum>;
export type SavingsGoalStatus = z.infer<typeof SavingsGoalStatusEnum>;

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type AccountInput = z.infer<typeof CreateAccountSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoryInput = z.infer<typeof CreateCategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionInput = z.infer<typeof CreateTransactionSchema>;
export type RecurringRule = z.infer<typeof RecurringRuleSchema>;
export type RecurringRuleInput = z.infer<typeof CreateRecurringRuleSchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;
export type SavingsGoalInput = z.infer<typeof CreateSavingsGoalSchema>;

