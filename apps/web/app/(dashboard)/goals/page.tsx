"use client";

import React, { useState, useMemo } from "react";
import { Plus, Target, TrendingUp } from "lucide-react";
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useDeleteSavingsGoal,
  useContributeToGoal,
} from "@/lib/hooks/useSavingsGoals";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { SavingsGoalForm } from "@/components/forms/SavingsGoalForm";
import { SavingsGoalCard } from "@/components/widgets/SavingsGoalCard";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
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
import type { SavingsGoal, SavingsGoalInput } from "@workspace/validators";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; goalId: string; goal: SavingsGoal & { id: string } }
  | null;

export default function GoalsPage(): React.JSX.Element {
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [contributeState, setContributeState] = useState<{
    goalId: string;
    goalName: string;
  } | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>("");

  const { data: goals, isLoading } = useSavingsGoals();
  const { data: accounts } = useAccounts();
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();
  const contributeToGoal = useContributeToGoal();

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!goals || goals.length === 0) {
      return {
        totalSaved: 0,
        totalTarget: 0,
        activeGoals: 0,
        overallProgress: 0,
      };
    }

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalSaved,
      totalTarget,
      activeGoals,
      overallProgress,
    };
  }, [goals]);

  const handleCreateGoal = async (data: SavingsGoalInput) => {
    try {
      await createGoal.mutateAsync(data);
      setFormState(null);
      toast.success("Savings goal created successfully!");
    } catch (error) {
      toast.error("Failed to create savings goal");
      console.error(error);
    }
  };

  const handleUpdateGoal = async (data: SavingsGoalInput) => {
    if (formState?.mode !== "edit") return;

    try {
      await updateGoal.mutateAsync({
        id: formState.goalId,
        data,
      });
      setFormState(null);
      toast.success("Savings goal updated successfully!");
    } catch (error) {
      toast.error("Failed to update savings goal");
      console.error(error);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteGoalId) return;

    try {
      await deleteGoal.mutateAsync(deleteGoalId);
      setDeleteGoalId(null);
      toast.success("Savings goal deleted");
    } catch (error) {
      toast.error("Failed to delete savings goal");
      console.error(error);
    }
  };

  const handleContribute = async () => {
    if (!contributeState) return;

    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const goal = goals?.find((g) => g.id === contributeState.goalId);
    if (!goal) return;

    const account = accounts?.find((a) => a.id === goal.accountId);
    if (!account) {
      toast.error("Linked account not found");
      return;
    }

    if (amount > account.currentBalance) {
      toast.error(`Insufficient balance. Available: K${account.currentBalance.toFixed(2)}`);
      return;
    }

    try {
      await contributeToGoal.mutateAsync({
        goalId: contributeState.goalId,
        amount,
        accountId: goal.accountId,
      });
      setContributeState(null);
      setContributeAmount("");
      toast.success(`K${amount.toFixed(2)} contributed to ${contributeState.goalName}!`);
    } catch (error) {
      toast.error("Failed to contribute to goal");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track and achieve your financial goals
          </p>
        </div>
        <Button onClick={() => setFormState({ mode: "create" })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Overview Stats */}
      {goals && goals.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{stats.totalSaved.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.overallProgress.toFixed(1)}% of total target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{stats.totalTarget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                K{(stats.totalTarget - stats.totalSaved).toFixed(2)} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGoals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {goals.length} total goals
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Grid */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground mt-4">Loading your goals...</p>
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onContribute={(goalId) =>
                  setContributeState({
                    goalId,
                    goalName: goal.name,
                  })
                }
                onEdit={(goalId) =>
                  setFormState({
                    mode: "edit",
                    goalId,
                    goal,
                  })
                }
                onDelete={setDeleteGoalId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No savings goals yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Start planning for your future by creating your first savings goal
              </p>
              <Button onClick={() => setFormState({ mode: "create" })}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formState !== null} onOpenChange={() => setFormState(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formState?.mode === "create" ? "Create Savings Goal" : "Edit Savings Goal"}
            </DialogTitle>
            <DialogDescription>
              {formState?.mode === "create"
                ? "Set a target amount and deadline for your savings goal"
                : "Update your savings goal details"}
            </DialogDescription>
          </DialogHeader>
          <SavingsGoalForm
            mode={formState?.mode || "create"}
            defaultValues={formState?.mode === "edit" ? formState.goal : undefined}
            onSubmit={formState?.mode === "create" ? handleCreateGoal : handleUpdateGoal}
            onCancel={() => setFormState(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={contributeState !== null} onOpenChange={() => setContributeState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to {contributeState?.goalName}</DialogTitle>
            <DialogDescription>
              Enter the amount you'd like to contribute to this goal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  K
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setContributeState(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleContribute}
                disabled={contributeToGoal.isPending}
              >
                {contributeToGoal.isPending ? "Contributing..." : "Contribute"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteGoalId !== null} onOpenChange={() => setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
