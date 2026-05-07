import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("is_private").eq("id", session?.user.id ?? "").single();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { mutate: update } = useMutation({
    mutationFn: async (isPrivate: boolean) => {
      const { error } = await supabase.from("profiles").update({ is_private: isPrivate }).eq("id", session?.user.id ?? "");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myProfile"] }),
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>개인정보</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <View style={styles.row}>
          <Text style={styles.label}>비공개 계정</Text>
          <Switch
            value={profile?.is_private ?? false}
            onValueChange={update}
            trackColor={{ false: "#EFEFEF", true: "#171D1B" }}
            thumbColor="#FFF"
          />
        </View>
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
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  label: { flex: 1, fontSize: 16, color: "#2E2E2E" },
});
