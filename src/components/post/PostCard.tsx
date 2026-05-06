import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onPress?: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment, onRepost, onPress }: Props) {
  const profile = post.profile;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(post.id)}
      activeOpacity={0.95}
    >
      <Avatar uri={profile?.avatar_url} size={40} initials={profile?.username?.[0]?.toUpperCase()} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.username}>{profile?.username ?? "unknown"}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        {post.content ? (
          <Text style={styles.content}>{post.content}</Text>
        ) : null}
        {post.edited_at ? (
          <Text style={styles.edited}>수정됨</Text>
        ) : null}
        <View style={styles.actions}>
          <TouchableOpacity
            testID="like-button"
            style={styles.actionBtn}
            onPress={() => onLike?.(post.id)}
          >
            <Text style={[styles.actionIcon, post.is_liked && { color: "#1AB64A" }]}>
              ♡
            </Text>
            {(post.likes_count ?? 0) > 0 && (
              <Text style={styles.actionCount}>{post.likes_count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            testID="comment-button"
            style={styles.actionBtn}
            onPress={() => onComment?.(post.id)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            {(post.comments_count ?? 0) > 0 && (
              <Text style={styles.actionCount}>{post.comments_count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            testID="repost-button"
            style={styles.actionBtn}
            onPress={() => onRepost?.(post.id)}
          >
            <Text style={[styles.actionIcon, post.is_reposted && { color: "#1AB64A" }]}>
              🔁
            </Text>
            {(post.reposts_count ?? 0) > 0 && (
              <Text style={styles.actionCount}>{post.reposts_count}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    backgroundColor: "#FFFFFF",
  },
  body: { flex: 1, gap: 4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  time: { fontSize: 12, color: "#999999" },
  content: { fontSize: 15, color: "#2E2E2E", lineHeight: 22 },
  edited: { fontSize: 12, color: "#999999", fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 16, color: "#999999" },
  actionCount: { fontSize: 12, color: "#999999" },
});
