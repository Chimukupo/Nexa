"use client";

import { useEffect, useState, useRef } from "react";
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
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeCategories = async () => {
      // Don't initialize if:
      // - User not authenticated
      // - Still loading categories
      // - Already initializing
      // - Already initialized (via ref)
      // - User already has categories
      if (!user || isLoading || isInitializing || hasInitialized.current || (categories && categories.length > 0)) {
        return;
      }

      // Mark as initialized BEFORE starting to prevent race conditions
      hasInitialized.current = true;
      setIsInitializing(true);

      try {
        // Create all default categories
        for (const category of DEFAULT_CATEGORIES) {
          await createCategory.mutateAsync(category);
        }
        
        console.log("✅ Default categories initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize default categories:", error);
        // Reset on error so user can retry
        hasInitialized.current = false;
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCategories();
    // IMPORTANT: Do NOT include createCategory in dependencies
    // It changes on every render and would cause infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categories, isLoading, isInitializing]);

  return {
    isInitializing,
    isInitialized: hasInitialized.current || (categories && categories.length > 0),
  };
}
