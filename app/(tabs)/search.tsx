import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearchUsers } from "@/hooks/useSearch";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);

  const renderUser = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => router.push(`/profile/${item.username}`)}
      testID={`user-row-${item.username}`}
    >
      <Avatar uri={item.avatar_url} size={44} initials={item.username[0].toUpperCase()} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.followers_count !== undefined && (
          <Text style={styles.followersText}>팔로워 {item.followers_count}명</Text>
        )}
      </View>
      <TouchableOpacity style={styles.followBtn} testID={`follow-btn-${item.username}`}>
        <Text style={styles.followBtnText}>팔로우</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>검색</Text>
      </View>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="검색"
          placeholderTextColor="#999999"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          testID="search-input"
        />
      </View>
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color="#171D1B" />}
      <FlatList
        data={users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  titleBar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", color: "#171D1B" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2E2E2E",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  userInfo: { flex: 1 },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  followersText: { fontSize: 13, color: "#999999", marginTop: 2 },
  followBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  followBtnText: { fontSize: 13, color: "#2E2E2E" },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
