import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUiStore } from "@/stores/ui.store";

export default function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleDark } = useUiStore();

  return (
    <View style={[styles.container, isDark && styles.darkContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, isDark && { color: "#999" }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, isDark && { color: "#FFF" }]}>모양과 화면</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, isDark && { color: "#FFF" }]}>다크 모드</Text>
        <Switch
          value={isDark}
          onValueChange={toggleDark}
          trackColor={{ false: "#EFEFEF", true: "#171D1B" }}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  label: { fontSize: 16, color: "#2E2E2E" },
});
