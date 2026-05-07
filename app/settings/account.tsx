import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>계정</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>이메일</Text>
        <Text style={styles.value}>{session?.user.email ?? "-"}</Text>
      </View>
      <TouchableOpacity style={styles.row} onPress={() => router.push("/settings/profile-edit" as any)}>
        <Text style={styles.label}>프로필 편집</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
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
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  label: { flex: 1, fontSize: 16, color: "#2E2E2E" },
  value: { fontSize: 16, color: "#999999" },
  arrow: { color: "#999999", fontSize: 20 },
});
