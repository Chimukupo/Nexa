import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getUserDoc } from "@/lib/firebase/collections";
import { getDoc, setDoc, updateDoc } from "firebase/firestore";
import { userKeys } from "@/lib/queries/keys";
import { UserProfile, UserProfileSchema } from "@workspace/validators";
import { z } from "zod";

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: userKeys.detail(user?.uid ?? ""),
    queryFn: async () => {
      if (!user?.uid) return null;
      const ref = getUserDoc(user.uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    },
    enabled: !!user?.uid,
  });
}

export function useCreateUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<UserProfile, "uid"> & { uid: string }) => {
      if (!user?.uid) throw new Error("User not authenticated");
      const ref = getUserDoc(user.uid);
      // Ensure we're sending valid data according to schema
      const validData = UserProfileSchema.parse({ ...data, uid: user.uid });
      await setDoc(ref, validData);
      return validData;
    },
    onSuccess: (_, variables) => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.uid) });
        // Also invalidate 'all' users if that's ever used (unlikely for this app)
      }
    },
  });
}

export function useUpdateUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      if (!user?.uid) throw new Error("User not authenticated");
      const ref = getUserDoc(user.uid);
      
      // We can't easily validate partial updates with the full schema without merging first,
      // but Firestore handles partial updates fine. 
      // Ideally we'd validate the partial data against a partial schema.
      const partialSchema = UserProfileSchema.partial();
      const validData = partialSchema.parse(data);

      await updateDoc(ref, validData);
      return validData;
    },
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.uid) });
      }
    },
  });
}

