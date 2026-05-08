import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>정보</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.appName}>Connect</Text>
        <Text style={styles.version}>버전 1.0.0</Text>
        <Text style={styles.team}>아성다이소 IT팀 제작</Text>
        <Text style={styles.copyright}>© 2026 Daiso Industries</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20, color: "#2E2E2E" },
  title: { fontSize: 18, fontWeight: "700", color: "#171D1B" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 60,
  },
  appName: { fontSize: 20, fontWeight: "700", color: "#171D1B" },
  version: { fontSize: 14, color: "#666666" },
  team: { fontSize: 14, color: "#666666" },
  copyright: { fontSize: 13, color: "#999999", marginTop: 4 },
});
