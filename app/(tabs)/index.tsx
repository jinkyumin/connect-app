import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFeed, useLikeToggle } from "@/hooks/useFeed";
import { useRepostToggle } from "@/hooks/useRepost";
import { PostCard } from "@/components/post/PostCard";
import { PostOptionsSheet } from "@/components/post/PostOptionsSheet";
import { useAuthStore } from "@/stores/auth.store";
import { router } from "expo-router";
import type { Post } from "@/types";
import { useColors } from "@/lib/colors";

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
  const colors = useColors();
  const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch } = useFeed();
  const posts = data?.pages.flat() ?? [];
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user.id ?? "";
  const [sheetPost, setSheetPost] = useState<{ postId: string; authorId: string } | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.muted }}>게시물을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.brand }]}>Connect</Text>
        <TouchableOpacity style={styles.headerDmBtn} onPress={() => router.push("/messages")}>
          <Ionicons name="mail-outline" size={24} color={colors.brand} />
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
            <Text style={[styles.emptyText, { color: colors.muted }]}>아직 게시물이 없습니다.</Text>
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerSpacer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  headerDmBtn: { flex: 1, alignItems: "flex-end" },
  empty: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 14 },
});
