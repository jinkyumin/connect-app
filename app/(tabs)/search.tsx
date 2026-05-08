import { useState, useEffect } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearchUsers } from "@/hooks/useSearch";
import { Avatar } from "@/components/ui/Avatar";
import { useFollow, useUnfollow } from "@/hooks/useFollow";
import { useAuthStore } from "@/stores/auth.store";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useColors } from "@/lib/colors";

interface SearchUserCardProps {
  item: Profile;
  myId: string;
}

function SearchUserCard({ item, myId }: SearchUserCardProps) {
  const colors = useColors();
  const [isFollowing, setIsFollowing] = useState(false);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  useEffect(() => {
    if (!myId || myId === item.id) return;
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", myId)
      .eq("following_id", item.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data);
      });
  }, [myId, item.id]);

  const handleFollowPress = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync(item.id);
      setIsFollowing(false);
    } else {
      await followMutation.mutateAsync(item.id);
      setIsFollowing(true);
    }
  };

  const isMe = myId === item.id;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <TouchableOpacity
      style={[styles.userRow, { borderBottomColor: colors.border }]}
      onPress={() => router.push(`/profile/${item.username}`)}
      testID={`user-row-${item.username}`}
    >
      <Avatar uri={item.avatar_url} size={44} initials={item.username?.[0]?.toUpperCase() ?? ""} />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
        {item.followers_count !== undefined && (
          <Text style={[styles.followersText, { color: colors.muted }]}>팔로워 {item.followers_count}명</Text>
        )}
      </View>
      {!isMe && (
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && { backgroundColor: colors.border, borderColor: colors.border }]}
          onPress={handleFollowPress}
          disabled={isPending}
          testID={`follow-btn-${item.username}`}
        >
          <Text style={[styles.followBtnText, { color: colors.text }, isFollowing && { color: colors.muted }]}>
            {isFollowing ? "팔로잉" : "팔로우"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);
  const session = useAuthStore((s) => s.session);
  const myId = session?.user.id ?? "";

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <Text style={[styles.title, { color: colors.brand }]}>검색</Text>
      </View>
      <View style={[styles.searchBar, { backgroundColor: colors.input }]}>
        <Ionicons name="search" size={16} color="#999999" style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="검색"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          testID="search-input"
        />
      </View>
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.brand} />}
      <FlatList
        data={users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SearchUserCard item={item} myId={myId} />}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>검색 결과가 없습니다.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleBar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  userInfo: { flex: 1 },
  username: { fontWeight: "700", fontSize: 14 },
  followersText: { fontSize: 13, marginTop: 2 },
  followBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  followBtnText: { fontSize: 13 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
