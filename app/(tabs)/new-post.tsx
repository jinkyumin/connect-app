import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Image, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/stores/auth.store";
import { useCreatePost } from "@/hooks/useCreatePost";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default function NewPostScreen() {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새 게시물</Text>
        <Button label="게시" onPress={handleSubmit} loading={isPending} disabled={!content.trim() && mediaUris.length === 0} />
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.compose}>
          <Avatar size={40} initials={session?.user?.email?.[0]?.toUpperCase()} />
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="무슨 일이 있나요?"
              placeholderTextColor="#999999"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={500}
              testID="post-input"
            />
            <Text style={styles.charCount}>{content.length}/500</Text>
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
      </ScrollView>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handlePickImage}>
          <Text style={styles.toolbarIcon}>🖼️ 사진/동영상</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  cancel: { color: "#999999", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  body: { flex: 1 },
  compose: { flexDirection: "row", padding: 16, gap: 12 },
  inputArea: { flex: 1 },
  input: { fontSize: 16, color: "#2E2E2E", lineHeight: 22, minHeight: 80 },
  charCount: { fontSize: 12, color: "#999999", textAlign: "right", marginTop: 4 },
  mediaRow: { paddingHorizontal: 16, marginBottom: 12 },
  mediaThumb: { width: 100, height: 100, borderRadius: 8, marginRight: 8, backgroundColor: "#EFEFEF" },
  toolbar: { borderTopWidth: 1, borderTopColor: "#EFEFEF", paddingHorizontal: 16, paddingVertical: 12 },
  toolbarIcon: { color: "#2E2E2E", fontSize: 14 },
});
