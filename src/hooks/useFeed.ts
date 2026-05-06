import { useInfiniteQuery } from "@tanstack/react-query";
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
