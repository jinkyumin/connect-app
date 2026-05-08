import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSearchUsers } from "@/hooks/useSearch";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";
import { useColors } from "@/lib/colors";

export default function NewMessageScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [query, setQuery] = useState("");
  const { data: users } = useSearchUsers(query);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>새 메시지</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrapper, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.input, color: colors.text }]}
          placeholder="사용자 검색"
          placeholderTextColor={colors.muted}
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
            style={[styles.userRow, { borderBottomColor: colors.border }]}
            onPress={() => router.replace(`/messages/${item.id}`)}
          >
            <Avatar
              uri={item.avatar_url}
              size={44}
              initials={item.username?.[0]?.toUpperCase() ?? ""}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
              {item.display_name ? (
                <Text style={[styles.fullName, { color: colors.muted }]}>{item.display_name}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40 },
  title: { fontSize: 16, fontWeight: "700" },

  // Search
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },

  // User row
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  userInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: "700" },
  fullName: { fontSize: 13, marginTop: 2 },
});
