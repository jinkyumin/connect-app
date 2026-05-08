import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/lib/colors";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const session = useAuthStore((s) => s.session);
  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>계정</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>이메일</Text>
        <Text style={[styles.value, { color: colors.muted }]}>{session?.user.email ?? "-"}</Text>
      </View>
      <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => router.push("/settings/profile-edit" as any)}>
        <Text style={[styles.label, { color: colors.text }]}>프로필 편집</Text>
        <Text style={[styles.arrow, { color: colors.muted }]}>›</Text>
      </TouchableOpacity>
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
  title: { fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: { flex: 1, fontSize: 16 },
  value: { fontSize: 16 },
  arrow: { fontSize: 20 },
});
