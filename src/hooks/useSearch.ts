import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export function useSearchUsers(query: string) {
  return useQuery<Profile[]>({
    queryKey: ["search", "users", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    enabled: query.trim().length > 0,
  });
}

export function useHashtagFeed(tag: string) {
  return useQuery({
    queryKey: ["hashtag", tag],
    queryFn: async () => {
      // First look up the hashtag ID
      const { data: hashtag } = await supabase
        .from("hashtags")
        .select("id")
        .eq("tag", tag.toLowerCase())
        .maybeSingle();

      // Return empty array if hashtag doesn't exist yet
      if (!hashtag) return [];

      const { data, error } = await supabase
        .from("post_hashtags")
        .select("post:posts(*, profile:profiles(*))")
        .eq("hashtag_id", hashtag.id)
        .limit(30);

      if (error) throw error;
      return data?.map((d) => d.post) ?? [];
    },
    enabled: !!tag,
  });
}
