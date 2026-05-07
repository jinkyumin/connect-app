import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function NotificationSettingsScreen() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notifSettings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notification_settings").select("*").eq("user_id", session?.user.id ?? "").single();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { mutate: update } = useMutation({
    mutationFn: async (patch: Partial<typeof settings>) => {
      const { error } = await supabase.from("notification_settings").update(patch).eq("user_id", session?.user.id ?? "");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifSettings"] }),
  });

  const TOGGLES = [
    { key: "likes", label: "좋아요" },
    { key: "comments", label: "댓글" },
    { key: "follows", label: "팔로우" },
    { key: "dms", label: "메시지" },
    { key: "mentions", label: "언급" },
    { key: "reposts", label: "리포스트" },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>알림</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        TOGGLES.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch
              value={settings?.[key] ?? true}
              onValueChange={(val) => update({ [key]: val })}
              trackColor={{ false: "#EFEFEF", true: "#171D1B" }}
              thumbColor="#FFF"
            />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
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
