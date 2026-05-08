import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/post/PostCard";
import { PostOptionsSheet } from "@/components/post/PostOptionsSheet";
import { useAuthStore } from "@/stores/auth.store";
import type { Post } from "@/types";

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
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

  if (isLoading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#171D1B" /></View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물</Text>
        <View style={{ width: 40 }} />
      </View>
      {post && (
        <PostCard
          post={post}
          onMorePress={(postId, authorId) => setSheetPost({ postId, authorId })}
        />
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
});
