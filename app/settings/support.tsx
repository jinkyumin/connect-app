import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>지원</Text>
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL("mailto:connect@daiso.com")}
        testID="email-support"
      >
        <Text style={styles.label}>이메일 문의</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert("준비 중", "서비스 준비 중입니다.")}
        testID="faq"
      >
        <Text style={styles.label}>자주 묻는 질문</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20, color: "#2E2E2E" },
  title: { fontSize: 18, fontWeight: "700", color: "#171D1B" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  label: { flex: 1, fontSize: 16, color: "#2E2E2E" },
  arrow: { color: "#999999", fontSize: 20 },
});
