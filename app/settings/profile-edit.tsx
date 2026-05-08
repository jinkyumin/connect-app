import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Seed form state once from Supabase
  const { isLoading } = useQuery<Profile>({
    queryKey: ["myProfileEdit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id ?? "")
        .single();
      if (error) throw error;
      const p = data as Profile;
      setDisplayName(p.display_name ?? "");
      setUsername(p.username ?? "");
      setBio(p.bio ?? "");
      setWebsiteUrl(p.website_url ?? "");
      setAvatarUrl(p.avatar_url ?? null);
      return p;
    },
    enabled: !!session,
    staleTime: Infinity,
  });

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) return;

    setAvatarUploading(true);
    try {
      const userId = session!.user.id;
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      // Convert blob to ArrayBuffer for Supabase upload
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { data: upload, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`${userId}/${Date.now()}.jpg`, arrayBuffer, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(upload.path);

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      setAvatarUrl(publicUrl);
    } catch (err: unknown) {
      Alert.alert("오류", (err as Error).message ?? "아바타 업로드에 실패했습니다.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          username: username.trim(),
          bio: bio.trim() || null,
          website_url: websiteUrl.trim() || null,
        })
        .eq("id", session.user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myProfileEdit"] });
      router.back();
    } catch (err: unknown) {
      Alert.alert("오류", (err as Error).message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#171D1B" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>프로필 편집</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={pickAvatar}
          disabled={avatarUploading}
          testID="avatar-picker"
        >
          {avatarUploading ? (
            <View style={styles.avatarLoader}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <Avatar
              uri={avatarUrl}
              size={80}
              initials={username[0]?.toUpperCase() ?? "?"}
            />
          )}
          <Text style={styles.changePhotoText}>사진 변경</Text>
        </TouchableOpacity>
      </View>

      {/* Fields */}
      <View style={styles.fields}>
        <Text style={styles.fieldLabel}>이름</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="이름"
          placeholderTextColor="#AAAAAA"
          testID="input-display-name"
        />

        <Text style={styles.fieldLabel}>사용자명</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="사용자명"
          placeholderTextColor="#AAAAAA"
          autoCapitalize="none"
          testID="input-username"
        />

        <Text style={styles.fieldLabel}>소개</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          placeholder="소개를 입력하세요"
          placeholderTextColor="#AAAAAA"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="input-bio"
        />

        <Text style={styles.fieldLabel}>웹사이트</Text>
        <TextInput
          style={styles.input}
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
          placeholder="https://"
          placeholderTextColor="#AAAAAA"
          autoCapitalize="none"
          keyboardType="url"
          testID="input-website"
        />
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        testID="save-button"
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>저장</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontSize: 22, color: "#171D1B" },
  title: { fontSize: 18, fontWeight: "700", color: "#171D1B" },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatarLoader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: { fontSize: 14, color: "#171D1B", marginTop: 8, textAlign: "center" },
  fields: { paddingHorizontal: 16, gap: 4 },
  fieldLabel: { fontSize: 13, color: "#888888", marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2E2E2E",
  },
  multiline: { minHeight: 100, paddingTop: 12 },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 32,
    height: 48,
    backgroundColor: "#171D1B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
