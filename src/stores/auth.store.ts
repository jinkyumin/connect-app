import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, loading: false });
    });
  },
}));
