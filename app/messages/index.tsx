import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useConversations } from "@/hooks/useMessages";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Conversation } from "@/types";

export default function MessagesScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: conversations, isLoading } = useConversations(session?.user.id);

  if (isLoading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#171D1B" /></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메시지</Text>
        <TouchableOpacity onPress={() => router.push("/messages/new")}>
          <Text style={styles.newBtn}>✏️</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations ?? []}
        keyExtractor={(item) => item.partner.id}
        renderItem={({ item }: { item: Conversation }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/messages/${item.partner.id}`)}
          >
            <Avatar uri={item.partner.avatar_url} size={48} initials={item.partner.username[0].toUpperCase()} />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={styles.username}>{item.partner.username}</Text>
                {item.last_message && (
                  <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.last_message.created_at), { addSuffix: false, locale: ko })}
                  </Text>
                )}
              </View>
              {item.last_message && (
                <Text style={styles.preview} numberOfLines={1}>{item.last_message.content}</Text>
              )}
            </View>
            {item.unread_count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread_count}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>메시지가 없습니다.</Text>
            <TouchableOpacity onPress={() => router.push("/messages/new")}>
              <Text style={styles.startChat}>새 메시지 보내기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#171D1B" },
  newBtn: { fontSize: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  info: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  time: { fontSize: 12, color: "#999999" },
  preview: { fontSize: 13, color: "#999999", marginTop: 2 },
  badge: { backgroundColor: "#1AB64A", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  empty: { paddingTop: 60, alignItems: "center", gap: 12 },
  emptyText: { color: "#999999", fontSize: 14 },
  startChat: { color: "#1AB64A", fontSize: 14, fontWeight: "600" },
});
