import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post } from "@/types";
import { useHashtagFeed } from "@/hooks/useSearch";
import { PostCard } from "@/components/post/PostCard";

export default function HashtagFeedScreen() {
  const insets = useSafeAreaInsets();
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const { data: posts, isLoading } = useHashtagFeed(tag);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>#{tag}</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#171D1B" /></View>
      ) : (
        <FlatList
          data={(posts ?? []).filter(Boolean) as Post[]}
          keyExtractor={(item) => item?.id ?? ""}
          renderItem={({ item }) => item ? <PostCard post={item} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}><Text style={styles.emptyText}>게시물이 없습니다.</Text></View>
          }
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#2E2E2E" },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
