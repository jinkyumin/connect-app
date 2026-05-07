import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSearchUsers } from "@/hooks/useSearch";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

export default function NewMessageScreen() {
  const [query, setQuery] = useState("");
  const { data: users } = useSearchUsers(query);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새 메시지</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="사용자 검색"
          placeholderTextColor="#999999"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {/* User list */}
      <FlatList
        data={users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Profile }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.replace(`/messages/${item.id}`)}
          >
            <Avatar
              uri={item.avatar_url}
              size={44}
              initials={item.username[0].toUpperCase()}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              {item.display_name ? (
                <Text style={styles.fullName}>{item.display_name}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backBtn: { width: 40 },
  backArrow: { fontSize: 20, color: "#171D1B" },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },

  // Search
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  searchInput: {
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2E2E2E",
  },

  // User row
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
  username: { fontSize: 15, fontWeight: "700", color: "#2E2E2E" },
  fullName: { fontSize: 13, color: "#999999", marginTop: 2 },
});
