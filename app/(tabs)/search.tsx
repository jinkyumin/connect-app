import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSearchUsers } from "@/hooks/useSearch";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);

  const renderUser = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => router.push(`/profile/${item.username}`)}
    >
      <Avatar uri={item.avatar_url} size={44} initials={item.username[0].toUpperCase()} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.display_name && <Text style={styles.displayName}>{item.display_name}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="사용자 검색"
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
  searchBar: { padding: 16 },
  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 10,
    paddingHorizontal: 16,
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
    borderBottomColor: "#EFEFEF",
  },
  userInfo: { flex: 1 },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  displayName: { fontSize: 13, color: "#999999", marginTop: 2 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
