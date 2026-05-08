import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function extractHashtags(content: string): string[] {
  const matches = content.match(/#(\w+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

export function extractMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

interface CreatePostInput {
  content: string;
  mediaUrls?: string[];
  mediaTypes?: string[];
  parentId?: string;
  quotePostId?: string;
  ogUrl?: string;
  ogTitle?: string;
  ogImage?: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          user_id: session.user.id,
          content: input.content,
          media_urls: input.mediaUrls ?? [],
          media_types: input.mediaTypes ?? [],
          parent_id: input.parentId ?? null,
          quote_post_id: input.quotePostId ?? null,
          og_url: input.ogUrl ?? null,
          og_title: input.ogTitle ?? null,
          og_image: input.ogImage ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      const tags = extractHashtags(input.content);
      for (const tag of tags) {
        const { data: existing } = await supabase
          .from("hashtags")
          .select("id")
          .eq("tag", tag)
          .single();

        const hashtagId = existing?.id ?? (
          await supabase.from("hashtags").insert({ tag }).select("id").single()
        ).data?.id;

        if (hashtagId && post) {
          await supabase.from("post_hashtags").insert({ post_id: post.id, hashtag_id: hashtagId });
        }
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.removeQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase
        .from("posts")
        .update({ content, edited_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
