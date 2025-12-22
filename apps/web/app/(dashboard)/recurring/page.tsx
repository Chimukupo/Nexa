"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import {
  useRecurringRules,
  useCreateRecurringRule,
  useUpdateRecurringRule,
  useDeleteRecurringRule,
  useToggleRecurringRule,
} from "@/lib/hooks/useRecurringRules";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { RecurringRuleForm } from "@/components/forms/RecurringRuleForm";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
import type { RecurringRule, RecurringRuleInput } from "@workspace/validators";

export default function RecurringRulesPage(): React.JSX.Element {
  const [formState, setFormState] = useState<{
    mode: "create" | "edit";
    rule?: RecurringRule & { id: string };
  } | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  const { data: rules, isLoading } = useRecurringRules();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createRule = useCreateRecurringRule();
  const updateRule = useUpdateRecurringRule();
  const deleteRule = useDeleteRecurringRule();
  const toggleRule = useToggleRecurringRule();

  const handleCreate = async (data: RecurringRuleInput) => {
    try {
      await createRule.mutateAsync(data);
      toast.success("Recurring rule created successfully");
      setFormState(null);
    } catch (error) {
      console.error("Failed to create recurring rule:", error);
      toast.error("Failed to create recurring rule");
    }
  };

  const handleUpdate = async (data: RecurringRuleInput) => {
    if (!formState?.rule?.id) return;

    try {
      await updateRule.mutateAsync({
        ruleId: formState.rule.id,
        data,
      });
      toast.success("Recurring rule updated successfully");
      setFormState(null);
    } catch (error) {
      console.error("Failed to update recurring rule:", error);
      toast.error("Failed to update recurring rule");
    }
  };

  const handleDelete = async () => {
    if (!deleteRuleId) return;

    try {
      await deleteRule.mutateAsync(deleteRuleId);
      toast.success("Recurring rule deleted successfully");
      setDeleteRuleId(null);
    } catch (error) {
      console.error("Failed to delete recurring rule:", error);
      toast.error("Failed to delete recurring rule");
    }
  };

  const handleToggle = async (ruleId: string, currentStatus: boolean) => {
    try {
      await toggleRule.mutateAsync({ ruleId, isActive: !currentStatus });
      toast.success(currentStatus ? "Rule deactivated" : "Rule activated");
    } catch (error) {
      console.error("Failed to toggle recurring rule:", error);
      toast.error("Failed to toggle recurring rule");
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getAccountName = (accountId: string) => {
    return accounts?.find((a) => a.id === accountId)?.name || "Unknown";
  };

  const activeRules = rules?.filter((r) => r.isActive) || [];
  const inactiveRules = rules?.filter((r) => !r.isActive) || [];

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recurring income and expenses
          </p>
        </div>
        <Button onClick={() => setFormState({ mode: "create" })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>
            These rules will automatically create transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading rules...
            </div>
          ) : activeRules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active recurring rules</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a rule to automatically track recurring income or expenses
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{rule.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          rule.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {rule.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>K{rule.amount.toFixed(2)}</span>
                      <span>•</span>
                      <span>Day {rule.dayOfMonth}</span>
                      <span>•</span>
                      <span>{getAccountName(rule.accountId)}</span>
                      <span>•</span>
                      <span>{getCategoryName(rule.categoryId)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(rule.id!, rule.isActive)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormState({ mode: "edit", rule })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteRuleId(rule.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Rules */}
      {inactiveRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Rules</CardTitle>
            <CardDescription>
              These rules are paused and won't create transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 opacity-60"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{rule.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {rule.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>K{rule.amount.toFixed(2)}</span>
                      <span>•</span>
                      <span>Day {rule.dayOfMonth}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(rule.id!, rule.isActive)}
                    >
                      <PowerOff className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteRuleId(rule.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={!!formState} onOpenChange={() => setFormState(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formState?.mode === "create" ? "Create Recurring Rule" : "Edit Recurring Rule"}
            </DialogTitle>
            <DialogDescription>
              {formState?.mode === "create"
                ? "Set up a rule to automatically track recurring transactions"
                : "Update the recurring rule details"}
            </DialogDescription>
          </DialogHeader>
          <RecurringRuleForm
            defaultValues={formState?.rule}
            onSubmit={formState?.mode === "create" ? handleCreate : handleUpdate}
            onCancel={() => setFormState(null)}
            isSubmitting={createRule.isPending || updateRule.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRuleId} onOpenChange={() => setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recurring rule.
              Past transactions created by this rule will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
