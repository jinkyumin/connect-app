import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post } from "@/types";
import { useHashtagFeed } from "@/hooks/useSearch";
import { PostCard } from "@/components/post/PostCard";
import { useColors } from "@/lib/colors";

export default function HashtagFeedScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const { data: posts, isLoading } = useHashtagFeed(tag);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.muted }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>#{tag}</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.brand} /></View>
      ) : (
        <FlatList
          data={(posts ?? []).filter(Boolean) as Post[]}
          keyExtractor={(item) => item?.id ?? ""}
          renderItem={({ item }) => item ? <PostCard post={item} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.muted }]}>게시물이 없습니다.</Text></View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
