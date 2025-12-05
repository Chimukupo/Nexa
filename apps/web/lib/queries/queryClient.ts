"use client"

import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient configuration for TanStack Query
 * 
 * Provides default options for queries and mutations:
 * - staleTime: How long data is considered fresh
 * - gcTime: How long unused data stays in cache
 * - retry: Retry failed requests
 * 
 * Note: QueryClient is created using useState to ensure it's only created once
 * per component instance (important for React 19 Strict Mode)
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Unused data stays in cache for 5 minutes
        gcTime: 5 * 60 * 1000, // Previously cacheTime in v4
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus (useful for real-time updates)
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse query client or create new one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

