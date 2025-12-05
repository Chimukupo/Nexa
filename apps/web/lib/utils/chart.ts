/**
 * Chart configuration utilities for Recharts
 * 
 * Provides theme colors and default configurations matching
 * the Nexa design system.
 */

/**
 * Chart theme colors matching Nexa design system
 */
export const chartColors = {
  // Primary brand color
  primary: "#007AFF", // Apple Blue
  
  // Semantic colors
  income: "#10B981", // Emerald 500 (Growth)
  expense: "#EF4444", // Red 500
  
  // Budget category colors
  housing: "#8B5CF6", // Purple 500
  food: "#F97316", // Orange 500
  entertainment: "#EC4899", // Pink 500
  shopping: "#06B6D4", // Cyan 500
  
  // Neutral colors
  background: "#F5F5F7", // Apple Light Gray
  surface: "#FFFFFF", // Pure White
  text: "#111827", // Gray 900
  textMuted: "#6B7280", // Gray 500
  border: "#E5E7EB", // Gray 200
} as const;

/**
 * Default chart configuration
 */
export const defaultChartConfig = {
  // Grid configuration
  grid: {
    stroke: chartColors.border,
    strokeWidth: 1,
    strokeDasharray: "3 3",
  },
  
  // Tooltip configuration
  tooltip: {
    backgroundColor: chartColors.surface,
    borderColor: chartColors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
  },
  
  // Legend configuration
  legend: {
    fontSize: 12,
    fill: chartColors.textMuted,
  },
} as const;

/**
 * Spending Wave chart gradient configuration
 * Gradient from Emerald-500 (opacity 0.2) to transparent
 */
export const spendingWaveGradient = {
  id: "spendingWaveGradient",
  gradientUnits: "userSpaceOnUse" as const,
  stops: [
    { offset: "0%", stopColor: "#10B981", stopOpacity: 0.2 },
    { offset: "100%", stopColor: "#10B981", stopOpacity: 0 },
  ],
};

