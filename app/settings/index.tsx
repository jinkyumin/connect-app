import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const SETTINGS_ITEMS = [
  { label: "계정", route: "/settings/account", icon: "👤" },
  { label: "알림", route: "/settings/notifications", icon: "🔔" },
  { label: "개인정보 및 보안", route: "/settings/privacy", icon: "🔒" },
  { label: "모양과 화면", route: "/settings/appearance", icon: "🎨" },
  { label: "뮤트 목록", route: "/settings/mutes", icon: "🔇" },
  { label: "차단 목록", route: "/settings/blocks", icon: "🚫" },
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
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  title: { fontSize: 22, fontWeight: "700", color: "#171D1B" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EFEFEF", gap: 12 },
  icon: { fontSize: 20 },
  label: { flex: 1, fontSize: 15, color: "#2E2E2E" },
  arrow: { color: "#999999", fontSize: 18 },
  signOut: { margin: 24, alignItems: "center" },
  signOutText: { color: "#FF3B30", fontSize: 15, fontWeight: "600" },
});
