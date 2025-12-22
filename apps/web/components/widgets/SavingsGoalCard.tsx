"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Progress } from "@workspace/ui/components/progress";
import { Calendar, DollarSign, MoreVertical, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import type { SavingsGoal } from "@workspace/validators";
import {
  calculateProgress,
  calculateMonthlyRequirement,
  calculateTimeRemaining,
  isGoalAchieved,
} from "@/lib/hooks/useSavingsGoals";

interface SavingsGoalCardProps {
  goal: SavingsGoal & { id: string };
  onContribute?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export function SavingsGoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
}: SavingsGoalCardProps) {
  const progress = useMemo(
    () => calculateProgress(goal.currentAmount, goal.targetAmount),
    [goal.currentAmount, goal.targetAmount]
  );

  const monthlyReq = useMemo(
    () => calculateMonthlyRequirement(goal.targetAmount, goal.currentAmount, new Date(goal.targetDate)),
    [goal.targetAmount, goal.currentAmount, goal.targetDate]
  );

  const timeRemaining = useMemo(
    () => calculateTimeRemaining(new Date(goal.targetDate)),
    [goal.targetDate]
  );

  const achieved = isGoalAchieved(goal.currentAmount, goal.targetAmount);

  // Format time remaining
  const timeRemainingText = useMemo(() => {
    if (timeRemaining.isOverdue) {
      return "Overdue";
    }
    if (timeRemaining.months === 0 && timeRemaining.days === 0) {
      return "Due today";
    }
    if (timeRemaining.months === 0) {
      return `${timeRemaining.days} day${timeRemaining.days !== 1 ? "s" : ""} left`;
    }
    return `${timeRemaining.months} month${timeRemaining.months !== 1 ? "s" : ""} left`;
  }, [timeRemaining]);

  return (
    <Card className="relative overflow-hidden">
      {/* Color accent bar */}
      {goal.color && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: goal.color }}
        />
      )}

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {goal.name}
            {achieved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Achieved
              </span>
            )}
            {timeRemaining.isOverdue && !achieved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </CardTitle>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(goal.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold">
              K{goal.currentAmount.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              of K{goal.targetAmount.toFixed(2)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(0)}% complete</span>
              <span>K{(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Time Left</p>
              <p className="text-sm font-medium truncate">{timeRemainingText}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Per Month</p>
              <p className="text-sm font-medium truncate">
                {achieved ? "K0.00" : `K${monthlyReq.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onContribute && !achieved && (
          <Button
            onClick={() => onContribute(goal.id)}
            className="w-full"
            size="sm"
          >
            Contribute to Goal
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
