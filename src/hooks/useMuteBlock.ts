import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export function useMuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");
      const { error } = await supabase.from("mutes").insert({ muter_id: session.user.id, muted_id: targetId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mutes"] }),
  });
}

export function useUnmuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");
      const { error } = await supabase.from("mutes").delete().eq("muter_id", session.user.id).eq("muted_id", targetId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mutes"] }),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");
      const { error } = await supabase.from("blocks").insert({ blocker_id: session.user.id, blocked_id: targetId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");
      const { error } = await supabase.from("blocks").delete().eq("blocker_id", session.user.id).eq("blocked_id", targetId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
  });
}

export function useMuteList(userId?: string) {
  return useQuery<Profile[]>({
    queryKey: ["mutes", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mutes")
        .select("muted:profiles!muted_id(*)")
        .eq("muter_id", userId ?? "");
      if (error) throw error;
      return (data?.map((d) => d.muted) ?? []) as Profile[];
    },
    enabled: !!userId,
  });
}

export function useBlockList(userId?: string) {
  return useQuery<Profile[]>({
    queryKey: ["blocks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocks")
        .select("blocked:profiles!blocked_id(*)")
        .eq("blocker_id", userId ?? "");
      if (error) throw error;
      return (data?.map((d) => d.blocked) ?? []) as Profile[];
    },
    enabled: !!userId,
  });
}
