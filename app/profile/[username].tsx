import { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/post/PostCard";
import { PostOptionsSheet } from "@/components/post/PostOptionsSheet";
import { useFollow, useUnfollow } from "@/hooks/useFollow";
import { useLikeToggle, useIsLiked } from "@/hooks/useFeed";
import { useRepostToggle, useIsReposted } from "@/hooks/useRepost";
import { useAuthStore } from "@/stores/auth.store";
import type { Profile, Post } from "@/types";
import { useColors } from "@/lib/colors";

function UserPostCard({ item, currentUserId, onMorePress }: { item: Post; currentUserId: string; onMorePress: (postId: string, authorId: string, content?: string) => void }) {
  const likeToggle = useLikeToggle(item.id);
  const repostToggle = useRepostToggle(item.id);
  const { data: isLiked } = useIsLiked(item.id);
  const { data: isReposted } = useIsReposted(item.id);
  const augmented = { ...item, is_liked: isLiked ?? false, is_reposted: isReposted ?? false };
  return (
    <PostCard
      post={augmented}
      onLike={() => likeToggle.mutate()}
      onRepost={() => repostToggle.mutate()}
      onComment={(id) => router.push(`/post/${id}`)}
      onPress={(id) => router.push(`/post/${id}`)}
      onMorePress={(postId, authorId) => onMorePress(postId, authorId, item.content ?? "")}
    />
  );
}

const TABS = ["스레드", "답글", "미디어", "리포스트"] as const;

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { mutate: follow, isPending: following } = useFollow();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollow();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("스레드");
  const [sheetPost, setSheetPost] = useState<{ postId: string; authorId: string; content?: string } | null>(null);
  const session = useAuthStore((s) => s.session);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, followers_count:follows!following_id(count), following_count:follows!follower_id(count)")
        .eq("username", username)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["userPosts", username, activeTab, profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const uid = profile.id;

      if (activeTab === "스레드") {
        const { data, error } = await supabase
          .from("posts")
          .select("*, profile:profiles(*)")
          .eq("user_id", uid)
          .is("parent_id", null)
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        return (data ?? []) as Post[];
      }

      if (activeTab === "답글") {
        const { data, error } = await supabase
          .from("posts")
          .select("*, profile:profiles(*)")
          .eq("user_id", uid)
          .not("parent_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        return (data ?? []) as Post[];
      }

      if (activeTab === "미디어") {
        const { data, error } = await supabase
          .from("posts")
          .select("*, profile:profiles(*)")
          .eq("user_id", uid)
          .not("media_urls", "eq", "{}")
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        return (data ?? []) as Post[];
      }

      if (activeTab === "리포스트") {
        const { data, error } = await supabase
          .from("reposts")
          .select("post_id, posts(*, profile:profiles(*))")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        return ((data ?? []).map((r: any) => r.posts).filter(Boolean)) as Post[];
      }

      return [];
    },
    enabled: !!profile,
  });

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.brand} /></View>
  );

  if (!profile) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}><Text style={{ color: colors.muted }}>프로필을 찾을 수 없습니다.</Text></View>
  );

  const followersCount = Array.isArray(profile.followers_count)
    ? (profile.followers_count[0] as any)?.count ?? 0
    : profile.followers_count ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Text style={[styles.back, { color: colors.muted }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.brand }]}>{profile.username}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* Profile section */}
            <View style={styles.profileSection}>
              <View style={styles.profileTop}>
                <View style={styles.profileInfo}>
                  <Text style={[styles.displayName, { color: colors.text }]}>{profile.display_name ?? profile.username}</Text>
                  <Text style={[styles.usernameText, { color: colors.muted }]}>@{profile.username}</Text>
                </View>
                <Avatar uri={profile.avatar_url} size={80} initials={profile.username[0].toUpperCase()} />
              </View>
              {profile.bio ? <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text> : null}
              <Text style={[styles.followersText, { color: colors.muted }]}>팔로워 {followersCount}명</Text>
              {/* Follow / Unfollow button */}
              {profile.is_following ? (
                <TouchableOpacity
                  style={[styles.followingBtn, { borderColor: colors.brand }]}
                  onPress={() => unfollow(profile.id)}
                  disabled={unfollowing}
                  testID="unfollow-button"
                >
                  <Text style={[styles.followingBtnText, { color: colors.brand }]}>팔로잉</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.followBtn, { backgroundColor: colors.brand }]}
                  onPress={() => follow(profile.id)}
                  disabled={following}
                  testID="follow-button"
                >
                  <Text style={styles.followBtnText}>팔로우</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Tabs */}
            <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                  testID={`tab-${tab}`}
                >
                  <Text style={[styles.tabText, { color: colors.muted }, activeTab === tab && { color: colors.brand, fontWeight: "600" }]}>{tab}</Text>
                  {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: colors.brand }]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <UserPostCard
            item={item}
            currentUserId={session?.user.id ?? ""}
            onMorePress={(postId, authorId, content) => setSheetPost({ postId, authorId, content })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.muted }]}>게시물이 없습니다.</Text></View>
        }
      />
      {sheetPost && (
        <PostOptionsSheet
          visible={!!sheetPost}
          onClose={() => setSheetPost(null)}
          postId={sheetPost.postId}
          authorId={sheetPost.authorId}
          currentUserId={session?.user.id ?? ""}
          initialContent={sheetPost.content}
          onDeleted={() => setSheetPost(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontSize: 14 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  profileSection: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  profileInfo: { flex: 1, marginRight: 16, justifyContent: "center" },
  displayName: { fontSize: 18, fontWeight: "700" },
  usernameText: { fontSize: 14, marginTop: 4 },
  bio: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  followersText: { fontSize: 14, marginBottom: 16 },
  followBtn: {
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  followBtnText: { fontSize: 14, color: "#FFFFFF", fontWeight: "600" },
  followingBtn: {
    height: 36,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  followingBtnText: { fontSize: 14, fontWeight: "600" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
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
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
