/**
 * Curated list of Lucide icons suitable for financial categories
 * Organized by common use cases
 */
export const CATEGORY_ICONS = [
  // Housing & Utilities
  "Home",
  "Building",
  "Zap",
  "Droplet",
  "Wifi",
  "Flame",
  
  // Transportation
  "Car",
  "Bus",
  "Train",
  "Plane",
  "Bike",
  "Fuel",
  
  // Food & Dining
  "ShoppingCart",
  "ShoppingBag",
  "UtensilsCrossed",
  "Coffee",
  "Pizza",
  "Apple",
  
  // Entertainment & Leisure
  "Film",
  "Music",
  "Gamepad2",
  "Tv",
  "Camera",
  "Palette",
  
  // Finance & Money
  "Wallet",
  "CreditCard",
  "Banknote",
  "DollarSign",
  "PiggyBank",
  "TrendingUp",
  "TrendingDown",
  "Target",
  
  // Work & Income
  "Briefcase",
  "Laptop",
  "Rocket",
  "Building2",
  "GraduationCap",
  
  // Health & Wellness
  "Heart",
  "Activity",
  "Pill",
  "Stethoscope",
  "Dumbbell",
  
  // Shopping & Personal
  "Gift",
  "Shirt",
  "Watch",
  "Sparkles",
  "Scissors",
  
  // Communication & Tech
  "Smartphone",
  "Mail",
  "Phone",
  "Headphones",
  
  // Protection & Security
  "Shield",
  "Lock",
  "Key",
  
  // Miscellaneous
  "Star",
  "Flag",
  "Bookmark",
  "Tag",
  "Package",
  "Box",
  "Wrench",
  "Settings",
] as const;

export type CategoryIconName = typeof CATEGORY_ICONS[number];

/**
 * Predefined color palette for categories
 * Using Tailwind color values for consistency
 */
export const CATEGORY_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#10B981" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Slate", value: "#64748B" },
] as const;
