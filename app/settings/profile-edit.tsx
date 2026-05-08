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
import { useColors } from "@/lib/colors";

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
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
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { data: upload, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`${userId}/${Date.now()}.jpg`, arrayBuffer, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (!uploadError && upload) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(upload.path);
        setAvatarUrl(publicUrl);
        setPendingAvatarUri(null);
      } else {
        // Upload failed — show locally only, will retry on save
        setPendingAvatarUri(asset.uri);
        setAvatarUrl(asset.uri);
      }
    } catch {
      // Upload failed — show locally only
      setPendingAvatarUri(asset.uri);
      setAvatarUrl(asset.uri);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const userId = session.user.id;
      const updateData: Record<string, unknown> = {
        display_name: displayName.trim() || null,
        username: username.trim(),
        bio: bio.trim() || null,
        website_url: websiteUrl.trim() || null,
      };

      // If there's a pending local URI that wasn't uploaded yet, try upload now
      if (pendingAvatarUri) {
        try {
          const response = await fetch(pendingAvatarUri);
          const blob = await response.blob();
          const arrayBuffer = await new Response(blob).arrayBuffer();
          const { data: upload, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(`${userId}/${Date.now()}.jpg`, arrayBuffer, {
              upsert: true,
              contentType: "image/jpeg",
            });
          if (!uploadError && upload) {
            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(upload.path);
            updateData.avatar_url = publicUrl;
          }
          // If upload still fails, skip avatar_url update — other fields still save
        } catch {}
      } else if (avatarUrl && !avatarUrl.startsWith("file://")) {
        // avatarUrl is already a remote URL (set during pickAvatar)
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
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
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Text style={[styles.back, { color: colors.brand }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.brand }]}>프로필 편집</Text>
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
          <Text style={[styles.changePhotoText, { color: colors.brand }]}>사진 변경</Text>
        </TouchableOpacity>
      </View>

      {/* Fields */}
      <View style={styles.fields}>
        <Text style={[styles.fieldLabel, { color: colors.muted }]}>이름</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="이름"
          placeholderTextColor={colors.muted}
          testID="input-display-name"
        />

        <Text style={[styles.fieldLabel, { color: colors.muted }]}>사용자명</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          value={username}
          onChangeText={setUsername}
          placeholder="사용자명"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          testID="input-username"
        />

        <Text style={[styles.fieldLabel, { color: colors.muted }]}>소개</Text>
        <TextInput
          style={[styles.input, styles.multiline, { backgroundColor: colors.input, color: colors.text }]}
          value={bio}
          onChangeText={setBio}
          placeholder="소개를 입력하세요"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="input-bio"
        />

        <Text style={[styles.fieldLabel, { color: colors.muted }]}>웹사이트</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
          placeholder="https://"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="url"
          testID="input-website"
        />
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.brand }, saving && styles.saveBtnDisabled]}
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
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontSize: 22 },
  title: { fontSize: 18, fontWeight: "700" },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatarLoader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: { fontSize: 14, marginTop: 8, textAlign: "center" },
  fields: { paddingHorizontal: 16, gap: 4 },
  fieldLabel: { fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 100, paddingTop: 12 },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 32,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
