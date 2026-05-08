import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/post/PostCard";
import { PostOptionsSheet } from "@/components/post/PostOptionsSheet";
import { CommentCard } from "@/components/post/CommentCard";
import { CommentInput } from "@/components/post/CommentInput";
import { useComments } from "@/hooks/useComments";
import { useLikeToggle, useIsLiked } from "@/hooks/useFeed";
import { useRepostToggle, useIsReposted } from "@/hooks/useRepost";
import { useAuthStore } from "@/stores/auth.store";
import type { Post } from "@/types";
import { useColors } from "@/lib/colors";

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user.id ?? "";
  const [sheetPost, setSheetPost] = useState<{ postId: string; authorId: string } | null>(null);

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profile:profiles(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Post;
    },
  });

  const { data: comments = [] } = useComments(id ?? "");
  const likeToggle = useLikeToggle(id ?? "");
  const repostToggle = useRepostToggle(id ?? "");
  const { data: isLiked } = useIsLiked(id ?? "");
  const { data: isReposted } = useIsReposted(id ?? "");
  const augmentedPost = post ? { ...post, is_liked: isLiked ?? false, is_reposted: isReposted ?? false } : null;

  const profile = (session?.user as any)?.user_metadata ?? null;

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.brand} /></View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.muted }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>게시물</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        style={styles.list}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentCard comment={item} />}
        ListHeaderComponent={
          <>
            {augmentedPost && (
              <PostCard
                post={augmentedPost}
                onLike={() => likeToggle.mutate()}
                onRepost={() => repostToggle.mutate()}
                onMorePress={(postId, authorId) => setSheetPost({ postId, authorId })}
              />
            )}
            <View style={[styles.commentHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentHeaderText, { color: colors.text }]}>댓글 {comments.length}개</Text>
            </View>
          </>
        }
      />

      <CommentInput postId={id ?? ""} avatarUrl={profile?.avatar_url ?? null} />

      {sheetPost && (
        <PostOptionsSheet
          visible={!!sheetPost}
          onClose={() => setSheetPost(null)}
          postId={sheetPost.postId}
          authorId={sheetPost.authorId}
          currentUserId={currentUserId}
          onDeleted={() => { setSheetPost(null); router.back(); }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  back: { fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  list: { flex: 1 },
  commentHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  commentHeaderText: { fontSize: 14, fontWeight: "700" },
});
