import { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications, markNotificationRead } from "@/hooks/useNotifications";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Notification } from "@/types";
import { useColors } from "@/lib/colors";

type NotifTab = "모두" | "팔로우" | "대화" | "언급";
const TABS: NotifTab[] = ["모두", "팔로우", "대화", "언급"];

function notificationText(n: Notification): string {
  switch (n.type) {
    case "like": return "님이 회원님의 게시물을 좋아합니다.";
    case "comment": return "님이 댓글을 남겼습니다.";
    case "follow": return "님이 팔로우하기 시작했습니다.";
    case "follow_request": return "님이 팔로우를 요청했습니다.";
    case "repost": return "님이 게시물을 리포스트했습니다.";
    case "mention": return "님이 게시물에서 회원님을 언급했습니다.";
    case "quote": return "님이 회원님의 게시물을 인용했습니다.";
    default: return "님의 새 알림";
  }
}

function filterByTab(notifications: Notification[], tab: NotifTab): Notification[] {
  if (tab === "모두") return notifications;
  if (tab === "팔로우") return notifications.filter((n) => n.type === "follow" || n.type === "follow_request");
  if (tab === "대화") return notifications.filter((n) => n.type === "comment" || n.type === "like");
  if (tab === "언급") return notifications.filter((n) => n.type === "mention" || n.type === "quote");
  return notifications;
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const session = useAuthStore((s) => s.session);
  const { data: notifications, isLoading } = useNotifications(session?.user.id);
  const [activeTab, setActiveTab] = useState<NotifTab>("모두");

  const handleNotificationPress = (notification: Notification) => {
    markNotificationRead(notification.id);
    if (notification.post_id) {
      router.push(`/post/${notification.post_id}`);
    } else if (notification.actor?.username) {
      router.push(`/profile/${notification.actor.username}`);
    }
  };

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.brand} /></View>
  );

  const filtered = filterByTab(notifications ?? [], activeTab);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.brand }]}>활동</Text>
      </View>
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            testID={`activity-tab-${tab}`}
          >
            <Text style={[styles.tabText, { color: colors.muted }, activeTab === tab && { color: colors.brand, fontWeight: "600" }]}>{tab}</Text>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: colors.brand }]} />}
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }, !item.read_at && { backgroundColor: colors.card }]}
            onPress={() => handleNotificationPress(item)}
            testID={`notification-${item.id}`}
          >
            <Avatar
              uri={item.actor?.avatar_url}
              size={40}
              initials={item.actor?.username?.[0]?.toUpperCase()}
            />
            <View style={styles.textArea}>
              <Text style={[styles.notifText, { color: colors.text }]}>
                <Text style={styles.bold}>{item.actor?.username}</Text>
                {notificationText(item)}
              </Text>
              <Text style={[styles.time, { color: colors.muted }]}>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ko })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>아직 알림이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  tabText: { fontSize: 14 },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  textArea: { flex: 1, gap: 4 },
  notifText: { fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: "700" },
  time: { fontSize: 12 },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
