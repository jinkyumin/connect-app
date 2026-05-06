import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type ReportReason = "spam" | "inappropriate" | "misinformation" | "other";

interface ReportInput {
  postId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  detail?: string;
}

export function useReport() {
  return useMutation({
    mutationFn: async (input: ReportInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");
      const { error } = await supabase.from("reports").insert({
        reporter_id: session.user.id,
        post_id: input.postId ?? null,
        reported_user_id: input.reportedUserId ?? null,
        reason: input.reason,
        detail: input.detail ?? null,
      });
      if (error) throw error;
    },
  });
}
