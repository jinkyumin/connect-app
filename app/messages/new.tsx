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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새 메시지</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.searchRow}>
        <Text style={styles.to}>받는 사람:</Text>
        <TextInput
          style={styles.input}
          placeholder="사용자 검색"
          placeholderTextColor="#999999"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>
      <FlatList
        data={users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Profile }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.replace(`/messages/${item.id}`)}
          >
            <Avatar uri={item.avatar_url} size={40} initials={item.username[0].toUpperCase()} />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  cancel: { color: "#999999", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  to: { fontSize: 14, color: "#999999", marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#2E2E2E" },
  userRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
});
