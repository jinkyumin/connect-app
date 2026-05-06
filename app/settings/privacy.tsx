import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function PrivacyScreen() {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>개인정보 및 보안</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>비공개 계정</Text>
            <Text style={styles.sub}>팔로우 요청을 승인한 사용자만 게시물을 볼 수 있습니다.</Text>
          </View>
          <Switch
            value={profile?.is_private ?? false}
            onValueChange={update}
            trackColor={{ false: "#EFEFEF", true: "#1AB64A" }}
            thumbColor="#FFF"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EFEFEF", gap: 12 },
  label: { fontSize: 15, color: "#2E2E2E", flex: 1 },
  sub: { fontSize: 13, color: "#999999", marginTop: 2 },
});
