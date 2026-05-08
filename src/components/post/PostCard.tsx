import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useColors } from "@/lib/colors";

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onPress?: (postId: string) => void;
  onMorePress?: (postId: string, authorId: string) => void;
  onBookmark?: (postId: string) => void;
  bookmarked?: boolean;
}

export function PostCard({ post, onLike, onComment, onRepost, onPress, onMorePress, onBookmark, bookmarked }: Props) {
  const colors = useColors();
  const profile = post.profile;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });
  const hasComments = (post.comments_count ?? 0) > 0;
  const firstImage = post.media_urls?.[0] ?? null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}
      onPress={() => onPress?.(post.id)}
      activeOpacity={0.95}
    >
      {/* Left column: avatar + thread line */}
      <View style={styles.leftCol}>
        <Avatar uri={profile?.avatar_url} size={40} initials={profile?.username?.[0]?.toUpperCase()} />
        {hasComments && <View style={[styles.threadLine, { backgroundColor: colors.border }]} />}
      </View>

      {/* Right column: content */}
      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.header}>
          <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>{profile?.username ?? "unknown"}</Text>
          <Text style={[styles.time, { color: colors.muted }]}>{timeAgo}</Text>
          <TouchableOpacity
            style={styles.moreBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onMorePress?.(post.id, post.user_id)}
          >
            <Text style={[styles.moreIcon, { color: colors.muted }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {post.content ? (
          <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
        ) : null}

        {/* Image */}
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.image} resizeMode="cover" />
        ) : null}

        {post.edited_at ? (
          <Text style={[styles.edited, { color: colors.muted }]}>수정됨</Text>
        ) : null}

        {/* Action bar */}
        <View style={styles.actions}>
          <TouchableOpacity
            testID="like-button"
            style={styles.actionBtn}
            onPress={() => onLike?.(post.id)}
          >
            <Text style={[styles.actionIcon, { color: colors.muted }, post.is_liked && styles.likedIcon]}>{post.is_liked ? "♥" : "♡"}</Text>
            {(post.likes_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.likes_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="comment-button"
            style={styles.actionBtn}
            onPress={() => onComment?.(post.id)}
          >
            <Text style={[styles.actionIcon, { color: colors.muted }]}>💬</Text>
            {(post.comments_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.comments_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="repost-button"
            style={styles.actionBtn}
            onPress={() => onRepost?.(post.id)}
          >
            <Text style={[styles.actionIcon, { color: colors.muted }, post.is_reposted && styles.repostedIcon]}>↻</Text>
            {(post.reposts_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.reposts_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={[styles.actionIcon, { color: colors.muted }]}>⤴</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="bookmark-button"
            style={[styles.actionBtn, styles.bookmarkBtn]}
            onPress={() => onBookmark?.(post.id)}
          >
            <Text style={[styles.actionIcon, { color: colors.muted }, (bookmarked ?? post.is_bookmarked) && styles.bookmarkedIcon]}>
              {(bookmarked ?? post.is_bookmarked) ? "★" : "☆"}
            </Text>
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
  },
  leftCol: {
    alignItems: "center",
    width: 40,
  },
  threadLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    borderRadius: 1,
  },
  body: { flex: 1, gap: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: { fontWeight: "700", fontSize: 15, flex: 1 },
  time: { fontSize: 13 },
  moreBtn: { paddingLeft: 4 },
  moreIcon: { fontSize: 16 },
  content: { fontSize: 15, lineHeight: 22 },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  edited: { fontSize: 12, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 20 },
  actionCount: { fontSize: 13 },
  likedIcon: { color: "#FF3B30" },
  repostedIcon: { color: "#1AB64A" },
  bookmarkBtn: { marginLeft: "auto" as const },
  bookmarkedIcon: { color: "#F5A623" },
});
