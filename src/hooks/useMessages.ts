import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Message, Profile, Conversation } from "@/types";

export function useConversations(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("messages:" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  return useQuery<Conversation[]>({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      // Get all messages involving this user, group by partner
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Build conversations map (one entry per partner)
      const convMap = new Map<string, Conversation>();
      for (const msg of data ?? []) {
        const partner: Profile = msg.sender_id === userId ? msg.receiver : msg.sender;
        if (!convMap.has(partner.id)) {
          convMap.set(partner.id, {
            partner,
            last_message: msg as Message,
            unread_count: !msg.read_at && msg.receiver_id === userId ? 1 : 0,
          });
        } else {
          const existing = convMap.get(partner.id)!;
          if (!msg.read_at && msg.receiver_id === userId) {
            existing.unread_count += 1;
          }
        }
      }
      return Array.from(convMap.values());
    },
    enabled: !!userId,
  });
}

export function useDirectMessages(userId?: string, partnerId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !partnerId) return;

    const channel = supabase
      .channel(`dm:${userId}:${partnerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dm", userId, partnerId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, partnerId, queryClient]);

  return useQuery<Message[]>({
    queryKey: ["dm", userId, partnerId],
    queryFn: async () => {
      if (!userId || !partnerId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*)")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!userId && !!partnerId,
  });
}
