import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUiStore } from "@/stores/ui.store";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/lib/colors";

export default function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isDark, toggleDark } = useUiStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>모양과 화면</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>다크 모드</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
});
