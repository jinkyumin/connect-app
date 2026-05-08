import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookmarks } from "@/hooks/useBookmark";
import { PostCard } from "@/components/post/PostCard";
import { useLikeToggle, useIsLiked } from "@/hooks/useFeed";
import { useRepostToggle, useIsReposted } from "@/hooks/useRepost";
import type { Post } from "@/types";
import { useColors } from "@/lib/colors";

function BookmarkCard({ item }: { item: Post }) {
  const likeToggle = useLikeToggle(item.id);
  const repostToggle = useRepostToggle(item.id);
  const { data: isLiked } = useIsLiked(item.id);
  const { data: isReposted } = useIsReposted(item.id);
  const augmented = { ...item, is_liked: isLiked ?? false, is_reposted: isReposted ?? false };
  return (
    <PostCard
      post={augmented}
      onLike={() => likeToggle.mutate()}
      onRepost={() => repostToggle.mutate()}
      onComment={(id) => router.push(`/post/${id}`)}
      onPress={(id) => router.push(`/post/${id}`)}
    />
  );
}

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: posts, isLoading } = useBookmarks();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.brand }]}>저장됨</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={[styles.center, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={posts ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookmarkCard item={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>저장된 게시물이 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { fontSize: 15 },
});
