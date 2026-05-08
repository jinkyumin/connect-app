import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useCreateComment } from "@/hooks/useComments";

interface CommentInputProps {
  postId: string;
  avatarUrl?: string | null;
}

export function CommentInput({ postId, avatarUrl }: CommentInputProps) {
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
    <View style={styles.container}>
      <Avatar uri={avatarUrl} size={32} />
      <TextInput
        style={styles.input}
        placeholder="댓글 달기..."
        placeholderTextColor="#999999"
        value={text}
        onChangeText={setText}
        multiline
        testID="comment-input"
      />
      <TouchableOpacity onPress={handleSubmit} disabled={!text.trim() || isPending}>
        <Text style={[styles.submitBtn, (!text.trim() || isPending) && styles.submitBtnDisabled]}>
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: "#2E2E2E",
    maxHeight: 100,
  },
  submitBtn: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171D1B",
  },
  submitBtnDisabled: {
    color: "#BBBBBB",
  },
});
