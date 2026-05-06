import { useState, useRef, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { useDirectMessages } from "@/hooks/useMessages";
import { Avatar } from "@/components/ui/Avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, Message } from "@/types";

export default function DMScreen() {
  const { id: partnerId } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const { data: partner } = useQuery<Profile>({
    queryKey: ["profile", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", partnerId).single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: messages, isLoading } = useDirectMessages(session?.user.id, partnerId);

  // Mark messages as read
  useEffect(() => {
    if (!session || !partnerId) return;
    (async () => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", partnerId)
        .eq("receiver_id", session.user.id)
        .is("read_at", null);
    })();
  }, [session, partnerId, messages]);

  const handleSend = async () => {
    if (!text.trim() || !session) return;
    const msg = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      sender_id: session.user.id,
      receiver_id: partnerId,
      content: msg,
    });
    if (error) {
      setText(msg); // restore on failure
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["dm", session.user.id, partnerId] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{partner?.username ?? "..."}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color="#171D1B" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages ?? []}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }: { item: Message }) => {
            const isMine = item.sender_id === session?.user.id;
            return (
              <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, isMine && styles.mineText]}>{item.content}</Text>
                {item.read_at && isMine && <Text style={styles.readReceipt}>읽음</Text>}
              </View>
            );
          }}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="메시지 보내기..."
          placeholderTextColor="#999999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          testID="dm-input"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  back: { color: "#999999", fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  bubble: { marginHorizontal: 16, marginVertical: 4, padding: 10, borderRadius: 16, maxWidth: "75%" },
  mine: { backgroundColor: "#171D1B", alignSelf: "flex-end" },
  theirs: { backgroundColor: "#EFEFEF", alignSelf: "flex-start" },
  bubbleText: { color: "#2E2E2E", fontSize: 15 },
  mineText: { color: "#FFFFFF" },
  readReceipt: { fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: 2 },
  inputRow: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#EFEFEF" },
  input: { flex: 1, backgroundColor: "#EFEFEF", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: "#2E2E2E" },
  sendBtn: { backgroundColor: "#171D1B", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, justifyContent: "center" },
  sendText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
