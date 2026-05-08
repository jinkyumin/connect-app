import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useCreateComment } from "@/hooks/useComments";
import { useColors } from "@/lib/colors";

interface CommentInputProps {
  postId: string;
  avatarUrl?: string | null;
}

export function CommentInput({ postId, avatarUrl }: CommentInputProps) {
  const colors = useColors();
  const [text, setText] = useState("");
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    createComment({ content: trimmed, parentId: postId }, {
      onSuccess: () => setText(""),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
      <Avatar uri={avatarUrl} size={32} />
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
        placeholder="댓글 달기..."
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={setText}
        multiline
        testID="comment-input"
      />
      <TouchableOpacity onPress={handleSubmit} disabled={!text.trim() || isPending}>
        <Text style={[styles.submitBtn, { color: colors.brand }, (!text.trim() || isPending) && { color: colors.muted }]}>
          게시
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  submitBtn: {
    fontSize: 14,
    fontWeight: "700",
  },
});
