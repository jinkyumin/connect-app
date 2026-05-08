import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeed, useLikeToggle } from "@/hooks/useFeed";
import { useRepostToggle } from "@/hooks/useRepost";
import { PostCard } from "@/components/post/PostCard";
import { PostOptionsSheet } from "@/components/post/PostOptionsSheet";
import { useAuthStore } from "@/stores/auth.store";
import { router } from "expo-router";
import type { Post } from "@/types";

function PostCardWrapper({
  item,
  onPress,
  onMorePress,
}: {
  item: Post;
  onPress: (id: string) => void;
  onMorePress: (postId: string, authorId: string) => void;
}) {
  const likeToggle = useLikeToggle(item.id);
  const repostToggle = useRepostToggle(item.id);
  return (
    <PostCard
      post={item}
      onLike={() => likeToggle.mutate()}
      onRepost={() => repostToggle.mutate()}
      onPress={onPress}
      onMorePress={onMorePress}
    />
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch } = useFeed();
  const posts = data?.pages.flat() ?? [];
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user.id ?? "";
  const [sheetPost, setSheetPost] = useState<{ postId: string; authorId: string } | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#171D1B" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#999999" }}>게시물을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity style={styles.headerDmBtn} onPress={() => router.push("/messages")}>
          <Text style={styles.headerDmIcon}>✉</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCardWrapper
            item={item}
            onPress={(id) => router.push(`/post/${id}`)}
            onMorePress={(postId, authorId) => setSheetPost({ postId, authorId })}
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
      {sheetPost && (
        <PostOptionsSheet
          visible={!!sheetPost}
          onClose={() => setSheetPost(null)}
          postId={sheetPost.postId}
          authorId={sheetPost.authorId}
          currentUserId={currentUserId}
          onDeleted={() => setSheetPost(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  headerSpacer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#171D1B" },
  headerDmBtn: { flex: 1, alignItems: "flex-end" },
  headerDmIcon: { fontSize: 22, color: "#171D1B" },
  empty: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#999999", fontSize: 14 },
});
