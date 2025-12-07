"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCategories, useCreateCategory } from "@/lib/hooks/useCategories";
import { DEFAULT_CATEGORIES } from "@/lib/data/defaultCategories";

/**
 * Hook to initialize default categories for new users
 * Automatically creates default categories if user has none
 */
export function useInitializeCategories() {
  const { user } = useAuth();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeCategories = async () => {
      // Don't initialize if:
      // - User not authenticated
      // - Still loading categories
      // - Already initializing
      // - Already initialized
      // - User already has categories
      if (!user || isLoading || isInitializing || isInitialized || (categories && categories.length > 0)) {
        return;
      }

      setIsInitializing(true);

      try {
        // Create all default categories
        for (const category of DEFAULT_CATEGORIES) {
          await createCategory.mutateAsync(category);
        }
        
        setIsInitialized(true);
        console.log("✅ Default categories initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize default categories:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCategories();
  }, [user, categories, isLoading, isInitializing, isInitialized, createCategory]);

  return {
    isInitializing,
    isInitialized: isInitialized || (categories && categories.length > 0),
  };
}
