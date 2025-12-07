"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { CreateCategorySchema, type CategoryType } from "@workspace/validators";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { useState } from "react";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/data/categoryOptions";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryFormData = z.input<typeof CreateCategorySchema>;

interface CategoryFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORY_TYPES: { value: CategoryType; label: string; description: string }[] = [
  { value: "NEEDS", label: "Needs", description: "Essential expenses (50%)" },
  { value: "WANTS", label: "Wants", description: "Discretionary spending (30%)" },
  { value: "SAVINGS", label: "Savings", description: "Savings & investments (20%)" },
  { value: "INCOME", label: "Income", description: "Income sources" },
];

export function CategoryForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(defaultValues?.color || CATEGORY_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(defaultValues?.icon || "Tag");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "NEEDS",
      color: defaultValues?.color || CATEGORY_COLORS[0].value,
      icon: defaultValues?.icon || "Tag",
      monthlyBudgetCap: defaultValues?.monthlyBudgetCap ?? 0,
    },
  });

  const selectedType = watch("type");

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit({
        ...data,
        color: selectedColor,
        icon: selectedIcon,
      });
    } catch (error: unknown) {
      console.error("Failed to submit category:", error);
    }
  };

  // Get the icon component dynamically
  const IconComponent = LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Category Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="e.g., Groceries"
          className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {errors.name && (
          <p className="text-sm text-rose-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Category Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setValue("type", type.value)}
              className={cn(
                "p-4 rounded-xl border transition-all text-left",
                selectedType === type.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50"
              )}
            >
              <div className="font-medium text-sm text-foreground">{type.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-sm text-rose-500 mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Color
        </label>
        <div className="grid grid-cols-9 gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => {
                setSelectedColor(color.value);
                setValue("color", color.value);
              }}
              className={cn(
                "w-10 h-10 rounded-lg transition-all",
                selectedColor === color.value
                  ? "ring-2 ring-primary ring-offset-2 scale-110"
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Icon
        </label>
        
        {/* Selected Icon Preview */}
        <button
          type="button"
          onClick={() => setShowIconPicker(!showIconPicker)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all mb-3"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
          </div>
          <span className="text-sm text-foreground">
            {showIconPicker ? "Hide icons" : "Choose icon"}
          </span>
        </button>

        {/* Icon Grid */}
        {showIconPicker && (
          <div className="grid grid-cols-8 gap-2 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm max-h-64 overflow-y-auto">
            {CATEGORY_ICONS.map((iconName) => {
              const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(iconName);
                    setValue("icon", iconName);
                    setShowIconPicker(false);
                  }}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    selectedIcon === iconName
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                  title={iconName}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Budget Cap */}
      <div>
        <label htmlFor="monthlyBudgetCap" className="block text-sm font-medium text-foreground mb-2">
          Monthly Budget Cap (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            K
          </span>
          <input
            id="monthlyBudgetCap"
            type="number"
            step="0.01"
            {...register("monthlyBudgetCap", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {errors.monthlyBudgetCap && (
          <p className="text-sm text-rose-500 mt-1">{errors.monthlyBudgetCap.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Set a spending limit for this category (0 = no limit)
        </p>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground mb-2">Preview</p>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {watch("name") || "Category Name"}
            </p>
            <p className="text-xs text-muted-foreground">
              {CATEGORY_TYPES.find(t => t.value === selectedType)?.label}
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel || (() => router.back())}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </span>
          ) : (
            mode === "create" ? "Create Category" : "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
