import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Notification } from "@/types";

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

export default function ActivityScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: notifications, isLoading } = useNotifications(session?.user.id);

  if (isLoading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#171D1B" /></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>알림</Text>
      </View>
      <FlatList
        data={notifications ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, !item.read_at && styles.unread]}>
            <Avatar
              uri={item.actor?.avatar_url}
              size={40}
              initials={item.actor?.username?.[0]?.toUpperCase()}
            />
            <View style={styles.textArea}>
              <Text style={styles.notifText}>
                <Text style={styles.bold}>{item.actor?.username}</Text>
                {notificationText(item)}
              </Text>
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ko })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 알림이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#171D1B" },
  row: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  unread: { backgroundColor: "#F4FBF8" },
  textArea: { flex: 1, gap: 4 },
  notifText: { fontSize: 14, color: "#2E2E2E", lineHeight: 20 },
  bold: { fontWeight: "700" },
  time: { fontSize: 12, color: "#999999" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
