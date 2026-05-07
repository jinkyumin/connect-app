import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const SETTINGS_ITEMS = [
  { label: "계정", route: "/settings/account" },
  { label: "알림", route: "/settings/notifications" },
  { label: "개인정보", route: "/settings/privacy" },
  { label: "모양과 화면", route: "/settings/appearance" },
  { label: "지원", route: "/settings/support" },
  { label: "정보", route: "/settings/about" },
];

export default function SettingsScreen() {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>
      {SETTINGS_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.row}
          onPress={() => router.push(item.route as any)}
          testID={`settings-${item.label}`}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.row} onPress={handleSignOut}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#2E2E2E" },
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
  signOutText: { flex: 1, fontSize: 16, color: "#FF3B30" },
});
