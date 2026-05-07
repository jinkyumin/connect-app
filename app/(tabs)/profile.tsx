import { useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/post/PostCard";
import type { Profile, Post } from "@/types";

const TABS = ["스레드", "답글", "미디어", "리포스트"] as const;

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("스레드");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, followers_count:follows!following_id(count), following_count:follows!follower_id(count)")
        .eq("id", session?.user.id ?? "")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session,
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["myPosts"],
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
    <View style={styles.center}><Text style={{ color: "#999" }}>로그인이 필요합니다.</Text></View>
  );

  const followersCount = Array.isArray(profile.followers_count)
    ? (profile.followers_count[0] as any)?.count ?? 0
    : profile.followers_count ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <TouchableOpacity testID="settings-button">
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
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
                  <Text style={styles.displayName}>{profile.display_name ?? profile.username}</Text>
                  <Text style={styles.usernameText}>@{profile.username}</Text>
                </View>
                <Avatar uri={profile.avatar_url} size={80} initials={profile.username[0].toUpperCase()} />
              </View>
              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
              <Text style={styles.followersText}>팔로워 {followersCount}명</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} testID="edit-profile-button">
                  <Text style={styles.actionBtnText}>프로필 편집</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} testID="share-profile-button">
                  <Text style={styles.actionBtnText}>프로필 공유</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Tabs */}
            <View style={styles.tabBar}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                  testID={`tab-${tab}`}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                  {activeTab === tab && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#171D1B" },
  settingsIcon: { fontSize: 22, color: "#171D1B" },
  profileSection: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  profileInfo: { flex: 1, marginRight: 16, justifyContent: "center" },
  displayName: { fontSize: 18, fontWeight: "700", color: "#2E2E2E" },
  usernameText: { fontSize: 14, color: "#999999", marginTop: 4 },
  bio: { fontSize: 14, color: "#2E2E2E", lineHeight: 20, marginBottom: 8 },
  followersText: { fontSize: 14, color: "#999999", marginBottom: 16 },
  actionButtons: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: { fontSize: 14, color: "#2E2E2E", fontWeight: "500" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  tabText: { fontSize: 14, color: "#999999" },
  tabTextActive: { color: "#171D1B", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#171D1B",
  },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
