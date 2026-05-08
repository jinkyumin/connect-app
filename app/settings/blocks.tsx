import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { useBlockList, useUnblockUser } from "@/hooks/useMuteBlock";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";
import { useColors } from "@/lib/colors";

export default function BlocksScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const session = useAuthStore((s) => s.session);
  const { data: blocked, isLoading } = useBlockList(session?.user.id);
  const { mutate: unblock } = useUnblockUser();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>차단 목록</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={blocked ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Profile }) => (
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <Avatar uri={item.avatar_url} size={40} initials={(item.username?.[0] ?? "?").toUpperCase()} />
              <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
              <TouchableOpacity onPress={() => unblock(item.id)} style={[styles.actionBtn, { borderColor: colors.border }]}>
                <Text style={[styles.actionText, { color: colors.text }]}>차단 해제</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { color: colors.muted }]}>차단한 사용자가 없습니다.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  back: { fontSize: 20, width: 40 },
  title: { fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  username: { flex: 1, fontWeight: "700", fontSize: 14 },
  actionBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 13 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14 },
});
