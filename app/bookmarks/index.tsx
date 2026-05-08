import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookmarks } from "@/hooks/useBookmark";
import { PostCard } from "@/components/post/PostCard";
import { useColors } from "@/lib/colors";

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: posts, isLoading } = useBookmarks();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Text style={[styles.back, { color: colors.brand }]}>←</Text>
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
          renderItem={({ item }) => <PostCard post={item} />}
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
  back: { fontSize: 22 },
  title: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { fontSize: 15 },
});
