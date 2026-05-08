import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/colors";

const SETTINGS_ITEMS = [
  { label: "계정", route: "/settings/account" },
  { label: "저장됨", route: "/bookmarks" },
  { label: "알림", route: "/settings/notifications" },
  { label: "개인정보", route: "/settings/privacy" },
  { label: "모양과 화면", route: "/settings/appearance" },
  { label: "지원", route: "/settings/support" },
  { label: "정보", route: "/settings/about" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const handleSignOut = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>설정</Text>
      </View>
      {SETTINGS_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => router.push(item.route as any)}
          testID={`settings-${item.label}`}
        >
          <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
          <Text style={[styles.arrow, { color: colors.muted }]}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleSignOut}>
        <Text style={[styles.signOutText, { color: colors.danger }]}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: { flex: 1, fontSize: 16 },
  arrow: { fontSize: 20 },
  signOutText: { flex: 1, fontSize: 16 },
});
