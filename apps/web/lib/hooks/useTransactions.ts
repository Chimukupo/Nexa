"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import {
  getTransactionsRef,
  getTransactionDoc,
} from "@/lib/firebase/collections";
import { transactionKeys, TransactionFilters } from "@/lib/queries/keys";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Transaction, TransactionInput } from "@workspace/validators";

/**
 * Fetches transactions with comprehensive filtering options
 */
export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: transactionKeys.list({ ...filters, userId: userId }),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      // Start with base collection reference
      const baseRef = getTransactionsRef(userId);
      const constraints = [];

      // Apply WHERE filters first (Firestore requirement)
      // NOTE: We skip 'type' filter here to avoid composite index requirement
      // Type filtering will be done client-side for better performance

      if (filters?.accountId) {
        constraints.push(where("accountId", "==", filters.accountId));
      }

      if (filters?.categoryId) {
        constraints.push(where("categoryId", "==", filters.categoryId));
      }

      if (filters?.startDate) {
        constraints.push(where("date", ">=", Timestamp.fromDate(filters.startDate)));
      }
      
      if (filters?.endDate) {
        constraints.push(where("date", "<=", Timestamp.fromDate(filters.endDate)));
      }

      // Apply ORDER BY after WHERE clauses
      constraints.push(orderBy("date", "desc"));
      
      // Default limit if no specific date range to prevent fetching everything
      if (!filters?.startDate && !filters?.endDate) {
        constraints.push(limit(50));
      }

      // Construct final query with all constraints
      const q = query(baseRef, ...constraints);

      const snapshot = await getDocs(q);
      
      let results = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as (Transaction & { id: string })[];

      // Apply type filter client-side to avoid composite index requirement
      if (filters?.type) {
        results = results.filter((t) => t.type === filters.type);
      }

      return results;
    },
    enabled: !!userId,
  });
}

/**
 * Fetches a single transaction by ID
 */
export function useTransaction(transactionId: string) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getTransactionDoc(userId, transactionId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error("Transaction not found");
      }

      return {
        ...snapshot.data(),
        id: snapshot.id,
      } as Transaction & { id: string };
    },
    enabled: !!userId && !!transactionId,
  });
}

/**
 * Creates a new transaction
 */
export function useCreateTransaction() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionInput) => {
      if (!userId) throw new Error("User not authenticated");

      const transactionsRef = getTransactionsRef(userId);
      
      // Filter out undefined values to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries({
          ...data,
          userId,
          date: Timestamp.fromDate(data.date), // Ensure Date -> Timestamp
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }).filter(([, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(transactionsRef, cleanData as Record<string, unknown>);

      return docRef.id;
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also potentially invalidate account query if we want to simulate balance update 
      // (though cloud function handles real update, optimistic update might be handled in text Phase)
    },
  });
}

/**
 * Updates an existing transaction
 */
export function useUpdateTransaction() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionInput> }) => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getTransactionDoc(userId, id);
      
      const updateData: Record<string, unknown> = { ...data };
      if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
      }
      
      // Filter out undefined values to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries({
          ...updateData,
          updatedAt: Timestamp.now(),
        }).filter(([, value]) => value !== undefined)
      );
      
      await updateDoc(docRef, cleanData);
    },
    onSuccess: (_result, variables) => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Deletes a transaction
 */
export function useDeleteTransaction() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getTransactionDoc(userId, id);
      await deleteDoc(docRef);
    },
    onSuccess: (_result, id) => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(id),
      });
    },
  });
}
