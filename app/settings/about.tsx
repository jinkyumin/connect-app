import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/lib/colors";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.brand }]}>정보</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.appName, { color: colors.brand }]}>Connect</Text>
        <Text style={[styles.version, { color: colors.muted }]}>버전 1.0.0</Text>
        <Text style={[styles.team, { color: colors.muted }]}>아성다이소 IT팀 제작</Text>
        <Text style={[styles.copyright, { color: colors.muted }]}>© 2026 Daiso Industries</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 60,
  },
  appName: { fontSize: 20, fontWeight: "700" },
  version: { fontSize: 14 },
  team: { fontSize: 14 },
  copyright: { fontSize: 13, marginTop: 4 },
});
