"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks/useCategories";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { CategoryInput, CategoryType } from "@workspace/validators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";

type FormState = {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues?: Partial<CategoryInput>;
} | null;

const CATEGORY_TYPE_LABELS: Record<CategoryType, { label: string; description: string }> = {
  NEEDS: { label: "Needs", description: "Essential expenses (50%)" },
  WANTS: { label: "Wants", description: "Discretionary spending (30%)" },
  SAVINGS: { label: "Savings", description: "Savings & investments (20%)" },
  INCOME: { label: "Income", description: "Income sources" },
};

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formState, setFormState] = useState<FormState>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleSubmitForm = async (data: CategoryInput) => {
    try {
      if (formState?.mode === "create") {
        await createCategory.mutateAsync(data);
        toast.success("Category created successfully");
      } else if (formState?.mode === "edit" && formState.categoryId) {
        await updateCategory.mutateAsync({
          id: formState.categoryId,
          data,
        });
        toast.success("Category updated successfully");
      }
      setFormState(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync(categoryToDelete);
      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: unknown) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const openDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  // Group categories by type
  const categoriesByType = categories?.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {} as Record<CategoryType, typeof categories>);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted/50" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <Button
          onClick={() => setFormState({ mode: "create" })}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Create / Edit Category Form Modal */}
      {formState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 md:p-8 max-w-lg w-full border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {formState.mode === "create" ? "Create New Category" : "Edit Category"}
            </h2>
            <CategoryForm
              mode={formState.mode}
              defaultValues={formState.defaultValues}
              onSubmit={handleSubmitForm}
              onCancel={() => setFormState(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Existing transactions with this category will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Categories by Type */}
      {(["NEEDS", "WANTS", "SAVINGS", "INCOME"] as CategoryType[]).map((type) => {
        const typeCategories = categoriesByType?.[type] || [];
        
        return (
          <div key={type}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {CATEGORY_TYPE_LABELS[type].label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {CATEGORY_TYPE_LABELS[type].description}
              </p>
            </div>

            {typeCategories.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No {CATEGORY_TYPE_LABELS[type].label.toLowerCase()} categories yet
                  </p>
                  <Button
                    onClick={() => setFormState({ mode: "create", defaultValues: { type } })}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {CATEGORY_TYPE_LABELS[type].label} Category
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeCategories.map((category) => {
                  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
                  
                  return (
                    <Card key={category.id} className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          >
                            {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {category.name}
                            </h3>
                            {category.monthlyBudgetCap && category.monthlyBudgetCap > 0 ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Budget: K{category.monthlyBudgetCap.toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                No budget set
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                setFormState({
                                  mode: "edit",
                                  categoryId: category.id,
                                  defaultValues: {
                                    name: category.name,
                                    type: category.type,
                                    color: category.color,
                                    icon: category.icon,
                                    monthlyBudgetCap: category.monthlyBudgetCap,
                                  },
                                })
                              }
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(category.id!)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
