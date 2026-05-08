import { Modal, View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useDeletePost } from "@/hooks/useCreatePost";
import { useReport } from "@/hooks/useReport";
import { useMuteUser, useBlockUser } from "@/hooks/useMuteBlock";
import { useColors } from "@/lib/colors";

export interface PostOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  authorId: string;
  currentUserId: string;
  onDeleted?: () => void;
}

export function PostOptionsSheet({
  visible,
  onClose,
  postId,
  authorId,
  currentUserId,
  onDeleted,
}: PostOptionsSheetProps) {
  const colors = useColors();
  const deletePost = useDeletePost();
  const report = useReport();
  const muteUser = useMuteUser();
  const blockUser = useBlockUser();

  const isOwn = authorId === currentUserId;

  function handleEdit() {
    onClose();
    Alert.alert("준비 중", "수정 기능은 곧 제공될 예정입니다.");
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
});
