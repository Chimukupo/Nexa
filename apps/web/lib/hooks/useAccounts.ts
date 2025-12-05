"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { accountKeys } from "@/lib/queries/keys";
import { useAuth } from "@/lib/contexts/AuthContext";
import type {
  Account,
} from "@workspace/validators";
import type { z } from "zod";
import { CreateAccountSchema } from "@workspace/validators";

type AccountInput = z.input<typeof CreateAccountSchema>;

/**
 * Fetches all accounts for the current user
 */
export function useAccounts() {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: accountKeys.list({ userId: userId! }),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const accountsRef = collection(db, "users", userId, "accounts");
      const q = query(accountsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          currentBalance: data.currentBalance,
          isArchived: data.isArchived ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Account & { id: string };
      });
    },
    enabled: !!userId,
  });
}

/**
 * Fetches a single account by ID
 */
export function useAccount(accountId: string) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "accounts", accountId);
      const snapshot = await getDoc(accountRef);

      if (!snapshot.exists()) {
        throw new Error("Account not found");
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name,
        type: data.type,
        currentBalance: data.currentBalance,
        isArchived: data.isArchived ?? false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Account & { id: string };
    },
    enabled: !!userId && !!accountId,
  });
}

/**
 * Creates a new account
 */
export function useCreateAccount() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountInput) => {
      if (!userId) throw new Error("User not authenticated");

      const accountsRef = collection(db, "users", userId, "accounts");
      const docRef = await addDoc(accountsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    },
    onSuccess: () => {
      // Invalidate accounts list to refetch
      queryClient.invalidateQueries({ queryKey: accountKeys.list({ userId: userId! }) });
    },
  });
}

/**
 * Updates an existing account
 */
export function useUpdateAccount(accountId: string) {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AccountInput>) => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "accounts", accountId);
      await updateDoc(accountRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      // Invalidate both list and specific account queries
      queryClient.invalidateQueries({ queryKey: accountKeys.list({ userId: userId! }) });
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(accountId),
      });
    },
  });
}

/**
 * Archives an account (soft delete)
 */
export function useArchiveAccount(accountId: string) {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "accounts", accountId);
      await updateDoc(accountRef, {
        isArchived: true,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list({ userId: userId! }) });
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(accountId),
      });
    },
  });
}

/**
 * Permanently deletes an account
 */
export function useDeleteAccount(accountId: string) {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const accountRef = doc(db, "users", userId, "accounts", accountId);
      await deleteDoc(accountRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list({ userId: userId! }) });
    },
  });
}

