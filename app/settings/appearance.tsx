import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useUiStore } from "@/stores/ui.store";

export default function AppearanceScreen() {
  const { isDark, toggleDark } = useUiStore();

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, isDark && { color: "#999" }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.title, isDark && { color: "#FFF" }]}>모양과 화면</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.row}>
        <View>
          <Text style={[styles.label, isDark && { color: "#FFF" }]}>다크 모드</Text>
          <Text style={styles.sub}>화면을 어둡게 표시합니다.</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleDark}
          trackColor={{ false: "#EFEFEF", true: "#1AB64A" }}
          thumbColor="#FFF"
          testID="dark-mode-switch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  darkContainer: { backgroundColor: "#0E0E0E" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  label: { fontSize: 15, color: "#2E2E2E" },
  sub: { fontSize: 13, color: "#999999", marginTop: 2 },
});
