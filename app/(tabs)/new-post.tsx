import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/stores/auth.store";
import { useCreatePost } from "@/hooks/useCreatePost";
import { Avatar } from "@/components/ui/Avatar";
import { useColors } from "@/lib/colors";
import { OgPreview } from "@/components/post/OgPreview";

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [content, setContent] = useState("");
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [ogData, setOgData] = useState<{ url: string; title: string; image: string } | null>(null);
  const [ogLoading, setOgLoading] = useState(false);
  const session = useAuthStore((s) => s.session);
  const { mutate: createPost, isPending } = useCreatePost();

  const URL_REGEX = /https?:\/\/[^\s]+/g;

  const handleTextChange = async (text: string) => {
    setContent(text);
    const urls = text.match(URL_REGEX);
    if (urls && urls[0] !== ogData?.url) {
      setOgLoading(true);
      try {
        const { getLinkPreview } = await import("link-preview-js");
        const data = await getLinkPreview(urls[0]);
        setOgData({
          url: urls[0],
          title: (data as any).title ?? "",
          image: (data as any).images?.[0] ?? "",
        });
      } catch {
        setOgData(null);
      } finally {
        setOgLoading(false);
      }
    } else if (!urls) {
      setOgData(null);
    }
  };

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
      {
        content: content.trim(),
        mediaUrls: mediaUris,
        ogUrl: ogData?.url,
        ogTitle: ogData?.title,
        ogImage: ogData?.image,
      },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (e) => Alert.alert("오류", e.message),
      }
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancel, { color: colors.muted }]}>취소</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>새로운 스레드</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
          <Text style={[styles.postBtn, { color: colors.brand }]}>게시</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.compose}>
          <Avatar size={36} initials={session?.user?.email?.[0]?.toUpperCase()} />
          <View style={styles.inputArea}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="새로운 소식이 있나요?"
              placeholderTextColor={colors.muted}
              multiline
              value={content}
              onChangeText={handleTextChange}
              maxLength={500}
              testID="post-input"
            />
            <TouchableOpacity onPress={handlePickImage} style={styles.imageIcon}>
              <Text style={styles.imageIconText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>
        {ogLoading && <ActivityIndicator size="small" color="#999" style={{ marginTop: 8, marginHorizontal: 16 }} />}
        {ogData && (
          <View style={styles.ogWrapper}>
            <OgPreview
              url={ogData.url}
              title={ogData.title}
              imageUrl={ogData.image}
            />
          </View>
        )}
        {mediaUris.length > 0 && (
          <ScrollView horizontal style={styles.mediaRow}>
            {mediaUris.map((uri) => (
              <TouchableOpacity key={uri} onPress={() => setMediaUris((prev) => prev.filter((u) => u !== uri))}>
                <Image source={{ uri }} style={[styles.mediaThumb, { backgroundColor: colors.input }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <Text style={[styles.hint, { color: colors.muted }]}>팔로우하는 프로필이 답글을 달 수 있어요</Text>
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.brand }]} onPress={handleSubmit} disabled={isPending}>
          <Text style={styles.submitBtnText}>게시</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  cancel: { fontSize: 16 },
  title: { fontSize: 16, fontWeight: "700" },
  postBtn: { fontSize: 16, fontWeight: "700" },
  body: { flex: 1 },
  compose: { flexDirection: "row", padding: 16, gap: 12 },
  inputArea: { flex: 1 },
  input: { fontSize: 15, lineHeight: 22, minHeight: 100 },
  imageIcon: { marginTop: 8 },
  imageIconText: { fontSize: 20 },
  mediaRow: { paddingHorizontal: 16, marginBottom: 12 },
  mediaThumb: { width: 100, height: 100, borderRadius: 8, marginRight: 8 },
  hint: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 16 },
  ogWrapper: { paddingHorizontal: 16 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
