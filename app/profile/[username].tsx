import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { useFollow, useUnfollow } from "@/hooks/useFollow";
import type { Profile, Post } from "@/types";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { mutate: follow, isPending: following } = useFollow();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollow();

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
    queryKey: ["userPosts", username],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*, profile:profiles(*)")
        .eq("user_id", profile.id)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Post[];
    },
    enabled: !!profile,
  });

  if (isLoading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#171D1B" /></View>
  );

  if (!profile) return (
    <View style={styles.center}><Text style={{ color: "#999" }}>프로필을 찾을 수 없습니다.</Text></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <Avatar uri={profile.avatar_url} size={72} initials={profile.username[0].toUpperCase()} />
            <Text style={styles.displayName}>{profile.display_name ?? profile.username}</Text>
            <Text style={styles.usernameText}>@{profile.username}</Text>
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
            <View style={styles.statsRow}>
              <Text style={styles.stat}><Text style={styles.statNum}>{profile.followers_count ?? 0}</Text> 팔로워</Text>
              <Text style={styles.stat}><Text style={styles.statNum}>{profile.following_count ?? 0}</Text> 팔로잉</Text>
            </View>
            <View style={styles.followBtn}>
              {profile.is_following ? (
                <Button label="팔로잉" variant="outline" onPress={() => unfollow(profile.id)} loading={unfollowing} />
              ) : (
                <Button label="팔로우" onPress={() => follow(profile.id)} loading={following} />
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyText}>게시물이 없습니다.</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  profileSection: { alignItems: "center", padding: 24, gap: 8, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  displayName: { fontSize: 22, fontWeight: "700", color: "#2E2E2E" },
  usernameText: { fontSize: 14, color: "#999999" },
  bio: { fontSize: 14, color: "#2E2E2E", textAlign: "center", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  stat: { fontSize: 14, color: "#999999" },
  statNum: { fontWeight: "700", color: "#2E2E2E" },
  followBtn: { marginTop: 8, width: "100%" },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
