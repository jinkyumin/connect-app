import { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { useConversations } from "@/hooks/useMessages";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Conversation } from "@/types";
import { useColors } from "@/lib/colors";

const TABS = ["받은 메시지함", "요청"] as const;
type Tab = (typeof TABS)[number];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const session = useAuthStore((s) => s.session);
  const { data: conversations, isLoading } = useConversations(session?.user.id);
  const [activeTab, setActiveTab] = useState<Tab>("받은 메시지함");

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.brand }]}>메시지</Text>
        <TouchableOpacity onPress={() => router.push("/messages/new")}>
          <Ionicons name="create-outline" size={24} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: colors.muted }, activeTab === tab && { color: colors.brand, fontWeight: "600" }]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={[styles.tabUnderline, { backgroundColor: colors.brand }]} />}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === "받은 메시지함" ? (conversations ?? []) : []}
        keyExtractor={(item) => item.partner.id}
        renderItem={({ item }: { item: Conversation }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/messages/${item.partner.id}`)}
          >
            <Avatar
              uri={item.partner.avatar_url}
              size={48}
              initials={item.partner.username?.[0]?.toUpperCase() ?? ""}
            />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={[styles.username, { color: colors.text }, item.unread_count > 0 && { fontWeight: "700" }]}>
                  {item.partner.username}
                </Text>
                {item.last_message && (
                  <Text style={[styles.time, { color: colors.muted }]}>
                    {formatDistanceToNow(new Date(item.last_message.created_at), { addSuffix: false, locale: ko })}
                  </Text>
                )}
              </View>
              {item.last_message && (
                <Text style={[styles.preview, { color: colors.muted }]} numberOfLines={1}>
                  {item.last_message.content}
                </Text>
              )}
            </View>
            {item.unread_count > 0 && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>메시지가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabText: { fontSize: 14, fontWeight: "500" },
  tabUnderline: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  info: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { fontSize: 15, fontWeight: "500" },
  time: { fontSize: 12 },
  preview: { fontSize: 14, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { flex: 1, paddingTop: 80, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
