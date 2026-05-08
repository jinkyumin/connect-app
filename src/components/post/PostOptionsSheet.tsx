import { Modal, View, Text, TouchableOpacity, Alert, StyleSheet, TextInput } from "react-native";
import { useState } from "react";
import { useDeletePost, useEditPost } from "@/hooks/useCreatePost";
import { useReport } from "@/hooks/useReport";
import { useMuteUser, useBlockUser } from "@/hooks/useMuteBlock";
import { useColors } from "@/lib/colors";

export interface PostOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  authorId: string;
  currentUserId: string;
  initialContent?: string;
  onDeleted?: () => void;
}

export function PostOptionsSheet({
  visible,
  onClose,
  postId,
  authorId,
  currentUserId,
  initialContent,
  onDeleted,
}: PostOptionsSheetProps) {
  const colors = useColors();
  const deletePost = useDeletePost();
  const editPost = useEditPost();
  const report = useReport();
  const muteUser = useMuteUser();
  const blockUser = useBlockUser();
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(initialContent ?? "");

  const isOwn = authorId === currentUserId;

  function handleEdit() {
    setEditText(initialContent ?? "");
    setEditMode(true);
  }

  function handleEditSubmit() {
    const trimmed = editText.trim();
    if (!trimmed) return;
    editPost.mutate(
      { postId, content: trimmed },
      {
        onSuccess: () => {
          setEditMode(false);
          onClose();
        },
        onError: () => Alert.alert("오류", "수정에 실패했습니다."),
      }
    );
  }

  function handleEditCancel() {
    setEditMode(false);
    onClose();
  }

  function handleDelete() {
    Alert.alert("게시물 삭제", "이 게시물을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          onClose();
          deletePost.mutate(postId, {
            onSuccess: () => onDeleted?.(),
            onError: () => Alert.alert("오류", "삭제에 실패했습니다."),
          });
        },
      },
    ]);
  }

  function handleReport() {
    Alert.alert("신고 사유 선택", "", [
      { text: "스팸", onPress: () => submitReport("spam") },
      { text: "부적절한 콘텐츠", onPress: () => submitReport("inappropriate") },
      { text: "잘못된 정보", onPress: () => submitReport("misinformation") },
      { text: "기타", onPress: () => submitReport("other") },
      { text: "취소", style: "cancel" },
    ]);
  }

  function submitReport(reason: "spam" | "inappropriate" | "misinformation" | "other") {
    onClose();
    report.mutate(
      { postId, reason },
      { onError: () => Alert.alert("오류", "신고에 실패했습니다.") }
    );
  }

  function handleMute() {
    onClose();
    muteUser.mutate(authorId, {
      onError: () => Alert.alert("오류", "뮤트에 실패했습니다."),
    });
  }

  function handleBlock() {
    Alert.alert("계정 차단", "이 계정을 차단하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => {
          onClose();
          blockUser.mutate(authorId, {
            onError: () => Alert.alert("오류", "차단에 실패했습니다."),
          });
        },
      },
    ]);
  }

  if (editMode) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleEditCancel}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleEditCancel} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={handleEditCancel}>
              <Text style={[styles.editAction, { color: colors.muted }]}>취소</Text>
            </TouchableOpacity>
            <Text style={[styles.editTitle, { color: colors.text }]}>게시물 수정</Text>
            <TouchableOpacity onPress={handleEditSubmit} disabled={editPost.isPending}>
              <Text style={[styles.editAction, { color: colors.brand, fontWeight: "700" }]}>저장</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.editInput, { color: colors.text, backgroundColor: colors.input, borderColor: colors.border }]}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
            placeholder="내용을 입력하세요..."
            placeholderTextColor={colors.muted}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        {isOwn ? (
          <>
            <TouchableOpacity style={styles.item} onPress={handleEdit}>
              <Text style={[styles.itemText, { color: colors.text }]}>수정</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.item} onPress={handleDelete}>
              <Text style={[styles.itemText, { color: colors.danger }]}>삭제</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.item} onPress={handleReport}>
              <Text style={[styles.itemText, { color: colors.text }]}>신고</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.item} onPress={handleMute}>
              <Text style={[styles.itemText, { color: colors.text }]}>이 계정 뮤트</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.item} onPress={handleBlock}>
              <Text style={[styles.itemText, { color: colors.danger }]}>이 계정 차단</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={[styles.cancelDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.item} onPress={onClose}>
          <Text style={[styles.itemText, { color: colors.text }, styles.cancelText]}>취소</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  item: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
  },
  cancelText: {
    fontWeight: "700",
  },
  divider: {
    height: 1,
  },
  cancelDivider: {
    height: 8,
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  editAction: {
    fontSize: 15,
  },
  editInput: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
