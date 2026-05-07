import { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useConversations } from "@/hooks/useMessages";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Conversation } from "@/types";

const TABS = ["받은 메시지함", "요청"] as const;
type Tab = (typeof TABS)[number];

export default function MessagesScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: conversations, isLoading } = useConversations(session?.user.id);
  const [activeTab, setActiveTab] = useState<Tab>("받은 메시지함");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#171D1B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메시지</Text>
        <TouchableOpacity onPress={() => router.push("/messages/new")}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={activeTab === "받은 메시지함" ? (conversations ?? []) : []}
        keyExtractor={(item) => item.partner.id}
        renderItem={({ item }: { item: Conversation }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/messages/${item.partner.id}`)}
          >
            <Avatar
              uri={item.partner.avatar_url}
              size={48}
              initials={item.partner.username[0].toUpperCase()}
            />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={[styles.username, item.unread_count > 0 && styles.usernameUnread]}>
                  {item.partner.username}
                </Text>
                {item.last_message && (
                  <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.last_message.created_at), {
                      addSuffix: false,
                      locale: ko,
                    })}
                  </Text>
                )}
              </View>
              {item.last_message && (
                <Text style={styles.preview} numberOfLines={1}>
                  {item.last_message.content}
                </Text>
              )}
            </View>
            {item.unread_count > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>메시지가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#171D1B" },
  editIcon: { fontSize: 20, color: "#171D1B" },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  tabText: { fontSize: 14, color: "#999999", fontWeight: "500" },
  tabTextActive: { color: "#171D1B", fontWeight: "600" },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#171D1B",
  },

  // Conversation row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  info: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { fontSize: 15, fontWeight: "500", color: "#2E2E2E" },
  usernameUnread: { fontWeight: "700" },
  time: { fontSize: 12, color: "#999999" },
  preview: { fontSize: 14, color: "#999999", marginTop: 2 },

  // Unread dot
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1AB64A",
  },

  // Empty state
  empty: { flex: 1, paddingTop: 80, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#999999" },
});
