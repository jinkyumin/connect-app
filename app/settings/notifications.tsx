import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/colors";

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
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
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>알림</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        TOGGLES.map(({ key, label }) => (
          <View key={key} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  back: { fontSize: 20, width: 40 },
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
