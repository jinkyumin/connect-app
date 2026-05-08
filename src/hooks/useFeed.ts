import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

const PAGE_SIZE = 20;

export function useFeed() {
  return useInfiniteQuery<Post[]>({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profile:profiles(*),
          likes_count:likes(count),
          comments_count:posts!parent_id(count),
          reposts_count:reposts(count)
        `)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return (data ?? []) as Post[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
}

export function useLikeToggle(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다");
      const userId = session.user.id;
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("likes").delete()
          .eq("post_id", postId).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useIsLiked(postId: string) {
  return useQuery({
    queryKey: ["liked", postId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const { data } = await supabase.from("likes").select("id")
        .eq("post_id", postId).eq("user_id", session.user.id).maybeSingle();
      return !!data;
    },
  });
}
