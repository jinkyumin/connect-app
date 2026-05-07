import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useMuteList, useUnmuteUser } from "@/hooks/useMuteBlock";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

export default function MutesScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: muted, isLoading } = useMuteList(session?.user.id);
  const { mutate: unmute } = useUnmuteUser();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>뮤트 목록</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={muted ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Profile }) => (
            <View style={styles.row}>
              <Avatar uri={item.avatar_url} size={40} initials={(item.username?.[0] ?? "?").toUpperCase()} />
              <Text style={styles.username}>{item.username}</Text>
              <TouchableOpacity onPress={() => unmute(item.id)} style={styles.actionBtn}>
                <Text style={styles.actionText}>뮤트 해제</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>뮤트한 사용자가 없습니다.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  back: { color: "#2E2E2E", fontSize: 20, width: 40 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  username: { flex: 1, fontWeight: "700", fontSize: 14, color: "#2E2E2E" },
  actionBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 13, color: "#2E2E2E" },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: "#999999", fontSize: 14 },
});
