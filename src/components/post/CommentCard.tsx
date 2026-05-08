import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles: { username: string; display_name: string | null; avatar_url: string | null };
  };
}

export function CommentCard({ comment }: CommentCardProps) {
  const { profiles } = comment;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko });

  return (
    <View style={styles.container}>
      <Avatar uri={profiles?.avatar_url} size={32} initials={profiles?.username?.[0]?.toUpperCase()} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.username}>{profiles?.display_name ?? profiles?.username ?? "unknown"}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
        <TouchableOpacity style={styles.likeBtn}>
          <Text style={styles.likeIcon}>♡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
  },
  body: { flex: 1, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  time: { fontSize: 12, color: "#999999" },
  content: { fontSize: 14, color: "#2E2E2E", lineHeight: 20 },
  likeBtn: { marginTop: 4 },
  likeIcon: { fontSize: 16, color: "#999999" },
});
