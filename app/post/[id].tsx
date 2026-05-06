import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/post/PostCard";
import type { Post } from "@/types";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물</Text>
        <View style={{ width: 40 }} />
      </View>
      {post && <PostCard post={post} />}
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
