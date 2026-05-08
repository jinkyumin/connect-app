import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRepostToggle(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다");
      const userId = session.user.id;
      const { data: existing } = await supabase
        .from("reposts")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("reposts").delete()
          .eq("post_id", postId).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reposts").insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["reposted", postId] });
    },
  });
}

export function useIsReposted(postId: string) {
  return useQuery({
    queryKey: ["reposted", postId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const { data } = await supabase.from("reposts").select("id")
        .eq("post_id", postId).eq("user_id", session.user.id).maybeSingle();
      return !!data;
    },
  });
}
