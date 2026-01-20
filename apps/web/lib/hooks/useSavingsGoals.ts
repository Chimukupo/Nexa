import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  CreateSavingsGoalSchema,
  UpdateSavingsGoalSchema,
  type SavingsGoal,
  type SavingsGoalInput,
} from "@workspace/validators";
import { useFirestoreSubscription } from "./useFirestoreSubscription";
import { differenceInMonths, differenceInDays } from "date-fns";

/**
 * Fetch all savings goals for the current user
 */
export function useSavingsGoals(): UseQueryResult<(SavingsGoal & { id: string })[]> {
  const { user } = useAuth();

  return useFirestoreSubscription<SavingsGoal>(
    ["savingsGoals", user?.uid],
    user ? `users/${user.uid}/savingsGoals` : null,
    {
      enabled: !!user,
    }
  );
}

/**
 * Fetch a single savings goal by ID
 */
export function useSavingsGoal(
  goalId: string
): UseQueryResult<SavingsGoal & { id: string }> {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savingsGoals", user?.uid, goalId],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const goalRef = doc(db, `users/${user.uid}/savingsGoals/${goalId}`);
      const snapshot = await getDoc(goalRef);

      if (!snapshot.exists()) {
        throw new Error("Savings goal not found");
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as SavingsGoal & { id: string };
    },
    enabled: !!user && !!goalId,
  });
}

/**
 * Create a new savings goal
 */
export function useCreateSavingsGoal(): UseMutationResult<
  void,
  Error,
  SavingsGoalInput
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SavingsGoalInput) => {
      if (!user) throw new Error("User not authenticated");

      const validated = CreateSavingsGoalSchema.parse(data);
      const goalsRef = collection(db, `users/${user.uid}/savingsGoals`);

      await addDoc(goalsRef, {
        ...validated,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", user?.uid] });
    },
  });
}

/**
 * Update an existing savings goal
 */
export function useUpdateSavingsGoal(): UseMutationResult<
  void,
  Error,
  { id: string; data: Partial<SavingsGoalInput> }
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SavingsGoalInput> }) => {
      if (!user) throw new Error("User not authenticated");

      const validated = UpdateSavingsGoalSchema.parse(data);
      const goalRef = doc(db, `users/${user.uid}/savingsGoals/${id}`);

      await updateDoc(goalRef, {
        ...validated,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", user?.uid] });
    },
  });
}

/**
 * Delete a savings goal
 */
export function useDeleteSavingsGoal(): UseMutationResult<void, Error, string> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!user) throw new Error("User not authenticated");

      const goalRef = doc(db, `users/${user.uid}/savingsGoals/${goalId}`);
      await deleteDoc(goalRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", user?.uid] });
    },
  });
}

/**
 * Contribute to a savings goal (virtual transfer from account)
 */
export function useContributeToGoal(): UseMutationResult<
  void,
  Error,
  { goalId: string; amount: number; accountId: string }
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      amount,
      accountId,
    }: {
      goalId: string;
      amount: number;
      accountId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (amount <= 0) throw new Error("Amount must be positive");

      const batch = writeBatch(db);

      // Deduct from account
      const accountRef = doc(db, `users/${user.uid}/accounts/${accountId}`);
      batch.update(accountRef, {
        currentBalance: increment(-amount),
        updatedAt: serverTimestamp(),
      });

      // Add to goal
      const goalRef = doc(db, `users/${user.uid}/savingsGoals/${goalId}`);
      batch.update(goalRef, {
        currentAmount: increment(amount),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    },
    onSuccess: () => {
      // Invalidate both goals and accounts queries
      queryClient.invalidateQueries({ queryKey: ["savingsGoals", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.uid] });
    },
  });
}

/**
 * Helper to normalize date from various formats (Date, Timestamp, string, number)
 */
function normalizeDate(date: unknown): Date {
  if (!date) return new Date();
  
  // Handle Firestore Timestamp
  if (typeof date === "object" && date !== null && "toDate" in date && typeof (date as { toDate: () => Date }).toDate === "function") {
    return (date as { toDate: () => Date }).toDate();
  }
  
  // Handle Date object
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // Handle string or number
  const parsed = new Date(date as string | number);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Calculate monthly savings requirement to reach goal
 */
export function calculateMonthlyRequirement(
  targetAmount: number,
  currentAmount: number,
  targetDate: unknown
): number {
  const normalizedDate = normalizeDate(targetDate);
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const monthsLeft = differenceInMonths(normalizedDate, new Date());
  
  if (monthsLeft <= 0) {
    // Goal is overdue or due this month - return full remaining amount
    return remaining;
  }

  return remaining / monthsLeft;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 100);
}

/**
 * Calculate time remaining until target date
 */
export function calculateTimeRemaining(targetDate: unknown): {
  months: number;
  days: number;
  isOverdue: boolean;
  totalDays: number;
} {
  const normalizedDate = normalizeDate(targetDate);
  const today = new Date();
  const months = differenceInMonths(normalizedDate, today);
  const days = differenceInDays(normalizedDate, today);

  return {
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays: days,
    isOverdue: days < 0,
  };
}

/**
 * Check if goal is achieved
 */
export function isGoalAchieved(currentAmount: number, targetAmount: number): boolean {
  return currentAmount >= targetAmount;
}

