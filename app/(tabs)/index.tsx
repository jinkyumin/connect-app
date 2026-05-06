import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useFeed } from "@/hooks/useFeed";
import { PostCard } from "@/components/post/PostCard";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export default function HomeScreen() {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } = useFeed();
  const queryClient = useQueryClient();
  const posts = data?.pages.flat() ?? [];

  const handleLike = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("likes").insert({ post_id: postId, user_id: session.user.id });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#171D1B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onPress={(id) => router.push(`/post/${id}`)}
          />
        )}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 게시물이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#171D1B" },
  empty: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#999999", fontSize: 14 },
});
