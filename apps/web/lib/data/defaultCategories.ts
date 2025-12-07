import type { CategoryInput } from "@workspace/validators";

/**
 * Default categories to be created for new users
 * Organized by type: NEEDS, WANTS, SAVINGS, INCOME
 */
export const DEFAULT_CATEGORIES: Omit<CategoryInput, "userId">[] = [
  // NEEDS - Essential expenses (50% of income in 50/30/20 rule)
  {
    name: "Rent/Mortgage",
    type: "NEEDS",
    color: "#8B5CF6", // Purple
    icon: "Home",
    monthlyBudgetCap: 0, // User will set this
  },
  {
    name: "Utilities",
    type: "NEEDS",
    color: "#F59E0B", // Amber
    icon: "Zap",
    monthlyBudgetCap: 0,
  },
  {
    name: "Groceries",
    type: "NEEDS",
    color: "#10B981", // Emerald
    icon: "ShoppingCart",
    monthlyBudgetCap: 0,
  },
  {
    name: "Transport",
    type: "NEEDS",
    color: "#3B82F6", // Blue
    icon: "Car",
    monthlyBudgetCap: 0,
  },
  {
    name: "Insurance",
    type: "NEEDS",
    color: "#6366F1", // Indigo
    icon: "Shield",
    monthlyBudgetCap: 0,
  },
  {
    name: "Healthcare",
    type: "NEEDS",
    color: "#EF4444", // Red
    icon: "Heart",
    monthlyBudgetCap: 0,
  },
  {
    name: "Debt Payments",
    type: "NEEDS",
    color: "#DC2626", // Dark Red
    icon: "CreditCard",
    monthlyBudgetCap: 0,
  },

  // WANTS - Discretionary spending (30% of income in 50/30/20 rule)
  {
    name: "Dining Out",
    type: "WANTS",
    color: "#F97316", // Orange
    icon: "UtensilsCrossed",
    monthlyBudgetCap: 0,
  },
  {
    name: "Entertainment",
    type: "WANTS",
    color: "#EC4899", // Pink
    icon: "Film",
    monthlyBudgetCap: 0,
  },
  {
    name: "Shopping",
    type: "WANTS",
    color: "#A855F7", // Purple
    icon: "ShoppingBag",
    monthlyBudgetCap: 0,
  },
  {
    name: "Subscriptions",
    type: "WANTS",
    color: "#06B6D4", // Cyan
    icon: "Tv",
    monthlyBudgetCap: 0,
  },
  {
    name: "Hobbies",
    type: "WANTS",
    color: "#14B8A6", // Teal
    icon: "Palette",
    monthlyBudgetCap: 0,
  },
  {
    name: "Travel",
    type: "WANTS",
    color: "#0EA5E9", // Sky
    icon: "Plane",
    monthlyBudgetCap: 0,
  },
  {
    name: "Personal Care",
    type: "WANTS",
    color: "#F472B6", // Pink
    icon: "Sparkles",
    monthlyBudgetCap: 0,
  },

  // SAVINGS - Savings and investments (20% of income in 50/30/20 rule)
  {
    name: "Emergency Fund",
    type: "SAVINGS",
    color: "#059669", // Green
    icon: "Wallet",
    monthlyBudgetCap: 0,
  },
  {
    name: "Investments",
    type: "SAVINGS",
    color: "#0891B2", // Cyan
    icon: "TrendingUp",
    monthlyBudgetCap: 0,
  },
  {
    name: "Retirement",
    type: "SAVINGS",
    color: "#7C3AED", // Violet
    icon: "PiggyBank",
    monthlyBudgetCap: 0,
  },
  {
    name: "Savings Goal",
    type: "SAVINGS",
    color: "#16A34A", // Green
    icon: "Target",
    monthlyBudgetCap: 0,
  },

  // INCOME - Income sources
  {
    name: "Salary",
    type: "INCOME",
    color: "#10B981", // Emerald
    icon: "Briefcase",
    monthlyBudgetCap: 0,
  },
  {
    name: "Freelance",
    type: "INCOME",
    color: "#06B6D4", // Cyan
    icon: "Laptop",
    monthlyBudgetCap: 0,
  },
  {
    name: "Side Hustle",
    type: "INCOME",
    color: "#8B5CF6", // Purple
    icon: "Rocket",
    monthlyBudgetCap: 0,
  },
  {
    name: "Dividends",
    type: "INCOME",
    color: "#0891B2", // Cyan
    icon: "TrendingUp",
    monthlyBudgetCap: 0,
  },
  {
    name: "Gifts",
    type: "INCOME",
    color: "#EC4899", // Pink
    icon: "Gift",
    monthlyBudgetCap: 0,
  },
  {
    name: "Other Income",
    type: "INCOME",
    color: "#6366F1", // Indigo
    icon: "DollarSign",
    monthlyBudgetCap: 0,
  },
];
