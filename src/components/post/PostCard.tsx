import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
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
  onMorePress?: (postId: string, authorId: string) => void;
}

export function PostCard({ post, onLike, onComment, onRepost, onPress, onMorePress }: Props) {
  const profile = post.profile;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });
  const hasComments = (post.comments_count ?? 0) > 0;
  const firstImage = post.media_urls?.[0] ?? null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(post.id)}
      activeOpacity={0.95}
    >
      {/* Left column: avatar + thread line */}
      <View style={styles.leftCol}>
        <Avatar uri={profile?.avatar_url} size={40} initials={profile?.username?.[0]?.toUpperCase()} />
        {hasComments && <View style={styles.threadLine} />}
      </View>

      {/* Right column: content */}
      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.header}>
          <Text style={styles.username} numberOfLines={1}>{profile?.username ?? "unknown"}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
          <TouchableOpacity
            style={styles.moreBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onMorePress?.(post.id, post.user_id)}
          >
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {post.content ? (
          <Text style={styles.content}>{post.content}</Text>
        ) : null}

        {/* Image */}
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.image} resizeMode="cover" />
        ) : null}

        {post.edited_at ? (
          <Text style={styles.edited}>수정됨</Text>
        ) : null}

        {/* Action bar */}
        <View style={styles.actions}>
          <TouchableOpacity
            testID="like-button"
            style={styles.actionBtn}
            onPress={() => onLike?.(post.id)}
          >
            <Text style={[styles.actionIcon, post.is_liked && styles.likedIcon]}>{post.is_liked ? "♥" : "♡"}</Text>
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
            <Text style={[styles.actionIcon, post.is_reposted && styles.repostedIcon]}>↻</Text>
            {(post.reposts_count ?? 0) > 0 && (
              <Text style={styles.actionCount}>{post.reposts_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>⤴</Text>
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
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
  },
  leftCol: {
    alignItems: "center",
    width: 40,
  },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#F5F5F5",
    marginTop: 4,
    borderRadius: 1,
  },
  body: { flex: 1, gap: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: { fontWeight: "700", fontSize: 15, color: "#2E2E2E", flex: 1 },
  time: { fontSize: 13, color: "#999999" },
  moreBtn: { paddingLeft: 4 },
  moreIcon: { fontSize: 16, color: "#999999" },
  content: { fontSize: 15, color: "#2E2E2E", lineHeight: 22 },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  edited: { fontSize: 12, color: "#999999", fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 20, color: "#999999" },
  actionCount: { fontSize: 13, color: "#999999" },
  likedIcon: { color: "#FF3B30" },
  repostedIcon: { color: "#1AB64A" },
});
