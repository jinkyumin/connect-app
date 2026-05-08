import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/lib/colors";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.brand }]}>지원</Text>
      </View>

      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={() => Linking.openURL("mailto:connect@daiso.com")}
        testID="email-support"
      >
        <Text style={[styles.label, { color: colors.text }]}>이메일 문의</Text>
        <Text style={[styles.arrow, { color: colors.muted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={() => Alert.alert("준비 중", "서비스 준비 중입니다.")}
        testID="faq"
      >
        <Text style={[styles.label, { color: colors.text }]}>자주 묻는 질문</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20 },
  title: { fontSize: 18, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: { flex: 1, fontSize: 16 },
  arrow: { fontSize: 20 },
});
