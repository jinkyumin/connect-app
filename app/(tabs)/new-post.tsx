import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Image, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/stores/auth.store";
import { useCreatePost } from "@/hooks/useCreatePost";
import { Avatar } from "@/components/ui/Avatar";

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const session = useAuthStore((s) => s.session);
  const { mutate: createPost, isPending } = useCreatePost();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4));
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && mediaUris.length === 0) {
      Alert.alert("오류", "내용을 입력하거나 미디어를 첨부해주세요.");
      return;
    }
    createPost(
      { content: content.trim(), mediaUrls: mediaUris },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (e) => Alert.alert("오류", e.message),
      }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새로운 스레드</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
          <Text style={styles.postBtn}>게시</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.compose}>
          <Avatar size={36} initials={session?.user?.email?.[0]?.toUpperCase()} />
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="새로운 소식이 있나요?"
              placeholderTextColor="#999999"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={500}
              testID="post-input"
            />
            <TouchableOpacity onPress={handlePickImage} style={styles.imageIcon}>
              <Text style={styles.imageIconText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>
        {mediaUris.length > 0 && (
          <ScrollView horizontal style={styles.mediaRow}>
            {mediaUris.map((uri) => (
              <TouchableOpacity key={uri} onPress={() => setMediaUris((prev) => prev.filter((u) => u !== uri))}>
                <Image source={{ uri }} style={styles.mediaThumb} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <Text style={styles.hint}>팔로우하는 프로필이 답글을 달 수 있어요</Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isPending}>
          <Text style={styles.submitBtnText}>게시</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  cancel: { color: "#999999", fontSize: 16 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  postBtn: { fontSize: 16, fontWeight: "700", color: "#171D1B" },
  body: { flex: 1 },
  compose: { flexDirection: "row", padding: 16, gap: 12 },
  inputArea: { flex: 1 },
  input: { fontSize: 15, color: "#2E2E2E", lineHeight: 22, minHeight: 100 },
  imageIcon: { marginTop: 8 },
  imageIconText: { fontSize: 20 },
  mediaRow: { paddingHorizontal: 16, marginBottom: 12 },
  mediaThumb: { width: 100, height: 100, borderRadius: 8, marginRight: 8, backgroundColor: "#EFEFEF" },
  hint: { fontSize: 12, color: "#999999", paddingHorizontal: 16, paddingBottom: 16 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F5F5F5" },
  submitBtn: {
    height: 48,
    backgroundColor: "#171D1B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
