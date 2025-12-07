import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import type {
  RecurringRule,
  RecurringRuleInput,
  RecurringRuleType,
} from "@workspace/validators";

/**
 * Query keys for recurring rules
 */
export const recurringRuleKeys = {
  all: ["recurringRules"] as const,
  lists: () => [...recurringRuleKeys.all, "list"] as const,
  list: (filters: { userId?: string; type?: RecurringRuleType; isActive?: boolean }) =>
    [...recurringRuleKeys.lists(), filters] as const,
  details: () => [...recurringRuleKeys.all, "detail"] as const,
  detail: (id: string) => [...recurringRuleKeys.details(), id] as const,
};

/**
 * Get Firestore reference for recurring rules collection
 */
function getRecurringRulesRef(userId: string) {
  return collection(db, `users/${userId}/recurringRules`);
}

/**
 * Fetch all recurring rules for the current user
 */
export function useRecurringRules(filters?: {
  type?: RecurringRuleType;
  isActive?: boolean;
}) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: recurringRuleKeys.list({ ...filters, userId }),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const rulesRef = getRecurringRulesRef(userId);
      const constraints = [];

      // Apply filters
      if (filters?.type) {
        constraints.push(where("type", "==", filters.type));
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }

      // Order by creation date (newest first)
      constraints.push(orderBy("createdAt", "desc"));

      const q = query(rulesRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastRunDate: doc.data().lastRunDate?.toDate(),
      })) as (RecurringRule & { id: string })[];
    },
    enabled: !!userId,
  });
}

/**
 * Fetch a single recurring rule by ID
 */
export function useRecurringRule(ruleId: string | null) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: recurringRuleKeys.detail(ruleId || ""),
    queryFn: async () => {
      if (!userId || !ruleId) throw new Error("User not authenticated or rule ID missing");

      const ruleRef = doc(db, `users/${userId}/recurringRules/${ruleId}`);
      const snapshot = await getDoc(ruleRef);

      if (!snapshot.exists()) {
        throw new Error("Recurring rule not found");
      }

      return {
        ...snapshot.data(),
        id: snapshot.id,
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate(),
        lastRunDate: snapshot.data().lastRunDate?.toDate(),
      } as RecurringRule & { id: string };
    },
    enabled: !!userId && !!ruleId,
  });
}

/**
 * Create a new recurring rule
 */
export function useCreateRecurringRule() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecurringRuleInput) => {
      if (!userId) throw new Error("User not authenticated");

      const rulesRef = getRecurringRulesRef(userId);
      const now = Timestamp.now();

      const ruleData = {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
        lastRunDate: null,
      };

      const docRef = await addDoc(rulesRef, ruleData);
      return { id: docRef.id, ...ruleData };
    },
    onSuccess: () => {
      // Invalidate all recurring rule queries
      queryClient.invalidateQueries({ queryKey: recurringRuleKeys.lists() });
    },
  });
}

/**
 * Update an existing recurring rule
 */
export function useUpdateRecurringRule() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ruleId,
      data,
    }: {
      ruleId: string;
      data: Partial<RecurringRuleInput>;
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const ruleRef = doc(db, `users/${userId}/recurringRules/${ruleId}`);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(ruleRef, updateData);
      return { id: ruleId, ...updateData };
    },
    onSuccess: (_, variables) => {
      // Invalidate specific rule and list queries
      queryClient.invalidateQueries({ queryKey: recurringRuleKeys.detail(variables.ruleId) });
      queryClient.invalidateQueries({ queryKey: recurringRuleKeys.lists() });
    },
  });
}

/**
 * Delete a recurring rule
 */
export function useDeleteRecurringRule() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const ruleRef = doc(db, `users/${userId}/recurringRules/${ruleId}`);
      await deleteDoc(ruleRef);
      return ruleId;
    },
    onSuccess: (ruleId) => {
      // Invalidate specific rule and list queries
      queryClient.invalidateQueries({ queryKey: recurringRuleKeys.detail(ruleId) });
      queryClient.invalidateQueries({ queryKey: recurringRuleKeys.lists() });
    },
  });
}

/**
 * Toggle active status of a recurring rule
 */
export function useToggleRecurringRule() {
  const updateRule = useUpdateRecurringRule();

  return useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      return updateRule.mutateAsync({
        ruleId,
        data: { isActive },
      });
    },
  });
}
