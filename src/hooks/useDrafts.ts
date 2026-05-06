import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Draft } from "@/types";

export function useDrafts(userId?: string) {
  return useQuery<Draft[]>({
    queryKey: ["drafts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", userId ?? "")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Draft[];
    },
    enabled: !!userId,
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, content, parentId }: { userId: string; content: string; parentId?: string }) => {
      const { error } = await supabase
        .from("drafts")
        .upsert({ user_id: userId, content, parent_id: parentId ?? null, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["drafts", vars.userId] });
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ draftId, userId }: { draftId: string; userId: string }) => {
      const { error } = await supabase.from("drafts").delete().eq("id", draftId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["drafts", vars.userId] });
    },
  });
}
