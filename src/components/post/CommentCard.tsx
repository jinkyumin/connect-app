import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useColors } from "@/lib/colors";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles: { username: string; display_name: string | null; avatar_url: string | null };
  };
}

export function CommentCard({ comment }: CommentCardProps) {
  const colors = useColors();
  const { profiles } = comment;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <Avatar uri={profiles?.avatar_url} size={32} initials={profiles?.username?.[0]?.toUpperCase()} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={[styles.username, { color: colors.text }]}>{profiles?.display_name ?? profiles?.username ?? "unknown"}</Text>
          <Text style={[styles.time, { color: colors.muted }]}>{timeAgo}</Text>
        </View>
        <Text style={[styles.content, { color: colors.text }]}>{comment.content}</Text>
        <TouchableOpacity style={styles.likeBtn}>
          <Ionicons name="heart-outline" size={16} color={colors.muted} />
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
  },
  body: { flex: 1, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  username: { fontWeight: "700", fontSize: 14 },
  time: { fontSize: 12 },
  content: { fontSize: 14, lineHeight: 20 },
  likeBtn: { marginTop: 4 },
});
