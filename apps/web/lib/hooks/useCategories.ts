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
} from "firebase/firestore";
import {
  getCategoriesRef,
  getCategoryDoc,
} from "@/lib/firebase/collections";
import { categoryKeys, CategoryFilters } from "@/lib/queries/keys";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Category, CategoryInput } from "@workspace/validators";

/**
 * Fetches all categories for the current user
 */
export function useCategories(filters?: CategoryFilters) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: categoryKeys.list({ ...filters, userId: userId }),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      let q = query(getCategoriesRef(userId), orderBy("name", "asc"));

      // Apply type filter if exists
      if (filters?.type) {
        q = query(q, where("type", "==", filters.type));
      }

      const snapshot = await getDocs(q);
      
      // The converter in collections.ts handles data transformation
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as (Category & { id: string })[];
    },
    enabled: !!userId,
  });
}

/**
 * Fetches a single category by ID
 */
export function useCategory(categoryId: string) {
  const { user } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getCategoryDoc(userId, categoryId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error("Category not found");
      }

      return {
        ...snapshot.data(),
        id: snapshot.id,
      } as Category & { id: string };
    },
    enabled: !!userId && !!categoryId,
  });
}

/**
 * Creates a new category
 */
export function useCreateCategory() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryInput) => {
      if (!userId) throw new Error("User not authenticated");

      const categoriesRef = getCategoriesRef(userId);
      
      // Filter out undefined values to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries({
          ...data,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }).filter(([, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(categoriesRef, cleanData as Record<string, unknown>);

      return docRef.id;
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: categoryKeys.list({ userId }) });
    },
  });
}

/**
 * Updates an existing category
 */
export function useUpdateCategory() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryInput> }) => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getCategoryDoc(userId, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_result, variables) => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: categoryKeys.list({ userId }) });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Deletes a category
 */
export function useDeleteCategory() {
  const { user } = useAuth();
  const userId = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated");

      const docRef = getCategoryDoc(userId, id);
      await deleteDoc(docRef);
    },
    onSuccess: (_result, id) => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: categoryKeys.list({ userId }) });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(id),
      });
    },
  });
}
