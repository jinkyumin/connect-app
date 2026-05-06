import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";

export default function AccountScreen() {
  const session = useAuthStore((s) => s.session);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  label: { fontSize: 15, color: "#2E2E2E" },
  value: { fontSize: 15, color: "#999999" },
  arrow: { color: "#999999", fontSize: 18 },
});
