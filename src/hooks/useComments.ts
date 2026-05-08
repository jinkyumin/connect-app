import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, display_name, avatar_url)")
        .eq("parent_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다");
      const { error } = await supabase.from("posts").insert({
        content,
        parent_id: parentId,
        user_id: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
