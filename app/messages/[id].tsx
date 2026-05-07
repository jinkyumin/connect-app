import { useState, useRef, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { useDirectMessages } from "@/hooks/useMessages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, Message } from "@/types";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  let label: string;
  if (isToday(d)) label = "오늘";
  else if (isYesterday(d)) label = "어제";
  else label = format(d, "M월 d일", { locale: ko });

  return (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateSeparatorText}>{label}</Text>
    </View>
  );
}

type ListItem =
  | { type: "date"; date: string; key: string }
  | { type: "message"; message: Message; key: string };

function buildListItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const dayKey = format(new Date(msg.created_at), "yyyy-MM-dd");
    if (dayKey !== lastDate) {
      items.push({ type: "date", date: msg.created_at, key: `date-${dayKey}` });
      lastDate = dayKey;
    }
    items.push({ type: "message", message: msg, key: msg.id });
  }
  return items;
}

export default function DMScreen() {
  const insets = useSafeAreaInsets();
  const { id: partnerId } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const { data: partner } = useQuery<Profile>({
    queryKey: ["profile", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", partnerId)
        .single();
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
      setText(msg);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["dm", session.user.id, partnerId] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const listItems = buildListItems(messages ?? []);
  const lastMyMessageId = [...(messages ?? [])]
    .reverse()
    .find((m) => m.sender_id === session?.user.id)?.id;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{partner?.username ?? "..."}</Text>
          <Text style={styles.headerStatus}>활성 5분 전</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#171D1B" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={listItems}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }: { item: ListItem }) => {
            if (item.type === "date") {
              return <DateSeparator date={item.date} />;
            }
            const { message } = item;
            const isMine = message.sender_id === session?.user.id;
            const isLastMine = message.id === lastMyMessageId;

            return (
              <View style={[styles.bubbleWrapper, isMine ? styles.bubbleWrapperMine : styles.bubbleWrapperTheirs]}>
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                    {message.content}
                  </Text>
                </View>
                {isMine && isLastMine && message.read_at && (
                  <Text style={styles.readReceipt}>읽음</Text>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="메시지 보내기..."
          placeholderTextColor="#999999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          testID="dm-input"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backBtn: { width: 40, justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#171D1B" },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  headerStatus: { fontSize: 12, color: "#999999", marginTop: 2 },

  // Message list
  messageList: { paddingVertical: 12, paddingHorizontal: 16 },

  // Date separator
  dateSeparator: { alignItems: "center", marginVertical: 12 },
  dateSeparatorText: { fontSize: 12, color: "#999999" },

  // Bubble wrapper (handles read receipt layout)
  bubbleWrapper: { marginVertical: 3 },
  bubbleWrapperMine: { alignItems: "flex-end" },
  bubbleWrapperTheirs: { alignItems: "flex-start" },

  // Bubbles
  bubble: {
    maxWidth: "70%",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: "#171D1B",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#EFEFEF",
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, color: "#2E2E2E", lineHeight: 20 },
  bubbleTextMine: { color: "#FFFFFF" },

  // Read receipt
  readReceipt: { fontSize: 12, color: "#999999", marginTop: 3 },

  // Input row
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  input: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2E2E2E",
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#171D1B",
    justifyContent: "center",
    alignItems: "center",
  },
  sendArrow: { fontSize: 18, color: "#FFFFFF" },
});
