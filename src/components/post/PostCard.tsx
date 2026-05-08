import { View, Text, TouchableOpacity, StyleSheet, Image, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useColors } from "@/lib/colors";
import { OgPreview } from "@/components/post/OgPreview";

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onPress?: (postId: string) => void;
  onMorePress?: (postId: string, authorId: string) => void;
  onBookmark?: (postId: string) => void;
  bookmarked?: boolean;
}

export function PostCard({ post, onLike, onComment, onRepost, onShare, onPress, onMorePress, onBookmark, bookmarked }: Props) {
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
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.muted} />
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

        {post.og_url && (
          <OgPreview
            url={post.og_url}
            title={post.og_title ?? ""}
            imageUrl={post.og_image ?? ""}
          />
        )}

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
            <Ionicons
              name={post.is_liked ? "heart" : "heart-outline"}
              size={22}
              color={post.is_liked ? "#FF3B30" : colors.muted}
            />
            {(post.likes_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.likes_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="comment-button"
            style={styles.actionBtn}
            onPress={() => onComment?.(post.id)}
          >
            <Ionicons name="chatbubble-outline" size={22} color={colors.muted} />
            {(post.comments_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.comments_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="repost-button"
            style={styles.actionBtn}
            onPress={() => onRepost?.(post.id)}
          >
            <Ionicons
              name="repeat"
              size={22}
              color={post.is_reposted ? "#1AB64A" : colors.muted}
            />
            {(post.reposts_count ?? 0) > 0 && (
              <Text style={[styles.actionCount, { color: colors.muted }]}>{post.reposts_count}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="share-button"
            style={styles.actionBtn}
            onPress={() => {
              if (onShare) {
                onShare(post.id);
              } else {
                Share.share({ message: post.content ?? "", title: "Connect 게시물" });
              }
            }}
          >
            <Ionicons name="share-outline" size={22} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            testID="bookmark-button"
            style={[styles.actionBtn, styles.bookmarkBtn]}
            onPress={() => onBookmark?.(post.id)}
          >
            <Ionicons
              name={(bookmarked ?? post.is_bookmarked) ? "bookmark" : "bookmark-outline"}
              size={22}
              color={(bookmarked ?? post.is_bookmarked) ? "#F5A623" : colors.muted}
            />
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
  actionCount: { fontSize: 13 },
  bookmarkBtn: { marginLeft: "auto" as const },
});
