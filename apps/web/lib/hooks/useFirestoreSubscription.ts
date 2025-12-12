import { useEffect, useRef } from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  doc,
  collection,
  onSnapshot,
  type DocumentSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

/**
 * Hook to subscribe to a Firestore collection or document
 * Integrating with TanStack Query for cache management
 */
export function useFirestoreSubscription<T extends DocumentData>(
  queryKey: unknown[],
  path: string | null,
  options: Omit<UseQueryOptions<(T & { id: string })[], Error>, "queryKey" | "queryFn"> = {}
): UseQueryResult<(T & { id: string })[], Error> {
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!path || options.enabled === false) {
      return;
    }

    // Determine if path is a collection or document based on number of segments
    const isCollection = path.split("/").length % 2 === 0;

    if (isCollection) {
      const collectionRef = collection(db, path);
      
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (T & { id: string })[];
          
          queryClient.setQueryData(queryKey, data);
        },
        (error) => {
          console.error(`Firestore subscription error for ${path}:`, error);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } else {
      // It's a document
      const docRef = doc(db, path);
      
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (snapshot.exists()) {
            const data = {
              id: snapshot.id,
              ...snapshot.data(),
            } as (T & { id: string });
            
            // For single docs, we usually want an array response to match the return type signature
            // or we need a separate hook for single doc subscriptions.
            // Based on usage in useSavingsGoals, it expects an array.
            // However, useSavingsGoals is passed a collection path usually.
            
             queryClient.setQueryData(queryKey, [data]);
          } else {
             queryClient.setQueryData(queryKey, []);
          }
        },
        (error) => {
           console.error(`Firestore subscription error for ${path}:`, error);
        }
      );
      
      unsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, queryClient, options.enabled]);

  // Use useQuery just to return the state, queryFn is a no-op that returns data from cache
  // The actual data fetching is updated via setQueryData in the subscription
  return useQuery({
    queryKey,
    queryFn: () => {
       // Return existing data from cache or empty array
       // This fn is only called if cache is empty and no initial data
       const cachedData = queryClient.getQueryData<(T & { id: string })[]>(queryKey);
       return cachedData || [] as (T & { id: string })[];
    },
    ...options,
    // Provide initial data to avoid loading state if we want, 
    // or let it be loading until subscription fires first event
    staleTime: Infinity, // Data comes from subscription
    gcTime: Infinity, // Keep data while subscribed
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
